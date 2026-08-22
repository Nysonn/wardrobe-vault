/**
 * Auth.js requires a secret for JWT/session signing.
 * In local dev, a placeholder is used when env vars are unset so public pages
 * (e.g. homepage, 404) can render without crashing on getSession().
 */
export function getAuthSecret(): string | undefined {
  const secret = process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET;
  if (secret) {
    return secret;
  }

  if (process.env.NODE_ENV !== "production") {
    return "wardrobe-vault-local-dev-secret-not-for-production";
  }

  return undefined;
}
