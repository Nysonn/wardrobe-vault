import {
  ListingStatus,
  OrderStatus,
  PaymentStatus,
  PayoutStatus,
  ReportStatus,
} from "@/lib/generated/prisma/enums";
import { prisma } from "@/lib/prisma";

export async function getAdminOverviewMetrics() {
  const [
    totalUsers,
    activeListings,
    pendingListingApprovals,
    totalOrders,
    paidOrdersAggregate,
    pendingPayouts,
    openDisputes,
    openReports,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.listing.count({ where: { status: ListingStatus.PUBLISHED } }),
    prisma.listing.count({
      where: {
        status: { in: [ListingStatus.SUBMITTED, ListingStatus.UNDER_REVIEW] },
      },
    }),
    prisma.order.count(),
    prisma.order.aggregate({
      where: {
        paymentStatus: PaymentStatus.CONFIRMED,
        status: { not: OrderStatus.CANCELLED },
      },
      _sum: { commissionAmount: true, totalAmount: true },
      _count: true,
    }),
    prisma.payout.count({
      where: {
        status: {
          in: [PayoutStatus.PENDING, PayoutStatus.APPROVED, PayoutStatus.PROCESSING],
        },
      },
    }),
    prisma.order.count({ where: { status: OrderStatus.DISPUTED } }),
    prisma.report.count({
      where: {
        status: { in: [ReportStatus.OPEN, ReportStatus.UNDER_REVIEW] },
      },
    }),
  ]);

  return {
    totalUsers,
    activeListings,
    pendingListingApprovals,
    totalOrders,
    totalSales: paidOrdersAggregate._count,
    platformRevenue: paidOrdersAggregate._sum.commissionAmount ?? 0,
    grossSalesVolume: paidOrdersAggregate._sum.totalAmount ?? 0,
    pendingPayouts,
    openDisputes,
    openReports,
  };
}
