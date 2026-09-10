import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm", "cjs"],
  dts: true,
  sourcemap: true,
  clean: true,
  target: "node20",
  // Runtime deps stay external (installed alongside the SDK) rather than bundled.
  external: ["@corpopay/contract", "@hey-api/client-fetch"],
});
