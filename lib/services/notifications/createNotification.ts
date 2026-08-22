import type { Prisma } from "@/lib/generated/prisma/client";
import type { NotificationType } from "@/lib/generated/prisma/enums";
import { prisma } from "@/lib/prisma";

export type CreateNotificationInput = {
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  link?: string | null;
  metadata?: Prisma.InputJsonValue;
};

type TransactionClient = Prisma.TransactionClient;

export async function createNotification(
  input: CreateNotificationInput,
  tx?: TransactionClient,
) {
  const client = tx ?? prisma;

  return client.notification.create({
    data: {
      userId: input.userId,
      type: input.type,
      title: input.title,
      body: input.body,
      link: input.link ?? null,
      metadata: input.metadata,
    },
  });
}

export async function createNotifications(
  inputs: CreateNotificationInput[],
  tx?: TransactionClient,
) {
  if (inputs.length === 0) return [];

  const client = tx ?? prisma;

  return Promise.all(inputs.map((input) => createNotification(input, client)));
}
