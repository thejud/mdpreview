![MDPreview Logo](media/mdpreview_logo_small.png)

# MDPreview

A fast, lightweight CLI tool for converting Markdown to HTML and opening it in your browser with intelligent caching.

## Features

- ✅ **GitHub-like styling** with dark mode support
- ✅ **Intelligent caching** using SHA256 hashes
- ✅ **Local image support** with automatic copying to cache
- ✅ **Syntax highlighting** for code blocks
- ✅ **macOS integration** using the `open` command
- ✅ **Multiple browser support** with shortcuts
- ✅ **Firefox default** browser
- ✅ **Markdown extensions** (tables, TOC, fenced code, etc.)
- ✅ **Interactive file selection** with `mdp` script using fzf
- ✅ **Configurable page width** for better display of wide content

## Quick Start

```bash
# Install the tool (choose one method)
pipx install mdpreview              # Recommended: isolated environment
pip install mdpreview               # Global installation
uv tool install mdpreview           # Using uv

# Basic usage (opens in Firefox by default)
mdpreview document.md

# Interactive file selection with fzf (if mdp is available)
mdp                                 # Search in current directory
mdp ~/Documents                     # Search in specific directory
mdp -g docs/                        # Search with Chrome browser option
mdp README.md                       # Open file directly without fzf
mdp -N -- -weird-dir-              # Search in directory starting with '-'

# Browser shortcuts
mdpreview document.md -g            # Chrome
mdpreview document.md -s            # Safari
mdpreview document.md -f            # Firefox

# Width control for wide content
mdpreview document.md --width 1200  # Wide layout (1200px)
mdpreview document.md -w 600        # Narrow layout (600px)

# Cache control
mdpreview document.md -N            # Skip cache, force regeneration
mdpreview -X                        # Clean cache directory
```

If using the script directly from the repository, prefix commands with `./` (e.g., `./mdpreview.py`).

## Use Case

MDPreview provides an extremely fast and simple way to view markdown files in your browser with professional GitHub-like styling. Perfect for quickly previewing documentation, notes, or README files without the overhead of a full markdown editor.

## Image Support

MDPreview automatically handles images in your markdown files:

- **Local images** are copied to the cache directory alongside the HTML
- **Remote images** (http/https URLs) work without any changes
- **Relative paths** are resolved based on the markdown file location
- **Supported formats**: PNG, JPG, JPEG, GIF, SVG, WebP

Example markdown with images:
```markdown
![Local diagram](./images/diagram.png)
![Screenshot](screenshot.jpg)
![Remote logo](https://example.com/logo.png)
```

When you preview a markdown file containing local images, MDPreview:
1. Detects all local image references
2. Copies them to a subdirectory in the cache
3. Updates the HTML to reference the cached copies
4. Preserves the cache for fast subsequent views

### Limitations

- **Single file preview only** - Does not handle multiple files or links between documents
- **Local files only** - Cannot fetch remote markdown files
- **Static preview** - No live reload on file changes

These limitations are by design to keep the tool fast, simple, and focused on its primary use case: quick markdown preview.

## Installation

### As a Stand-alone Tool

MDPreview can be installed as a stand-alone command-line tool using several methods:

#### Using pipx (Recommended)
[pipx](https://pypa.github.io/pipx/) installs Python applications in isolated environments:

```bash
pipx install mdpreview
```

#### Using pip
Install globally with pip:

```bash
pip install mdpreview
```

#### Using uv
[uv](https://docs.astral.sh/uv/) is a fast Python package manager:

```bash
uv tool install mdpreview
```

#### From Source
Clone and install from the repository:

```bash
git clone https://github.com/yourusername/mdpreview.git
cd mdpreview
pip install .
```

#### Development Installation
For development with editable installation:

```bash
git clone https://github.com/yourusername/mdpreview.git
cd mdpreview
pip install -e .

# Or using uv (faster):
uv pip install -e .
```

### Using the Script Directly

The repository includes a self-contained script that uses uv's inline dependency management:

```bash
# Clone the repository
git clone https://github.com/yourusername/mdpreview.git
cd mdpreview

# Make the script executable
chmod +x mdpreview.py

# Run directly (uv will handle dependencies automatically)
./mdpreview.py document.md
```

**Note about the `mdp` interactive file selector**: The `mdp` script requires `fzf` to be installed (`brew install fzf` on macOS). When installing via pip/pipx/uv, the mdp script is included in the package.

See [INSTALL.md](INSTALL.md) for more detailed installation options and usage instructions.

## Project Structure

```
mdpreview/
├── mdpreview.py          # Main CLI script
├── mdp                   # Interactive file selector using fzf
├── pyproject.toml        # Python dependencies
├── test/                 # Test files and examples
├── README.md            # This file
└── INSTALL.md           # Detailed installation guide
```
