import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { ProfileHeader } from "@/components/profile/profile-header";
import { ProfileListingsSection } from "@/components/profile/profile-listings-section";
import { getPublicUserProfile } from "@/lib/services/users/publicProfile";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ userId: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { userId } = await params;
  const profile = await getPublicUserProfile(userId);

  if (!profile) {
    return { title: "Profile not found — Wardrobe Vault" };
  }

  const name = profile.user.name ?? "Member";
  const headline = profile.user.profile?.headline;

  return {
    title: `${name} — Wardrobe Vault`,
    description:
      headline ??
      profile.user.profile?.bio?.slice(0, 160) ??
      `Pieces listed by ${name} on Wardrobe Vault.`,
  };
}

export default async function PublicProfilePage({ params }: PageProps) {
  const { userId } = await params;
  const profile = await getPublicUserProfile(userId);

  if (!profile) {
    notFound();
  }

  const { listings } = profile;
  const hasNoListings =
    listings.active.length === 0 && listings.sold.length === 0;

  return (
    <>
      <Container>
        <Link
          href="/vault"
          className="inline-block py-6 text-xs uppercase tracking-[0.16em] text-muted-foreground transition-vault hover:text-foreground"
        >
          ← Back to the Vault
        </Link>
      </Container>

      <Container>
        <ProfileHeader profile={profile} className="animate-fade-in" />
      </Container>

      <Section spacing="default">
        <Container className="space-y-16 animate-fade-in-slow">
          {hasNoListings ? (
            <ProfileListingsSection
              label="Collection"
              title="In the Vault"
              listings={[]}
              emptyTitle="Nothing on view yet."
              emptyDescription="When this member lists pieces, they will appear here."
            />
          ) : (
            <>
              <ProfileListingsSection
                label="Currently listed"
                title="In the Vault"
                listings={listings.active}
                emptyTitle="No pieces listed right now."
                emptyDescription="Check back — new listings may arrive soon."
              />

              {listings.sold.length > 0 && (
                <ProfileListingsSection
                  label="Archive"
                  title="Sold pieces"
                  listings={listings.sold}
                  emptyTitle="No sold pieces yet."
                  emptyDescription="Completed sales will be shown here when available."
                  className="border-t border-border pt-16"
                />
              )}
            </>
          )}
        </Container>
      </Section>
    </>
  );
}
