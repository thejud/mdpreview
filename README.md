# MDPreview

A fast, lightweight CLI tool for converting Markdown to HTML and opening it in your browser with intelligent caching.

## Features

- ✅ **GitHub-like styling** with dark mode support
- ✅ **Intelligent caching** using SHA256 hashes
- ✅ **Syntax highlighting** for code blocks
- ✅ **macOS integration** using the `open` command
- ✅ **Multiple browser support** with shortcuts
- ✅ **Firefox default** browser
- ✅ **Markdown extensions** (tables, TOC, fenced code, etc.)
- ✅ **Interactive file selection** with `mdp` script using fzf

## Quick Start

```bash
# Basic usage (opens in Firefox by default)
./mdpreview.py document.md

# Interactive file selection with fzf
./mdp                             # Search in current directory
./mdp ~/Documents                 # Search in specific directory

# Browser shortcuts
./mdpreview.py document.md -g    # Chrome
./mdpreview.py document.md -s    # Safari
./mdpreview.py document.md -f    # Firefox
```

The script uses `uv` with inline dependencies - no setup required! (Make sure `uv` is installed: https://docs.astral.sh/uv/)

## Use Case

MDPreview provides an extremely fast and simple way to view markdown files in your browser with professional GitHub-like styling. Perfect for quickly previewing documentation, notes, or README files without the overhead of a full markdown editor.

### Limitations

- **Single file preview only** - Does not handle multiple files or links between documents
- **No image support** - Images referenced in markdown won't be displayed
- **Local files only** - Cannot fetch remote markdown files
- **Static preview** - No live reload on file changes

These limitations are by design to keep the tool fast, simple, and focused on its primary use case: quick markdown preview.

## Installation

See [INSTALL.md](INSTALL.md) for detailed installation and usage instructions.

## Project Structure

```
mdpreview/
├── mdpreview.py          # Main CLI script
├── mdp                   # Interactive file selector using fzf
├── pyproject.toml        # Python dependencies
├── README.md            # This file
└── INSTALL.md           # Detailed installation guide
```
