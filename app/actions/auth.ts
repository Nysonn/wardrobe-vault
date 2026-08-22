"use server";

import { AuthError } from "next-auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { signIn, signOut } from "@/lib/auth/config";
import {
  resolvePostLoginRedirect,
} from "@/lib/auth/guards";
import {
  resolveActionError,
  validationMessage,
} from "@/lib/errors/action-error";
import {
  enforceRateLimit,
  getClientIp,
  RateLimitError,
} from "@/lib/auth/rate-limit";
import { loginSchema, registerSchema } from "@/lib/schemas/auth";
import {
  registerUser,
  RegistrationError,
} from "@/lib/services/users/register";
import { prisma } from "@/lib/prisma";

export type AuthActionState = {
  error?: string;
};

async function getRequestIp(): Promise<string> {
  const headerStore = await headers();
  return getClientIp(headerStore.get("x-forwarded-for"));
}

export async function loginAction(
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: validationMessage(parsed.error, "Enter a valid email and password.") };
  }

  const ip = await getRequestIp();

  try {
    await enforceRateLimit({
      key: `login:${ip}`,
      limit: 10,
      windowMs: 15 * 60 * 1000,
    });
  } catch (error) {
    if (error instanceof RateLimitError) {
      return { error: error.message };
    }
    return resolveActionError(error, { context: "auth.login.rateLimit" });
  }

  const callbackUrl = formData.get("callbackUrl");

  try {
    const result = await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirect: false,
    });

    if (typeof result === "string" && result.includes("error=")) {
      return { error: "Email or password is incorrect." };
    }
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Email or password is incorrect." };
    }
    return resolveActionError(error, { context: "auth.login" });
  }

  const user = await prisma.user.findUnique({
    where: { email: parsed.data.email },
    select: { role: true },
  });

  redirect(resolvePostLoginRedirect(callbackUrl, user?.role));
}

export async function registerAction(
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    return {
      error: validationMessage(parsed.error, "Please check your details."),
    };
  }

  const ip = await getRequestIp();

  try {
    await enforceRateLimit({
      key: `register:${ip}`,
      limit: 5,
      windowMs: 60 * 60 * 1000,
    });
  } catch (error) {
    if (error instanceof RateLimitError) {
      return { error: error.message };
    }
    return resolveActionError(error, { context: "auth.register.rateLimit" });
  }

  try {
    await registerUser(parsed.data);
  } catch (error) {
    if (error instanceof RegistrationError) {
      return { error: error.message };
    }
    return resolveActionError(error, { context: "auth.register" });
  }

  redirect("/login?registered=1");
}

export async function signOutAction() {
  await signOut({ redirectTo: "/" });
}
