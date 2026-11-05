import { describe, test, expect } from "bun:test";
import { MermaidProcessor } from "../../src/processors/mermaid";

describe("MermaidProcessor", () => {
  test("detects mermaid code blocks in HTML", async () => {
    const html = '<pre><code class="language-mermaid">graph TD\n  A-->B</code></pre>';
    const processor = new MermaidProcessor();

    const blocks = processor.detectMermaidBlocks(html);

    expect(blocks.length).toBe(1);
    expect(blocks[0]?.code).toContain("graph TD");
  });

  test("extracts mermaid source code", async () => {
    const html = '<pre><code class="language-mermaid">flowchart LR\n  Start --> Stop</code></pre>';
    const processor = new MermaidProcessor();

    const blocks = processor.detectMermaidBlocks(html);

    expect(blocks[0]?.code).toBe("flowchart LR\n  Start --> Stop");
  });

  test("wraps mermaid block with container structure", async () => {
    const code = "graph TD\n  A-->B";
    const processor = new MermaidProcessor();

    const wrapped = await processor.wrapMermaidBlock(code);

    expect(wrapped).toContain('<div class="mermaid-container">');
    expect(wrapped).toContain('<div class="mermaid-diagram">');
    expect(wrapped).toContain('<pre class="mermaid-source"');
    expect(wrapped).toContain('<button class="mermaid-toggle">');
  });

  test("includes mermaid source in wrapped block", async () => {
    const code = "graph TD\n  A-->B";
    const processor = new MermaidProcessor();

    const wrapped = await processor.wrapMermaidBlock(code);

    expect(wrapped).toContain("graph TD\n  A--&gt;B");
  });

  test("wrapped mermaid source is initially hidden", async () => {
    const code = "graph TD\n  A-->B";
    const processor = new MermaidProcessor();

    const wrapped = await processor.wrapMermaidBlock(code);

    expect(wrapped).toContain('style="display: none"');
  });

  test("processes all mermaid blocks in HTML", async () => {
    const html = `
      <p>Text before</p>
      <pre><code class="language-mermaid">graph TD
  A-->B</code></pre>
      <p>Text between</p>
      <pre><code class="language-mermaid">sequenceDiagram
  Alice->>Bob: Hello</code></pre>
      <p>Text after</p>
    `;
    const processor = new MermaidProcessor();

    const result = await processor.processMermaidBlocks(html);

    expect(result).toContain("mermaid-container");
    expect(result).toContain("graph TD");
    expect(result).toContain("sequenceDiagram");
    expect(result).toContain("Text before");
    expect(result).toContain("Text after");
  });

  test("preserves non-mermaid code blocks", async () => {
    const html = `
      <pre><code class="language-javascript">console.log("hello");</code></pre>
      <pre><code class="language-mermaid">graph TD
  A-->B</code></pre>
      <pre><code class="language-python">print("world")</code></pre>
    `;
    const processor = new MermaidProcessor();

    const result = await processor.processMermaidBlocks(html);

    expect(result).toContain('language-javascript');
    expect(result).toContain('console.log("hello")');
    expect(result).toContain('language-python');
    expect(result).toContain('print("world")');
    expect(result).toContain("mermaid-container");
  });

  test("handles HTML without mermaid blocks", async () => {
    const html = "<p>Just regular HTML, no mermaid</p>";
    const processor = new MermaidProcessor();

    const result = await processor.processMermaidBlocks(html);

    expect(result).toBe(html);
  });

  test("handles empty HTML", async () => {
    const processor = new MermaidProcessor();

    const result = await processor.processMermaidBlocks("");

    expect(result).toBe("");
  });

  test("toggle button has correct text", async () => {
    const code = "graph TD\n  A-->B";
    const processor = new MermaidProcessor();

    const wrapped = await processor.wrapMermaidBlock(code);

    expect(wrapped).toContain('>Toggle Source</button>');
  });

  test("handles complex mermaid diagrams", async () => {
    const code = `graph TB
    A[Start] --> B{Decision}
    B -->|Yes| C[Result 1]
    B -->|No| D[Result 2]
    C --> E[End]
    D --> E`;

    const processor = new MermaidProcessor();
    const wrapped = await processor.wrapMermaidBlock(code);

    expect(wrapped).toContain("A[Start] --&gt; B{Decision}");
    expect(wrapped).toContain("mermaid-container");
  });

  test("handles mermaid blocks with special characters", async () => {
    const code = 'graph TD\n  A["Text with <brackets>"] --> B';
    const processor = new MermaidProcessor();

    const wrapped = await processor.wrapMermaidBlock(code);

    // Source view is escaped, so raw "<brackets>" must never appear as markup
    expect(wrapped).toContain("&lt;brackets&gt;");
    expect(wrapped).not.toContain("<brackets>");
  });

  test("detects multiple mermaid blocks", async () => {
    const html = `
      <pre><code class="language-mermaid">graph TD
  A-->B</code></pre>
      <pre><code class="language-mermaid">graph LR
  C-->D</code></pre>
      <pre><code class="language-mermaid">flowchart TB
  E-->F</code></pre>
    `;
    const processor = new MermaidProcessor();

    const blocks = processor.detectMermaidBlocks(html);

    expect(blocks.length).toBe(3);
  });

  test("replaces original pre/code block with wrapped version", async () => {
    const html = '<pre><code class="language-mermaid">graph TD\n  A-->B</code></pre>';
    const processor = new MermaidProcessor();

    const result = await processor.processMermaidBlocks(html);

    // Original pre/code structure should be replaced
    expect(result).not.toContain('<pre><code class="language-mermaid">');
    expect(result).toContain("mermaid-container");
  });

  test("mermaid source is wrapped in code element", async () => {
    const code = "graph TD\n  A-->B";
    const processor = new MermaidProcessor();

    const wrapped = await processor.wrapMermaidBlock(code);

    expect(wrapped).toContain("<code>");
    expect(wrapped).toContain("</code>");
  });

  test("handles mermaid blocks with HTML entities", async () => {
    const code = "graph TD\n  A[\"Task &amp; Goal\"] --> B";
    const processor = new MermaidProcessor();

    const wrapped = await processor.wrapMermaidBlock(code);

    expect(wrapped).toContain("Task &amp;amp; Goal");
  });

  test("renders diagram to inline SVG (no client-side script)", async () => {
    const wrapped = await new MermaidProcessor().wrapMermaidBlock("graph TD\n  A-->B");

    expect(wrapped).toContain("<svg");
    expect(wrapped).not.toContain('<pre class="mermaid">');
  });

  test("shows an error notice instead of throwing on invalid diagrams", async () => {
    const wrapped = await new MermaidProcessor().wrapMermaidBlock("not a diagram at all");

    expect(wrapped).toContain("mermaid-container");
    expect(wrapped).toContain("mermaid-source");
  });
});
