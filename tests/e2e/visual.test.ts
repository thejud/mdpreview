import { describe, test, expect, beforeAll, afterAll, mock } from "bun:test";
import { chromium, type Browser, type Page } from "playwright";
import { existsSync, rmSync, writeFileSync, mkdirSync, readFileSync } from "fs";
import { join, dirname, basename } from "path";
import { tmpdir } from "os";
import { getCacheDir, cleanCache, writeCachedHtml } from "../../src/core/cache";
import { getFileHash } from "../../src/core/hash";
import { convertMarkdown } from "../../src/core/markdown";
import { LocalImageProcessor } from "../../src/processors/images";
import { MermaidProcessor } from "../../src/processors/mermaid";
import { getGithubCSS } from "../../src/rendering/styles";
import { generateHtml } from "../../src/rendering/template";

const TEST_DIR = join(tmpdir(), "mdpreview-visual-test");
const TEST_MD = join(TEST_DIR, "visual-test.md");

let browser: Browser;
let page: Page;

/**
 * Generate HTML from markdown without opening browser
 * This mimics the main() function but skips openInBrowser()
 */
async function generateHtmlWithoutBrowser(markdownPath: string): Promise<string> {
  const hash = getFileHash(markdownPath);
  const markdown = readFileSync(markdownPath, "utf-8");

  // Convert markdown
  let html = convertMarkdown(markdown);

  // Process images
  const sourceDir = dirname(markdownPath);
  const cacheDir = getCacheDir();
  const imageProcessor = new LocalImageProcessor();
  html = imageProcessor.processImages(html, sourceDir, cacheDir, hash);

  // Process mermaid
  const mermaidProcessor = new MermaidProcessor();
  html = mermaidProcessor.processMermaidBlocks(html);

  // Generate full HTML
  const title = basename(markdownPath, ".md");
  const styles = getGithubCSS(980);
  const fullHtml = generateHtml(title, html, styles);

  // Write to cache
  const cachePath = writeCachedHtml(hash, fullHtml);
  return cachePath;
}

beforeAll(async () => {
  // Create test directory
  mkdirSync(TEST_DIR, { recursive: true });

  // Create test images
  writeFileSync(join(TEST_DIR, "test.png"), "fake png data");
  writeFileSync(join(TEST_DIR, "test.jpg"), "fake jpg data");

  // Launch browser
  browser = await chromium.launch({ headless: true });
  page = await browser.newPage();
});

afterAll(async () => {
  await page?.close();
  await browser?.close();

  // Clean up
  if (existsSync(TEST_DIR)) {
    rmSync(TEST_DIR, { recursive: true, force: true });
  }

  const cacheDir = getCacheDir();
  if (existsSync(cacheDir)) {
    rmSync(cacheDir, { recursive: true, force: true });
  }
});

