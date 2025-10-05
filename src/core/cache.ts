import { existsSync, mkdirSync, rmSync, readFileSync, writeFileSync } from "fs";
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

/**
 * Get cached HTML content by hash
 * @param hash - Content hash
 * @returns HTML content if cached, null otherwise
 */
export function getCachedHtml(hash: string): string | null {
  const cacheDir = getCacheDir();
  const cachePath = join(cacheDir, `${hash}.html`);

  if (!existsSync(cachePath)) {
    return null;
  }

  try {
    return readFileSync(cachePath, "utf-8");
  } catch (error) {
    console.warn(`Warning: Failed to read cache file: ${cachePath}`);
    return null;
  }
}

/**
 * Write HTML content to cache
 * @param hash - Content hash
 * @param html - HTML content to cache
 * @returns Absolute path to cached file
 */
export function writeCachedHtml(hash: string, html: string): string {
  const cacheDir = getCacheDir();
  const cachePath = join(cacheDir, `${hash}.html`);

  try {
    writeFileSync(cachePath, html, "utf-8");
    return cachePath;
  } catch (error) {
    console.error(`Error writing to cache: ${error}`);
    // Fallback: try to write to a temp file
    const tempPath = join(tmpdir(), `mdpreview-${hash}.html`);
    writeFileSync(tempPath, html, "utf-8");
    console.warn(`Wrote to temporary file instead: ${tempPath}`);
    return tempPath;
  }
}

/**
 * Check if cache should be used
 * @param hash - Content hash
 * @param noCache - Skip cache flag (default: false)
 * @returns true if cache should be used
 */
export function shouldUseCache(hash: string, noCache: boolean = false): boolean {
  if (noCache) {
    return false;
  }

  const cacheDir = getCacheDir();
  const cachePath = join(cacheDir, `${hash}.html`);

  return existsSync(cachePath);
}
