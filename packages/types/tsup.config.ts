import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts", "src/schema.ts"],
  format: ["esm"],
  outDir: "dist",
  shims: true,
  minify: true,
  clean: true,
  dts: true,
});
