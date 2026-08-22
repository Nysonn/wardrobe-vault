/**
 * Wardrobe Vault — database seed (Phase 1.2)
 *
 * Uses `prisma db execute` (Prisma's native engine) because direct pg/Neon
 * driver connections may time out in some CLI environments while migrate works.
 *
 * Demo credentials (local dev only):
 *   All seeded users share password: WardrobeVault1!
 *
 * Run: npm run db:seed
 */
import "dotenv/config";

import { execSync } from "node:child_process";

import bcrypt from "bcryptjs";

const DEMO_PASSWORD = "WardrobeVault1!";

const IDS = {
  buyer: "seed_user_buyer",
  seller: "seed_user_seller",
  icon: "seed_user_icon",
  admin: "seed_user_admin",
  superAdmin: "seed_user_super_admin",
  profileBuyer: "seed_profile_buyer",
  profileSeller: "seed_profile_seller",
  profileIcon: "seed_profile_icon",
  profileAdmin: "seed_profile_admin",
  profileSuper: "seed_profile_super",
  walletSeller: "seed_wallet_seller",
  walletIcon: "seed_wallet_icon",
  commissionDefault: "seed_commission_default",
  verificationIcon: "seed_verification_icon",
  catDresses: "seed_cat_dresses",
  catGowns: "seed_cat_gowns",
  catSuits: "seed_cat_suits",
  catJackets: "seed_cat_jackets",
  catShoes: "seed_cat_shoes",
  catHandbags: "seed_cat_handbags",
  catJewelry: "seed_cat_jewelry",
  catAccessories: "seed_cat_accessories",
  catStreetwear: "seed_cat_streetwear",
  catMenswear: "seed_cat_menswear",
  catWomenswear: "seed_cat_womenswear",
  catVintage: "seed_cat_vintage",
  catDesigner: "seed_cat_designer",
  catOther: "seed_cat_other",
  listingDraft: "seed_listing_draft",
  listingSubmitted: "seed_listing_submitted",
  listingApproved: "seed_listing_approved",
  listingRejected: "seed_listing_rejected",
  listingPublished: "seed_listing_published",
  listingSold: "seed_listing_sold",
  listingSold2: "seed_listing_sold_2",
  listingSold3: "seed_listing_sold_3",
  shipDraft: "seed_ship_draft",
  shipSubmitted: "seed_ship_submitted",
  shipApproved: "seed_ship_approved",
  shipRejected: "seed_ship_rejected",
  shipPublished: "seed_ship_published",
  shipSold: "seed_ship_sold",
  shipSold2: "seed_ship_sold_2",
  shipSold3: "seed_ship_sold_3",
  order1: "seed_order_1",
  order2: "seed_order_2",
  order3: "seed_order_3",
  payout1: "seed_payout_1",
  payout2: "seed_payout_2",
  payout3: "seed_payout_3",
  payment1: "seed_payment_1",
  payment2: "seed_payment_2",
  payment3: "seed_payment_3",
  favorite1: "seed_favorite_1",
} as const;

const CATEGORIES = [
  { id: IDS.catDresses, name: "Dresses", slug: "dresses", sort: 0 },
  { id: IDS.catGowns, name: "Gowns", slug: "gowns", sort: 1 },
  { id: IDS.catSuits, name: "Suits", slug: "suits", sort: 2 },
  { id: IDS.catJackets, name: "Jackets", slug: "jackets", sort: 3 },
  { id: IDS.catShoes, name: "Shoes", slug: "shoes", sort: 4 },
  { id: IDS.catHandbags, name: "Handbags", slug: "handbags", sort: 5 },
  { id: IDS.catJewelry, name: "Jewelry", slug: "jewelry", sort: 6 },
  { id: IDS.catAccessories, name: "Accessories", slug: "accessories", sort: 7 },
  { id: IDS.catStreetwear, name: "Streetwear", slug: "streetwear", sort: 8 },
  { id: IDS.catMenswear, name: "Menswear", slug: "menswear", sort: 9 },
  { id: IDS.catWomenswear, name: "Womenswear", slug: "womenswear", sort: 10 },
  { id: IDS.catVintage, name: "Vintage", slug: "vintage", sort: 11 },
  { id: IDS.catDesigner, name: "Designer", slug: "designer", sort: 12 },
  { id: IDS.catOther, name: "Other", slug: "other", sort: 13 },
] as const;

