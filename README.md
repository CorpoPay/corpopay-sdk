# @corpopay/sdk

[![Website](https://img.shields.io/badge/website-corpopay.site-6e3ff6)](https://corpopay.site)

Type-safe TypeScript SDK for the [CorpoPay](https://corpopay.site) payments
API. The client is **generated** from the API's OpenAPI contract (`@corpopay/contract`)
with [`@hey-api/openapi-ts`](https://heyapi.dev), then bundled into a single ESM + CJS
artifact consumable from Node, serverless runtimes, and bundlers.

## Install

```bash
npm install @corpopay/sdk
```

## Configure once, then call

`createCorpoPay()` gives you an isolated client with your base URL and tenant API key
pre-configured. Pass it into any generated method.

```ts
import { createCorpoPay, PaymentLinks, PaymentIntents } from "@corpopay/sdk";

const corpoPay = createCorpoPay({
  baseUrl: "https://api.corpopay.site", // your deployment
  apiKey: "cp_live_…",                  // tenant API key (cp_live_ / cp_test_)
});

// Amounts are integer centimes (per-currency minor units).
const { data, error } = await PaymentLinks.listPaymentLinks({ client: corpoPay.client });
const created = await PaymentLinks.createPaymentLink({
  client: corpoPay.client,
  body: { amount: 9900, currency: "MAD", description: "…", provider: "VPS" },
});
```

The SDK is grouped by resource tag: `PaymentLinks`, `PaymentIntents`, `Refunds`,
`Subscriptions`, `Payouts`, `Wallets`, `Webhooks`, `Ledger`, `Settlement`, and more.

## Verify inbound webhooks

```ts
const corpoPay = createCorpoPay({
  baseUrl,
  apiKey,
  webhookSigningSecret: "…", // tenant's webhook signing secret
});

app.post("/webhooks/corpopay", (req) => {
  const ok = corpoPay.webhooks.verify({
    body: req.rawBody,               // exact raw bytes CorpoPay signed
    signature: req.headers["x-corpopay-signature"],
    toleranceSeconds: 300,           // optional replay protection
  });
  if (!ok) return 401;
  // … handle the event
});
```

## Status & money types

Precise enum unions (from the API's Prisma schema) are re-exported from
`@corpopay/contract`, e.g. `PaymentIntentStatus`, `PaymentLinkStatus`, and their
runtime value arrays (`PaymentIntentStatusValues`, …). Note `CANCELED` (payment intent)
and `CANCELLED` (subscription / installment agreement / payout) are distinct.

## Regenerating the client

The committed `src/client/` is generated from `openapi.json` (the API's spec) via:

```bash
npm run generate   # openapi-ts
npm run build      # tsup → dist/index.js + dist/index.cjs + dist/index.d.ts
npm test           # vitest
```

When the API contract changes, copy the new `corpopay-api/openapi.json` here and
re-run `npm run generate`. The version is driven by release-please.
