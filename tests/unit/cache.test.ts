import { describe, test, expect, beforeEach, afterEach } from "bun:test";
import {
  getCacheDir,
  cleanCache,
  getCachedHtml,
  writeCachedHtml,
  shouldUseCache,
} from "../../src/core/cache";
import { existsSync, mkdirSync, writeFileSync, rmSync, statSync, readFileSync } from "fs";
import { join } from "path";
import { tmpdir } from "os";

const TEST_CACHE_DIR = join(tmpdir(), "mdpreview-test-cache");

// Mock the cache directory for testing
beforeEach(() => {
  // Clean up any existing test cache
  if (existsSync(TEST_CACHE_DIR)) {
    rmSync(TEST_CACHE_DIR, { recursive: true, force: true });
  }
});

afterEach(() => {
  // Clean up test cache
  if (existsSync(TEST_CACHE_DIR)) {
    rmSync(TEST_CACHE_DIR, { recursive: true, force: true });
  }
});

describe("getCacheDir", () => {
  test("returns cache directory path", () => {
    const cacheDir = getCacheDir();

    expect(cacheDir).toContain("mdpreview");
    expect(typeof cacheDir).toBe("string");
  });

  test("creates cache directory if it doesn't exist", () => {
    const cacheDir = getCacheDir();

    // Call again to ensure it handles existing directory
    const cacheDir2 = getCacheDir();

    expect(existsSync(cacheDir)).toBe(true);
    expect(cacheDir).toBe(cacheDir2);
  });

  test("cache directory has correct permissions", () => {
    const cacheDir = getCacheDir();
    const stats = statSync(cacheDir);

    expect(stats.isDirectory()).toBe(true);
    // Check that directory is readable and writable
    expect(stats.mode & 0o700).toBeGreaterThan(0);
  });

  test("returns same path on multiple calls", () => {
    const path1 = getCacheDir();
    const path2 = getCacheDir();
    const path3 = getCacheDir();

    expect(path1).toBe(path2);
    expect(path2).toBe(path3);
  });
});

describe("cleanCache", () => {
  test("removes all files from cache directory", () => {
    const cacheDir = getCacheDir();

    // Create some test files
    writeFileSync(join(cacheDir, "test1.html"), "<html>test1</html>");
    writeFileSync(join(cacheDir, "test2.html"), "<html>test2</html>");
    mkdirSync(join(cacheDir, "test_images"), { recursive: true });
    writeFileSync(join(cacheDir, "test_images", "img.png"), "fake image");

    expect(existsSync(join(cacheDir, "test1.html"))).toBe(true);
    expect(existsSync(join(cacheDir, "test2.html"))).toBe(true);

    cleanCache();

    // Cache directory should still exist but be empty
    expect(existsSync(cacheDir)).toBe(true);
    expect(existsSync(join(cacheDir, "test1.html"))).toBe(false);
    expect(existsSync(join(cacheDir, "test2.html"))).toBe(false);
    expect(existsSync(join(cacheDir, "test_images"))).toBe(false);
  });

  test("handles non-existent cache directory gracefully", () => {
    const cacheDir = getCacheDir();

    // Remove cache directory
    if (existsSync(cacheDir)) {
      rmSync(cacheDir, { recursive: true, force: true });
    }

    expect(() => cleanCache()).not.toThrow();

    // Cache directory should be created
    expect(existsSync(cacheDir)).toBe(true);
  });

  test("cache directory exists after cleaning", () => {
    cleanCache();

    const cacheDir = getCacheDir();
    expect(existsSync(cacheDir)).toBe(true);
  });
});