const DEFAULT_COMMISSION_BPS = 1000;

function q(value: string): string {
  return `'${value.replace(/'/g, "''")}'`;
}

function executeSql(sql: string, label: string): void {
  console.log(label);
  execSync("npx prisma db execute --stdin", {
    input: sql,
    stdio: ["pipe", "inherit", "inherit"],
    cwd: process.cwd(),
    env: process.env,
  });
}

function buildClearSql(): string {
  return `
BEGIN;
DELETE FROM "AdminAction";
DELETE FROM "Report";
DELETE FROM "PlatformSetting";
DELETE FROM "Message";
DELETE FROM "Notification";
DELETE FROM "WalletTransaction";
DELETE FROM "Payout";
DELETE FROM "Payment";
DELETE FROM "OrderItem";
DELETE FROM "Order";
DELETE FROM "Favorite";
DELETE FROM "ListingStatusHistory";
DELETE FROM "ListingDocument";
DELETE FROM "ListingImage";
DELETE FROM "ShippingDetail";
DELETE FROM "Listing";
DELETE FROM "PublicFigureVerification";
DELETE FROM "CommissionSetting";
DELETE FROM "Category";
DELETE FROM "Wallet";
DELETE FROM "Profile";
DELETE FROM "Session";
DELETE FROM "Account";
DELETE FROM "VerificationToken";
DELETE FROM "User";
COMMIT;
`;
}

