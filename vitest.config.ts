import { defineConfig } from "vitest/config";

// Most tests drive a real browser; a scan takes a few seconds.
export default defineConfig({ test: { testTimeout: 20000 } });
