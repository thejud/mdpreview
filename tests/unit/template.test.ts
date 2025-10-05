import { describe, test, expect } from "bun:test";
import { generateHtml } from "../../src/rendering/template";

describe("generateHtml", () => {
  test("returns complete HTML5 document", () => {
    const html = generateHtml("Test", "<p>Content</p>", "<style>body{}</style>");

    expect(html).toContain("<!DOCTYPE html>");
    expect(html).toContain("<html");
    expect(html).toContain("</html>");
  });

  test("includes DOCTYPE declaration", () => {
    const html = generateHtml("Test", "<p>Content</p>", "<style>body{}</style>");

    expect(html).toStartWith("<!DOCTYPE html>");
  });

  test("includes head section with meta tags", () => {
    const html = generateHtml("Test", "<p>Content</p>", "<style>body{}</style>");

    expect(html).toContain("<head>");
    expect(html).toContain("</head>");
    expect(html).toContain('<meta charset="UTF-8">');
    expect(html).toContain('<meta name="viewport"');
  });

  test("includes title from parameter", () => {
    const html = generateHtml("My Document", "<p>Content</p>", "<style>body{}</style>");

    expect(html).toContain("<title>My Document</title>");
  });

  test("embeds provided styles", () => {
    const styles = "<style>body { color: red; }</style>";
    const html = generateHtml("Test", "<p>Content</p>", styles);

    expect(html).toContain(styles);
  });

  test("embeds provided content in body", () => {
    const content = "<h1>Hello World</h1><p>This is a test</p>";
    const html = generateHtml("Test", content, "<style>body{}</style>");

    expect(html).toContain(content);
  });

  test("includes mermaid.js CDN script", () => {
    const html = generateHtml("Test", "<p>Content</p>", "<style>body{}</style>");

    expect(html).toContain("mermaid");
    expect(html).toContain("cdn.jsdelivr.net");
    expect(html).toContain('type="module"');
  });

  test("includes mermaid initialization", () => {
    const html = generateHtml("Test", "<p>Content</p>", "<style>body{}</style>");

    expect(html).toContain("mermaid.initialize");
    expect(html).toContain("startOnLoad: true");
  });

  test("includes toggle button JavaScript", () => {
    const html = generateHtml("Test", "<p>Content</p>", "<style>body{}</style>");

    expect(html).toContain("mermaid-toggle");
    expect(html).toContain("addEventListener");
    expect(html).toContain("click");
  });

  test("toggle script handles showing/hiding source", () => {
    const html = generateHtml("Test", "<p>Content</p>", "<style>body{}</style>");

    expect(html).toContain("mermaid-diagram");
    expect(html).toContain("mermaid-source");
    expect(html).toContain("style.display");
  });

  test("handles special characters in title", () => {
    const html = generateHtml("Test & <Title>", "<p>Content</p>", "<style>body{}</style>");

    // Title should be properly escaped or at least included
    expect(html).toContain("Test");
    expect(html).toContain("Title");
  });

  test("handles empty content", () => {
    const html = generateHtml("Empty", "", "<style>body{}</style>");

    expect(html).toContain("<!DOCTYPE html>");
    expect(html).toContain("<body>");
    expect(html).toContain("</body>");
  });

  test("handles complex nested HTML content", () => {
    const content = `
      <h1>Main Header</h1>
      <div class="section">
        <h2>Subsection</h2>
        <p>Paragraph with <strong>bold</strong> and <em>italic</em></p>
        <ul>
          <li>Item 1</li>
          <li>Item 2</li>
        </ul>
      </div>
    `;
    const html = generateHtml("Complex", content, "<style>body{}</style>");

    expect(html).toContain(content);
  });

  test("includes language attribute on html tag", () => {
    const html = generateHtml("Test", "<p>Content</p>", "<style>body{}</style>");

    expect(html).toContain('<html lang="en">');
  });

  test("maintains proper HTML structure order", () => {
    const html = generateHtml("Test", "<p>Content</p>", "<style>body{}</style>");

    const docIndex = html.indexOf("<!DOCTYPE html>");
    const htmlIndex = html.indexOf("<html");
    const headIndex = html.indexOf("<head>");
    const bodyIndex = html.indexOf("<body>");
    const closeBodyIndex = html.indexOf("</body>");
    const closeHtmlIndex = html.indexOf("</html>");

    expect(docIndex).toBeLessThan(htmlIndex);
    expect(htmlIndex).toBeLessThan(headIndex);
    expect(headIndex).toBeLessThan(bodyIndex);
    expect(bodyIndex).toBeLessThan(closeBodyIndex);
    expect(closeBodyIndex).toBeLessThan(closeHtmlIndex);
  });

  test("viewport meta tag includes responsive settings", () => {
    const html = generateHtml("Test", "<p>Content</p>", "<style>body{}</style>");

    expect(html).toContain("width=device-width");
    expect(html).toContain("initial-scale=1.0");
  });
});
