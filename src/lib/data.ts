import { prisma } from "./prisma";

// Sample fallback data so the UI renders before the DB is provisioned/migrated.
// Once DATABASE_URL points at a live Postgres and migrations run, real data replaces this.
const SAMPLE = {
  counts: {
    total: 6,
    pendingApproval: 2,
    notOpened: 1,
    openedNotSigned: 1,
    unresolvedComments: 2,
    expired: 1,
  },
  pipelineValue: 184500,
  byStatus: [
    { status: "DRAFT", count: 1 },
    { status: "PENDING_APPROVAL", count: 2 },
    { status: "SENT", count: 1 },
    { status: "OPENED", count: 1 },
    { status: "SIGNED", count: 1 },
  ],
  funnel: { sent: 4, opened: 3, signed: 1, rejected: 0 },
  proposals: [
    { id: "s1", proposalNumber: "Q-2026-0012", title: "אפיון — Acme Ltd", status: "PENDING_APPROVAL", amount: 42000, currency: "USD", company: "Acme Ltd", owner: "Yarin", updatedAt: new Date() },
    { id: "s2", proposalNumber: "Q-2026-0011", title: "פרויקט — Globex", status: "SENT", amount: 68000, currency: "USD", company: "Globex", owner: "Idan", updatedAt: new Date() },
    { id: "s3", proposalNumber: "Q-2026-0010", title: "דיסקברי — Initech", status: "SIGNED", amount: 15500, currency: "USD", company: "Initech", owner: "Yarin", updatedAt: new Date() },
    { id: "s4", proposalNumber: "Q-2026-0009", title: "אפיון — Umbrella", status: "OPENED", amount: 31000, currency: "USD", company: "Umbrella", owner: "Idan", updatedAt: new Date() },
    { id: "s5", proposalNumber: "Q-2026-0008", title: "פרויקט — Soylent", status: "DRAFT", amount: 28000, currency: "USD", company: "Soylent", owner: "Yarin", updatedAt: new Date() },
    { id: "s6", proposalNumber: "Q-2026-0007", title: "דיסקברי — Hooli", status: "EXPIRED", amount: 0, currency: "USD", company: "Hooli", owner: "Idan", updatedAt: new Date() },
  ],
  usingSampleData: true as const,
};

export type DashboardData = Awaited<ReturnType<typeof getDashboardData>>;

export async function getDashboardData() {
  try {
    const [proposals, grouped] = await Promise.all([
      prisma.proposal.findMany({
        take: 50,
        orderBy: { updatedAt: "desc" },
        include: { company: true, owner: true },
      }),
      prisma.proposal.groupBy({ by: ["status"], _count: true }),
    ]);

    const byStatus = grouped.map((g) => ({ status: g.status, count: g._count }));
    const pipelineValue = proposals
      .filter((p) => !["SIGNED", "REJECTED", "EXPIRED"].includes(p.status))
      .reduce((sum, p) => sum + Number(p.amount), 0);

    const statusCount = (s: string) =>
      byStatus.find((b) => b.status === s)?.count ?? 0;

    return {
      counts: {
        total: proposals.length,
        pendingApproval: statusCount("PENDING_APPROVAL"),
        notOpened: proposals.filter((p) => p.status === "SENT").length,
        openedNotSigned: proposals.filter((p) => p.status === "OPENED").length,
        unresolvedComments: 0,
        expired: statusCount("EXPIRED"),
      },
      pipelineValue,
      byStatus,
      funnel: {
        sent: proposals.filter((p) => ["SENT", "OPENED", "SIGNED", "REJECTED"].includes(p.status)).length,
        opened: proposals.filter((p) => ["OPENED", "SIGNED", "REJECTED"].includes(p.status)).length,
        signed: statusCount("SIGNED"),
        rejected: statusCount("REJECTED"),
      },
      proposals: proposals.map((p) => ({
        id: p.id,
        proposalNumber: p.proposalNumber,
        title: p.title,
        status: p.status as string,
        amount: Number(p.amount),
        currency: p.currency,
        company: p.company?.name ?? "—",
        owner: p.owner?.name ?? "—",
        updatedAt: p.updatedAt,
      })),
      usingSampleData: false as const,
    };
  } catch {
    // DB not reachable yet — serve sample data so the UI is reviewable.
    return SAMPLE;
  }
}
