import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import type { NextAuthConfig } from "next-auth";
import bcrypt from "bcryptjs";

import { isAdminRole } from "@/lib/auth/guards";
import { getAuthSecret } from "@/lib/auth/secret";
import { prisma } from "@/lib/prisma";
import { loginSchema } from "@/lib/schemas/auth";

// Auth.js requires JWT sessions for the Credentials provider — database-only
// sessions are not supported for password login. Suspension and role checks are
// enforced on every session read via a fresh DB lookup in the session callback.
// The Prisma adapter remains wired for Account/Session tables (Phase 11 suspension
// invalidation can delete Session rows when non-credentials providers are added).
export const authConfig = {
  adapter: PrismaAdapter(prisma),
  trustHost: true,
  secret: getAuthSecret(),
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  providers: [
    Credentials({
      name: "Email and password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: parsed.data.email },
        });

        if (!user?.password || user.suspendedAt) {
          return null;
        }

        const passwordValid = await bcrypt.compare(
          parsed.data.password,
          user.password,
        );
        if (!passwordValid) {
          return null;
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
          role: user.role,
        };
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized({ auth: session, request }) {
      if (request.nextUrl.pathname.startsWith("/admin")) {
        const role = session?.user?.role;
        return !!session?.user?.id && !!role && isAdminRole(role);
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (!token.id) {
        return session;
      }

      const user = await prisma.user.findUnique({
        where: { id: token.id as string },
        select: {
          id: true,
          name: true,
          email: true,
          emailVerified: true,
          image: true,
          role: true,
          suspendedAt: true,
        },
      });

      if (!user || user.suspendedAt) {
        return {
          ...session,
          user: undefined,
        };
      }

      session.user = {
        id: user.id,
        name: user.name,
        email: user.email ?? "",
        emailVerified: user.emailVerified,
        image: user.image,
        role: user.role,
      };

      return session;
    },
  },
} satisfies NextAuthConfig;

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
