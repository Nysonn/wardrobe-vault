import Link from "next/link";

import { VerificationApplicationForm } from "@/components/verification/verification-application-form";
import { VerificationBadge } from "@/components/brand/verification-badge";
import { EmptyState } from "@/components/brand/empty-state";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { Button } from "@/components/ui/button";
import { requireAuth } from "@/lib/auth/guards";
import { VerificationStatus } from "@/lib/generated/prisma/enums";
import { getUserVerificationState } from "@/lib/services/verification";

export const dynamic = "force-dynamic";

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "long",
    timeStyle: "short",
  }).format(date);
}

const STATUS_COPY: Record<VerificationStatus, string> = {
  [VerificationStatus.UNVERIFIED]: "Not verified",
  [VerificationStatus.PENDING]: "Under review",
  [VerificationStatus.VERIFIED]: "Verified public figure",
  [VerificationStatus.REVOKED]: "Verification revoked",
};

export default async function VerifyPage() {
  const session = await requireAuth();
  const state = await getUserVerificationState(session.user.id);

  return (
    <>
      <div className="border-b border-border py-6">
        <Container>
          <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-muted-foreground">
            Public figure verification
          </p>
          <h1 className="mt-2 font-heading text-3xl">Verified status</h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            Anyone can sell on Wardrobe Vault. Verified public figures receive a
            subtle badge after our team reviews supporting evidence — never
            automatically.
          </p>
        </Container>
      </div>

      <Section spacing="default" className="pt-10">
        <Container>
          <div className="mx-auto max-w-2xl space-y-10">
            <div className="border border-border px-4 py-4">
              <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
                Current status
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <p className="font-heading text-xl">
                  {STATUS_COPY[state.user.verificationStatus]}
                </p>
                {state.user.isVerifiedPublicFigure ? (
                  <VerificationBadge label="Verified public figure" />
                ) : null}
              </div>
            </div>

            {state.user.isVerifiedPublicFigure ? (
              <EmptyState
                title="You are verified."
                description="Your profile reflects verified public figure status. If you believe this was revoked in error, contact Wardrobe Vault support."
                action={
                  <Button variant="outline" render={<Link href={`/profile/${session.user.id}`} />}>
                    View your profile
                  </Button>
                }
              />
            ) : null}

            {!state.user.isVerifiedPublicFigure &&
            state.user.verificationStatus === VerificationStatus.PENDING &&
            state.pendingApplication ? (
              <div className="space-y-4 border border-border bg-muted/30 px-4 py-5">
                <h2 className="font-heading text-xl">Application under review</h2>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  Submitted {formatDate(state.pendingApplication.submittedAt)}.
                  We will notify you when a decision is made.
                </p>
                <div className="space-y-2 text-sm">
                  <p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                    Your application
                  </p>
                  <p className="whitespace-pre-wrap text-foreground/90">
                    {state.pendingApplication.applicationNotes}
                  </p>
                </div>
              </div>
            ) : null}

            {state.canApply ? (
              <div className="space-y-6">
                <div>
                  <h2 className="font-heading text-2xl">
                    {state.user.verificationStatus === VerificationStatus.REVOKED
                      ? "Submit a new application"
                      : "Apply for verification"}
                  </h2>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {state.user.verificationStatus === VerificationStatus.REVOKED
                      ? "Your previous verification was revoked. You may apply again with stronger evidence."
                      : "Submit evidence such as press coverage, event photographs, ownership documentation, or management letters. Our team reviews every application manually."}
                  </p>
                </div>
                <VerificationApplicationForm />
              </div>
            ) : null}

            {!state.user.isVerifiedPublicFigure &&
            !state.canApply &&
            state.user.verificationStatus !== VerificationStatus.PENDING ? (
              <EmptyState
                title={
                  state.user.verificationStatus === VerificationStatus.REVOKED
                    ? "Verification was revoked."
                    : "Application not available."
                }
                description={
                  state.user.verificationStatus === VerificationStatus.REVOKED
                    ? "You may submit a new application with stronger evidence if you wish to be reconsidered."
                    : "Please check back later or contact support if you need assistance."
                }
              />
            ) : null}

            {state.recentApplications.length > 0 ? (
              <div className="space-y-3 border-t border-border pt-8">
                <h2 className="font-heading text-xl">Application history</h2>
                <ul className="divide-y divide-border border border-border">
                  {state.recentApplications.map((application) => (
                    <li key={application.id} className="px-4 py-3 text-sm">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span>{STATUS_COPY[application.status]}</span>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(application.submittedAt)}
                        </span>
                      </div>
                      {application.adminDecision ? (
                        <p className="mt-2 text-xs text-muted-foreground">
                          Decision: {application.adminDecision}
                        </p>
                      ) : null}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        </Container>
      </Section>
    </>
  );
}
