import bcrypt from "bcryptjs";

import { prisma } from "@/lib/prisma";
import type { RegisterInput } from "@/lib/schemas/auth";

export class RegistrationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "RegistrationError";
  }
}

export async function registerUser(input: RegisterInput) {
  const email = input.email.trim().toLowerCase();

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw new RegistrationError("An account with this email already exists.");
  }

  const passwordHash = await bcrypt.hash(input.password, 12);

  return prisma.user.create({
    data: {
      name: input.name.trim(),
      email,
      password: passwordHash,
      profile: {
        create: {},
      },
    },
    select: {
      id: true,
      email: true,
      name: true,
    },
  });
}
