import { redirect } from "next/navigation";
import type { Session } from "next-auth";

import { auth } from "@/lib/auth/config";
import { Role } from "@/lib/generated/prisma/enums";

/** Roles that may access the `/admin` route group. */
export const ADMIN_ROLES: readonly Role[] = [
  Role.MODERATOR,
  Role.ADMIN,
  Role.SUPER_ADMIN,
] as const;

export function isAdminRole(role: Role): boolean {
  return ADMIN_ROLES.includes(role);
}

/** Default landing page after login — admins to /admin unless a deep link was requested. */
export function resolvePostLoginRedirect(
  callbackUrl: unknown,
  role: Role | undefined,
): string {
  if (
    typeof callbackUrl === "string" &&
    callbackUrl.startsWith("/") &&
    !callbackUrl.startsWith("//") &&
    callbackUrl !== "/"
  ) {
    return callbackUrl;
  }

  if (role && isAdminRole(role)) {
    return "/admin";
  }

  return "/";
}

export type AuthenticatedSession = Session & {
  user: {
    id: string;
    role: Role;
    email: string;
    name?: string | null;
    image?: string | null;
  };
};

export async function getSession() {
  try {
    return await auth();
  } catch {
    return null;
  }
}

export async function requireAuth(): Promise<AuthenticatedSession> {
  const session = await auth();
  if (!session?.user?.id || !session.user.email) {
    redirect("/login");
  }
  return session as AuthenticatedSession;
}

export async function requireAdmin(): Promise<AuthenticatedSession> {
  const session = await requireAuth();
  if (!isAdminRole(session.user.role)) {
    redirect("/");
  }
  return session;
}
