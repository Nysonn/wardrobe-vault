import { prisma } from "@/lib/prisma";
import {
  DEFAULT_PLATFORM_SETTINGS,
  PLATFORM_SETTING_KEYS,
  type PlatformSettingKey,
} from "@/lib/config/platform-settings";

export class AdminSettingsError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AdminSettingsError";
  }
}

export type PlatformSettingsSnapshot = {
  currency: string;
  verificationPolicy: string;
  shippingGuidance: string;
};

function resolveSetting(
  map: Map<string, string>,
  key: PlatformSettingKey,
): string {
  return map.get(key) ?? DEFAULT_PLATFORM_SETTINGS[key];
}

export async function getPlatformSettings(): Promise<PlatformSettingsSnapshot> {
  const rows = await prisma.platformSetting.findMany({
    where: {
      key: {
        in: Object.values(PLATFORM_SETTING_KEYS),
      },
    },
  });

  const map = new Map<string, string>(
    rows.map((row) => [row.key, row.value]),
  );

  return {
    currency: resolveSetting(map, PLATFORM_SETTING_KEYS.CURRENCY),
    verificationPolicy: resolveSetting(
      map,
      PLATFORM_SETTING_KEYS.VERIFICATION_POLICY,
    ),
    shippingGuidance: resolveSetting(
      map,
      PLATFORM_SETTING_KEYS.SHIPPING_GUIDANCE,
    ),
  };
}

async function upsertSetting(
  key: PlatformSettingKey,
  value: string,
  adminId: string,
) {
  return prisma.platformSetting.upsert({
    where: { key },
    create: { key, value, updatedById: adminId },
    update: { value, updatedById: adminId },
  });
}

export async function updatePlatformSettings({
  adminId,
  verificationPolicy,
  shippingGuidance,
}: {
  adminId: string;
  verificationPolicy: string;
  shippingGuidance: string;
}) {
  const trimmedPolicy = verificationPolicy.trim();
  const trimmedShipping = shippingGuidance.trim();

  if (trimmedPolicy.length < 20) {
    throw new AdminSettingsError(
      "Verification policy must be at least 20 characters.",
    );
  }

  if (trimmedShipping.length < 20) {
    throw new AdminSettingsError(
      "Shipping guidance must be at least 20 characters.",
    );
  }

  await Promise.all([
    upsertSetting(
      PLATFORM_SETTING_KEYS.VERIFICATION_POLICY,
      trimmedPolicy,
      adminId,
    ),
    upsertSetting(
      PLATFORM_SETTING_KEYS.SHIPPING_GUIDANCE,
      trimmedShipping,
      adminId,
    ),
  ]);

  await prisma.adminAction.create({
    data: {
      adminId,
      action: "PLATFORM_SETTINGS_UPDATED",
      targetType: "PlatformSetting",
      targetId: "marketplace",
      details: {
        keys: [
          PLATFORM_SETTING_KEYS.VERIFICATION_POLICY,
          PLATFORM_SETTING_KEYS.SHIPPING_GUIDANCE,
        ],
      },
    },
  });
}

export async function ensureDefaultPlatformSettings() {
  await Promise.all(
    Object.entries(DEFAULT_PLATFORM_SETTINGS).map(([key, value]) =>
      prisma.platformSetting.upsert({
        where: { key },
        create: { key, value },
        update: {},
      }),
    ),
  );
}
