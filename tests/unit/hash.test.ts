import { describe, test, expect, beforeAll, afterAll } from "bun:test";
import { getFileHash } from "../../src/core/hash";
import { mkdirSync, writeFileSync, rmSync } from "fs";
import { join } from "path";

const TEST_DIR = join(import.meta.dir, "../fixtures/hash-test");

beforeAll(() => {
  // Create test directory and files
  mkdirSync(TEST_DIR, { recursive: true });
  writeFileSync(join(TEST_DIR, "test1.md"), "# Hello World\n");
  writeFileSync(join(TEST_DIR, "test2.md"), "# Hello World\n"); // Same content
  writeFileSync(join(TEST_DIR, "test3.md"), "# Different Content\n");
  writeFileSync(join(TEST_DIR, "utf8.md"), "# UTF-8 Test 🚀 中文\n");
});

afterAll(() => {
  // Clean up test directory
  rmSync(TEST_DIR, { recursive: true, force: true });
});

describe("getFileHash", () => {
  test("returns consistent SHA256 hash for same file", () => {
    const hash1 = getFileHash(join(TEST_DIR, "test1.md"));
    const hash2 = getFileHash(join(TEST_DIR, "test1.md"));

    expect(hash1).toBe(hash2);
    expect(hash1).toHaveLength(64); // SHA256 produces 64 hex characters
  });

  test("returns same hash for files with identical content", () => {
    const hash1 = getFileHash(join(TEST_DIR, "test1.md"));
    const hash2 = getFileHash(join(TEST_DIR, "test2.md"));

    expect(hash1).toBe(hash2);
  });

  test("returns different hash for files with different content", () => {
    const hash1 = getFileHash(join(TEST_DIR, "test1.md"));
    const hash3 = getFileHash(join(TEST_DIR, "test3.md"));

    expect(hash1).not.toBe(hash3);
  });

  test("handles UTF-8 encoding correctly", () => {
    const hash = getFileHash(join(TEST_DIR, "utf8.md"));

    expect(hash).toHaveLength(64);
    expect(hash).toMatch(/^[a-f0-9]{64}$/); // Valid hex string
  });

  test("throws error for non-existent file", () => {
    expect(() => {
      getFileHash(join(TEST_DIR, "does-not-exist.md"));
    }).toThrow();
  });

  test("hash is valid hexadecimal string", () => {
    const hash = getFileHash(join(TEST_DIR, "test1.md"));

    expect(hash).toMatch(/^[a-f0-9]{64}$/);
  });
});
