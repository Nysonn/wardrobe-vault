import { VerificationStatus } from "@/lib/generated/prisma/enums";
import { prisma } from "@/lib/prisma";
import {
  notifyVerificationApproved,
  notifyVerificationRejected,
} from "@/lib/services/verification/notifications";

export type AdminVerificationTab = "pending" | "verified" | "revoked" | "all";

export type AdminVerificationAction = "approve" | "reject" | "revoke";

export class AdminVerificationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AdminVerificationError";
  }
}

function tabToStatuses(tab: AdminVerificationTab): VerificationStatus[] {
  switch (tab) {
    case "pending":
      return [VerificationStatus.PENDING];
    case "verified":
      return [VerificationStatus.VERIFIED];
    case "revoked":
      return [VerificationStatus.REVOKED];
    case "all":
      return [
        VerificationStatus.PENDING,
        VerificationStatus.VERIFIED,
        VerificationStatus.REVOKED,
      ];
    default:
      return [VerificationStatus.PENDING];
  }
}

export async function getAdminVerificationQueueCounts() {
  const tabs: Exclude<AdminVerificationTab, "all">[] = [
    "pending",
    "verified",
    "revoked",
  ];

  const counts = await Promise.all(
    tabs.map(async (tab) => {
      const count = await prisma.publicFigureVerification.count({
        where: { status: { in: tabToStatuses(tab) } },
      });
      return [tab, count] as const;
    }),
  );

  return Object.fromEntries(counts) as Record<
    Exclude<AdminVerificationTab, "all">,
    number
  >;
}

export async function getAdminVerificationQueue(tab: AdminVerificationTab) {
  return prisma.publicFigureVerification.findMany({
    where: { status: { in: tabToStatuses(tab) } },
    orderBy: [{ submittedAt: "asc" }, { createdAt: "asc" }],
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          verificationStatus: true,
          isVerifiedPublicFigure: true,
        },
      },
    },
  });
}

export async function getAdminVerificationDetail(applicationId: string) {
  const application = await prisma.publicFigureVerification.findUnique({
    where: { id: applicationId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          verificationStatus: true,
          isVerifiedPublicFigure: true,
          profile: {
            select: {
              bio: true,
              publicFigureBio: true,
              region: true,
              location: true,
            },
          },
        },
      },
      reviewer: {
        select: { id: true, name: true, email: true },
      },
    },
  });

  if (!application) return null;

  const history = await prisma.publicFigureVerification.findMany({
    where: { userId: application.userId },
    orderBy: { submittedAt: "desc" },
    select: {
      id: true,
      status: true,
      adminDecision: true,
      reviewedAt: true,
      submittedAt: true,
    },
  });

  return { application, history };
}

type AdminActionInput = {
  adminId: string;
  applicationId: string;
  action: AdminVerificationAction;
  reason?: string;
  notes?: string;
};

const ACTION_LABELS: Record<AdminVerificationAction, string> = {
  approve: "VERIFICATION_APPROVED",
  reject: "VERIFICATION_REJECTED",
  revoke: "VERIFICATION_REVOKED",
};

export async function performAdminVerificationAction({
  adminId,
  applicationId,
  action,
  reason,
  notes,
}: AdminActionInput) {
  const application = await prisma.publicFigureVerification.findUnique({
    where: { id: applicationId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          verificationStatus: true,
          isVerifiedPublicFigure: true,
        },
      },
    },
  });

  if (!application) {
    throw new AdminVerificationError("Application not found.");
  }

  const now = new Date();

  if (action === "approve") {
    if (application.status !== VerificationStatus.PENDING) {
      throw new AdminVerificationError(
        "Only pending applications can be approved.",
      );
    }

    await prisma.$transaction(async (tx) => {
      await tx.publicFigureVerification.update({
        where: { id: applicationId },
        data: {
          status: VerificationStatus.VERIFIED,
          adminDecision: "APPROVED",
          adminNotes: notes ?? null,
          reviewedById: adminId,
          reviewedAt: now,
        },
      });

      await tx.user.update({
        where: { id: application.userId },
        data: {
          verificationStatus: VerificationStatus.VERIFIED,
          isVerifiedPublicFigure: true,
        },
      });
    });

    await notifyVerificationApproved(application.userId);
  } else if (action === "reject") {
    if (application.status !== VerificationStatus.PENDING) {
      throw new AdminVerificationError(
        "Only pending applications can be rejected.",
      );
    }

    if (!reason?.trim()) {
      throw new AdminVerificationError(
        "Please provide a reason when rejecting an application.",
      );
    }

    await prisma.$transaction(async (tx) => {
      await tx.publicFigureVerification.update({
        where: { id: applicationId },
        data: {
          status: VerificationStatus.REVOKED,
          adminDecision: "REJECTED",
          adminNotes: notes ?? reason,
          reviewedById: adminId,
          reviewedAt: now,
        },
      });

      await tx.user.update({
        where: { id: application.userId },
        data: {
          verificationStatus: VerificationStatus.UNVERIFIED,
          isVerifiedPublicFigure: false,
        },
      });
    });

    await notifyVerificationRejected(application.userId, reason);
  } else if (action === "revoke") {
    if (
      application.status !== VerificationStatus.VERIFIED &&
      !application.user.isVerifiedPublicFigure
    ) {
      throw new AdminVerificationError(
        "Only verified public figures can be revoked.",
      );
    }

    await prisma.$transaction(async (tx) => {
      await tx.publicFigureVerification.update({
        where: { id: applicationId },
        data: {
          status: VerificationStatus.REVOKED,
          adminDecision: "REVOKED",
          adminNotes: notes ?? reason ?? null,
          reviewedById: adminId,
          reviewedAt: now,
        },
      });

      await tx.user.update({
        where: { id: application.userId },
        data: {
          verificationStatus: VerificationStatus.REVOKED,
          isVerifiedPublicFigure: false,
        },
      });
    });

    await notifyVerificationRejected(
      application.userId,
      reason ??
        "Your verified public figure status has been revoked by Wardrobe Vault.",
    );
  }

  await prisma.adminAction.create({
    data: {
      adminId,
      action: ACTION_LABELS[action],
      targetType: "PublicFigureVerification",
      targetId: applicationId,
      details: {
        applicantEmail: application.user.email,
        applicantName: application.user.name,
        fromStatus: application.status,
        action,
        reason: reason ?? null,
        notes: notes ?? null,
      },
    },
  });

  return { success: true };
}
