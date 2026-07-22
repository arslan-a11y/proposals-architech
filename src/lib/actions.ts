"use server";

import { prisma } from "./prisma";
import { revalidatePath } from "next/cache";
import { randomUUID } from "crypto";

function id(prefix: string) {
  return `${prefix}_${randomUUID().slice(0, 8)}`;
}

async function nextProposalNumber(): Promise<string> {
  const year = 2026; // Date.now unavailable in some sandboxes; stamped per business year
  const count = await prisma.proposal.count();
  return `Q-${year}-${String(count + 1).padStart(4, "0")}`;
}

export async function createProposal(formData: FormData) {
  const opportunityId = (formData.get("opportunityId") as string) || null;
  const templateId = (formData.get("templateId") as string) || null;
  const titleInput = (formData.get("title") as string) || "";

  let companyId: string | null = null;
  let title = titleInput;
  if (opportunityId) {
    const opp = await prisma.opportunity.findUnique({
      where: { id: opportunityId },
      include: { company: true },
    });
    companyId = opp?.companyId ?? null;
    if (!title) title = opp?.name ?? "Untitled Proposal";
  }

  const proposal = await prisma.proposal.create({
    data: {
      id: id("prop"),
      proposalNumber: await nextProposalNumber(),
      title: title || "Untitled Proposal",
      opportunityId,
      companyId,
      templateId,
      status: "DRAFT",
      currentVersion: 1,
    },
  });

  await prisma.activityEvent.create({
    data: { id: id("act"), proposalId: proposal.id, type: "CREATED" },
  });

  revalidatePath("/proposals");
  revalidatePath("/");
  return proposal.id;
}

const NEXT_STATUS: Record<string, { status: string; approval?: string; activity: string }> = {
  submit: { status: "PENDING_APPROVAL", approval: "PENDING", activity: "SUBMITTED_FOR_APPROVAL" },
  approve: { status: "APPROVED_FOR_SENDING", approval: "APPROVED", activity: "APPROVED" },
  return: { status: "PENDING_CORRECTIONS", approval: "REJECTED", activity: "RETURNED_FOR_CORRECTIONS" },
  send: { status: "SENT", activity: "SENT" },
};

export async function transitionStatus(proposalId: string, action: keyof typeof NEXT_STATUS) {
  const t = NEXT_STATUS[action];
  if (!t) return;
  await prisma.proposal.update({
    where: { id: proposalId },
    data: {
      status: t.status as never,
      ...(t.approval ? { approvalStatus: t.approval as never } : {}),
      ...(action === "send" ? { sentDate: new Date() } : {}),
    },
  });
  await prisma.activityEvent.create({
    data: { id: id("act"), proposalId, type: t.activity as never },
  });
  revalidatePath(`/proposals/${proposalId}`);
  revalidatePath("/proposals");
  revalidatePath("/");
}

export async function addLineItem(proposalId: string, formData: FormData) {
  await prisma.pricingLineItem.create({
    data: {
      id: id("li"),
      proposalId,
      product: (formData.get("product") as string) || "Custom",
      description: (formData.get("description") as string) || null,
      quantity: Number(formData.get("quantity") || 1),
      unitPrice: Number(formData.get("unitPrice") || 0),
      vatPct: Number(formData.get("vatPct") || 17),
    },
  });
  await recalcAmount(proposalId);
  revalidatePath(`/proposals/${proposalId}`);
}

export async function deleteLineItem(proposalId: string, lineItemId: string) {
  await prisma.pricingLineItem.delete({ where: { id: lineItemId } });
  await recalcAmount(proposalId);
  revalidatePath(`/proposals/${proposalId}`);
}

async function recalcAmount(proposalId: string) {
  const items = await prisma.pricingLineItem.findMany({ where: { proposalId } });
  const total = items.reduce((sum, it) => {
    const base = Number(it.quantity) * Number(it.unitPrice);
    const afterDisc = base * (1 - Number(it.discountPct) / 100);
    const withVat = afterDisc * (1 + Number(it.vatPct) / 100);
    return sum + (it.isOptional ? 0 : withVat);
  }, 0);
  await prisma.proposal.update({
    where: { id: proposalId },
    data: { amount: total },
  });
}

export async function saveProposalContent(proposalId: string, blocksJson: string) {
  let content: unknown;
  try {
    content = JSON.parse(blocksJson);
  } catch {
    return { ok: false, error: "invalid content" };
  }
  await prisma.proposal.update({
    where: { id: proposalId },
    data: { contentJson: content as object },
  });
  revalidatePath(`/proposals/${proposalId}`);
  revalidatePath(`/proposals/${proposalId}/edit`);
  return { ok: true };
}

export async function submitSignature(proposalId: string, formData: FormData) {
  const { headers } = await import("next/headers");
  const h = await headers();
  const ip =
    h.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    h.get("x-real-ip") ||
    "unknown";

  const proposal = await prisma.proposal.findUnique({
    where: { id: proposalId },
    include: { signatures: true, company: true, lineItems: true },
  });
  if (!proposal) return { ok: false, error: "not found" };
  if (proposal.status === "SIGNED") return { ok: false, error: "already signed" };

  const signerName = (formData.get("signerName") as string)?.trim();
  const signerEmail = (formData.get("signerEmail") as string)?.trim();
  const termsAccepted = formData.get("termsAccepted") === "on";
  if (!signerName || !signerEmail || !termsAccepted) {
    return { ok: false, error: "name, email and terms acceptance are required" };
  }

  await prisma.signature.create({
    data: {
      id: id("sig"),
      proposalId,
      signerName,
      signerRole: (formData.get("signerRole") as string) || null,
      signerCompany: (formData.get("signerCompany") as string) || null,
      signerEmail,
      signerPhone: (formData.get("signerPhone") as string) || null,
      signingOrder: proposal.signatures.length + 1,
      termsAccepted: true,
      signatureImageUrl: (formData.get("signatureData") as string) || null,
      ipAddress: ip,
      versionSigned: proposal.currentVersion,
    },
  });

  // Freeze an immutable version snapshot at signing.
  await prisma.proposalVersion.upsert({
    where: { proposalId_versionNumber: { proposalId, versionNumber: proposal.currentVersion } },
    update: {},
    create: {
      id: id("ver"),
      proposalId,
      versionNumber: proposal.currentVersion,
      statusAtTime: "SIGNED",
      snapshotJson: {
        title: proposal.title,
        company: proposal.company?.name ?? null,
        amount: Number(proposal.amount),
        currency: proposal.currency,
        content: proposal.contentJson ?? { blocks: [] },
        lineItems: proposal.lineItems.map((li) => ({
          product: li.product,
          quantity: Number(li.quantity),
          unitPrice: Number(li.unitPrice),
          vatPct: Number(li.vatPct),
        })),
      },
    },
  });

  await prisma.proposal.update({
    where: { id: proposalId },
    data: { status: "SIGNED", signatureStatus: "SIGNED" },
  });

  await prisma.activityEvent.create({
    data: { id: id("act"), proposalId, type: "SIGNED", actorName: signerName, ipAddress: ip },
  });

  revalidatePath(`/proposals/${proposalId}`);
  revalidatePath("/proposals");
  revalidatePath("/");
  return { ok: true };
}
