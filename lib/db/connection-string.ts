/**
 * Normalize Neon/Postgres URLs for Prisma + pg.
 *
 * Strips `channel_binding=require` (breaks many Node pg setups). Adds
 * connect_timeout when missing so Neon compute has time to wake.
 */
export function normalizeDatabaseUrl(url: string): string {
  let normalized = url;

  normalized = normalized.replace(/([?&])channel_binding=[^&]*&?/g, "$1");
  normalized = normalized.replace(/[?&]$/, "");
  normalized = normalized.replace(/\?&/, "?");

  if (!normalized.includes("connect_timeout=")) {
    normalized += `${normalized.includes("?") ? "&" : "?"}connect_timeout=30`;
  }

  return normalized;
}
