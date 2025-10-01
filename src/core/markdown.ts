import { marked } from "marked";
import hljs from "highlight.js";

export interface MarkdownOptions {
  /** Apply syntax highlighting to code blocks (default: true) */
  highlight?: boolean;
  /** Enable GitHub Flavored Markdown extensions (default: true) */
  gfm?: boolean;
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
    breaks: false, // Don't convert \n to <br> automatically (GFM default)
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
    return marked.parse(content) as string;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to convert markdown: ${error.message}`);
    }
    throw error;
  }
}
