import { marked } from "marked";
import hljs from "highlight.js";

export interface MarkdownOptions {
  /** Apply syntax highlighting to code blocks (default: true) */
  highlight?: boolean;
  /** Enable GitHub Flavored Markdown extensions (default: true) */
  gfm?: boolean;
}

interface FrontmatterEntry {
  key: string;
  value: string;
}

// Singleton configuration to avoid re-initialization
let isConfigured = false;

/**
 * Configure marked with GitHub Flavored Markdown and syntax highlighting
 */
function configureMarked(options: MarkdownOptions = {}): void {
  if (isConfigured) return;

  const { highlight = true, gfm = true } = options;

  // Configure marked with GFM and syntax highlighting
  marked.setOptions({
    gfm,
    breaks: true, // Convert \n to <br> to match GitHub behavior
    highlight: highlight
      ? (code: string, lang: string) => {
          if (lang && hljs.getLanguage(lang)) {
            try {
              return hljs.highlight(code, { language: lang }).value;
            } catch (err) {
              console.error(`Error highlighting code for language "${lang}":`, err);
            }
          }
          // No fallback - just return plain code
          return code;
        }
      : undefined,
  });

  isConfigured = true;
}

/**
 * Extract a YAML-style frontmatter block at the start of a Markdown document.
 * This intentionally handles the flat metadata commonly used in Markdown
 * documents without adding a YAML parser dependency.
 */
function extractFrontmatter(content: string): { entries: FrontmatterEntry[]; body: string } | null {
  const match = content.match(/^(?:\uFEFF)?---[ \t]*\r?\n([\s\S]*?)\r?\n(?:---|\.\.\.)[ \t]*(?:\r?\n|$)/);
  if (!match) {
    return null;
  }

  const entries: FrontmatterEntry[] = [];
  let currentEntry: FrontmatterEntry | undefined;

  const frontmatterContent = match[1] ?? "";
  for (const line of frontmatterContent.split(/\r?\n/)) {
    if (!line.trim() || /^\s*#/.test(line)) {
      continue;
    }

    const entryMatch = line.match(/^([A-Za-z0-9_.-]+)\s*:\s*(.*)$/);
    if (entryMatch) {
      const entry = { key: entryMatch[1] ?? "", value: entryMatch[2] ?? "" };
      currentEntry = entry;
      entries.push(entry);
      continue;
    }

    // Keep indented YAML list items and multiline values in the same cell.
    if (currentEntry && /^\s+/.test(line)) {
      const continuation = line.trim().replace(/^-\s*/, "");
      currentEntry.value = currentEntry.value
        ? `${currentEntry.value}\n${continuation}`
        : continuation;
    }
  }

  return { entries, body: content.slice(match[0].length) };
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function renderFrontmatter(entries: FrontmatterEntry[]): string {
  if (entries.length === 0) {
    return "";
  }

  const rows = entries.map(({ key, value }) => {
    const formattedValue = escapeHtml(value).replace(/\r?\n/g, "<br>");
    return `    <tr><th scope="row">${escapeHtml(key)}</th><td>${formattedValue}</td></tr>`;
  }).join("\n");

  return `<table class="frontmatter-table">
  <thead>
    <tr><th scope="col">Key</th><th scope="col">Value</th></tr>
  </thead>
  <tbody>
${rows}
  </tbody>
</table>
`;
}

/**
 * Convert markdown content to HTML
 * @param content - Markdown content string
 * @param options - Conversion options
 * @returns HTML string
 */
export function convertMarkdown(content: string, options: MarkdownOptions = {}): string {
  if (!content) {
    return "";
  }

  // Configure marked once
  configureMarked(options);

  try {
    const frontmatter = extractFrontmatter(content);
    const markdown = frontmatter?.entries.length ? frontmatter.body : content;
    const frontmatterHtml = frontmatter?.entries.length ? renderFrontmatter(frontmatter.entries) : "";

    return frontmatterHtml + (marked.parse(markdown) as string);
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to convert markdown: ${error.message}`);
    }
    throw error;
  }
}
