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

## Quick Start

```bash
# Install dependencies
uv sync

# Basic usage (opens in Firefox by default)
./mdpreview.py document.md

# Browser shortcuts
./mdpreview.py document.md -g    # Chrome
./mdpreview.py document.md -s    # Safari
./mdpreview.py document.md -f    # Firefox
```

## Installation

See [INSTALL.md](INSTALL.md) for detailed installation and usage instructions.

## Project Structure

```
mdpreview/
├── mdpreview.py          # Main CLI script
├── pyproject.toml        # Python dependencies
├── README.md            # This file
└── INSTALL.md           # Detailed installation guide
```

This tool is separate from the MCP Hello server project and can be used independently for any markdown preview needs.