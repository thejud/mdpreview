# Changelog

All notable changes to MDPreview will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.0] - 2025-10-01

### Added

- **Complete rewrite in Bun/TypeScript** for improved performance and maintainability
- **Mermaid diagram support** with interactive toggle between rendered diagram and source code
  - All diagram types supported (flowcharts, sequence diagrams, Gantt charts, class diagrams, etc.)
  - GitHub-style toggle buttons
  - Automatic rendering on page load
- **Multiple file support** - open multiple markdown files at once
  - Example: `mdpreview foo.md bar.md baz.md`
  - Each file opens in a separate browser tab/window
- **Comprehensive test suite** with 182 tests and 370 assertions
  - Unit tests for all core functionality
  - Integration tests for end-to-end workflows
  - Playwright E2E tests for visual verification
  - 100% pass rate
- **Test-Driven Development (TDD)** - all features developed with tests first
- **TypeScript strict mode** for complete type safety
- **Standalone executable** - compile to single binary with `bun run build`
- **Enhanced documentation**
  - Visual examples in README with side-by-side markdown/rendered output
  - Comprehensive E2E verification documentation
  - Complete API documentation

### Changed

- Runtime changed from Python to Bun
- Markdown parser changed from Python-Markdown to marked.js
- Syntax highlighting changed from Pygments to highlight.js
- Cache directory remains `/tmp/mdpreview/` for compatibility
- CLI interface remains identical for backward compatibility
- GitHub-like styling enhanced and optimized

### Improved

- **Performance**
  - Faster startup time with Bun runtime
  - Cached previews under 100ms
  - Fresh conversions under 500ms for typical README
- **Code organization**
  - Modular architecture with clear separation of concerns
  - Reusable components for processors and rendering
  - Helper functions for cleaner code
- **Testing**
  - No browser windows opened during test runs
  - Headless browser testing with Playwright
  - Comprehensive coverage from unit to E2E

### Fixed

- Integration tests no longer open browser windows
- E2E tests use headless Chromium only
- Proper handling of multiple files with error tracking

### Technical Details

- **Runtime**: Bun v1.2.23+
- **Language**: TypeScript 5.0+ (strict mode)
- **Markdown Parser**: marked v11.2.0 with GFM
- **Syntax Highlighting**: highlight.js v11.9.0
- **Mermaid**: mermaid.js v11 (via CDN)
- **Testing**: Bun test + Playwright v1.55.1
- **Development Approach**: Test-Driven Development

## [1.0.0] - 2024-07-13

### Added

- Initial Python implementation
- GitHub-like styling with dark mode
- SHA256-based content caching
- Local image processing and caching
- Syntax highlighting with Pygments
- Multi-browser support (Firefox, Chrome, Safari)
- macOS integration with `open` command
- Interactive file selector (`mdp` script) with fzf
- Configurable page width

### Features

- Markdown conversion with Python-Markdown
- GitHub Flavored Markdown extensions
- Smart caching in `/tmp/mdpreview/`
- Automatic dark mode detection
- Image copying to cache directory
- Browser shortcuts (`-g`, `-s`, `-f`)
- Cache management (`-N`, `-X`)

---

## Migration Notes

### From v1.0.0 (Python) to v2.0.0 (Bun/TypeScript)

**Breaking Changes:**
- Requires Bun runtime instead of Python/uv
- Must install Node/Bun dependencies with `bun install`

**Compatible:**
- ✅ Same CLI interface and options
- ✅ Same cache directory (`/tmp/mdpreview/`)
- ✅ Same GitHub-like styling
- ✅ Same browser support

**New Features:**
- ✅ Mermaid diagrams with interactive toggles
- ✅ Multiple file support
- ✅ Faster performance

**Installation:**
```bash
# Install Bun (if not already installed)
curl -fsSL https://bun.sh/install | bash

# Install dependencies
bun install

# Run directly or build standalone executable
bun run src/cli.ts document.md
# or
bun run build && ./mdpreview document.md
```

---

[2.0.0]: https://github.com/yourusername/mdpreview/compare/v1.0.0...v2.0.0
[1.0.0]: https://github.com/yourusername/mdpreview/releases/tag/v1.0.0
