import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm"],
  outDir: "dist",
  shims: true,
  minify: true,
  clean: true,
  dts: true,
  loader: {
    ".hbs": "text",
  },
});