describe("getCachedHtml", () => {
  test("returns null for non-existent cache", () => {
    const html = getCachedHtml("nonexistent123");

    expect(html).toBeNull();
  });

  test("returns cached HTML content", () => {
    const cacheDir = getCacheDir();
    const hash = "abc123";
    const content = "<html><body>Test content</body></html>";

    writeFileSync(join(cacheDir, `${hash}.html`), content);

    const html = getCachedHtml(hash);

    expect(html).toBe(content);
  });

  test("returns content from cached file", () => {
    const cacheDir = getCacheDir();
    const hash = "def456";
    const content = "<html>Test</html>";

    writeFileSync(join(cacheDir, `${hash}.html`), content);

    const html = getCachedHtml(hash);

    expect(html).toBe(content);
  });

  test("handles different hash values", () => {
    const cacheDir = getCacheDir();
    const hash1 = "hash1";
    const hash2 = "hash2";

    writeFileSync(join(cacheDir, `${hash1}.html`), "Content 1");
    writeFileSync(join(cacheDir, `${hash2}.html`), "Content 2");

    const content1 = getCachedHtml(hash1);
    const content2 = getCachedHtml(hash2);

    expect(content1).toContain("Content 1");
    expect(content2).toContain("Content 2");
  });
});

describe("writeCachedHtml", () => {
  test("writes HTML to cache with hash filename", () => {
    const hash = "test123";
    const html = "<html><body>Test</body></html>";

    const path = writeCachedHtml(hash, html);

    expect(existsSync(path)).toBe(true);
    expect(path).toContain(hash);
    expect(path).toContain(".html");
  });

  test("writes correct HTML content", () => {
    const hash = "content456";
    const html = "<html><body>Hello World</body></html>";

    const path = writeCachedHtml(hash, html);

    const content = readFileSync(path, "utf-8");
    expect(content).toBe(html);
  });

  test("overwrites existing cache file", () => {
    const hash = "overwrite789";
    const html1 = "<html>First</html>";
    const html2 = "<html>Second</html>";

    const path1 = writeCachedHtml(hash, html1);
    const path2 = writeCachedHtml(hash, html2);

    expect(path1).toBe(path2);

    const content = readFileSync(path2, "utf-8");
    expect(content).toBe(html2);
  });

  test("creates cache directory if missing", () => {
    const cacheDir = getCacheDir();
    rmSync(cacheDir, { recursive: true, force: true });

    const hash = "create123";
    const html = "<html>Test</html>";

    const path = writeCachedHtml(hash, html);

    expect(existsSync(cacheDir)).toBe(true);
    expect(existsSync(path)).toBe(true);
  });

  test("returns absolute path to cached file", () => {
    const hash = "absolute123";
    const html = "<html>Test</html>";

    const path = writeCachedHtml(hash, html);

    expect(path).toMatch(/^\//); // Unix absolute path
    expect(existsSync(path)).toBe(true);
  });
});

describe("shouldUseCache", () => {
  test("returns false when noCache is true", () => {
    const hash = "test123";

    const result = shouldUseCache(hash, true);

    expect(result).toBe(false);
  });

  test("returns false when cache doesn't exist", () => {
    const hash = "nonexistent123";

    const result = shouldUseCache(hash, false);

    expect(result).toBe(false);
  });

  test("returns true when cache exists and noCache is false", () => {
    const hash = "exists123";
    const cacheDir = getCacheDir();

    writeFileSync(join(cacheDir, `${hash}.html`), "<html>Test</html>");

    const result = shouldUseCache(hash, false);

    expect(result).toBe(true);
  });

  test("returns false when noCache is true even if cache exists", () => {
    const hash = "exists456";
    const cacheDir = getCacheDir();

    writeFileSync(join(cacheDir, `${hash}.html`), "<html>Test</html>");

    const result = shouldUseCache(hash, true);

    expect(result).toBe(false);
  });

  test("defaults noCache to false", () => {
    const hash = "default123";
    const cacheDir = getCacheDir();

    writeFileSync(join(cacheDir, `${hash}.html`), "<html>Test</html>");

    // Call without noCache parameter
    const result = shouldUseCache(hash);

    expect(result).toBe(true);
  });
});
