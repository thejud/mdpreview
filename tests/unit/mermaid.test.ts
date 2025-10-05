import { describe, test, expect } from "bun:test";
import { MermaidProcessor } from "../../src/processors/mermaid";

describe("MermaidProcessor", () => {
  test("detects mermaid code blocks in HTML", () => {
    const html = '<pre><code class="language-mermaid">graph TD\n  A-->B</code></pre>';
    const processor = new MermaidProcessor();

    const blocks = processor.detectMermaidBlocks(html);

    expect(blocks.length).toBe(1);
    expect(blocks[0]?.code).toContain("graph TD");
  });

  test("extracts mermaid source code", () => {
    const html = '<pre><code class="language-mermaid">flowchart LR\n  Start --> Stop</code></pre>';
    const processor = new MermaidProcessor();

    const blocks = processor.detectMermaidBlocks(html);

    expect(blocks[0]?.code).toBe("flowchart LR\n  Start --> Stop");
  });

  test("wraps mermaid block with container structure", () => {
    const code = "graph TD\n  A-->B";
    const processor = new MermaidProcessor();

    const wrapped = processor.wrapMermaidBlock(code);

    expect(wrapped).toContain('<div class="mermaid-container">');
    expect(wrapped).toContain('<div class="mermaid-diagram">');
    expect(wrapped).toContain('<pre class="mermaid-source"');
    expect(wrapped).toContain('<button class="mermaid-toggle">');
  });

  test("includes mermaid source in wrapped block", () => {
    const code = "graph TD\n  A-->B";
    const processor = new MermaidProcessor();

    const wrapped = processor.wrapMermaidBlock(code);

    expect(wrapped).toContain(code);
  });

  test("wrapped mermaid source is initially hidden", () => {
    const code = "graph TD\n  A-->B";
    const processor = new MermaidProcessor();

    const wrapped = processor.wrapMermaidBlock(code);

    expect(wrapped).toContain('style="display: none"');
  });

  test("processes all mermaid blocks in HTML", () => {
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

    const result = processor.processMermaidBlocks(html);

    expect(result).toContain("mermaid-container");
    expect(result).toContain("graph TD");
    expect(result).toContain("sequenceDiagram");
    expect(result).toContain("Text before");
    expect(result).toContain("Text after");
  });

  test("preserves non-mermaid code blocks", () => {
    const html = `
      <pre><code class="language-javascript">console.log("hello");</code></pre>
      <pre><code class="language-mermaid">graph TD
  A-->B</code></pre>
      <pre><code class="language-python">print("world")</code></pre>
    `;
    const processor = new MermaidProcessor();

    const result = processor.processMermaidBlocks(html);

    expect(result).toContain('language-javascript');
    expect(result).toContain('console.log("hello")');
    expect(result).toContain('language-python');
    expect(result).toContain('print("world")');
    expect(result).toContain("mermaid-container");
  });

  test("handles HTML without mermaid blocks", () => {
    const html = "<p>Just regular HTML, no mermaid</p>";
    const processor = new MermaidProcessor();

    const result = processor.processMermaidBlocks(html);

    expect(result).toBe(html);
  });

  test("handles empty HTML", () => {
    const processor = new MermaidProcessor();

    const result = processor.processMermaidBlocks("");

    expect(result).toBe("");
  });

  test("toggle button has correct text", () => {
    const code = "graph TD\n  A-->B";
    const processor = new MermaidProcessor();

    const wrapped = processor.wrapMermaidBlock(code);

    expect(wrapped).toContain('>Toggle Source</button>');
  });

  test("handles complex mermaid diagrams", () => {
    const code = `graph TB
    A[Start] --> B{Decision}
    B -->|Yes| C[Result 1]
    B -->|No| D[Result 2]
    C --> E[End]
    D --> E`;

    const processor = new MermaidProcessor();
    const wrapped = processor.wrapMermaidBlock(code);

    expect(wrapped).toContain(code);
    expect(wrapped).toContain("mermaid-container");
  });

  test("handles mermaid blocks with special characters", () => {
    const code = 'graph TD\n  A["Text with <brackets>"] --> B';
    const processor = new MermaidProcessor();

    const wrapped = processor.wrapMermaidBlock(code);

    expect(wrapped).toContain(code);
  });

  test("detects multiple mermaid blocks", () => {
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

  test("replaces original pre/code block with wrapped version", () => {
    const html = '<pre><code class="language-mermaid">graph TD\n  A-->B</code></pre>';
    const processor = new MermaidProcessor();

    const result = processor.processMermaidBlocks(html);

    // Original pre/code structure should be replaced
    expect(result).not.toContain('<pre><code class="language-mermaid">');
    expect(result).toContain("mermaid-container");
  });

  test("mermaid source is wrapped in code element", () => {
    const code = "graph TD\n  A-->B";
    const processor = new MermaidProcessor();

    const wrapped = processor.wrapMermaidBlock(code);

    expect(wrapped).toContain("<code>");
    expect(wrapped).toContain("</code>");
  });

  test("handles mermaid blocks with HTML entities", () => {
    const code = "graph TD\n  A[\"Task &amp; Goal\"] --> B";
    const processor = new MermaidProcessor();

    const wrapped = processor.wrapMermaidBlock(code);

    expect(wrapped).toContain(code);
  });
});
