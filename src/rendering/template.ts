/**
 * Generate complete HTML document with embedded content and styles
 * @param title - Document title (typically markdown filename)
 * @param content - Rendered markdown HTML content
 * @param styles - Complete <style> tag with CSS
 * @param theme - Theme mode: 'auto', 'light', or 'dark' (default: 'auto')
 * @returns Complete HTML5 document
 */
export function generateHtml(title: string, content: string, styles: string, theme: 'auto' | 'light' | 'dark' = 'auto'): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${escapeHtml(title)}</title>
    ${styles}
    <script type="module">
      import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs';
      mermaid.initialize({ startOnLoad: true, theme: 'default' });
    </script>
</head>
<body>
    ${content}
    <script>
      // Toggle source code visibility for mermaid diagrams
      document.querySelectorAll('.mermaid-toggle').forEach(button => {
        button.addEventListener('click', (e) => {
          const container = e.target.closest('.mermaid-container');
          const diagram = container.querySelector('.mermaid-diagram');
          const source = container.querySelector('.mermaid-source');

          if (source.style.display === 'none' || source.style.display === '') {
            diagram.style.display = 'none';
            source.style.display = 'block';
            button.textContent = 'Show Diagram';
          } else {
            diagram.style.display = 'block';
            source.style.display = 'none';
            button.textContent = 'Toggle Source';
          }
        });
      });
    </script>
</body>
</html>`;
}

/**
 * Escape HTML special characters for safe embedding in HTML
 * @param text - Text to escape
 * @returns Escaped text
 */
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
