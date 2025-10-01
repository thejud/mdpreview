# MDPreview

Fast, lightweight command-line tool to convert Markdown to HTML with GitHub-like styling and automatic browser opening.

![Version](https://img.shields.io/badge/version-2.0.0-blue)
![Tests](https://img.shields.io/badge/tests-170%20passing-green)
![TypeScript](https://img.shields.io/badge/TypeScript-strict-blue)
![Bun](https://img.shields.io/badge/runtime-Bun-orange)

## Features

- **⚡ Fast**: Instant preview with SHA256-based content caching
- **🎨 GitHub Styling**: Familiar GitHub-like markdown rendering
- **🌓 Dark Mode**: Automatic dark mode support via system preferences
- **📊 Mermaid Diagrams**: Interactive diagram rendering with source toggle
- **🖼️ Local Images**: Automatic image copying and path rewriting
- **💻 Syntax Highlighting**: 100+ languages via highlight.js
- **🔄 Smart Caching**: Only regenerates when content changes
- **🌐 Multi-Browser**: Support for Firefox, Chrome, Safari, and custom browsers

## Installation

### Using Bun

```bash
# Install dependencies
bun install

# Make CLI executable
chmod +x src/cli.ts

# Run directly
bun src/cli.ts README.md

# Or build standalone executable
bun build src/cli.ts --compile --outfile mdpreview
./mdpreview README.md
```

## Usage

```bash
# Basic usage (Firefox default)
mdpreview README.md

# Browser selection
mdpreview document.md -g          # Chrome
mdpreview document.md -s          # Safari
mdpreview document.md -f          # Firefox
mdpreview document.md -b "Opera"  # Custom browser

# Width control
mdpreview wide-content.md -w 1200

# Cache management
mdpreview document.md -N          # Skip cache
mdpreview -X                      # Clean all cache

# Get help
mdpreview --help
```

## Command-Line Options

```
Usage: mdpreview [options] <markdown_file>

Positional Arguments:
  markdown_file         Markdown file to convert

Options:
  -h, --help            Show help message
  -b, --browser BROWSER Browser to open (e.g., "Google Chrome", "Safari")
  -g, --chrome          Open with Google Chrome
  -s, --safari          Open with Safari
  -f, --firefox         Open with Firefox (default)
  -w, --width WIDTH     Maximum width in pixels (default: 980)
  -N, --no-cache        Skip cache and regenerate HTML
  -X, --clean-cache     Clean the cache directory
```

## Markdown Features

### Supported Syntax

- ✅ **Headers** (H1-H6)
- ✅ **Emphasis** (bold, italic, strikethrough)
- ✅ **Lists** (ordered, unordered, nested)
- ✅ **Links** (inline, reference)
- ✅ **Images** (local and remote)
- ✅ **Code** (inline and fenced blocks)
- ✅ **Tables** (GitHub Flavored Markdown)
- ✅ **Blockquotes**
- ✅ **Task Lists**
- ✅ **Syntax Highlighting** (100+ languages)
- ✅ **Mermaid Diagrams** (with interactive toggle)

### Example Markdown

```markdown
# Project Title

## Features

This project includes **bold text** and *italic text*.

### Code Example

\`\`\`python
def hello():
    print("Hello, World!")
\`\`\`

### Table

| Feature | Status |
|---------|--------|
| Tables  | ✓      |
| Images  | ✓      |

### Mermaid Diagram

\`\`\`mermaid
graph TD
    A[Start] --> B{Decision}
    B -->|Yes| C[Result 1]
    B -->|No| D[Result 2]
\`\`\`
```

## How It Works

1. **Hash Calculation**: Computes SHA256 hash of markdown content
2. **Cache Check**: Looks for cached HTML with matching hash
3. **Conversion**: Converts markdown to HTML with GFM extensions
4. **Image Processing**: Copies local images to cache directory
5. **Mermaid Processing**: Wraps diagrams with interactive toggles
6. **Styling**: Applies GitHub-like CSS with dark mode
7. **Caching**: Saves generated HTML to `/tmp/mdpreview/`
8. **Browser Launch**: Opens HTML in selected browser

### Cache Structure

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

## Performance

- **Cached preview**: < 100ms
- **Fresh conversion**: < 500ms for typical README
- **Large files**: Handles multi-MB markdown files efficiently

## Development

### Project Structure

```
mdpreview/
├── src/
│   ├── cli.ts              # Main CLI entry point
│   ├── core/
│   │   ├── hash.ts         # SHA256 hashing
│   │   ├── cache.ts        # Cache management
│   │   └── markdown.ts     # Markdown conversion
│   ├── processors/
│   │   ├── images.ts       # Image processing
│   │   └── mermaid.ts      # Mermaid diagrams
│   ├── rendering/
│   │   ├── styles.ts       # GitHub CSS
│   │   └── template.ts     # HTML template
│   └── browser/
│       └── launcher.ts     # Browser launching
└── tests/
    ├── unit/               # Unit tests
    └── integration/        # E2E tests
```

### Running Tests

```bash
# Run all tests
bun test

# Run specific test file
bun test tests/unit/markdown.test.ts

# Run with coverage
bun test --coverage
```

### Test Statistics

- **Total Tests**: 170
- **Assertions**: 333
- **Coverage**: Unit + Integration tests
- **Passing**: ✅ 100%

### Technology Stack

- **Runtime**: Bun
- **Language**: TypeScript (strict mode)
- **Markdown**: marked (with GFM)
- **Syntax Highlighting**: highlight.js
- **Mermaid**: mermaid.js (CDN)
- **Testing**: Bun's built-in test runner

## Contributing

This project follows strict TDD (Test-Driven Development):

1. Write failing tests first
2. Implement minimal code to pass
3. Refactor if needed
4. All commits must have passing tests

## Requirements

- **Bun**: >= 1.0.0
- **macOS**: Primary platform (uses `open -a`)
- **Browsers**: Firefox, Chrome, Safari, or custom

## License

See LICENSE file for details.

## Credits

Built with strict TDD methodology following the PRD specifications.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
