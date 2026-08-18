import Image from "next/image";

import { VerificationBadge } from "@/components/brand/verification-badge";
import { cn } from "@/lib/utils";
import type { PublicUserProfile } from "@/lib/services/users/publicProfile";

type ProfileHeaderProps = {
  profile: PublicUserProfile;
  className?: string;
};

function ProfilePhoto({
  photoUrl,
  name,
  large,
}: {
  photoUrl: string | null;
  name: string;
  large?: boolean;
}) {
  if (!photoUrl) {
    return (
      <div
        className={cn(
          "flex items-center justify-center bg-muted text-muted-foreground",
          large ? "size-32 sm:size-40" : "size-24 sm:size-28",
        )}
        aria-hidden
      >
        <span className="font-heading text-3xl uppercase">
          {name.charAt(0) || "?"}
        </span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative overflow-hidden bg-muted",
        large ? "size-32 sm:size-40" : "size-24 sm:size-28",
      )}
    >
      <Image
        src={photoUrl}
        alt=""
        fill
        sizes={large ? "160px" : "112px"}
        className="object-cover"
      />
    </div>
  );
}

function RegionLine({
  region,
  location,
}: {
  region: string | null | undefined;
  location: string | null | undefined;
}) {
  const value = region ?? location;
  if (!value) return null;
  return (
    <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
      {value}
    </p>
  );
}

/**
 * Profile hero — editorial treatment for verified public figures (§28, §13),
 * restrained layout for regular sellers.
 */
export function ProfileHeader({ profile, className }: ProfileHeaderProps) {
  const { user } = profile;
  const displayName = user.name ?? "Member";
  const photoUrl = user.profile?.photoUrl ?? user.image ?? null;
  const isVerifiedFigure = user.isVerifiedPublicFigure;

  const biography = isVerifiedFigure
    ? (user.profile?.publicFigureBio ?? user.profile?.bio)
    : user.profile?.bio;

  if (isVerifiedFigure) {
    return (
      <div
        className={cn(
          "border-b border-border bg-muted/50 py-12 sm:py-16",
          className,
        )}
      >
        <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:gap-10">
          <ProfilePhoto photoUrl={photoUrl} name={displayName} large />

          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-medium uppercase tracking-[0.24em] text-muted-foreground">
              In the Vault
            </p>
            <h1 className="mt-2 font-heading text-4xl leading-tight sm:text-5xl">
              {displayName}
            </h1>

            <div className="mt-3">
              <VerificationBadge label="Verified public figure" />
            </div>

            {user.profile?.headline && (
              <p className="mt-4 text-base text-foreground/90">
                {user.profile.headline}
              </p>
            )}

            <RegionLine region={user.profile?.region} location={user.profile?.location} />

            {biography && (
              <p className="mt-6 max-w-2xl whitespace-pre-wrap text-base leading-relaxed text-muted-foreground">
                {biography}
              </p>
            )}

            {(user.profile?.websiteUrl || user.profile?.instagramHandle) && (
              <div className="mt-6 flex flex-wrap gap-4 text-xs uppercase tracking-[0.14em]">
                {user.profile.websiteUrl && (
                  <a
                    href={user.profile.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-vault-accent underline-offset-4 hover:underline"
                  >
                    Website
                  </a>
                )}
                {user.profile.instagramHandle && (
                  <a
                    href={`https://instagram.com/${user.profile.instagramHandle.replace(/^@/, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-vault-accent underline-offset-4 hover:underline"
                  >
                    @{user.profile.instagramHandle.replace(/^@/, "")}
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("border-b border-border py-10 sm:py-12", className)}>
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:gap-8">
        <ProfilePhoto photoUrl={photoUrl} name={displayName} />

        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-muted-foreground">
            Seller profile
          </p>
          <h1 className="mt-2 font-heading text-3xl leading-tight sm:text-4xl">
            {displayName}
          </h1>

          <RegionLine region={user.profile?.region} location={user.profile?.location} />

          {biography && (
            <p className="mt-4 max-w-xl whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
              {biography}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
