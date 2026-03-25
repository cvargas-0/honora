import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/cli.ts"],
  format: ["esm"],
  target: "node18",
  outDir: "dist",
  minify: true,
  clean: true,
  dts: true,
  sourcemap: true,
  banner: {
    js: "#!/usr/bin/env node",
  },
  loader: {
    ".hbs": "text",
  },
});
