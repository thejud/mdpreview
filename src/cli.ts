#!/usr/bin/env bun

import { resolve, dirname, basename } from "path";
import { existsSync, readFileSync } from "fs";
import { getFileHash } from "./core/hash";
import { getCacheDir, cleanCache, getCachedHtml, writeCachedHtml, shouldUseCache } from "./core/cache";
import { convertMarkdown } from "./core/markdown";
import { LocalImageProcessor } from "./processors/images";
import { MermaidProcessor } from "./processors/mermaid";
import { getGithubCSS } from "./rendering/styles";
import { generateHtml } from "./rendering/template";
import { openInBrowser, type BrowserOptions } from "./browser/launcher";

export interface CliOptions {
  markdownFiles: string[];
  browser: BrowserOptions;
  width: number;
  noCache: boolean;
  cleanCache: boolean;
  help: boolean;
}

/**
 * Parse command-line arguments
 * @param args - Command-line arguments (excluding node and script name)
 * @returns Parsed options
 */
export function parseArgs(args: string[]): CliOptions {
  const options: CliOptions = {
    markdownFiles: [],
    browser: {},
    width: 980,
    noCache: false,
    cleanCache: false,
    help: false,
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (!arg) continue;

    // Help flags
    if (arg === "-h" || arg === "--help") {
      options.help = true;
      continue;
    }

    // Clean cache flags
    if (arg === "-X" || arg === "--clean-cache") {
      options.cleanCache = true;
      continue;
    }

    // No cache flags
    if (arg === "-N" || arg === "--no-cache") {
      options.noCache = true;
      continue;
    }

    // Browser flags
    if (arg === "-g" || arg === "--chrome") {
      options.browser.chrome = true;
      continue;
    }

    if (arg === "-s" || arg === "--safari") {
      options.browser.safari = true;
      continue;
    }

    if (arg === "-f" || arg === "--firefox") {
      options.browser.firefox = true;
      continue;
    }

    // Browser option with value
    if (arg === "-b" || arg === "--browser") {
      options.browser.browser = args[++i];
      continue;
    }

    // Browser option with = sign
    if (arg.startsWith("--browser=")) {
      options.browser.browser = arg.split("=")[1];
      continue;
    }

    // Width option
    if (arg === "-w" || arg === "--width") {
      const widthStr = args[++i];
      const width = widthStr ? parseInt(widthStr, 10) : 980;
      options.width = isNaN(width) ? 980 : width;
      continue;
    }

    // Width option with = sign
    if (arg.startsWith("--width=")) {
      const widthStr = arg.split("=")[1];
      const width = widthStr ? parseInt(widthStr, 10) : 980;
      options.width = isNaN(width) ? 980 : width;
      continue;
    }

    // Markdown files (positional arguments)
    if (!arg.startsWith("-")) {
      options.markdownFiles.push(arg);
    }
  }

  return options;
}

/**
 * Show usage help
 */
function showHelp(): void {
  console.log(`
mdpreview - Convert Markdown to HTML and open in browser

Usage: mdpreview [options] <markdown_file> [markdown_file2] [...]

Positional Arguments:
  markdown_file         Markdown file(s) to convert (can specify multiple)

Options:
  -h, --help            Show this help message
  -b, --browser BROWSER Browser to open with (e.g., "Google Chrome", "Safari")
  -g, --chrome          Open with Google Chrome
  -s, --safari          Open with Safari
  -f, --firefox         Open with Firefox (default)
  -w, --width WIDTH     Maximum width for content in pixels (default: 980)
  -N, --no-cache        Skip cache and regenerate HTML
  -X, --clean-cache     Clean the cache directory

Examples:
  mdpreview README.md                    # Open in Firefox (default)
  mdpreview foo.md bar.md                # Open multiple files
  mdpreview document.md -g               # Open in Google Chrome
  mdpreview document.md -s               # Open in Safari
  mdpreview wide-content.md -w 1200     # Custom width
  mdpreview document.md -N               # Skip cache
  mdpreview -X                           # Clean all cache
`);
}

