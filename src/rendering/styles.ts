/**
 * Generate GitHub-like CSS with configurable max-width and theme
 * @param maxWidth - Maximum content width in pixels
 * @param theme - Theme mode: 'auto', 'light', or 'dark'
 * @returns Complete <style> tag with embedded CSS
 */
export function getGithubCSS(maxWidth: number, theme: 'auto' | 'light' | 'dark' = 'auto'): string {
  // Generate dark mode styles - wrap with media query if auto, apply directly if dark
  const darkModePrefix = theme === 'auto' ? '@media (prefers-color-scheme: dark) {\n' : '';
  const darkModeSuffix = theme === 'auto' ? '}\n' : '';
  const darkModeIndent = theme === 'auto' ? '  ' : '';

  const darkModeStyles = theme === 'light' ? '' : `
${darkModePrefix}${darkModeIndent}body {
${darkModeIndent}  color: #e6edf3;
${darkModeIndent}  background-color: #0d1117;
${darkModeIndent}}

${darkModeIndent}h1, h2 {
${darkModeIndent}  border-bottom-color: #30363d;
${darkModeIndent}}

${darkModeIndent}h6 {
${darkModeIndent}  color: #7d8590;
${darkModeIndent}}

${darkModeIndent}a {
${darkModeIndent}  color: #58a6ff;
${darkModeIndent}}

${darkModeIndent}code {
${darkModeIndent}  background-color: #161b22;
${darkModeIndent}}

${darkModeIndent}pre {
${darkModeIndent}  background-color: #161b22;
${darkModeIndent}}

${darkModeIndent}table th {
${darkModeIndent}  background-color: #161b22;
${darkModeIndent}  border-color: #30363d;
${darkModeIndent}}

${darkModeIndent}table td {
${darkModeIndent}  border-color: #30363d;
${darkModeIndent}}

${darkModeIndent}table tr {
${darkModeIndent}  background-color: #0d1117;
${darkModeIndent}  border-top-color: #30363d;
${darkModeIndent}}

${darkModeIndent}table tr:nth-child(2n) {
${darkModeIndent}  background-color: #161b22;
${darkModeIndent}}

${darkModeIndent}blockquote {
${darkModeIndent}  color: #7d8590;
${darkModeIndent}  border-left-color: #30363d;
${darkModeIndent}}

${darkModeIndent}hr {
${darkModeIndent}  background-color: #30363d;
${darkModeIndent}}

${darkModeIndent}/* Dark mode syntax highlighting */
${darkModeIndent}.hljs {
${darkModeIndent}  color: #f0f6fc;
${darkModeIndent}  background: #161b22;
${darkModeIndent}}

${darkModeIndent}.hljs-comment,
${darkModeIndent}.hljs-quote {
${darkModeIndent}  color: #8b949e;
${darkModeIndent}}

${darkModeIndent}.hljs-keyword,
${darkModeIndent}.hljs-selector-tag,
${darkModeIndent}.hljs-subst {
${darkModeIndent}  color: #ff7b72;
${darkModeIndent}}

${darkModeIndent}.hljs-number,
${darkModeIndent}.hljs-literal,
${darkModeIndent}.hljs-variable,
${darkModeIndent}.hljs-template-variable,
${darkModeIndent}.hljs-tag .hljs-attr {
${darkModeIndent}  color: #79c0ff;
${darkModeIndent}}

${darkModeIndent}.hljs-string,
${darkModeIndent}.hljs-doctag {
${darkModeIndent}  color: #a5d6ff;
${darkModeIndent}}

${darkModeIndent}.hljs-title,
${darkModeIndent}.hljs-section,
${darkModeIndent}.hljs-selector-id {
${darkModeIndent}  color: #d2a8ff;
${darkModeIndent}}

${darkModeIndent}.hljs-type,
${darkModeIndent}.hljs-class .hljs-title {
${darkModeIndent}  color: #ff7b72;
${darkModeIndent}}

${darkModeIndent}.hljs-tag,
${darkModeIndent}.hljs-name,
${darkModeIndent}.hljs-attribute {
${darkModeIndent}  color: #7ee787;
${darkModeIndent}}

${darkModeIndent}.hljs-regexp,
${darkModeIndent}.hljs-link {
${darkModeIndent}  color: #a5d6ff;
${darkModeIndent}}

${darkModeIndent}.hljs-symbol,
${darkModeIndent}.hljs-bullet {
${darkModeIndent}  color: #ffa657;
${darkModeIndent}}

${darkModeIndent}.hljs-built_in,
${darkModeIndent}.hljs-builtin-name {
${darkModeIndent}  color: #79c0ff;
${darkModeIndent}}

${darkModeIndent}.hljs-meta {
${darkModeIndent}  color: #8b949e;
${darkModeIndent}}

${darkModeIndent}.hljs-deletion {
${darkModeIndent}  background-color: #490202;
${darkModeIndent}}

${darkModeIndent}.hljs-addition {
${darkModeIndent}  background-color: #033a16;
${darkModeIndent}}

${darkModeIndent}.mermaid-diagram {
${darkModeIndent}  background-color: #161b22;
${darkModeIndent}  border-color: #30363d;
${darkModeIndent}}

${darkModeIndent}.mermaid-source {
${darkModeIndent}  background-color: #161b22;
${darkModeIndent}  border-color: #30363d;
${darkModeIndent}}

${darkModeIndent}.mermaid-toggle {
${darkModeIndent}  background-color: #21262d;
${darkModeIndent}  border-color: #30363d;
${darkModeIndent}  color: #e6edf3;
${darkModeIndent}}

${darkModeIndent}.mermaid-toggle:hover {
${darkModeIndent}  background-color: #30363d;
${darkModeIndent}}
${darkModeSuffix}`;

  return `<style>
/* Base styles */
body {
  max-width: ${maxWidth}px;
  margin: 0 auto;
  padding: 45px;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji";
  font-size: 16px;
  line-height: 1.5;
  color: #1f2328;
  background-color: #ffffff;
  word-wrap: break-word;
}

/* Typography */
h1, h2, h3, h4, h5, h6 {
  margin-top: 24px;
  margin-bottom: 16px;
  font-weight: 600;
  line-height: 1.25;
}

h1 {
  font-size: 2em;
  padding-bottom: 0.3em;
  border-bottom: 1px solid #d0d7de;
}

h2 {
  font-size: 1.5em;
  padding-bottom: 0.3em;
  border-bottom: 1px solid #d0d7de;
}

h3 {
  font-size: 1.25em;
}

h4 {
  font-size: 1em;
}

h5 {
  font-size: 0.875em;
}

h6 {
  font-size: 0.85em;
  color: #656d76;
}

p {
  margin-top: 0;
  margin-bottom: 16px;
}

/* Links */
a {
  color: #0969da;
  text-decoration: none;
}

a:hover {
  text-decoration: underline;
}

/* Lists */
ul, ol {
  margin-top: 0;
  margin-bottom: 16px;
  padding-left: 2em;
}

li + li {
  margin-top: 0.25em;
}

/* Code */
code {
  padding: 0.2em 0.4em;
  margin: 0;
  font-size: 85%;
  background-color: #f6f8fa;
  border-radius: 6px;
  font-family: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace;
}

pre {
  padding: 16px;
  overflow: auto;
  font-size: 85%;
  line-height: 1.45;
  background-color: #f6f8fa;
  border-radius: 6px;
  margin-top: 0;
  margin-bottom: 16px;
}

pre code {
  display: block;
  padding: 0;
  margin: 0;
  overflow: visible;
  word-wrap: normal;
  background-color: transparent;
  border: 0;
}

/* Tables */
table {
  border-spacing: 0;
  border-collapse: collapse;
  margin-top: 0;
  margin-bottom: 16px;
  width: 100%;
  overflow: auto;
}

table th {
  font-weight: 600;
  padding: 6px 13px;
  border: 1px solid #d0d7de;
  background-color: #f6f8fa;
}

table td {
  padding: 6px 13px;
  border: 1px solid #d0d7de;
}

table tr {
  background-color: #ffffff;
  border-top: 1px solid #d0d7de;
}

table tr:nth-child(2n) {
  background-color: #f6f8fa;
}

/* Blockquotes */
blockquote {
  margin: 0 0 16px 0;
  padding: 0 1em;
  color: #656d76;
  border-left: 0.25em solid #d0d7de;
}

/* Images */
img {
  max-width: 100%;
  height: auto;
  box-sizing: content-box;
}

/* Horizontal rules */
hr {
  height: 0.25em;
  padding: 0;
  margin: 24px 0;
  background-color: #d0d7de;
  border: 0;
}

/* Task lists */
input[type="checkbox"] {
  margin-right: 0.5em;
}

/* Syntax highlighting */
.hljs {
  display: block;
  overflow-x: auto;
  padding: 0.5em;
  color: #24292f;
  background: #f6f8fa;
}

.hljs-comment,
.hljs-quote {
  color: #6a737d;
  font-style: italic;
}

.hljs-keyword,
.hljs-selector-tag,
.hljs-subst {
  color: #d73a49;
  font-weight: bold;
}

.hljs-number,
.hljs-literal,
.hljs-variable,
.hljs-template-variable,
.hljs-tag .hljs-attr {
  color: #005cc5;
}

.hljs-string,
.hljs-doctag {
  color: #032f62;
}

.hljs-title,
.hljs-section,
.hljs-selector-id {
  color: #6f42c1;
  font-weight: bold;
}

.hljs-type,
.hljs-class .hljs-title {
  color: #d73a49;
}

.hljs-tag,
.hljs-name,
.hljs-attribute {
  color: #22863a;
  font-weight: normal;
}

.hljs-regexp,
.hljs-link {
  color: #032f62;
}

.hljs-symbol,
.hljs-bullet {
  color: #e36209;
}

.hljs-built_in,
.hljs-builtin-name {
  color: #005cc5;
}

.hljs-meta {
  color: #6a737d;
}

.hljs-deletion {
  background-color: #ffeef0;
}

.hljs-addition {
  background-color: #e6ffed;
}

.hljs-emphasis {
  font-style: italic;
}

.hljs-strong {
  font-weight: bold;
}

/* Mermaid diagram container styles */
.mermaid-container {
  margin: 16px 0;
}

.mermaid-diagram {
  background-color: #ffffff;
  padding: 16px;
  border-radius: 6px;
  border: 1px solid #d0d7de;
}

.mermaid-source {
  background-color: #f6f8fa;
  padding: 16px;
  border-radius: 6px;
  border: 1px solid #d0d7de;
  overflow-x: auto;
}

.mermaid-source code {
  background-color: transparent;
}

.mermaid-toggle {
  margin-top: 8px;
  padding: 5px 16px;
  background-color: #f6f8fa;
  border: 1px solid #d0d7de;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  color: #24292f;
}

.mermaid-toggle:hover {
  background-color: #f3f4f6;
}
${darkModeStyles}
</style>`;
}
