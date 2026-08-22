import { Role } from "@/lib/generated/prisma/enums";
import { prisma } from "@/lib/prisma";
import { isAdminRole } from "@/lib/auth/guards";

export class AdminUserError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AdminUserError";
  }
}

const PAGE_SIZE = 20;

export async function searchAdminUsers(query?: string, page = 1) {
  const where = query?.trim()
    ? {
        OR: [
          { name: { contains: query.trim(), mode: "insensitive" as const } },
          { email: { contains: query.trim(), mode: "insensitive" as const } },
        ],
      }
    : {};

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy: [{ createdAt: "desc" }],
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        suspendedAt: true,
        isVerifiedPublicFigure: true,
        verificationStatus: true,
        createdAt: true,
        _count: {
          select: {
            listings: true,
            ordersAsSeller: true,
          },
        },
      },
    }),
    prisma.user.count({ where }),
  ]);

  return {
    users,
    total,
    page,
    pageSize: PAGE_SIZE,
    totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
  };
}

export async function getAdminUserDetail(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      suspendedAt: true,
      suspendedReason: true,
      isVerifiedPublicFigure: true,
      verificationStatus: true,
      createdAt: true,
      profile: {
        select: {
          bio: true,
          region: true,
          location: true,
        },
      },
      listings: {
        orderBy: { createdAt: "desc" },
        take: 10,
        select: {
          id: true,
          title: true,
          status: true,
          price: true,
          createdAt: true,
        },
      },
      ordersAsSeller: {
        orderBy: { placedAt: "desc" },
        take: 10,
        select: {
          id: true,
          orderNumber: true,
          status: true,
          totalAmount: true,
          placedAt: true,
        },
      },
      _count: {
        select: {
          listings: true,
          ordersAsSeller: true,
          ordersAsBuyer: true,
          reportsFiled: true,
        },
      },
    },
  });
}

function assertCanModerateTarget(
  actorRole: Role,
  targetRole: Role,
  action: "suspend" | "unsuspend",
) {
  if (targetRole === Role.SUPER_ADMIN) {
    throw new AdminUserError("Super admin accounts cannot be modified.");
  }

  if (isAdminRole(targetRole) && actorRole !== Role.SUPER_ADMIN) {
    throw new AdminUserError(
      `Only a super admin can ${action} staff accounts.`,
    );
  }
}

export async function suspendUser({
  adminId,
  adminRole,
  userId,
  reason,
}: {
  adminId: string;
  adminRole: Role;
  userId: string;
  reason: string;
}) {
  if (adminId === userId) {
    throw new AdminUserError("You cannot suspend your own account.");
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, role: true, suspendedAt: true },
  });

  if (!user) {
    throw new AdminUserError("User not found.");
  }

  if (user.suspendedAt) {
    throw new AdminUserError("This account is already suspended.");
  }

  assertCanModerateTarget(adminRole, user.role, "suspend");

  const now = new Date();

  await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: userId },
      data: {
        suspendedAt: now,
        suspendedReason: reason.trim(),
      },
    });

    await tx.session.deleteMany({ where: { userId } });
  });

  await prisma.adminAction.create({
    data: {
      adminId,
      action: "USER_SUSPENDED",
      targetType: "User",
      targetId: userId,
      details: {
        email: user.email,
        reason: reason.trim(),
      },
    },
  });

  return { userId, suspendedAt: now };
}

export async function unsuspendUser({
  adminId,
  adminRole,
  userId,
}: {
  adminId: string;
  adminRole: Role;
  userId: string;
}) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, role: true, suspendedAt: true },
  });

  if (!user) {
    throw new AdminUserError("User not found.");
  }

  if (!user.suspendedAt) {
    throw new AdminUserError("This account is not suspended.");
  }

  assertCanModerateTarget(adminRole, user.role, "unsuspend");

  await prisma.user.update({
    where: { id: userId },
    data: {
      suspendedAt: null,
      suspendedReason: null,
    },
  });

  await prisma.adminAction.create({
    data: {
      adminId,
      action: "USER_UNSUSPENDED",
      targetType: "User",
      targetId: userId,
      details: { email: user.email },
    },
  });

  return { userId };
}