/**
 * Process a single markdown file and return the HTML cache path
 * @param markdownFile - Path to markdown file
 * @param options - CLI options
 * @returns Cache path of generated HTML, or null on error
 */
async function processFile(markdownFile: string, options: CliOptions): Promise<string | null> {
  // Resolve absolute path
  const markdownPath = resolve(markdownFile);

  // Check if file exists
  if (!existsSync(markdownPath)) {
    console.error(`Error: File not found: ${markdownPath}`);
    return null;
  }

  try {
    // Calculate content hash
    const hash = getFileHash(markdownPath);

    // Check cache
    if (shouldUseCache(hash, options.noCache)) {
      const cachedHtml = getCachedHtml(hash);
      if (cachedHtml) {
        const cacheDir = getCacheDir();
        const cachePath = resolve(cacheDir, `${hash}.html`);
        console.log(`Using cached version: ${cachePath}`);
        return cachePath;
      }
    }

    // Read markdown file
    const markdown = readFileSync(markdownPath, "utf-8");

    // Convert markdown to HTML
    let html = convertMarkdown(markdown);

    // Process images
    const sourceDir = dirname(markdownPath);
    const cacheDir = getCacheDir();
    const imageProcessor = new LocalImageProcessor();
    html = imageProcessor.processImages(html, sourceDir, cacheDir, hash);

    // Process mermaid diagrams
    const mermaidProcessor = new MermaidProcessor();
    html = mermaidProcessor.processMermaidBlocks(html);

    // Generate complete HTML document
    const title = basename(markdownPath, ".md");
    const styles = getGithubCSS(options.width);
    const fullHtml = generateHtml(title, html, styles);

    // Write to cache
    const cachePath = writeCachedHtml(hash, fullHtml);
    console.log(`Generated HTML: ${cachePath}`);

    return cachePath;
  } catch (error) {
    console.error("Error processing markdown:", error);
    return null;
  }
}

/**
 * Main CLI function without browser opening (for testing)
 * @param args - Command-line arguments
 * @returns Exit code (0 for success, 1 for error)
 */
export async function mainNoBrowser(args: string[]): Promise<number> {
  const options = parseArgs(args);

  // Show help
  if (options.help) {
    showHelp();
    return 0;
  }

  // Clean cache
  if (options.cleanCache) {
    cleanCache();
    return 0;
  }

  // Require markdown file
  if (options.markdownFiles.length === 0) {
    console.error("Error: No markdown file specified");
    console.log("Use -h or --help for usage information");
    return 1;
  }

  // Process each file
  let hasErrors = false;
  for (const file of options.markdownFiles) {
    const cachePath = await processFile(file, options);
    if (cachePath === null) {
      hasErrors = true;
    }
    // Skip browser opening for tests
  }

  return hasErrors ? 1 : 0;
}

/**
 * Main CLI function
 * @param args - Command-line arguments
 * @returns Exit code (0 for success, 1 for error)
 */
export async function main(args: string[]): Promise<number> {
  const options = parseArgs(args);

  // Show help
  if (options.help) {
    showHelp();
    return 0;
  }

  // Clean cache
  if (options.cleanCache) {
    cleanCache();
    return 0;
  }

  // Require markdown file
  if (options.markdownFiles.length === 0) {
    console.error("Error: No markdown file specified");
    console.log("Use -h or --help for usage information");
    return 1;
  }

  // Process each file
  let hasErrors = false;
  for (const file of options.markdownFiles) {
    const cachePath = await processFile(file, options);
    if (cachePath === null) {
      hasErrors = true;
    } else {
      // Open in browser
      openInBrowser(cachePath, options.browser);
    }
  }

  return hasErrors ? 1 : 0;
}

// Run if called directly
if (import.meta.main) {
  const args = process.argv.slice(2);
  const exitCode = await main(args);
  process.exit(exitCode);
}
