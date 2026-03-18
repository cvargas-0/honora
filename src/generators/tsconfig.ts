export function generateTsConfig(): string {
  const config = {
    compilerOptions: {
      target: "ES2022",
      module: "ESNext",
      moduleResolution: "bundler",
      outDir: "dist",
      rootDir: "src",
      strict: true,
      esModuleInterop: true,
      declaration: true,
      sourceMap: true,
      resolveJsonModule: true,
      isolatedModules: true,
      skipLibCheck: true,
    },
    include: ["src"],
    exclude: ["node_modules", "dist"],
  };

  return JSON.stringify(config, null, 2) + "\n";
}
