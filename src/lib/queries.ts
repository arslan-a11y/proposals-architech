import { prisma } from "./prisma";

export async function getProposal(id: string) {
  return prisma.proposal.findUnique({
    where: { id },
    include: {
      company: true,
      opportunity: true,
      owner: true,
      template: true,
      contacts: { include: { contact: true } },
      lineItems: { orderBy: { sortOrder: "asc" } },
      versions: { orderBy: { versionNumber: "desc" } },
      activities: { orderBy: { createdAt: "desc" }, take: 20 },
      comments: { orderBy: { createdAt: "desc" } },
      signatures: true,
    },
  });
}

export async function getCreateOptions() {
  const [opportunities, templates] = await Promise.all([
    prisma.opportunity.findMany({ orderBy: { createdAt: "desc" }, include: { company: true } }),
    prisma.template.findMany({ where: { status: "ACTIVE" }, orderBy: { isDefault: "desc" } }),
  ]);
  return { opportunities, templates };
}

export async function getCrmData() {
  const [companies, opportunities, contacts] = await Promise.all([
    prisma.company.findMany({ orderBy: { name: "asc" }, include: { _count: { select: { proposals: true, opportunities: true } } } }),
    prisma.opportunity.findMany({ orderBy: { createdAt: "desc" }, include: { company: true } }),
    prisma.contact.findMany({ orderBy: { fullName: "asc" }, include: { company: true } }),
  ]);
  return { companies, opportunities, contacts };
}

export async function getTemplates() {
  return prisma.template.findMany({ orderBy: [{ isDefault: "desc" }, { name: "asc" }] });
}
