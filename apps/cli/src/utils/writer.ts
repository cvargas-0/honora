import { mkdirSync, writeFileSync, copyFileSync } from "node:fs";
import { dirname, join } from "node:path";

export function writeFile(outputDir: string, relativePath: string, content: string): void {
  const fullPath = join(outputDir, relativePath);
  mkdirSync(dirname(fullPath), { recursive: true });
  writeFileSync(fullPath, content, "utf-8");
}

export function copyFile(src: string, outputDir: string, relativePath: string): void {
  const fullPath = join(outputDir, relativePath);
  mkdirSync(dirname(fullPath), { recursive: true });
  copyFileSync(src, fullPath);
}
