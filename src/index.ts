// Generated, type-safe client (SDK classes grouped by tag + request types).
export * from "./client/index";

// The default singleton client + primitives for isolated, multi-tenant clients.
export { client, type CreateClientConfig } from "./client/client.gen";
export {
  createClient,
  createConfig,
  mergeHeaders,
} from "./client/client/index";
export type {
  Client,
  ClientOptions,
  Config,
  Options as ClientFetchOptions,
  RequestResult,
} from "./client/client/index";

// Ergonomic factory + webhook verification.
export { createCorpoPay } from "./corpopay";
export type { CorpoPay, CorpoPayConfig } from "./corpopay";
export { verifyWebhookSignature } from "./webhooks";
export type { WebhookVerification } from "./webhooks";

// Precise status/money enum unions (from the API's Prisma schema), re-exported
// so SDK consumers get the real enum values instead of the OpenAPI `string`.
export * from "@corpopay/contract";
