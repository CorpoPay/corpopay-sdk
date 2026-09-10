import crypto from "node:crypto";
import { describe, expect, it } from "vitest";
import { createCorpoPay } from "../src/corpopay";
import { verifyWebhookSignature } from "../src/webhooks";

const SECRET = "0123456789abcdef0123456789abcdef";

function sign(body: string, secret = SECRET, t = Math.floor(Date.now() / 1000)) {
  const v1 = crypto.createHmac("sha256", secret).update(`${t}.${body}`).digest("hex");
  return { t, header: `t=${t},v1=${v1}` };
}

describe("verifyWebhookSignature", () => {
  it("accepts a correctly signed payload", () => {
    const body = JSON.stringify({ type: "payment.updated" });
    const { header } = sign(body);
    expect(verifyWebhookSignature({ body, signature: header, secret: SECRET })).toBe(true);
  });

  it("rejects a tampered body", () => {
    const body = JSON.stringify({ type: "payment.updated" });
    const { header } = sign(body);
    expect(verifyWebhookSignature({ body: body + "x", signature: header, secret: SECRET })).toBe(false);
  });

  it("rejects a wrong secret", () => {
    const body = JSON.stringify({ type: "payment.updated" });
    const { header } = sign(body);
    expect(verifyWebhookSignature({ body, signature: header, secret: SECRET.replace("a", "b") })).toBe(false);
  });

  it("rejects a malformed header", () => {
    expect(verifyWebhookSignature({ body: "x", signature: "nonsense", secret: SECRET })).toBe(false);
  });

  it("enforces timestamp tolerance when requested", () => {
    const body = JSON.stringify({ type: "payment.updated" });
    const { header } = sign(body, SECRET, Math.floor(Date.now() / 1000) - 100);
    expect(verifyWebhookSignature({ body, signature: header, secret: SECRET, toleranceSeconds: 1 })).toBe(false);
  });
});

describe("createCorpoPay", () => {
  it("configures an isolated client with base URL + API key", async () => {
    const corpo = createCorpoPay({ baseUrl: "https://api.corpopay.site", apiKey: "cp_test_abc" });
    expect(typeof corpo.client.get).toBe("function");
    expect(typeof corpo.client.post).toBe("function");
  });

  it("uses the webhookSigningSecret as the verify() default", () => {
    const corpo = createCorpoPay({
      baseUrl: "https://api.corpopay.site",
      apiKey: "cp_test_abc",
      webhookSigningSecret: SECRET,
    });
    const body = JSON.stringify({ type: "payment.updated" });
    const { header } = sign(body);
    expect(corpo.webhooks.verify({ body, signature: header })).toBe(true);
  });
});
