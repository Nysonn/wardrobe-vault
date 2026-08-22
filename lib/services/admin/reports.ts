import { ReportStatus } from "@/lib/generated/prisma/enums";
import { prisma } from "@/lib/prisma";

export class AdminReportError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AdminReportError";
  }
}

export type AdminReportTab = "open" | "under-review" | "resolved" | "all";

function tabToStatuses(tab: AdminReportTab): ReportStatus[] {
  switch (tab) {
    case "open":
      return [ReportStatus.OPEN];
    case "under-review":
      return [ReportStatus.UNDER_REVIEW];
    case "resolved":
      return [ReportStatus.RESOLVED, ReportStatus.DISMISSED];
    case "all":
      return [
        ReportStatus.OPEN,
        ReportStatus.UNDER_REVIEW,
        ReportStatus.RESOLVED,
        ReportStatus.DISMISSED,
      ];
    default:
      return [ReportStatus.OPEN];
  }
}

export async function getAdminReportQueueCounts() {
  const tabs: Exclude<AdminReportTab, "all">[] = [
    "open",
    "under-review",
    "resolved",
  ];

  const counts = await Promise.all(
    tabs.map(async (tab) => {
      const count = await prisma.report.count({
        where: { status: { in: tabToStatuses(tab) } },
      });
      return [tab, count] as const;
    }),
  );

  return Object.fromEntries(counts) as Record<
    Exclude<AdminReportTab, "all">,
    number
  >;
}

export async function getAdminReportQueue(tab: AdminReportTab) {
  return prisma.report.findMany({
    where: { status: { in: tabToStatuses(tab) } },
    orderBy: { createdAt: "asc" },
    include: {
      reporter: { select: { id: true, name: true, email: true } },
      listing: {
        select: {
          id: true,
          title: true,
          status: true,
          seller: { select: { id: true, name: true, email: true } },
        },
      },
    },
  });
}

export async function getAdminReportDetail(reportId: string) {
  return prisma.report.findUnique({
    where: { id: reportId },
    include: {
      reporter: { select: { id: true, name: true, email: true } },
      listing: {
        select: {
          id: true,
          title: true,
          status: true,
          seller: { select: { id: true, name: true, email: true } },
        },
      },
      resolver: { select: { id: true, name: true, email: true } },
    },
  });
}

export type AdminReportAction = "under-review" | "resolve" | "dismiss";

export async function performAdminReportAction({
  adminId,
  reportId,
  action,
  resolutionNotes,
}: {
  adminId: string;
  reportId: string;
  action: AdminReportAction;
  resolutionNotes?: string;
}) {
  const report = await prisma.report.findUnique({
    where: { id: reportId },
    include: {
      listing: { select: { id: true, title: true } },
    },
  });

  if (!report) {
    throw new AdminReportError("Report not found.");
  }

  const now = new Date();
  let toStatus: ReportStatus;

  switch (action) {
    case "under-review":
      toStatus = ReportStatus.UNDER_REVIEW;
      break;
    case "resolve":
      toStatus = ReportStatus.RESOLVED;
      break;
    case "dismiss":
      toStatus = ReportStatus.DISMISSED;
      break;
    default:
      throw new AdminReportError("Unknown report action.");
  }

  if (report.status === toStatus) {
    return { reportId, status: report.status };
  }

  const updated = await prisma.report.update({
    where: { id: reportId },
    data: {
      status: toStatus,
      resolvedById:
        action === "under-review" ? null : adminId,
      resolvedAt: action === "under-review" ? null : now,
      resolutionNotes: resolutionNotes?.trim() || null,
    },
  });

  await prisma.adminAction.create({
    data: {
      adminId,
      action: `REPORT_${action.toUpperCase().replace("-", "_")}`,
      targetType: "Report",
      targetId: reportId,
      details: {
        listingId: report.listingId,
        listingTitle: report.listing.title,
        fromStatus: report.status,
        toStatus,
        resolutionNotes: resolutionNotes ?? null,
      },
    },
  });

  return updated;
}
