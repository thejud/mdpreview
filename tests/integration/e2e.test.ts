import { describe, test, expect, beforeAll, afterAll } from "bun:test";
import { mainNoBrowser as main } from "../../src/cli";
import { existsSync, rmSync, readFileSync, writeFileSync, mkdirSync } from "fs";
import { join } from "path";
import { tmpdir } from "os";
import { getCacheDir } from "../../src/core/cache";

const TEST_DIR = join(tmpdir(), "mdpreview-e2e-test");
const TEST_FILE = join(TEST_DIR, "test.md");

beforeAll(() => {
  // Create test directory
  mkdirSync(TEST_DIR, { recursive: true });
});

afterAll(() => {
  // Clean up test directory
  if (existsSync(TEST_DIR)) {
    rmSync(TEST_DIR, { recursive: true, force: true });
  }

  // Clean cache
  const cacheDir = getCacheDir();
  if (existsSync(cacheDir)) {
    rmSync(cacheDir, { recursive: true, force: true });
  }
});

describe("End-to-End Integration Tests", () => {
  test("converts simple markdown file", async () => {
    const markdown = "# Hello World\n\nThis is a test.";
    writeFileSync(TEST_FILE, markdown);

    // Mock browser opening by not actually launching
    const exitCode = await main([TEST_FILE, "-X"]); // Clean cache first

    // Then convert (browser will try to open but that's okay for testing)
    const result = await main([TEST_FILE]);

    expect(result).toBe(0);

    // Check that cache file was created
    const cacheDir = getCacheDir();
    const files = existsSync(cacheDir) ? require("fs").readdirSync(cacheDir) : [];
    expect(files.length).toBeGreaterThan(0);
  });

  test("handles markdown with code blocks", async () => {
    const markdown = `
# Code Example

\`\`\`javascript
function hello() {
  console.log("Hello, World!");
}
\`\`\`
`;
    writeFileSync(TEST_FILE, markdown);

    const exitCode = await main([TEST_FILE]);

    expect(exitCode).toBe(0);
  });

  test("handles markdown with tables", async () => {
    const markdown = `
# Table Example

| Header 1 | Header 2 |
|----------|----------|
| Cell 1   | Cell 2   |
| Cell 3   | Cell 4   |
`;
    writeFileSync(TEST_FILE, markdown);

    const exitCode = await main([TEST_FILE]);

    expect(exitCode).toBe(0);
  });

  test("handles markdown with images", async () => {
    // Create a test image
    const imagePath = join(TEST_DIR, "test-image.png");
    writeFileSync(imagePath, "fake png data");

    const markdown = `
# Image Example

![Test Image](test-image.png)
`;
    writeFileSync(TEST_FILE, markdown);

    const exitCode = await main([TEST_FILE]);

    expect(exitCode).toBe(0);

    // Check that image was copied to cache
    const cacheDir = getCacheDir();
    const imageDirs = existsSync(cacheDir)
      ? require("fs").readdirSync(cacheDir).filter((f: string) => f.endsWith("_images"))
      : [];
    expect(imageDirs.length).toBeGreaterThan(0);
  });

  test("uses cache on second run", async () => {
    const markdown = "# Cache Test\n\nThis should be cached.";
    writeFileSync(TEST_FILE, markdown);

    // First run - generate HTML
    const exitCode1 = await main([TEST_FILE]);
    expect(exitCode1).toBe(0);

    // Second run - should use cache
    const exitCode2 = await main([TEST_FILE]);
    expect(exitCode2).toBe(0);
  });

  test("skips cache with --no-cache flag", async () => {
    const markdown = "# No Cache Test";
    writeFileSync(TEST_FILE, markdown);

    // First run with cache
    await main([TEST_FILE]);

    // Second run without cache
    const exitCode = await main([TEST_FILE, "-N"]);
    expect(exitCode).toBe(0);
  });

  test("cleans cache with --clean-cache flag", async () => {
    const exitCode = await main(["-X"]);
    expect(exitCode).toBe(0);

    // Cache directory should exist but be empty
    const cacheDir = getCacheDir();
    expect(existsSync(cacheDir)).toBe(true);

    const files = require("fs").readdirSync(cacheDir);
    expect(files.length).toBe(0);
  });

  test("handles non-existent file", async () => {
    const exitCode = await main(["nonexistent.md"]);
    expect(exitCode).toBe(1);
  });

  test("shows help with --help flag", async () => {
    const exitCode = await main(["--help"]);
    expect(exitCode).toBe(0);
  });

  test("requires markdown file argument", async () => {
    const exitCode = await main([]);
    expect(exitCode).toBe(1);
  });

  test("handles different width settings", async () => {
    const markdown = "# Width Test";
    writeFileSync(TEST_FILE, markdown);

    const exitCode = await main([TEST_FILE, "-w", "1200"]);
    expect(exitCode).toBe(0);
  });

  test("handles browser selection flags", async () => {
    const markdown = "# Browser Test";
    writeFileSync(TEST_FILE, markdown);

    const exitCode1 = await main([TEST_FILE, "-g"]);
    const exitCode2 = await main([TEST_FILE, "-s"]);
    const exitCode3 = await main([TEST_FILE, "-f"]);

    expect(exitCode1).toBe(0);
    expect(exitCode2).toBe(0);
    expect(exitCode3).toBe(0);
  });

  test("processes markdown with all features", async () => {
    // Create test image
    const imagePath = join(TEST_DIR, "full-test.png");
    writeFileSync(imagePath, "fake png");

    const markdown = `
# Complete Feature Test

## Markdown Features

This document tests **all** features *together*.

### Lists

- Item 1
- Item 2
- Item 3

### Code

\`\`\`python
def hello():
    print("Hello, World!")
\`\`\`

### Tables

| Feature | Status |
|---------|--------|
| Tables  | ✓      |
| Images  | ✓      |

### Images

![Test](full-test.png)

### Links

[GitHub](https://github.com)

### Mermaid

\`\`\`mermaid
graph TD
  A-->B
\`\`\`
`;
    writeFileSync(TEST_FILE, markdown);

    const exitCode = await main([TEST_FILE, "-w", "1400"]);
    expect(exitCode).toBe(0);
  });

  test("handles relative paths", async () => {
    const markdown = "# Relative Path Test";
    const relativePath = join("test.md");
    writeFileSync(relativePath, markdown);

    const exitCode = await main([relativePath]);

    expect(exitCode).toBe(0);

    // Clean up
    if (existsSync(relativePath)) {
      rmSync(relativePath);
    }
  });

  test("generates valid HTML output", async () => {
    const markdown = "# HTML Validation\n\nTest content.";
    writeFileSync(TEST_FILE, markdown);

    await main([TEST_FILE]);

    // Find the generated HTML in cache
    const cacheDir = getCacheDir();
    const files = require("fs").readdirSync(cacheDir).filter((f: string) => f.endsWith(".html"));

    expect(files.length).toBeGreaterThan(0);

    if (files[0]) {
      const htmlPath = join(cacheDir, files[0]);
      const html = readFileSync(htmlPath, "utf-8");

      // Validate HTML structure
      expect(html).toContain("<!DOCTYPE html>");
      expect(html).toContain("<html");
      expect(html).toContain("<head>");
      expect(html).toContain("<body>");
      expect(html).toContain("</body>");
      expect(html).toContain("</html>");
      expect(html).toContain("<style>");
      expect(html).toContain("mermaid");
    }
  });
});
