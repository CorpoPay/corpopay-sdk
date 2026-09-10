import { createClient, createConfig } from "./client/client/index";
import type { Client } from "./client/client/index";
import { verifyWebhookSignature } from "./webhooks";

export interface CorpoPayConfig {
  /** Base URL of the CorpoPay API (e.g. `https://api.corpopay.site`). */
  baseUrl: string;
  /** Tenant API key (`cp_live_…` / `cp_test_…`). Sent as `Authorization: Bearer`. */
  apiKey: string;
  /** Optional tenant webhook signing secret, used by `corpoPay.webhooks.verify()`. */
  webhookSigningSecret?: string;
  /** Extra headers merged into every request. */
  headers?: Record<string, string>;
}

export interface CorpoPay {
  /** The configured `@hey-api/client-fetch` client (isolated, multi-tenant safe). */
  client: Client;
  webhooks: {
    /**
     * Verify an inbound CorpoPay webhook. Uses `webhookSigningSecret` from config
     * unless `secret` is supplied on the call.
     */
    verify: (params: Omit<Parameters<typeof verifyWebhookSignature>[0], "secret"> & {
      secret?: string;
    }) => boolean;
  };
}

/**
 * Create a configured CorpoPay client. Configure once (base URL + API key), then
 * pass `corpoPay.client` into any generated SDK method, e.g.:
 *
 *   const corpoPay = createCorpoPay({ baseUrl, apiKey });
 *   const { data } = await PaymentLinks.listPaymentLinks({ client: corpoPay.client });
 */
export function createCorpoPay(config: CorpoPayConfig): CorpoPay {
  const { baseUrl, apiKey, webhookSigningSecret, headers } = config;

  const client = createClient(
    createConfig({
      baseUrl,
      headers: { Authorization: `Bearer ${apiKey}`, ...headers },
    }),
  );

  return {
    client,
    webhooks: {
      verify: (params) => {
        const secret = params.secret ?? webhookSigningSecret;
        if (!secret) {
          throw new Error(
            "No webhook signing secret: pass `webhookSigningSecret` to createCorpoPay() or `secret` to verify()",
          );
        }
        return verifyWebhookSignature({ ...params, secret });
      },
    },
  };
}
