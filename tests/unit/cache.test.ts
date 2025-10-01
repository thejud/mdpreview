import { describe, test, expect, beforeEach, afterEach } from "bun:test";
import { getCacheDir, cleanCache } from "../../src/core/cache";
import { existsSync, mkdirSync, writeFileSync, rmSync, statSync } from "fs";
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
