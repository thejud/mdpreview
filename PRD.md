# MDPreview - Product Requirements Document

## Product Overview

**Product Name:** MDPreview
**Version:** 1.0
**Document Date:** 2025-09-30
**Author:** Technical Specification for Re-implementation

### Executive Summary

MDPreview is a fast, lightweight command-line tool that converts Markdown files to HTML with GitHub-like styling and automatically opens them in a web browser. It features intelligent content-based caching, local image processing, syntax highlighting, and dark mode support.

**Core Value Proposition:**
- **Speed**: Instant preview with SHA256-based caching (only regenerates on content changes)
- **Simplicity**: Single command to view any markdown file
- **Familiarity**: GitHub-like styling that developers expect
- **Convenience**: Automatic browser launch with multi-browser support

---

## Table of Contents

1. [Product Overview](#product-overview)
2. [User Interface](#user-interface)
3. [Functional Requirements](#functional-requirements)
4. [Technical Architecture](#technical-architecture)
5. [System Requirements](#system-requirements)
6. [User Workflows](#user-workflows)
7. [Implementation Specifications](#implementation-specifications)
8. [Non-Functional Requirements](#non-functional-requirements)
9. [Future Enhancements](#future-enhancements)

---

## User Interface

### CLI Interface

The tool provides two command-line interfaces:

#### 1. Direct Preview Command (`mdpreview`)

```
usage: mdpreview [-h] [-b BROWSER] [-g] [-s] [-f] [-N] [-X] [-w WIDTH] [markdown_file]

Convert Markdown to HTML and open in browser

positional arguments:
  markdown_file         Markdown file to convert

options:
  -h, --help            show this help message and exit
  -b BROWSER, --browser BROWSER
                        Browser to open with (e.g., "Google Chrome", "Safari", "Firefox")
  -g, --chrome          Open with Google Chrome
  -s, --safari          Open with Safari
  -f, --firefox         Open with Firefox
  -N, --no-cache        Skip cache and regenerate HTML
  -X, --clean-cache     Clean the cache directory
  -w WIDTH, --width WIDTH
                        Maximum width for the content in pixels (default: 980)
```

**Examples:**
```bash
# Basic usage (Firefox default)
mdpreview README.md

# Browser selection
mdpreview document.md -g          # Chrome
mdpreview document.md -s          # Safari
mdpreview document.md -f          # Firefox

# Width control
mdpreview wide-content.md -w 1200

# Cache management
mdpreview document.md -N          # Skip cache
mdpreview -X                      # Clean all cache
```


### Browser Output

The rendered HTML displays in the browser with the following characteristics:

**Light Mode (Default):**
![MDPreview Light Mode Output](screenshots/mdpreview_light_mode.png)

**Dark Mode (System Preference):**
- Automatically activates based on OS settings
- Uses GitHub dark theme colors
- All elements styled for dark background

**Visual Design Elements:**
- Maximum content width: 980px (configurable)
- Center-aligned content
- 45px padding
- Professional typography matching GitHub
- Responsive images (max-width: 100%)

---

## Functional Requirements

### FR1: Markdown Conversion

**Priority:** P0 (Critical)

**Description:** Convert Markdown files to HTML with full CommonMark compatibility and GitHub Flavored Markdown extensions.

**Acceptance Criteria:**
- ✅ Support all CommonMark syntax
- ✅ Support GitHub Flavored Markdown extensions:
  - Tables
  - Fenced code blocks
  - Syntax highlighting
  - Strikethrough
  - Task lists (via sane_lists)
  - Newlines to `<br>` (nl2br)
- ✅ Preserve markdown semantics in HTML output
- ✅ Handle UTF-8 encoding correctly
- ✅ Generate valid HTML5 documents

**Markdown Extensions Required:**
```python
extensions = [
    'codehilite',      # Syntax highlighting with Pygments
    'fenced_code',     # ```code blocks```
    'tables',          # GitHub-style tables
    'toc',             # Table of contents generation
    'nl2br',           # Convert newlines to <br>
    'sane_lists',      # Better list handling
    'local_images'     # Custom: local image processing
    'mermaid',         # mermaid chart library
]
```

### FR2: Intelligent Caching

**Priority:** P0 (Critical)

**Description:** Cache rendered HTML based on content hash to avoid unnecessary regeneration.

**Acceptance Criteria:**
- ✅ Generate SHA256 hash of markdown file content
- ✅ Use hash as cache key (filename: `{hash}.html`)
- ✅ Store cache in `/tmp/mdpreview/` directory
- ✅ Return cached version if hash matches
- ✅ Skip cache when `-N/--no-cache` flag provided
- ✅ Clean all cache with `-X/--clean-cache` command
- ✅ Handle cache write failures gracefully (fallback to temp file)

**Cache Structure:**
```
/tmp/mdpreview/
├── {sha256_hash_1}.html
├── {sha256_hash_2}.html
├── {sha256_hash_3}_images/
│   ├── diagram.png
│   └── screenshot.jpg
└── {sha256_hash_4}_images/
    └── logo.svg
```

**Performance Target:**
- Cached preview: < 100ms
- Fresh conversion: < 500ms for typical README

### FR3: Local Image Processing

**Priority:** P1 (High)

**Description:** Automatically detect, copy, and reference local images in the rendered HTML.

**Acceptance Criteria:**
- ✅ Detect local image references (relative and absolute paths)
- ✅ Skip remote URLs (http://, https://, //, data:)
- ✅ Support formats: PNG, JPG, JPEG, GIF, SVG, WebP
- ✅ Copy images to cache subdirectory: `{hash}_images/`
- ✅ Update HTML src to reference cached copies
- ✅ Preserve original filenames
- ✅ Avoid duplicate copying
- ✅ Warn on missing images (don't fail)
- ✅ Handle relative paths based on markdown file location
- ✅ Handle embedding of mermaid diagrams with interactive "toggle source" button

**Example Processing:**
```markdown
<!-- Source markdown -->
![Diagram](./images/diagram.png)
![Logo](../media/logo.svg)

<!-- Generated HTML -->
<img src="abc123_images/diagram.png" alt="Diagram">
<img src="abc123_images/logo.svg" alt="Logo">
```

### FR4: Syntax Highlighting

**Priority:** P1 (High)

**Description:** Provide syntax highlighting for code blocks using Pygments.

**Acceptance Criteria:**
- ✅ Auto-detect language from fenced code blocks
- ✅ Generate inline CSS (no external stylesheets)
- ✅ Support 100+ programming languages
- ✅ Match GitHub's visual style
- ✅ Work in both light and dark modes

**Supported Languages (Examples):**
- Python, JavaScript, TypeScript, Go, Rust
- Java, C, C++, C#, Swift, Kotlin
- Ruby, PHP, Perl, Shell/Bash
- HTML, CSS, SQL, JSON, YAML, TOML
- And 100+ more via Pygments

### FR5: Mermaid Diagram Support

**Priority:** P1 (High)

**Description:** Render mermaid diagrams with an interactive toggle to view source code.

**Acceptance Criteria:**
- ✅ Detect mermaid code blocks (```mermaid)
- ✅ Render diagrams using mermaid.js library
- ✅ Add "Toggle Source" button below each diagram
- ✅ Button toggles between rendered diagram and source code
- ✅ Source code displayed in formatted code block
- ✅ Preserve diagram state across toggles
- ✅ Style button to match GitHub aesthetic
- ✅ Support all mermaid diagram types (flowchart, sequence, gantt, etc.)

**Implementation Details:**
```html
<!-- Rendered output structure -->
<div class="mermaid-container">
  <div class="mermaid-diagram">
    <!-- Rendered mermaid diagram -->
  </div>
  <pre class="mermaid-source" style="display: none;">
    <code><!-- Mermaid source code --></code>
  </pre>
  <button class="mermaid-toggle">Toggle Source</button>
</div>
```

**JavaScript Integration:**
- Include mermaid.js from CDN in HTML template
- Initialize mermaid on page load
- Add click handlers for toggle buttons
- Persist toggle state using CSS display properties

**Button Styling:**
- GitHub-style button appearance
- Light/dark mode support
- Hover and active states
- Positioned below diagram

### FR6: Browser Integration

**Priority:** P0 (Critical)

**Description:** Open rendered HTML in user's preferred browser.

**Acceptance Criteria:**
- ✅ Default to Firefox if no browser specified
- ✅ Support browser shortcuts: `-g` (Chrome), `-s` (Safari), `-f` (Firefox)
- ✅ Support long-form: `-b "Browser Name"`
- ✅ Use macOS `open -a` command (primary method)
- ✅ Fallback to Python's `webbrowser` module
- ✅ Handle browser launch failures gracefully
- ✅ Print cache file location for manual access

**Platform-Specific Implementation:**
- **macOS:** Use `open -a "Browser Name" file.html`
- **Linux:** Use `xdg-open` or browser-specific commands
- **Windows:** Use `start` or browser-specific commands
- **Fallback:** Python's `webbrowser.open()`

### FR8: Responsive Layout Control

**Priority:** P2 (Medium)

**Description:** Allow users to control content width for better readability.

**Acceptance Criteria:**
- ✅ Default width: 980px (GitHub standard)
- ✅ Accept custom width via `-w/--width` option
- ✅ Support range: 200px to unlimited
- ✅ Center content in viewport
- ✅ Maintain responsive images (max-width: 100%)

**Use Cases:**
- Wide tables/code: `-w 1400`
- Narrow reading: `-w 600`
- Full width: `-w 2000`


###

---

## Technical Architecture

### System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                         User Input                          │
│                                                             │
│  mdpreview document.md -g -w 1200                           │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                    CLI Parser                               │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ argparse                                             │  │
│  │ - markdown_file (positional)                         │  │
│  │ - browser (-b/-g/-s/-f)                              │  │
│  │ - width (-w)                                         │  │
│  │ - no-cache (-N)                                      │  │
│  │ - clean-cache (-X)                                   │  │
│  └──────────────────────────────────────────────────────┘  │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
           ┌───────────┴───────────┐
           │                       │
           ▼                       ▼
┌──────────────────┐    ┌──────────────────┐
│  Cache Check     │    │  Clean Cache     │
│                  │    │                  │
│ get_file_hash()  │    │ clean_cache()    │
│ SHA256 of        │    │ rm -rf /tmp/     │
│ content          │    │ mdpreview        │
└────┬─────────────┘    └──────────────────┘
     │
     │ Hash: abc123...
     ▼
┌──────────────────────────────────┐
│  Cache Lookup                    │
│                                  │
│  /tmp/mdpreview/{hash}.html      │
│  exists?                         │
└────┬─────────────┬───────────────┘
     │             │
     │ No          │ Yes (and not -N)
     ▼             ▼
┌──────────────┐  Return cached
│  Markdown    │  file
│  Processor   │
│              │
│ ┌──────────────────────────────┐
│ │ Python-Markdown Engine       │
│ │                              │
│ │ Extensions:                  │
│ │ • codehilite                 │
│ │ • fenced_code                │
│ │ • tables                     │
│ │ • toc                        │
│ │ • nl2br                      │
│ │ • sane_lists                 │
│ │ • LocalImageExtension        │
│ └──────────────────────────────┘
│              │
│ ┌──────────────────────────────┐
│ │ LocalImageProcessor          │
│ │ (TreeProcessor)              │
│ │                              │
│ │ 1. Find <img> tags           │
│ │ 2. Check if local file       │
│ │ 3. Copy to cache:            │
│ │    {hash}_images/file.png    │
│ │ 4. Update src attribute      │
│ └──────────────────────────────┘
└────┬─────────────┘
     │
     │ HTML content
     ▼
┌──────────────────────────────────┐
│  HTML Template Builder           │
│                                  │
│  • DOCTYPE html                  │
│  • <head>                        │
│    - UTF-8 charset               │
│    - Viewport meta               │
│    - Title (from filename)       │
│    - Embedded CSS                │
│  • <body>                        │
│    - Rendered markdown           │
└────┬─────────────────────────────┘
     │
     ▼
┌──────────────────────────────────┐
│  Cache Writer                    │
│                                  │
│  Write to:                       │
│  /tmp/mdpreview/{hash}.html      │
│                                  │
│  Fallback: tempfile if write     │
│  fails                           │
└────┬─────────────────────────────┘
     │
     │ File path
     ▼
┌──────────────────────────────────┐
│  Browser Launcher                │
│                                  │
│  open_in_browser(file, browser)  │
│                                  │
│  macOS: open -a Browser file     │
│  Fallback: webbrowser.open()     │
└──────────────────────────────────┘
```

### Data Flow Diagram

```
Input File                Content Hash              Cached Output
document.md      ────►    SHA256 Hash     ────►    abc123.html
    │                         │                         │
    │ Read bytes              │ Check cache             │ Exists?
    │                         │                         │
    ▼                         ▼                         ▼
┌─────────┐             ┌──────────┐              ┌─────────┐
│ File    │             │ Hash =   │     No       │ Convert │
│ Content │────────────►│ Cache    │─────────────►│ MD→HTML │
│ (UTF-8) │             │ Key?     │              │         │
└─────────┘             └──────────┘              └────┬────┘
                             │                         │
                             │ Yes                     │
                             │                         │
                             ▼                         ▼
                        Return cached         ┌────────────────┐
                        file path             │ Process Images │
                                              │ Copy to cache  │
                                              └────┬───────────┘
                                                   │
                                                   ▼
                                              ┌──────────┐
                                              │ Generate │
                                              │ Complete │
                                              │ HTML Doc │
                                              └────┬─────┘
                                                   │
                                                   ▼
                                              ┌──────────┐
                                              │ Write to │
                                              │ Cache    │
                                              └────┬─────┘
                                                   │
                                                   ▼
┌──────────────────────────────────────────────────────────┐
│                    Browser Display                       │
│                  (file:// protocol)                      │
└──────────────────────────────────────────────────────────┘
```

### Supported Platforms

| Platform | Status | Browser Launch Method |
|----------|--------|----------------------|
| macOS    | ✅ Primary | `open -a Browser` |
| Linux    | ✅ Supported | `xdg-open` / `webbrowser` |
| Windows  | ⚠️ Partial | `webbrowser` module |

**Note:** Windows support is theoretical; the current implementation uses macOS-specific `open` command. Cross-platform implementation would require platform detection and appropriate launcher selection.

### Supported Browsers

- Firefox (default)
- Google Chrome
- Safari
- Edge (via `-b "Microsoft Edge"`)
- Any browser installed on the system

### File System Requirements

**Cache Directory:**
- Path: `/tmp/mdpreview/`
- Permissions: Read/Write
- Cleanup: Manual via `-X` or system temp cleanup
- Expected size: 1-10MB for typical usage

**Temporary Files:**
- Used as fallback if cache write fails
- System-managed cleanup

---

## User Workflows

### Workflow 1: Quick Preview (Primary Use Case)

```
┌─────────────────────────────────────────────┐
│ Developer writing markdown document         │
└────────────────┬────────────────────────────┘
                 │
                 ▼
      ┌────────────────────┐
      │ Run: mdpreview     │
      │      README.md     │
      └─────────┬──────────┘
                │
                ▼
      ┌────────────────────┐      ┌──────────────┐
      │ First run?         │─Yes─►│ Generate     │
      │                    │      │ HTML + cache │
      └─────────┬──────────┘      └──────┬───────┘
                │ No                     │
                │ (content unchanged)     │
                ▼                        ▼
      ┌────────────────────┐      ┌──────────────┐
      │ Use cached HTML    │◄─────│ Save to      │
      │ (<100ms)           │      │ cache        │
      └─────────┬──────────┘      └──────────────┘
                │
                ▼
      ┌────────────────────┐
      │ Firefox opens      │
      │ with rendered      │
      │ document           │
      └────────────────────┘
```

**Time Budget:**
- Cached: <100ms total
- Fresh: <500ms for typical README
- User sees results in <1 second


### Workflow 4: Cache Management

```
┌─────────────────────────────────────────────┐
│ Scenario: Cache has grown large or has      │
│ outdated files                              │
└────────────────┬────────────────────────────┘
                 │
                 ▼
      ┌────────────────────┐
      │ Run: mdpreview -X  │
      └─────────┬──────────┘
                │
                ▼
      ┌────────────────────────────────────┐
      │ clean_cache() executes:            │
      │ • rm -rf /tmp/mdpreview/*          │
      │ • mkdir /tmp/mdpreview             │
      └─────────┬──────────────────────────┘
                │
                ▼
      ┌────────────────────────────────────┐
      │ Output: "Cache cleaned             │
      │ successfully"                      │
      └────────────────────────────────────┘
                │
                │ Next preview will regenerate
                ▼
      ┌────────────────────────────────────┐
      │ Fresh HTML generation for all      │
      │ subsequent previews                │
      └────────────────────────────────────┘
```

---

## Implementation Specifications

### File Structure for Re-implementation

```
mdpreview/
├── package.json           # Node/Bun dependencies (if using Bun)
├── pyproject.toml        # Python dependencies (if using Python)
├── README.md
├── LICENSE
├── INSTALL.md
│
├── src/
│   ├── cli.ts            # Main CLI entry point
│   │
│   ├── core/
│   │   ├── hash.ts       # SHA256 content hashing
│   │   ├── cache.ts      # Cache management
│   │   └── markdown.ts   # Markdown processing
│   │
│   ├── processors/
│   │   └── images.ts     # Local image processor
│   │
│   ├── rendering/
│   │   ├── styles.ts     # CSS generation
│   │   └── template.ts   # HTML template
│   │
│   └── browser/
│       └── launcher.ts   # Browser launch logic
│
└── tests/
    ├── test-data/
    │   ├── sample.md
    │   └── images/
    └── unit/
        ├── hash.test.ts
        ├── cache.test.ts
        └── markdown.test.ts
```

### Core Functions Specification

#### 1. `getFileHash(filePath: string): string`

**Purpose:** Generate SHA256 hash of file content.

**Input:**
- `filePath`: Absolute or relative path to markdown file

**Output:**
- 64-character hexadecimal string

**Algorithm:**
```typescript
function getFileHash(filePath: string): string {
  const content = readFileSync(filePath);
  const hash = createHash('sha256');
  hash.update(content);
  return hash.digest('hex');
}
```

**Error Handling:**
- File not found → Exit with error
- Read permission denied → Exit with error

#### 2. `getCacheDir(): string`

**Purpose:** Get or create cache directory.

**Output:**
- `/tmp/mdpreview` (or platform-specific temp dir)

**Behavior:**
- Create directory if doesn't exist
- Set permissions: 755
- Return absolute path

#### 3. `convertMarkdownToHtml(filePath: string, options: ConvertOptions): string`

**Purpose:** Convert markdown file to HTML with caching.

**Input:**
```typescript
interface ConvertOptions {
  useCache: boolean;      // Default: true
  width: number;          // Default: 980
}
```

**Output:**
- Absolute path to generated HTML file

**Algorithm:**
1. Calculate file hash
2. Check cache if `useCache` is true
3. If cached, return cached path
4. Read markdown content
5. Process with markdown engine
6. Process images (copy to cache)
7. Generate complete HTML with CSS
8. Write to cache
9. Return file path

**Error Handling:**
- File not found → Exit with error
- Markdown parse error → Exit with error
- Cache write failure → Use temp file

#### 4. `processLocalImages(markdownAST, sourceDir: string, cacheDir: string, fileHash: string)`

**Purpose:** Find and process local images in markdown.

**Algorithm:**
1. Traverse markdown AST
2. Find all `<img>` elements
3. For each image:
   - Check if local (skip http://, https://, data:)
   - Resolve path relative to source file
   - Check if file exists
   - Check if supported format
   - Copy to `{cacheDir}/{fileHash}_images/`
   - Update `src` attribute to relative path
4. Return modified AST

**Supported Formats:**
- `.png`, `.jpg`, `.jpeg`, `.gif`, `.svg`, `.webp`

**Error Handling:**
- Missing image → Warn to stderr, continue
- Copy failure → Warn to stderr, continue

#### 5. `getGithubCSS(maxWidth: number): string`

**Purpose:** Generate GitHub-like CSS with configurable width.

**Input:**
- `maxWidth`: Maximum content width in pixels

**Output:**
- Complete `<style>` tag with embedded CSS

**Features:**
- Light mode styles (default)
- Dark mode styles (`@media (prefers-color-scheme: dark)`)
- Typography matching GitHub
- Responsive tables
- Code block styling
- Syntax highlighting integration

**CSS Structure:**
```css
<style>
body {
  /* Layout */
  max-width: {maxWidth}px;
  margin: 0 auto;
  padding: 45px;

  /* Typography */
  font-family: -apple-system, ...;
  font-size: 16px;
  line-height: 1.5;

  /* Colors */
  color: #1f2328;
  background: #ffffff;
}

@media (prefers-color-scheme: dark) {
  body {
    color: #e6edf3;
    background: #0d1117;
  }
  /* ... all dark mode overrides ... */
}

/* ... all other element styles ... */
</style>
```

#### 6. `openInBrowser(htmlPath: string, browser?: string)`

**Purpose:** Open HTML file in specified browser.

**Input:**
- `htmlPath`: Absolute path to HTML file
- `browser`: Browser name (default: "Firefox")

**Algorithm:**
```typescript
function openInBrowser(htmlPath: string, browser = "Firefox") {
  // macOS
  if (process.platform === 'darwin') {
    exec(`open -a "${browser}" "${htmlPath}"`);
  }
  // Linux
  else if (process.platform === 'linux') {
    exec(`xdg-open "${htmlPath}"`);
  }
  // Windows
  else if (process.platform === 'win32') {
    exec(`start "" "${htmlPath}"`);
  }
  // Fallback
  else {
    exec(`open "${htmlPath}"`);
  }
}
```

**Error Handling:**
- Browser not found → Try fallback method
- Launch failure → Print error + file path for manual opening

#### 7. `cleanCache()`

**Purpose:** Remove all cached files.

**Algorithm:**
```typescript
function cleanCache() {
  const cacheDir = getCacheDir();
  if (existsSync(cacheDir)) {
    rmSync(cacheDir, { recursive: true, force: true });
    mkdirSync(cacheDir, { recursive: true });
    console.log("Cache cleaned successfully");
  } else {
    console.log("Cache directory doesn't exist");
  }
}
```

### Markdown Processing Pipeline

```
Raw Markdown
     │
     ▼
┌─────────────────────┐
│ Parse with Markdown │
│ Engine              │
│ (marked/remark/etc) │
└─────────┬───────────┘
          │
          ▼
    ┌──────────┐
    │   AST    │
    └─────┬────┘
          │
          ▼
┌─────────────────────────┐
│ Apply Extensions:       │
│ • Tables                │
│ • Code (fenced)         │
│ • Strikethrough         │
│ • Task lists            │
└─────────┬───────────────┘
          │
          ▼
┌─────────────────────────┐
│ Custom Processors:      │
│ • LocalImageProcessor   │
│   - Find images         │
│   - Copy files          │
│   - Rewrite paths       │
└─────────┬───────────────┘
          │
          ▼
┌─────────────────────────┐
│ Syntax Highlighting     │
│ • Detect language       │
│ • Apply Pygments/Prism  │
│ • Generate HTML         │
└─────────┬───────────────┘
          │
          ▼
┌─────────────────────────┐
│ Render to HTML          │
└─────────┬───────────────┘
          │
          ▼
    HTML Output
```

### HTML Template Structure

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{filename}</title>
    {githubCSS}
    <script type="module">
      import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs';
      mermaid.initialize({ startOnLoad: true, theme: 'default' });
    </script>
</head>
<body>
    {renderedMarkdown}
    <script>
      // Toggle source code visibility for mermaid diagrams
      document.querySelectorAll('.mermaid-toggle').forEach(button => {
        button.addEventListener('click', (e) => {
          const container = e.target.closest('.mermaid-container');
          const diagram = container.querySelector('.mermaid-diagram');
          const source = container.querySelector('.mermaid-source');

          if (source.style.display === 'none') {
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
</html>
```

**Variables:**
- `{filename}`: Markdown filename without extension
- `{githubCSS}`: Complete `<style>` block from `getGithubCSS()`
- `{renderedMarkdown}`: Processed HTML from markdown engine (including mermaid containers)

### Color Palette

**Light Mode:**
```css
--bg-primary: #ffffff;
--text-primary: #1f2328;
--text-secondary: #656d76;
--border: #d0d7de;
--code-bg: #f6f8fa;
--code-text: #24292f;
--link: #0969da;
--heading-border: #d0d7de;
```

**Dark Mode:**
```css
--bg-primary: #0d1117;
--text-primary: #e6edf3;
--text-secondary: #656d76;
--border: #30363d;
--code-bg: #161b22;
--code-text: #f0f6fc;
--link: #58a6ff;
--heading-border: #30363d;
```

