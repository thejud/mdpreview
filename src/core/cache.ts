import { existsSync, mkdirSync, rmSync } from "fs";
import { join } from "path";
import { tmpdir } from "os";

const CACHE_DIR_NAME = "mdpreview";

/**
 * Get or create the cache directory
 * @returns Absolute path to cache directory
 */
export function getCacheDir(): string {
  const cacheDir = join(tmpdir(), CACHE_DIR_NAME);

  if (!existsSync(cacheDir)) {
    mkdirSync(cacheDir, { recursive: true, mode: 0o755 });
  }

  return cacheDir;
}

/**
 * Remove all cached files and recreate empty cache directory
 */
export function cleanCache(): void {
  const cacheDir = getCacheDir();

  if (existsSync(cacheDir)) {
    rmSync(cacheDir, { recursive: true, force: true });
  }

  mkdirSync(cacheDir, { recursive: true, mode: 0o755 });
  console.log("Cache cleaned successfully");
}
