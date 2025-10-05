![MDPreview Logo](media/mdpreview_logo_small.png)

# MDPreview

A fast, lightweight CLI tool for converting Markdown to HTML and opening it in your browser with intelligent caching. Now powered by Bun for even faster performance!

## Features

- ✅ **GitHub-like styling** with automatic dark mode support
- ✅ **Lightning-fast** with Bun runtime and intelligent caching using SHA256 hashes
- ✅ **Local image support** with automatic copying to cache
- ✅ **Mermaid diagrams** with interactive toggle between diagram and source code
- ✅ **Syntax highlighting** for 100+ programming languages
- ✅ **macOS integration** using the `open` command
- ✅ **Multiple browser support** (Firefox, Chrome, Safari)
- ✅ **Markdown extensions** (GitHub Flavored Markdown, tables, fenced code, etc.)
- ✅ **Configurable page width** for better display of wide content

## Quick Start

```bash
# Basic usage (opens in Firefox by default)
./mdpreview document.md

# Browser shortcuts
./mdpreview document.md -g    # Chrome
./mdpreview document.md -s    # Safari
./mdpreview document.md -f    # Firefox

# Width control for wide content
./mdpreview document.md --width 1200    # Wide layout (1200px)
./mdpreview document.md -w 600          # Narrow layout (600px)

# Cache control
./mdpreview document.md -N              # Skip cache, force regeneration
./mdpreview -X                          # Clean cache directory
```

## Use Case

MDPreview provides an extremely fast and simple way to view markdown files in your browser with professional GitHub-like styling. Perfect for quickly previewing documentation, notes, or README files without the overhead of a full markdown editor.

With intelligent content-based caching, subsequent views of the same file are nearly instantaneous (<100ms). The cache automatically invalidates when you edit the markdown file, ensuring you always see the latest version.

## Image Support

MDPreview automatically handles images in your markdown files:

- **Local images** are copied to the cache directory alongside the HTML
- **Remote images** (http/https URLs) work without any changes
- **Relative paths** are resolved based on the markdown file location
- **Supported formats**: PNG, JPG, JPEG, GIF, SVG, WebP

### How It Works

When you preview a markdown file containing local images, MDPreview:
1. Detects all local image references
2. Copies them to a subdirectory in the cache (`{hash}_images/`)
3. Updates the HTML to reference the cached copies
4. Preserves the cache for fast subsequent views

### Example: Image Syntax

