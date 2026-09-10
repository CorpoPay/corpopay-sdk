import crypto from "node:crypto";

/**
 * Outbound (CorpoPay → merchant) webhook signature verification.
 *
 * CorpoPay signs each `payment.updated` payload with
 * `X-CorpoPay-Signature: t=<unix-seconds>,v1=<hex-hmac>` where
 * `v1 = HMAC-SHA256(secret, "<t>.<raw-body>")`, hex-encoded. This mirrors
 * `corpopay-api/src/lib/webhook-sign.ts` exactly.
 */

export interface WebhookVerification {
  /** Raw request body bytes, as a string (the exact bytes CorpoPay signed). */
  body: string;
  /** The value of the `X-CorpoPay-Signature` header. */
  signature: string;
  /**
   * Per-tenant signing secret. Defaults to the `webhookSigningSecret` passed to
   * `createCorpoPay()`; override here for a specific tenant/endpoint.
   */
  secret?: string;
  /**
   * Optional replay protection: reject signatures whose `t` is older than this
   * many seconds. Omit to skip the freshness check (authenticity only).
   */
  toleranceSeconds?: number;
}

/** Compute the expected HMAC-SHA256 hex signature over `<timestamp>.<body>`. */
function sign(secret: string, timestamp: number, body: string): string {
  return crypto.createHmac("sha256", secret).update(`${timestamp}.${body}`).digest("hex");
}

/** Constant-time comparison of two hex strings. */
function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a, "utf8");
  const bufB = Buffer.from(b, "utf8");
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

/**
 * Verify an `X-CorpoPay-Signature` header against a raw body.
 * Returns `true` only when the HMAC matches and (if `toleranceSeconds` is set)
 * the timestamp is fresh.
 */
export function verifyWebhookSignature(
  params: WebhookVerification & { secret: string },
): boolean {
  const { body, signature, secret, toleranceSeconds } = params;

  const t = /(?:^|,)\s*t=(\d+)/.exec(signature)?.[1];
  const v1 = /(?:^|,)\s*v1=([a-f0-9]+)/i.exec(signature)?.[1];
  if (!t || !v1) return false;

  const timestamp = Number.parseInt(t, 10);

  if (toleranceSeconds !== undefined) {
    const now = Math.floor(Date.now() / 1000);
    if (Math.abs(now - timestamp) > toleranceSeconds) return false;
  }

  return safeEqual(sign(secret, timestamp, body), v1);
}
