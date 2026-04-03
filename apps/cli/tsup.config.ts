import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/cli.ts"],
  format: ["esm"],
  target: "node18",
  outDir: "dist",
  shims: true,
  minify: true,
  clean: true,
  banner: {
    js: "#!/usr/bin/env node",
  },
  noExternal: ["@honora/generator", "@honora/types"],
  loader: {
    ".hbs": "text",
  },
});