| Markdown Source | Rendered Output |
|----------------|-----------------|
| `![Local PNG](test/test_image.png)` | ![Local PNG](test/test_image.png) |
| `![Local SVG](test/test_image.svg)` | ![Local SVG](test/test_image.svg) |
| `![Remote](https://via.placeholder.com/150x80/0969da/ffffff?text=Remote+Image)` | ![Remote](https://via.placeholder.com/150x80/0969da/ffffff?text=Remote+Image) |

## Mermaid Diagram Support

MDPreview includes full support for Mermaid diagrams with an interactive toggle feature:

- **All diagram types supported**: flowcharts, sequence diagrams, Gantt charts, class diagrams, etc.
- **Interactive toggle button**: Switch between rendered diagram and source code
- **Automatic rendering**: Diagrams render on page load
- **GitHub-style buttons**: Consistent with the overall design

### Example: Mermaid Diagrams

**Flowchart Syntax:**
````markdown
```mermaid
graph TD
    A[Start] --> B{Is it working?}
    B -->|Yes| C[Great!]
    B -->|No| D[Debug]
    C --> E[End]
    D --> E
```
````

**Rendered Flowchart:**

```mermaid
graph TD
    A[Start] --> B{Is it working?}
    B -->|Yes| C[Great!]
    B -->|No| D[Debug]
    C --> E[End]
    D --> E
```

---

**Sequence Diagram Syntax:**
````markdown
```mermaid
sequenceDiagram
    User->>MDPreview: Convert file
    MDPreview->>Browser: Open HTML
    Browser->>User: Display result
```
````

**Rendered Sequence Diagram:**

```mermaid
sequenceDiagram
    User->>MDPreview: Convert file
    MDPreview->>Browser: Open HTML
    Browser->>User: Display result
```

## Installation

### Prerequisites

- **Bun** runtime (https://bun.sh)
- **Supported platforms**: macOS (ARM64/Intel), Linux (x64/ARM64), Windows (x64)
- **Modern web browser** (Firefox, Chrome, or Safari)

### Option 1: Install from Source

```bash
# Clone the repository
git clone https://github.com/yourusername/mdpreview.git
cd mdpreview

# Install dependencies
bun install

# Run directly
bun run src/cli.ts document.md

# Or create an alias in your shell config (~/.zshrc or ~/.bashrc)
alias mdpreview="bun run /path/to/mdpreview/src/cli.ts"
```

### Option 2: Build Standalone Executable

```bash
# Build for your current platform (defaults to macOS ARM64)
bun run build

# This creates a standalone binary: ./mdpreview
./mdpreview document.md

# Move to your PATH for system-wide access
sudo mv mdpreview /usr/local/bin/
```

#### Cross-Platform Builds

Build standalone executables for multiple platforms:

```bash
# Build for specific platforms
bun run build:macos-arm64      # macOS Apple Silicon (M1/M2/M3)
bun run build:macos-x64        # macOS Intel
bun run build:linux-x64        # Linux x64
bun run build:linux-arm64      # Linux ARM64
bun run build:windows-x64      # Windows x64

# Build for all platforms at once
bun run build:all

# Outputs to dist/ directory:
# - dist/mdpreview-macos-arm64
# - dist/mdpreview-macos-x64
# - dist/mdpreview-linux-x64
# - dist/mdpreview-linux-arm64
# - dist/mdpreview-windows-x64.exe
```

**Note:** You can cross-compile from any platform to any other platform. For example, build Windows executables from macOS or Linux executables from Windows.

### Option 3: Quick Alias

Add to your `~/.zshrc` or `~/.bashrc`:

```bash
alias mdpreview="bun run /path/to/mdpreview/src/cli.ts"
```

## Usage

```
Usage: mdpreview [options] [markdown_file]

Options:
  -h, --help              Show this help message
  -b, --browser BROWSER   Browser to open with (e.g., "Google Chrome", "Safari", "Firefox")
  -g, --chrome            Open with Google Chrome
  -s, --safari            Open with Safari
  -f, --firefox           Open with Firefox (default)
  -N, --no-cache          Skip cache and regenerate HTML
  -X, --clean-cache       Clean the cache directory
  -w, --width WIDTH       Maximum width for the content in pixels (default: 980)

Examples:
  mdpreview README.md                    # Open in Firefox (default)
  mdpreview document.md -g               # Open in Chrome
  mdpreview document.md -w 1200          # Custom width
  mdpreview document.md -N               # Force regeneration
  mdpreview -X                           # Clean cache
```

## Caching

MDPreview uses intelligent content-based caching:

- **SHA256 hash** of file content determines cache key
- **Cache directory**: `/tmp/mdpreview/`
- **Cache invalidation**: Automatic when file content changes
- **Performance**: <100ms for cached files, <500ms for fresh conversion

Cache structure:
```
/tmp/mdpreview/
├── {hash1}.html
├── {hash1}_images/
│   ├── diagram.png
│   └── screenshot.jpg
├── {hash2}.html
└── {hash2}_images/
    └── logo.svg
```

## Testing

The project includes comprehensive test coverage with unit, integration, and E2E tests:

```bash
# Run all tests
bun test

# Run specific test file
bun test tests/unit/hash.test.ts

# Run E2E visual tests (uses Playwright)
bun test tests/e2e/visual.test.ts

# Test statistics
# - 180 total tests
# - 366 assertions
# - 100% pass rate
```

## Project Structure

```
mdpreview/
├── src/
│   ├── cli.ts                    # Main CLI entry point
│   ├── core/
│   │   ├── hash.ts               # SHA256 content hashing
│   │   ├── cache.ts              # Cache management
│   │   └── markdown.ts           # Markdown processing
│   ├── processors/
│   │   ├── images.ts             # Local image processor
│   │   └── mermaid.ts            # Mermaid diagram processor
│   ├── rendering/
│   │   ├── styles.ts             # GitHub-like CSS
│   │   └── template.ts           # HTML template generation
│   └── browser/
│       └── launcher.ts           # Browser launch logic
├── tests/
│   ├── unit/                     # Unit tests
│   ├── integration/              # Integration tests
│   └── e2e/                      # End-to-end tests (Playwright)
├── package.json                  # Dependencies
├── tsconfig.json                 # TypeScript configuration
├── README.md                     # This file
└── INSTALL.md                    # Detailed installation guide
```

## Technical Details

- **Runtime**: Bun (fast JavaScript/TypeScript runtime)
- **Markdown Parser**: marked with GitHub Flavored Markdown support
- **Syntax Highlighting**: highlight.js (100+ languages)
- **Mermaid**: mermaid.js via CDN
- **Testing**: Bun's built-in test runner + Playwright for E2E
- **Type Safety**: TypeScript strict mode
- **Development Approach**: Test-Driven Development (TDD)

## Limitations

- **Local files only** - Cannot fetch remote markdown files
- **Static preview** - No live reload on file changes
- **Browser integration** - Browser launching primarily tested on macOS (uses `open` command)

These limitations are by design to keep the tool fast, simple, and focused on its primary use case: quick markdown preview.

**Note:** While executables can be built for Linux and Windows, browser launching may require adjustments for those platforms. The core markdown processing works on all platforms.

## Migrating from Python Version

The new Bun/TypeScript implementation maintains compatibility with the Python version:

- ✅ Same command-line interface and options
- ✅ Same cache directory and structure
- ✅ Same GitHub-like styling
- ✅ **New**: Mermaid diagram support with interactive toggles
- ✅ **Faster**: Bun provides better performance than Python

You can safely switch between implementations. The cache is compatible, though the Python version won't recognize mermaid-enhanced HTML files.

## Contributing

Contributions are welcome! This project follows strict Test-Driven Development:

1. Write tests first
2. Implement feature to pass tests
3. Ensure all tests pass (`bun test`)
4. Maintain 100% pass rate

## License

MIT License - see LICENSE file for details

## Version History

- **v2.0.0** - Complete rewrite in Bun/TypeScript with TDD approach, added Mermaid support
- **v1.0.0** - Original Python implementation

---

Made with ❤️ for the markdown community
