import type { Prisma } from "@/lib/generated/prisma/client";
import { WalletTransactionType } from "@/lib/generated/prisma/enums";

type RecordSaleWalletEntriesInput = {
  tx: Prisma.TransactionClient;
  walletId: string;
  payoutId: string;
  listingTitle: string;
  orderNumber: string;
  grossAmount: number;
  commissionAmount: number;
};

/** Records sale and commission ledger entries when a purchase completes (§43). */
export async function recordSaleWalletEntries({
  tx,
  walletId,
  payoutId,
  listingTitle,
  orderNumber,
  grossAmount,
  commissionAmount,
}: RecordSaleWalletEntriesInput) {
  await tx.walletTransaction.createMany({
    data: [
      {
        walletId,
        payoutId,
        type: WalletTransactionType.SALE_CREDIT,
        amount: grossAmount,
        currency: "UGX",
        description: `Sale — ${listingTitle}`,
      },
      {
        walletId,
        payoutId,
        type: WalletTransactionType.COMMISSION_DEBIT,
        amount: commissionAmount,
        currency: "UGX",
        description: `Commission — ${orderNumber}`,
      },
    ],
  });
}
