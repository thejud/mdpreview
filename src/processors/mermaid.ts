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
   * Wrap a mermaid code block with container, diagram, source, and toggle button
   * @param code - Mermaid diagram code
   * @returns HTML structure with mermaid container
   */
  wrapMermaidBlock(code: string): string {
    return `<div class="mermaid-container">
  <div class="mermaid-diagram">
    <pre class="mermaid">${code}</pre>
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
  processMermaidBlocks(html: string): string {
    if (!html) return "";

    const blocks = this.detectMermaidBlocks(html);
    if (blocks.length === 0) return html;

    let result = html;

    for (const block of blocks) {
      const wrapped = this.wrapMermaidBlock(block.code);
      result = result.replace(block.fullMatch, wrapped);
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