describe("Visual E2E Tests with Playwright", () => {
  test("renders local images correctly", async () => {
    const markdown = `# Image Test

![Local PNG](test.png)
![Local JPG](test.jpg)
`;
    writeFileSync(TEST_MD, markdown);

    // Generate HTML without opening browser
    cleanCache();
    const htmlPath = await generateHtmlWithoutBrowser(TEST_MD);

    // Load in browser
    await page.goto(`file://${htmlPath}`);

    // Wait for page to load
    await page.waitForLoadState("load");

    // Check that images are present in the DOM
    const images = await page.locator("img").all();
    expect(images.length).toBe(2);

    // Check that image sources point to cache directory
    const img1Src = await page.locator("img").nth(0).getAttribute("src");
    const img2Src = await page.locator("img").nth(1).getAttribute("src");

    expect(img1Src).toContain("_images/test.png");
    expect(img2Src).toContain("_images/test.jpg");

    // Check that alt text is present
    const img1Alt = await page.locator("img").nth(0).getAttribute("alt");
    const img2Alt = await page.locator("img").nth(1).getAttribute("alt");

    expect(img1Alt).toBe("Local PNG");
    expect(img2Alt).toBe("Local JPG");
  });

  test("renders remote images correctly", async () => {
    const markdown = `# Remote Image Test

![Remote](https://via.placeholder.com/150x100)
`;
    writeFileSync(TEST_MD, markdown);

    const htmlPath = await generateHtmlWithoutBrowser(TEST_MD);

    await page.goto(`file://${htmlPath}`);
    await page.waitForLoadState("load");

    // Check remote image
    const imgSrc = await page.locator("img").getAttribute("src");
    expect(imgSrc).toContain("https://");
    expect(imgSrc).toContain("placeholder");
  });

  test("renders mermaid diagrams with toggle", async () => {
    const markdown = `# Mermaid Test

\`\`\`mermaid
graph TD
    A[Start] --> B[End]
\`\`\`
`;
    writeFileSync(TEST_MD, markdown);

    const htmlPath = await generateHtmlWithoutBrowser(TEST_MD);


    await page.goto(`file://${htmlPath}`);
    await page.waitForLoadState("networkidle");

    // Wait for mermaid to initialize
    await page.waitForTimeout(1000);

    // Check mermaid container exists
    const container = page.locator(".mermaid-container");
    const containerCount = await container.count();
    expect(containerCount).toBeGreaterThan(0);

    // Check toggle button exists
    const toggleButton = page.locator(".mermaid-toggle");
    const toggleVisible = await toggleButton.isVisible();
    expect(toggleVisible).toBe(true);

    // Check diagram is visible initially
    const diagram = page.locator(".mermaid-diagram");
    const diagramVisible = await diagram.isVisible();
    expect(diagramVisible).toBe(true);

    // Check source is hidden initially
    const source = page.locator(".mermaid-source");
    const sourceDisplay = await source.evaluate((el) =>
      window.getComputedStyle(el).display
    );
    expect(sourceDisplay).toBe("none");

    // Click toggle button
    await toggleButton.click();
    await page.waitForTimeout(100);

    // Check source is now visible
    const sourceDisplayAfter = await source.evaluate((el) =>
      window.getComputedStyle(el).display
    );
    expect(sourceDisplayAfter).toBe("block");

    // Check diagram is now hidden
    const diagramDisplayAfter = await diagram.evaluate((el) =>
      window.getComputedStyle(el).display
    );
    expect(diagramDisplayAfter).toBe("none");

    // Check button text changed
    const buttonText = await toggleButton.textContent();
    expect(buttonText).toBe("Show Diagram");
  });

  test("mermaid toggle works multiple times", async () => {
    const markdown = `# Toggle Test

\`\`\`mermaid
graph LR
    A --> B
\`\`\`
`;
    writeFileSync(TEST_MD, markdown);

    const htmlPath = await generateHtmlWithoutBrowser(TEST_MD);


    await page.goto(`file://${htmlPath}`);
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1000);

    const toggleButton = page.locator(".mermaid-toggle");
    const diagram = page.locator(".mermaid-diagram");
    const source = page.locator(".mermaid-source");

    // Initial state: diagram visible, source hidden
    let diagramVisible = await diagram.isVisible();
    expect(diagramVisible).toBe(true);

    // Click 1: Show source
    await toggleButton.click();
    await page.waitForTimeout(100);
    diagramVisible = await diagram.isVisible();
    expect(diagramVisible).toBe(false);

    // Click 2: Show diagram again
    await toggleButton.click();
    await page.waitForTimeout(100);
    diagramVisible = await diagram.isVisible();
    expect(diagramVisible).toBe(true);

    // Click 3: Show source again
    await toggleButton.click();
    await page.waitForTimeout(100);
    diagramVisible = await diagram.isVisible();
    expect(diagramVisible).toBe(false);
  });

  test("handles multiple mermaid diagrams independently", async () => {
    const markdown = `# Multiple Mermaid

\`\`\`mermaid
graph TD
    A --> B
\`\`\`

Some text in between.

\`\`\`mermaid
sequenceDiagram
    Alice->>Bob: Hello
\`\`\`
`;
    writeFileSync(TEST_MD, markdown);

    const htmlPath = await generateHtmlWithoutBrowser(TEST_MD);


    await page.goto(`file://${htmlPath}`);
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1000);

    // Check both containers exist
    const containers = await page.locator(".mermaid-container").all();
    expect(containers.length).toBe(2);

    // Check both toggle buttons exist
    const toggleButtons = await page.locator(".mermaid-toggle").all();
    expect(toggleButtons.length).toBe(2);

    // Toggle first diagram
    await toggleButtons[0]?.click();
    await page.waitForTimeout(100);

    // Check first diagram is hidden
    const diagram1 = page.locator(".mermaid-diagram").nth(0);
    const diagram1Visible = await diagram1.isVisible();
    expect(diagram1Visible).toBe(false);

    // Check second diagram is still visible
    const diagram2 = page.locator(".mermaid-diagram").nth(1);
    const diagram2Visible = await diagram2.isVisible();
    expect(diagram2Visible).toBe(true);
  });

  test("mermaid source code is properly escaped", async () => {
    const markdown = `# Source Escape Test

\`\`\`mermaid
graph TD
    A["Text with <brackets>"] --> B
\`\`\`
`;
    writeFileSync(TEST_MD, markdown);

    const htmlPath = await generateHtmlWithoutBrowser(TEST_MD);


    await page.goto(`file://${htmlPath}`);
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1000);

    // Click toggle to show source
    const toggleButton = page.locator(".mermaid-toggle");
    await toggleButton.click();
    await page.waitForTimeout(100);

    // Check source contains the original brackets (textContent decodes HTML entities)
    const source = page.locator(".mermaid-source");
    const sourceText = await source.textContent();
    // textContent returns decoded text, so we check for the original brackets
    expect(sourceText).toContain("<brackets>");
  });

  test("regular code blocks are not converted to mermaid", async () => {
    const markdown = `# Code Block Test

\`\`\`python
def hello():
    print("mermaid")
\`\`\`

\`\`\`javascript
console.log("mermaid");
\`\`\`
`;
    writeFileSync(TEST_MD, markdown);

    const htmlPath = await generateHtmlWithoutBrowser(TEST_MD);


    await page.goto(`file://${htmlPath}`);
    await page.waitForLoadState("load");

    // Should have no mermaid containers
    const containers = await page.locator(".mermaid-container").all();
    expect(containers.length).toBe(0);

    // Should have regular code blocks
    const codeBlocks = await page.locator("pre code").all();
    expect(codeBlocks.length).toBeGreaterThanOrEqual(2);
  });

  test("mixed content with images and mermaid", async () => {
    const markdown = `# Mixed Content Test

## Image Section

![Test](test.png)

## Mermaid Section

\`\`\`mermaid
graph TD
    A --> B
\`\`\`

## Another Image

![Another](test.jpg)
`;
    writeFileSync(TEST_MD, markdown);

    const htmlPath = await generateHtmlWithoutBrowser(TEST_MD);


    await page.goto(`file://${htmlPath}`);
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1000);

    // Check images
    const images = await page.locator("img").all();
    expect(images.length).toBe(2);

    // Check mermaid
    const mermaidContainers = await page.locator(".mermaid-container").all();
    expect(mermaidContainers.length).toBe(1);

    // Verify toggle works
    const toggleButton = page.locator(".mermaid-toggle");
    await toggleButton.click();
    await page.waitForTimeout(100);

    const source = page.locator(".mermaid-source");
    const sourceVisible = await source.isVisible();
    expect(sourceVisible).toBe(true);
  });

  test("mermaid renders actual SVG diagram", async () => {
    const markdown = `# SVG Render Test

\`\`\`mermaid
graph LR
    A[Box A] --> B[Box B]
\`\`\`
`;
    writeFileSync(TEST_MD, markdown);

    const htmlPath = await generateHtmlWithoutBrowser(TEST_MD);


    await page.goto(`file://${htmlPath}`);
    await page.waitForLoadState("networkidle");

    // Wait for mermaid to render
    await page.waitForTimeout(2000);

    // Check for SVG element (mermaid renders to SVG)
    const svg = await page.locator(".mermaid-diagram svg").count();
    expect(svg).toBeGreaterThan(0);

    // Check that diagram contains expected text
    const diagramText = await page.locator(".mermaid-diagram").textContent();
    expect(diagramText).toContain("Box A");
    expect(diagramText).toContain("Box B");
  });

  test("page styling is applied correctly", async () => {
    const markdown = `# Style Test

This tests that GitHub-like styles are applied.
`;
    writeFileSync(TEST_MD, markdown);

    const htmlPath = await generateHtmlWithoutBrowser(TEST_MD);


    await page.goto(`file://${htmlPath}`);
    await page.waitForLoadState("load");

    // Check body has max-width (GitHub style)
    const bodyMaxWidth = await page.locator("body").evaluate((el) =>
      window.getComputedStyle(el).maxWidth
    );
    expect(bodyMaxWidth).toBe("980px");

    // Check mermaid toggle button has correct styles
    const markdown2 = `\`\`\`mermaid
graph TD
    A --> B
\`\`\``;
    writeFileSync(TEST_MD, markdown2);
    const htmlPath2 = await generateHtmlWithoutBrowser(TEST_MD);

    await page.goto(`file://${htmlPath2}`);
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1000);

    const buttonBgColor = await page.locator(".mermaid-toggle").evaluate((el) =>
      window.getComputedStyle(el).backgroundColor
    );
    expect(buttonBgColor).toBeTruthy();
  });
});
