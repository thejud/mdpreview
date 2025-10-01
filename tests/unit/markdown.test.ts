import { describe, test, expect } from "bun:test";
import { convertMarkdown, type MarkdownOptions } from "../../src/core/markdown";

describe("convertMarkdown", () => {
  test("converts basic markdown to HTML", () => {
    const markdown = "# Hello World\n\nThis is a paragraph.";
    const html = convertMarkdown(markdown);

    expect(html).toContain("<h1");
    expect(html).toContain("Hello World");
    expect(html).toContain("<p>");
    expect(html).toContain("This is a paragraph.");
  });

  test("converts headers at all levels", () => {
    const markdown = `
# H1
## H2
### H3
#### H4
##### H5
###### H6
`;
    const html = convertMarkdown(markdown);

    expect(html).toContain("<h1");
    expect(html).toContain("<h2");
    expect(html).toContain("<h3");
    expect(html).toContain("<h4");
    expect(html).toContain("<h5");
    expect(html).toContain("<h6");
  });

  test("converts lists correctly", () => {
    const markdown = `
- Item 1
- Item 2
- Item 3
`;
    const html = convertMarkdown(markdown);

    expect(html).toContain("<ul");
    expect(html).toContain("<li");
    expect(html).toContain("Item 1");
  });

  test("converts links correctly", () => {
    const markdown = "[Google](https://google.com)";
    const html = convertMarkdown(markdown);

    expect(html).toContain("<a");
    expect(html).toContain('href="https://google.com"');
    expect(html).toContain("Google");
  });

  test("converts bold and italic text", () => {
    const markdown = "**bold** and *italic* and ***both***";
    const html = convertMarkdown(markdown);

    expect(html).toContain("<strong>bold</strong>");
    expect(html).toContain("<em>italic</em>");
  });

  test("supports GFM tables", () => {
    const markdown = `
| Header 1 | Header 2 |
|----------|----------|
| Cell 1   | Cell 2   |
| Cell 3   | Cell 4   |
`;
    const html = convertMarkdown(markdown);

    expect(html).toContain("<table");
    expect(html).toContain("<thead");
    expect(html).toContain("<tbody");
    expect(html).toContain("<th");
    expect(html).toContain("<td");
    expect(html).toContain("Header 1");
    expect(html).toContain("Cell 1");
  });

  test("supports fenced code blocks", () => {
    const markdown = `
\`\`\`javascript
function hello() {
  console.log("Hello");
}
\`\`\`
`;
    const html = convertMarkdown(markdown);

    expect(html).toContain("<pre");
    expect(html).toContain("<code");
    expect(html).toContain("function hello");
  });

  test("supports inline code", () => {
    const markdown = "Use `const` instead of `var`.";
    const html = convertMarkdown(markdown);

    expect(html).toContain("<code>const</code>");
    expect(html).toContain("<code>var</code>");
  });

  test("supports strikethrough", () => {
    const markdown = "~~strikethrough text~~";
    const html = convertMarkdown(markdown);

    expect(html).toContain("<del>strikethrough text</del>");
  });

  test("supports blockquotes", () => {
    const markdown = "> This is a quote";
    const html = convertMarkdown(markdown);

    expect(html).toContain("<blockquote");
    expect(html).toContain("This is a quote");
  });

  test("supports images", () => {
    const markdown = "![Alt text](image.png)";
    const html = convertMarkdown(markdown);

    expect(html).toContain("<img");
    expect(html).toContain('src="image.png"');
    expect(html).toContain('alt="Alt text"');
  });

  test("applies syntax highlighting to code blocks", () => {
    const markdown = `
\`\`\`python
def hello():
    print("Hello, World!")
\`\`\`
`;
    const html = convertMarkdown(markdown);

    expect(html).toContain("<pre");
    expect(html).toContain("<code");
    // Should have language class or highlighting
    expect(html).toContain("language-python");
  });

  test("handles multiple paragraphs", () => {
    const markdown = `
First paragraph.

Second paragraph.

Third paragraph.
`;
    const html = convertMarkdown(markdown);

    const pCount = (html.match(/<p>/g) || []).length;
    expect(pCount).toBeGreaterThanOrEqual(3);
  });

  test("handles HTML in markdown", () => {
    const markdown = "This has <strong>HTML</strong> tags";
    const html = convertMarkdown(markdown);

    // By default, marked allows HTML passthrough
    expect(html).toContain("<strong>HTML</strong>");
  });

  test("supports task list syntax", () => {
    const markdown = `
- [ ] Unchecked task
- [x] Checked task
`;
    const html = convertMarkdown(markdown);

    // GFM supports task lists
    expect(html).toContain("<input");
    expect(html).toContain('type="checkbox"');
  });

  test("preserves empty content", () => {
    const markdown = "";
    const html = convertMarkdown(markdown);

    expect(html).toBe("");
  });

  test("handles complex nested structures", () => {
    const markdown = `
# Main Header

## Subsection

This is a paragraph with **bold** and *italic*.

- List item 1
  - Nested item
- List item 2

\`\`\`javascript
const x = 42;
\`\`\`

| Col 1 | Col 2 |
|-------|-------|
| A     | B     |
`;
    const html = convertMarkdown(markdown);

    expect(html).toContain("<h1");
    expect(html).toContain("<h2");
    expect(html).toContain("<strong>");
    expect(html).toContain("<ul");
    expect(html).toContain("<pre");
    expect(html).toContain("<table");
  });
});
