import { defineConfig } from "@hey-api/openapi-ts";

export default defineConfig({
  input: "openapi.json",
  output: {
    path: "src/client",
  },
  plugins: [
    "@hey-api/typescript",
    {
      name: "@hey-api/sdk",
      client: "@hey-api/client-fetch",
      operations: {
        strategy: "byTags",
      },
    },
  ],
});