function buildSeedSql(passwordHash: string): string {
  const categoryRows = CATEGORIES.map(
    (c) =>
      `(${q(c.id)}, ${q(c.name)}, ${q(c.slug)}, NULL, true, ${c.sort}, NOW(), NOW())`,
  ).join(",\n  ");

  const order1Price = 6_000_000;
  const order1Commission = Math.round((order1Price * DEFAULT_COMMISSION_BPS) / 10_000);
  const order1Shipping = 100_000;
  const order1Total = order1Price + order1Shipping;
  const order1Net = order1Price - order1Commission;

  const order2Price = 1_500_000;
  const order2Commission = Math.round((order2Price * DEFAULT_COMMISSION_BPS) / 10_000);
  const order2Shipping = 30_000;
  const order2Total = order2Price + order2Shipping;
  const order2Net = order2Price - order2Commission;

  const order3Price = 2_800_000;
  const order3Commission = Math.round((order3Price * DEFAULT_COMMISSION_BPS) / 10_000);
  const order3Shipping = 45_000;
  const order3Total = order3Price + order3Shipping;
  const order3Net = order3Price - order3Commission;

  const sellerWalletBalance = order2Net;
  const iconWalletBalance = order1Net + order3Net;

  return `
BEGIN;

INSERT INTO "User" ("id","name","email","password","role","isVerifiedPublicFigure","verificationStatus","createdAt","updatedAt") VALUES
  (${q(IDS.buyer)}, 'Amara Okello', 'buyer@demo.local', ${q(passwordHash)}, 'USER', false, 'UNVERIFIED', NOW(), NOW()),
  (${q(IDS.seller)}, 'David Mwangi', 'seller@demo.local', ${q(passwordHash)}, 'USER', false, 'UNVERIFIED', NOW(), NOW()),
  (${q(IDS.icon)}, 'Nia Ademola', 'icon@demo.local', ${q(passwordHash)}, 'USER', true, 'VERIFIED', NOW(), NOW()),
  (${q(IDS.admin)}, 'Elena Vasquez', 'admin@demo.local', ${q(passwordHash)}, 'ADMIN', false, 'UNVERIFIED', NOW(), NOW()),
  (${q(IDS.superAdmin)}, 'Jordan Kim', 'super@demo.local', ${q(passwordHash)}, 'SUPER_ADMIN', false, 'UNVERIFIED', NOW(), NOW());

INSERT INTO "Profile" ("id","userId","bio","location","region","headline","publicFigureBio","instagramHandle","createdAt","updatedAt") VALUES
  (${q(IDS.profileBuyer)}, ${q(IDS.buyer)}, 'Collector of pieces with a past.', 'Kampala', 'Central Region', NULL, NULL, NULL, NOW(), NOW()),
  (${q(IDS.profileSeller)}, ${q(IDS.seller)}, 'Curating my wardrobe for its next chapter.', 'Nairobi', 'East Africa', NULL, NULL, NULL, NOW(), NOW()),
  (${q(IDS.profileIcon)}, ${q(IDS.icon)}, 'Pieces from moments the world still remembers.', 'Lagos', 'West Africa', 'Verified Public Figure', 'Award-winning artist whose red-carpet archive lives here.', 'niaademola', NOW(), NOW()),
  (${q(IDS.profileAdmin)}, ${q(IDS.admin)}, 'Wardrobe Vault moderation team.', 'Remote', NULL, NULL, NULL, NULL, NOW(), NOW()),
  (${q(IDS.profileSuper)}, ${q(IDS.superAdmin)}, 'Platform operations.', 'Remote', NULL, NULL, NULL, NULL, NOW(), NOW());

INSERT INTO "Wallet" ("id","userId","availableBalance","pendingBalance","createdAt","updatedAt") VALUES
  (${q(IDS.walletSeller)}, ${q(IDS.seller)}, ${sellerWalletBalance}, 0, NOW(), NOW()),
  (${q(IDS.walletIcon)}, ${q(IDS.icon)}, ${iconWalletBalance}, 0, NOW(), NOW());

INSERT INTO "CommissionSetting" ("id","type","name","rateBps","isActive","description","createdAt","updatedAt") VALUES
  (${q(IDS.commissionDefault)}, 'DEFAULT', 'Platform default', ${DEFAULT_COMMISSION_BPS}, true, 'Default commission applied when no override matches.', NOW(), NOW());

INSERT INTO "Category" ("id","name","slug","description","isActive","sortOrder","createdAt","updatedAt") VALUES
  ${categoryRows};

INSERT INTO "PublicFigureVerification" ("id","userId","status","applicationNotes","evidenceSummary","evidenceUrls","adminDecision","adminNotes","reviewedById","reviewedAt","submittedAt","createdAt","updatedAt") VALUES
  (${q(IDS.verificationIcon)}, ${q(IDS.icon)}, 'VERIFIED', 'Public figure verification for Nia Ademola — press kit and event portfolio attached.', 'Press coverage, event photographs, management letter.', ARRAY[${q("https://res.cloudinary.com/demo/image/upload/v1/evidence/press-kit.pdf")}, ${q("https://res.cloudinary.com/demo/image/upload/v1/evidence/event-photos.zip")}], 'APPROVED', 'Evidence reviewed and verified.', ${q(IDS.admin)}, '2026-06-01T10:00:00Z', '2026-05-28T14:30:00Z', NOW(), NOW());

INSERT INTO "Listing" ("id","sellerId","categoryId","title","brand","designer","price","currency","size","color","material","condition","wornByName","wornByUserId","wornBySeller","eventName","eventDate","timesWorn","storyDetails","storyVerifiedByVault","authenticityVerifiedByVault","status","rejectionReason","publishedAt","soldAt","submittedAt","createdAt","updatedAt") VALUES
  (${q(IDS.listingDraft)}, ${q(IDS.seller)}, ${q(IDS.catDresses)}, 'Silk Evening Dress — Work in Progress', 'Unfinished Atelier', 'Unfinished Atelier', 1800000, 'UGX', 'M', 'Champagne', 'Silk', 'EXCELLENT', NULL, NULL, false, NULL, NULL, NULL, 'Draft listing — story still being written.', false, false, 'DRAFT', NULL, NULL, NULL, NULL, NOW(), NOW()),
  (${q(IDS.listingSubmitted)}, ${q(IDS.seller)}, ${q(IDS.catJackets)}, 'Structured Wool Blazer', 'Maison Lumière', 'Maison Lumière', 2200000, 'UGX', 'L', 'Charcoal', 'Wool', 'VERY_GOOD', NULL, NULL, true, 'Gallery Opening', NULL, NULL, 'Worn once to a private gallery opening in Nairobi.', false, false, 'SUBMITTED', NULL, NULL, NULL, '2026-07-10T09:00:00Z', NOW(), NOW()),
  (${q(IDS.listingApproved)}, ${q(IDS.icon)}, ${q(IDS.catGowns)}, 'Ivory Column Gown — Awards Night', 'Atelier Noire', 'Atelier Noire', 8500000, 'UGX', 'S', 'Ivory', 'Silk crepe', 'EXCELLENT', 'Nia Ademola', ${q(IDS.icon)}, true, 'Continental Music Awards', '2025-11-20T00:00:00Z', 1, 'Worn once for a televised awards ceremony. Preserved in garment bag since.', true, false, 'APPROVED', NULL, NULL, NULL, '2026-07-05T11:00:00Z', NOW(), NOW()),
  (${q(IDS.listingRejected)}, ${q(IDS.seller)}, ${q(IDS.catHandbags)}, 'Quilted Evening Clutch', 'Unverified Label', NULL, 950000, 'UGX', 'One size', 'Gold', NULL, 'GOOD', NULL, NULL, false, NULL, NULL, NULL, NULL, false, false, 'REJECTED', 'Ownership documentation does not match the claimed provenance. Please resubmit with a verifiable receipt or certificate.', NULL, NULL, '2026-07-01T16:00:00Z', NOW(), NOW()),
  (${q(IDS.listingPublished)}, ${q(IDS.icon)}, ${q(IDS.catDesigner)}, 'Architectural Shoulder Bag', 'Maison Éclat', 'Maison Éclat', 4200000, 'UGX', 'One size', 'Espresso', 'Leather', 'EXCELLENT', 'Nia Ademola', ${q(IDS.icon)}, false, 'Fashion Week Front Row', NULL, NULL, 'Carried during front-row appearances across two seasons.', true, false, 'PUBLISHED', NULL, '2026-07-12T08:00:00Z', NULL, '2026-07-08T10:00:00Z', NOW(), NOW()),
  (${q(IDS.listingSold)}, ${q(IDS.icon)}, ${q(IDS.catGowns)}, 'Midnight Silk Gown — Film Premiere', 'Couture Archive', 'Couture Archive', ${order1Price}, 'UGX', 'M', 'Midnight', 'Silk', 'EXCELLENT', 'Nia Ademola', ${q(IDS.icon)}, true, 'International Film Premiere', '2024-09-15T00:00:00Z', 1, 'Premiere gown, professionally cleaned and archived.', true, true, 'SOLD', NULL, '2026-05-01T10:00:00Z', '2026-06-15T14:00:00Z', '2026-04-20T09:00:00Z', NOW(), NOW()),
  (${q(IDS.listingSold2)}, ${q(IDS.seller)}, ${q(IDS.catHandbags)}, 'Vintage Leather Tote — Sold', 'Heritage Atelier', NULL, ${order2Price}, 'UGX', NULL, NULL, NULL, 'VERY_GOOD', NULL, NULL, true, NULL, NULL, NULL, 'Daily carry for two seasons, well maintained.', false, false, 'SOLD', NULL, '2026-04-01T00:00:00Z', '2026-05-20T12:00:00Z', NULL, NOW(), NOW()),
  (${q(IDS.listingSold3)}, ${q(IDS.icon)}, ${q(IDS.catDesigner)}, 'Crystal Drop Earrings — Sold', 'Lumière Joaillerie', NULL, ${order3Price}, 'UGX', NULL, NULL, NULL, 'EXCELLENT', 'Nia Ademola', ${q(IDS.icon)}, false, 'Charity Gala', NULL, NULL, NULL, true, false, 'SOLD', NULL, '2026-03-15T00:00:00Z', '2026-04-10T18:00:00Z', NULL, NOW(), NOW());

INSERT INTO "ShippingDetail" ("id","listingId","isAvailable","regions","fee","estimatedDaysMin","estimatedDaysMax","createdAt","updatedAt") VALUES
  (${q(IDS.shipDraft)}, ${q(IDS.listingDraft)}, true, ARRAY[${q("East Africa")}], 35000, 3, 7, NOW(), NOW()),
  (${q(IDS.shipSubmitted)}, ${q(IDS.listingSubmitted)}, true, ARRAY[${q("East Africa")}, ${q("Central Africa")}], 40000, 4, 8, NOW(), NOW()),
  (${q(IDS.shipApproved)}, ${q(IDS.listingApproved)}, true, ARRAY[${q("Africa")}, ${q("Europe")}], 120000, 5, 14, NOW(), NOW()),
  (${q(IDS.shipRejected)}, ${q(IDS.listingRejected)}, true, ARRAY[${q("East Africa")}], 25000, NULL, NULL, NOW(), NOW()),
  (${q(IDS.shipPublished)}, ${q(IDS.listingPublished)}, true, ARRAY[${q("Worldwide")}], 85000, 5, 12, NOW(), NOW()),
  (${q(IDS.shipSold)}, ${q(IDS.listingSold)}, true, ARRAY[${q("Africa")}, ${q("Europe")}, ${q("North America")}], ${order1Shipping}, 5, 14, NOW(), NOW()),
  (${q(IDS.shipSold2)}, ${q(IDS.listingSold2)}, true, ARRAY[${q("East Africa")}], ${order2Shipping}, NULL, NULL, NOW(), NOW()),
  (${q(IDS.shipSold3)}, ${q(IDS.listingSold3)}, true, ARRAY[${q("Worldwide")}], ${order3Shipping}, NULL, NULL, NOW(), NOW());

INSERT INTO "ListingImage" ("id","listingId","cloudinaryPublicId","url","sortOrder","altText","width","height","createdAt") VALUES
  ('seed_img_submitted_1', ${q(IDS.listingSubmitted)}, 'wardrobe-vault/demo/submitted-blazer/0', 'https://res.cloudinary.com/demo/image/upload/c_fill,w_1200,h_1600/sample.jpg', 0, 'Front view', 1200, 1600, NOW()),
  ('seed_img_submitted_2', ${q(IDS.listingSubmitted)}, 'wardrobe-vault/demo/submitted-blazer/1', 'https://res.cloudinary.com/demo/image/upload/c_fill,w_1200,h_1600/sample.jpg', 1, 'Detail', 1200, 1600, NOW()),
  ('seed_img_published_1', ${q(IDS.listingPublished)}, 'wardrobe-vault/demo/published-bag/0', 'https://res.cloudinary.com/demo/image/upload/c_fill,w_1200,h_1600/sample.jpg', 0, 'Front', 1200, 1600, NOW()),
  ('seed_img_published_2', ${q(IDS.listingPublished)}, 'wardrobe-vault/demo/published-bag/1', 'https://res.cloudinary.com/demo/image/upload/c_fill,w_1200,h_1600/sample.jpg', 1, 'Interior', 1200, 1600, NOW());

INSERT INTO "ListingDocument" ("id","listingId","type","cloudinaryPublicId","url","fileName","createdAt") VALUES
  ('seed_doc_approved_1', ${q(IDS.listingApproved)}, 'EVENT_PHOTOGRAPH', 'wardrobe-vault/demo/approved-gown/event-photo', 'https://res.cloudinary.com/demo/image/upload/v1/event-photo.jpg', 'awards-ceremony.jpg', NOW());

INSERT INTO "ListingStatusHistory" ("id","listingId","fromStatus","toStatus","actorId","reason","notes","createdAt") VALUES
  ('seed_hist_1', ${q(IDS.listingSubmitted)}, 'DRAFT', 'SUBMITTED', ${q(IDS.seller)}, 'Seller submitted for review', NULL, NOW()),
  ('seed_hist_2', ${q(IDS.listingApproved)}, 'DRAFT', 'SUBMITTED', ${q(IDS.icon)}, NULL, NULL, NOW()),
  ('seed_hist_3', ${q(IDS.listingApproved)}, 'SUBMITTED', 'UNDER_REVIEW', ${q(IDS.admin)}, NULL, NULL, NOW()),
  ('seed_hist_4', ${q(IDS.listingApproved)}, 'UNDER_REVIEW', 'APPROVED', ${q(IDS.admin)}, NULL, 'Authenticity evidence reviewed.', NOW()),
  ('seed_hist_5', ${q(IDS.listingRejected)}, 'UNDER_REVIEW', 'REJECTED', ${q(IDS.admin)}, 'Insufficient authenticity evidence', NULL, NOW()),
  ('seed_hist_6', ${q(IDS.listingPublished)}, 'APPROVED', 'PUBLISHED', ${q(IDS.admin)}, NULL, NULL, NOW()),
  ('seed_hist_7', ${q(IDS.listingSold)}, 'PUBLISHED', 'SOLD', ${q(IDS.admin)}, 'Purchase completed', NULL, NOW());

INSERT INTO "Favorite" ("id","userId","listingId","createdAt") VALUES
  (${q(IDS.favorite1)}, ${q(IDS.buyer)}, ${q(IDS.listingPublished)}, NOW());

INSERT INTO "Order" ("id","orderNumber","buyerId","sellerId","status","paymentStatus","payoutStatus","itemPrice","commissionAmount","commissionRateBps","shippingFee","totalAmount","currency","trackingNumber","trackingCarrier","placedAt","paidAt","shippedAt","deliveredAt","completedAt","createdAt","updatedAt") VALUES
  (${q(IDS.order1)}, 'WV-2026-0001', ${q(IDS.buyer)}, ${q(IDS.icon)}, 'COMPLETED', 'CONFIRMED', 'PAID', ${order1Price}, ${order1Commission}, ${DEFAULT_COMMISSION_BPS}, ${order1Shipping}, ${order1Total}, 'UGX', 'WVTRK000001', 'Wardrobe Vault Logistics', '2026-06-10T11:30:00Z', '2026-06-10T11:31:00Z', '2026-06-12T09:00:00Z', '2026-06-18T16:00:00Z', '2026-06-20T10:00:00Z', NOW(), NOW()),
  (${q(IDS.order2)}, 'WV-2026-0002', ${q(IDS.buyer)}, ${q(IDS.seller)}, 'COMPLETED', 'CONFIRMED', 'PAID', ${order2Price}, ${order2Commission}, ${DEFAULT_COMMISSION_BPS}, ${order2Shipping}, ${order2Total}, 'UGX', 'WVTRK000002', 'Wardrobe Vault Logistics', '2026-05-18T09:00:00Z', '2026-05-18T09:02:00Z', '2026-05-19T08:00:00Z', '2026-05-22T14:00:00Z', '2026-05-25T11:00:00Z', NOW(), NOW()),
  (${q(IDS.order3)}, 'WV-2026-0003', ${q(IDS.buyer)}, ${q(IDS.icon)}, 'COMPLETED', 'CONFIRMED', 'PAID', ${order3Price}, ${order3Commission}, ${DEFAULT_COMMISSION_BPS}, ${order3Shipping}, ${order3Total}, 'UGX', 'WVTRK000003', 'Wardrobe Vault Logistics', '2026-04-08T15:00:00Z', '2026-04-08T15:01:00Z', '2026-04-09T10:00:00Z', '2026-04-14T12:00:00Z', '2026-04-16T09:00:00Z', NOW(), NOW());

INSERT INTO "OrderItem" ("id","orderId","listingId","titleSnapshot","price","createdAt") VALUES
  ('seed_order_item_1', ${q(IDS.order1)}, ${q(IDS.listingSold)}, 'Midnight Silk Gown — Film Premiere', ${order1Price}, NOW()),
  ('seed_order_item_2', ${q(IDS.order2)}, ${q(IDS.listingSold2)}, 'Vintage Leather Tote — Sold', ${order2Price}, NOW()),
  ('seed_order_item_3', ${q(IDS.order3)}, ${q(IDS.listingSold3)}, 'Crystal Drop Earrings — Sold', ${order3Price}, NOW());

INSERT INTO "Payment" ("id","orderId","userId","provider","providerReference","status","amount","currency","createdAt","updatedAt") VALUES
  (${q(IDS.payment1)}, ${q(IDS.order1)}, ${q(IDS.buyer)}, 'mock', 'mock_WV-2026-0001', 'CONFIRMED', ${order1Total}, 'UGX', NOW(), NOW()),
  (${q(IDS.payment2)}, ${q(IDS.order2)}, ${q(IDS.buyer)}, 'mock', 'mock_WV-2026-0002', 'CONFIRMED', ${order2Total}, 'UGX', NOW(), NOW()),
  (${q(IDS.payment3)}, ${q(IDS.order3)}, ${q(IDS.buyer)}, 'mock', 'mock_WV-2026-0003', 'CONFIRMED', ${order3Total}, 'UGX', NOW(), NOW());

INSERT INTO "Payout" ("id","orderId","sellerId","grossAmount","commissionAmount","netAmount","currency","status","approvedById","approvedAt","paidAt","createdAt","updatedAt") VALUES
  (${q(IDS.payout1)}, ${q(IDS.order1)}, ${q(IDS.icon)}, ${order1Price}, ${order1Commission}, ${order1Net}, 'UGX', 'PAID', ${q(IDS.admin)}, '2026-06-18T16:00:00Z', '2026-06-20T10:00:00Z', NOW(), NOW()),
  (${q(IDS.payout2)}, ${q(IDS.order2)}, ${q(IDS.seller)}, ${order2Price}, ${order2Commission}, ${order2Net}, 'UGX', 'PAID', ${q(IDS.admin)}, '2026-05-22T14:00:00Z', '2026-05-25T11:00:00Z', NOW(), NOW()),
  (${q(IDS.payout3)}, ${q(IDS.order3)}, ${q(IDS.icon)}, ${order3Price}, ${order3Commission}, ${order3Net}, 'UGX', 'PAID', ${q(IDS.admin)}, '2026-04-14T12:00:00Z', '2026-04-16T09:00:00Z', NOW(), NOW());

INSERT INTO "WalletTransaction" ("id","walletId","type","amount","currency","description","payoutId","createdAt") VALUES
  ('seed_wt_1', ${q(IDS.walletIcon)}, 'SALE_CREDIT', ${order1Price}, 'UGX', 'Sale — Midnight Silk Gown — Film Premiere', ${q(IDS.payout1)}, NOW()),
  ('seed_wt_2', ${q(IDS.walletIcon)}, 'COMMISSION_DEBIT', ${order1Commission}, 'UGX', 'Commission — WV-2026-0001', ${q(IDS.payout1)}, NOW()),
  ('seed_wt_3', ${q(IDS.walletIcon)}, 'PAYOUT_DEBIT', ${order1Net}, 'UGX', 'Payout — WV-2026-0001', ${q(IDS.payout1)}, NOW()),
  ('seed_wt_4', ${q(IDS.walletSeller)}, 'SALE_CREDIT', ${order2Price}, 'UGX', 'Sale — Vintage Leather Tote — Sold', ${q(IDS.payout2)}, NOW()),
  ('seed_wt_5', ${q(IDS.walletSeller)}, 'COMMISSION_DEBIT', ${order2Commission}, 'UGX', 'Commission — WV-2026-0002', ${q(IDS.payout2)}, NOW()),
  ('seed_wt_6', ${q(IDS.walletSeller)}, 'PAYOUT_DEBIT', ${order2Net}, 'UGX', 'Payout — WV-2026-0002', ${q(IDS.payout2)}, NOW()),
  ('seed_wt_7', ${q(IDS.walletIcon)}, 'SALE_CREDIT', ${order3Price}, 'UGX', 'Sale — Crystal Drop Earrings — Sold', ${q(IDS.payout3)}, NOW()),
  ('seed_wt_8', ${q(IDS.walletIcon)}, 'COMMISSION_DEBIT', ${order3Commission}, 'UGX', 'Commission — WV-2026-0003', ${q(IDS.payout3)}, NOW()),
  ('seed_wt_9', ${q(IDS.walletIcon)}, 'PAYOUT_DEBIT', ${order3Net}, 'UGX', 'Payout — WV-2026-0003', ${q(IDS.payout3)}, NOW());

INSERT INTO "Notification" ("id","userId","type","title","body","link","createdAt") VALUES
  ('seed_notif_1', ${q(IDS.icon)}, 'LISTING_APPROVED', 'Your listing was approved', 'Architectural Shoulder Bag is ready to publish.', ${q(`/listings/${IDS.listingPublished}`)}, NOW()),
  ('seed_notif_2', ${q(IDS.seller)}, 'LISTING_REJECTED', 'Listing needs attention', 'Ownership documentation does not match the claimed provenance. Please resubmit with a verifiable receipt or certificate.', NULL, NOW()),
  ('seed_notif_3', ${q(IDS.buyer)}, 'PURCHASE_CONFIRMED', 'Purchase confirmed', 'Midnight Silk Gown — Film Premiere. We will notify you when it ships.', NULL, NOW());

INSERT INTO "AdminAction" ("id","adminId","action","targetType","targetId","details","createdAt") VALUES
  ('seed_audit_1', ${q(IDS.admin)}, 'VERIFICATION_APPROVED', 'User', ${q(IDS.icon)}, '{"email":"icon@demo.local"}', NOW()),
  ('seed_audit_2', ${q(IDS.admin)}, 'LISTING_APPROVED', 'Listing', ${q(IDS.listingApproved)}, NULL, NOW()),
  ('seed_audit_3', ${q(IDS.admin)}, 'PAYOUT_PAID', 'Order', 'WV-2026-0001', NULL, NOW());

INSERT INTO "PlatformSetting" ("key","value","updatedAt") VALUES
  ('marketplace.currency', 'UGX', NOW()),
  ('marketplace.verification_policy', 'Public figure verification requires manual admin review. Applicants must submit verifiable evidence such as press coverage, event photographs, management letters, or ownership documentation. Verification is never granted automatically.', NOW()),
  ('marketplace.shipping_guidance', 'Sellers configure shipping per listing. Platform default guidance: confirm regions served, disclose fees in UGX, and provide realistic delivery estimates. International shipping is out of scope for MVP.', NOW());

INSERT INTO "Report" ("id","reporterId","listingId","reason","details","status","createdAt","updatedAt") VALUES
  ('seed_report_open', ${q(IDS.buyer)}, ${q(IDS.listingPublished)}, 'MISLEADING_DESCRIPTION', 'The event attribution on this listing may not match published photographs from the referenced appearance.', 'OPEN', NOW(), NOW());

COMMIT;
`;
}

async function main(): Promise<void> {
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 12);

  executeSql(buildClearSql(), "Clearing existing seed data…");
  executeSql(buildSeedSql(passwordHash), "Inserting seed data…");

  console.log("\nSeed complete.\n");
  console.log("Demo accounts (password for all: WardrobeVault1!):");
  console.log("  Buyer:              buyer@demo.local");
  console.log("  Seller:             seller@demo.local");
  console.log("  Verified figure:    icon@demo.local");
  console.log("  Admin:              admin@demo.local");
  console.log("  Super admin:        super@demo.local");
  console.log(`\n  Categories:         ${CATEGORIES.length}`);
  console.log("  Listings:           draft, submitted, approved, rejected, published, sold (+2 sold for orders)");
  console.log("  Completed orders:   3");
}

main().catch((error: unknown) => {
  console.error("Seed failed:", error);
  process.exit(1);
});
