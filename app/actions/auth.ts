"use server";

import { AuthError } from "next-auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { signIn, signOut } from "@/lib/auth/config";
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
    return { error: "Enter a valid email and password." };
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
    throw error;
  }

  const callbackUrl = formData.get("callbackUrl");
  const redirectTo =
    typeof callbackUrl === "string" && callbackUrl.startsWith("/")
      ? callbackUrl
      : "/";

  try {
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirectTo,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Email or password is incorrect." };
    }
    throw error;
  }

  return {};
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
      error: parsed.error.issues[0]?.message ?? "Please check your details.",
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
    throw error;
  }

  try {
    await registerUser(parsed.data);
  } catch (error) {
    if (error instanceof RegistrationError) {
      return { error: error.message };
    }
    throw error;
  }

  redirect("/login?registered=1");
}

export async function signOutAction() {
  await signOut({ redirectTo: "/" });
}
