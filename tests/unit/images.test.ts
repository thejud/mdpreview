import { describe, test, expect, beforeEach, afterEach } from "bun:test";
import { LocalImageProcessor } from "../../src/processors/images";
import { mkdirSync, writeFileSync, rmSync, existsSync } from "fs";
import { join } from "path";
import { tmpdir } from "os";

const TEST_DIR = join(tmpdir(), "mdpreview-image-test");
const SOURCE_DIR = join(TEST_DIR, "source");
const CACHE_DIR = join(TEST_DIR, "cache");
const TEST_HASH = "abc123def456";

beforeEach(() => {
  // Create test directories and files
  mkdirSync(SOURCE_DIR, { recursive: true });
  mkdirSync(CACHE_DIR, { recursive: true });

  // Create test images
  writeFileSync(join(SOURCE_DIR, "test.png"), "fake png data");
  writeFileSync(join(SOURCE_DIR, "logo.svg"), "fake svg data");
  mkdirSync(join(SOURCE_DIR, "images"), { recursive: true });
  writeFileSync(join(SOURCE_DIR, "images", "nested.jpg"), "fake jpg data");
});

afterEach(() => {
  // Clean up test directory
  if (existsSync(TEST_DIR)) {
    rmSync(TEST_DIR, { recursive: true, force: true });
  }
});

describe("LocalImageProcessor", () => {
  test("detects local images in HTML", () => {
    const html = '<img src="test.png" alt="Test"><img src="logo.svg" alt="Logo">';
    const processor = new LocalImageProcessor();

    const images = processor.detectLocalImages(html);

    expect(images.length).toBe(2);
    expect(images[0]?.src).toBe("test.png");
    expect(images[1]?.src).toBe("logo.svg");
  });

  test("ignores remote URLs", () => {
    const html = `
      <img src="https://example.com/image.png">
      <img src="http://example.com/image.jpg">
      <img src="//cdn.example.com/image.gif">
    `;
    const processor = new LocalImageProcessor();

    const images = processor.detectLocalImages(html);

    expect(images.length).toBe(0);
  });

  test("ignores data URLs", () => {
    const html = '<img src="data:image/png;base64,iVBORw0KG...">';
    const processor = new LocalImageProcessor();

    const images = processor.detectLocalImages(html);

    expect(images.length).toBe(0);
  });

  test("detects images with relative paths", () => {
    const html = '<img src="./images/nested.jpg"><img src="../other.png">';
    const processor = new LocalImageProcessor();

    const images = processor.detectLocalImages(html);

    expect(images.length).toBe(2);
    expect(images[0]?.src).toBe("./images/nested.jpg");
    expect(images[1]?.src).toBe("../other.png");
  });

  test("processes all images and updates HTML", () => {
    const html = '<p>Text</p><img src="test.png" alt="Test"><p>More</p>';
    const processor = new LocalImageProcessor();

    const result = processor.processImages(html, SOURCE_DIR, CACHE_DIR, TEST_HASH);

    expect(result).toContain(`${TEST_HASH}_images/test.png`);
    expect(result).toContain('alt="Test"');
  });

  test("copies images to cache directory", () => {
    const html = '<img src="test.png" alt="Test">';
    const processor = new LocalImageProcessor();

    processor.processImages(html, SOURCE_DIR, CACHE_DIR, TEST_HASH);

    const cachedImagePath = join(CACHE_DIR, `${TEST_HASH}_images`, "test.png");
    expect(existsSync(cachedImagePath)).toBe(true);
  });

  test("handles nested directory images", () => {
    const html = '<img src="images/nested.jpg" alt="Nested">';
    const processor = new LocalImageProcessor();

    const result = processor.processImages(html, SOURCE_DIR, CACHE_DIR, TEST_HASH);

    expect(result).toContain(`${TEST_HASH}_images/nested.jpg`);
    const cachedImagePath = join(CACHE_DIR, `${TEST_HASH}_images`, "nested.jpg");
    expect(existsSync(cachedImagePath)).toBe(true);
  });

  test("preserves original filename in cache", () => {
    const html = '<img src="test.png" alt="Test">';
    const processor = new LocalImageProcessor();

    processor.processImages(html, SOURCE_DIR, CACHE_DIR, TEST_HASH);

    const cachedImagePath = join(CACHE_DIR, `${TEST_HASH}_images`, "test.png");
    expect(existsSync(cachedImagePath)).toBe(true);
  });

  test("handles missing images gracefully", () => {
    const html = '<img src="missing.png" alt="Missing">';
    const processor = new LocalImageProcessor();

    // Should not throw, but should warn
    const result = processor.processImages(html, SOURCE_DIR, CACHE_DIR, TEST_HASH);

    // Image tag should remain unchanged or be preserved
    expect(result).toContain("missing.png");
  });

  test("supports multiple image formats", () => {
    writeFileSync(join(SOURCE_DIR, "test.gif"), "fake gif");
    writeFileSync(join(SOURCE_DIR, "test.webp"), "fake webp");

    const html = `
      <img src="test.png">
      <img src="logo.svg">
      <img src="test.gif">
      <img src="test.webp">
      <img src="images/nested.jpg">
    `;
    const processor = new LocalImageProcessor();

    const images = processor.detectLocalImages(html);

    expect(images.length).toBe(5);
  });

  test("preserves remote images in output", () => {
    const html = `
      <img src="local.png">
      <img src="https://example.com/remote.png">
      <img src="another-local.png">
    `;
    const processor = new LocalImageProcessor();

    const result = processor.processImages(html, SOURCE_DIR, CACHE_DIR, TEST_HASH);

    expect(result).toContain("https://example.com/remote.png");
    expect(result).not.toContain(`${TEST_HASH}_images/remote.png`);
  });

  test("handles images with query parameters", () => {
    const html = '<img src="test.png?v=123" alt="Test">';
    const processor = new LocalImageProcessor();

    const images = processor.detectLocalImages(html);

    expect(images.length).toBe(1);
    expect(images[0]?.src).toBe("test.png?v=123");
  });

  test("handles images with special characters in path", () => {
    writeFileSync(join(SOURCE_DIR, "test image.png"), "fake png");

    const html = '<img src="test image.png" alt="Test">';
    const processor = new LocalImageProcessor();

    const result = processor.processImages(html, SOURCE_DIR, CACHE_DIR, TEST_HASH);

    expect(result).toContain(`${TEST_HASH}_images/test image.png`);
  });

  test("avoids duplicate copying of same image", () => {
    const html = '<img src="test.png"><img src="test.png"><img src="test.png">';
    const processor = new LocalImageProcessor();

    const result = processor.processImages(html, SOURCE_DIR, CACHE_DIR, TEST_HASH);

    // All three should reference the same cached file
    const matches = result.match(new RegExp(`${TEST_HASH}_images/test.png`, "g"));
    expect(matches?.length).toBe(3);

    // But only one copy should exist
    const cachedImagePath = join(CACHE_DIR, `${TEST_HASH}_images`, "test.png");
    expect(existsSync(cachedImagePath)).toBe(true);
  });

  test("handles empty HTML", () => {
    const processor = new LocalImageProcessor();

    const result = processor.processImages("", SOURCE_DIR, CACHE_DIR, TEST_HASH);

    expect(result).toBe("");
  });

  test("handles HTML with no images", () => {
    const html = "<p>Just text, no images</p>";
    const processor = new LocalImageProcessor();

    const result = processor.processImages(html, SOURCE_DIR, CACHE_DIR, TEST_HASH);

    expect(result).toBe(html);
  });
});
