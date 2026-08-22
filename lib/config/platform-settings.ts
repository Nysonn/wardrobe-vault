export const PLATFORM_SETTING_KEYS = {
  CURRENCY: "marketplace.currency",
  VERIFICATION_POLICY: "marketplace.verification_policy",
  SHIPPING_GUIDANCE: "marketplace.shipping_guidance",
} as const;

export type PlatformSettingKey =
  (typeof PLATFORM_SETTING_KEYS)[keyof typeof PLATFORM_SETTING_KEYS];

export const DEFAULT_PLATFORM_SETTINGS: Record<PlatformSettingKey, string> = {
  [PLATFORM_SETTING_KEYS.CURRENCY]: "UGX",
  [PLATFORM_SETTING_KEYS.VERIFICATION_POLICY]:
    "Public figure verification requires manual admin review. Applicants must submit verifiable evidence such as press coverage, event photographs, management letters, or ownership documentation. Verification is never granted automatically.",
  [PLATFORM_SETTING_KEYS.SHIPPING_GUIDANCE]:
    "Sellers configure shipping per listing. Platform default guidance: confirm regions served, disclose fees in UGX, and provide realistic delivery estimates. International shipping is out of scope for MVP.",
};
