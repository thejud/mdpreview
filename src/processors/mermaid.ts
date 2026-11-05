import { render } from "pele";

export interface MermaidBlock {
  code: string;
  fullMatch: string;
}

export class MermaidProcessor {
  /**
   * Detect mermaid code blocks in HTML
   * @param html - HTML string to search
   * @returns Array of mermaid blocks with code and full match
   */
  detectMermaidBlocks(html: string): MermaidBlock[] {
    const blocks: MermaidBlock[] = [];
    const mermaidRegex = /<pre><code\s+class=["'](?:[^"']*\s)?language-mermaid(?:\s[^"']*)?["']>([\s\S]*?)<\/code><\/pre>/gi;
    let match;

    while ((match = mermaidRegex.exec(html)) !== null) {
      const code = match[1] || "";
      const fullMatch = match[0] || "";

      // Decode HTML entities in the code
      const decodedCode = this.decodeHtmlEntities(code);

      blocks.push({
        code: decodedCode,
        fullMatch,
      });
    }

    return blocks;
  }

  /**
   * Render mermaid code to inline SVG at build time (no client-side JS).
   * On a parse/render failure, show the error above the source instead of failing the page.
   * @param code - Mermaid diagram code
   * @returns SVG markup, or an error notice
   */
  private async renderDiagram(code: string): Promise<string> {
    try {
      return (await render(code)).svg;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      return `<pre class="mermaid-error">Mermaid render error: ${this.escapeHtml(message)}</pre>`;
    }
  }

  /**
   * Wrap a mermaid code block with container, diagram, source, and toggle button
   * @param code - Mermaid diagram code
   * @returns HTML structure with mermaid container
   */
  async wrapMermaidBlock(code: string): Promise<string> {
    return `<div class="mermaid-container">
  <div class="mermaid-diagram">
    ${await this.renderDiagram(code)}
  </div>
  <pre class="mermaid-source" style="display: none">
    <code>${this.escapeHtml(code)}</code>
  </pre>
  <button class="mermaid-toggle">Toggle Source</button>
</div>`;
  }

  /**
   * Process all mermaid blocks in HTML
   * @param html - HTML string with mermaid code blocks
   * @returns HTML with wrapped mermaid blocks
   */
  async processMermaidBlocks(html: string): Promise<string> {
    if (!html) return "";

    const blocks = this.detectMermaidBlocks(html);
    if (blocks.length === 0) return html;

    let result = html;

    for (const block of blocks) {
      const wrapped = await this.wrapMermaidBlock(block.code);
      // Function replacer: SVG may contain "$&"-style sequences
      result = result.replace(block.fullMatch, () => wrapped);
    }

    return result;
  }

  /**
   * Decode common HTML entities
   * @param text - Text with HTML entities
   * @returns Decoded text
   */
  private decodeHtmlEntities(text: string): string {
    return text
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#039;/g, "'")
      .replace(/&nbsp;/g, " ");
  }

  /**
   * Escape HTML special characters
   * @param text - Text to escape
   * @returns Escaped text
   */
  private escapeHtml(text: string): string {
    return text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }
}
