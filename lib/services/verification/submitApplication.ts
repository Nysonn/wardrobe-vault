import { VerificationStatus } from "@/lib/generated/prisma/enums";
import { prisma } from "@/lib/prisma";
import type { VerificationApplicationInput } from "@/lib/schemas/verification";

import { VerificationServiceError } from "./errors";

export async function getUserVerificationState(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      verificationStatus: true,
      isVerifiedPublicFigure: true,
    },
  });

  if (!user) {
    throw new VerificationServiceError("Account not found.");
  }

  const applications = await prisma.publicFigureVerification.findMany({
    where: { userId },
    orderBy: { submittedAt: "desc" },
    take: 5,
    select: {
      id: true,
      status: true,
      applicationNotes: true,
      evidenceSummary: true,
      evidenceUrls: true,
      adminDecision: true,
      adminNotes: true,
      reviewedAt: true,
      submittedAt: true,
    },
  });

  const pendingApplication =
    applications.find((app) => app.status === VerificationStatus.PENDING) ??
    null;

  const canApply =
    !user.isVerifiedPublicFigure &&
    user.verificationStatus !== VerificationStatus.PENDING &&
    pendingApplication === null;

  return {
    user,
    pendingApplication,
    recentApplications: applications,
    canApply,
  };
}

export async function submitVerificationApplication(
  userId: string,
  input: VerificationApplicationInput,
) {
  const state = await getUserVerificationState(userId);

  if (state.user.isVerifiedPublicFigure) {
    throw new VerificationServiceError(
      "Your account is already verified as a public figure.",
    );
  }

  if (
    state.user.verificationStatus === VerificationStatus.PENDING ||
    state.pendingApplication
  ) {
    throw new VerificationServiceError(
      "You already have a verification application under review.",
    );
  }

  const evidenceUrls = input.evidenceUrls.map((item) => item.url);

  const application = await prisma.$transaction(async (tx) => {
    const created = await tx.publicFigureVerification.create({
      data: {
        userId,
        status: VerificationStatus.PENDING,
        applicationNotes: input.applicationNotes,
        evidenceSummary: input.evidenceSummary,
        evidenceUrls,
      },
      select: { id: true, submittedAt: true },
    });

    await tx.user.update({
      where: { id: userId },
      data: { verificationStatus: VerificationStatus.PENDING },
    });

    return created;
  });

  return application;
}
