# Markdown Preview CLI Tool

A fast, lightweight CLI tool for converting Markdown to HTML and opening it in your browser with intelligent caching. Includes an interactive file selector (`mdp`) for quick markdown browsing with fzf.

## Features

- ✅ **GitHub-like styling** with dark mode support
- ✅ **Intelligent caching** using SHA256 hashes
- ✅ **Syntax highlighting** for code blocks
- ✅ **macOS integration** using the `open` command
- ✅ **Multiple browser support** (Chrome, Safari, Firefox)
- ✅ **Markdown extensions** (tables, TOC, fenced code, etc.)

## Prerequisites

### Required
- **uv** - Fast Python package installer (handles dependencies automatically)
- **fzf** - Command-line fuzzy finder (for `mdp` interactive mode)

### Install uv

```bash
# Using curl (recommended)
curl -LsSf https://astral.sh/uv/install.sh | sh

# Or using pip
pip install uv

# Or using Homebrew (macOS)
brew install uv
```

For more installation options, visit: https://docs.astral.sh/uv/

### Install fzf (for mdp script)

```bash
# Using Homebrew (macOS)
brew install fzf

# Or see https://github.com/junegunn/fzf#installation
```

## Installation

The script uses `uv` with inline dependencies - no additional setup required after installing uv!

1. **Make the script executable** (if needed):
   ```bash
   chmod +x mdpreview.py
   ```

2. **Optional: Add to PATH** for global access:
   ```bash
   # Add to ~/.zshrc or ~/.bash_profile
   export PATH="/path/to/mdpreview:$PATH"
   ```

When you run the script for the first time, `uv` will automatically:
- Create an isolated environment
- Install the required dependencies (markdown, pygments)
- Cache everything for fast subsequent runs

## Usage

### Basic Usage
```bash
# Convert and open README.md in default browser
./mdpreview.py README.md

# Interactive file selection with fzf
./mdp                      # Browse current directory
./mdp ~/Documents          # Browse specific directory

# Or if added to PATH
mdpreview.py README.md
mdp ~/notes
```

### Advanced Usage
```bash
# Open with specific browser (using short options)
./mdpreview.py document.md -g              # Google Chrome
./mdpreview.py document.md -s              # Safari
./mdpreview.py document.md -f              # Firefox

# Or using long form
./mdpreview.py document.md -b "Google Chrome"
./mdpreview.py document.md -b "Safari"
./mdpreview.py document.md -b "Firefox"

# Skip cache (force regeneration)
./mdpreview.py document.md --no-cache

# Clean cache directory
./mdpreview.py --clean-cache

# Get help
./mdpreview.py --help
```

## How It Works

1. **Dependency Management**: Uses `uv` with inline dependencies for zero-setup
2. **Content Hashing**: Generates SHA256 hash of markdown content
3. **Cache Check**: Looks for cached HTML in `/tmp/mdpreview/`
4. **Conversion**: If not cached, converts markdown to HTML with extensions
5. **Styling**: Applies GitHub-like CSS with dark mode support
6. **Browser Launch**: Uses macOS `open` command to launch browser
7. **Caching**: Saves HTML for future use

## Cache Location

HTML files are cached at:
```
/tmp/mdpreview/[hash].html
```

## Supported Markdown Features

- **Headers** (H1-H6) with automatic anchors
- **Code blocks** with syntax highlighting
- **Tables** with proper styling
- **Lists** (ordered and unordered)
- **Links and images**
- **Blockquotes**
- **Horizontal rules**
- **Table of Contents** (TOC)
- **Fenced code blocks**
- **Line breaks** (nl2br)

## Browser Support

- **Default browser** (system default)
- **Google Chrome** (`-b "Google Chrome"`)
- **Safari** (`-b "Safari"`)
- **Firefox** (`-b "Firefox"`)
- **Fallback** to Python's webbrowser module

## Performance

- **Fast startup**: Lightweight Python script
- **Intelligent caching**: Only regenerates when content changes
- **Efficient conversion**: Uses optimized markdown library
- **Quick browser launch**: Native macOS integration

## Troubleshooting

### Script not found
```bash
# Make sure you're in the right directory
cd /path/to/mdpreview

# Or use absolute path
/path/to/mdpreview/mdpreview.py README.md
```

### Permission denied
```bash
chmod +x mdpreview.py
```

### 'uv' command not found
This means `uv` is not installed. Install it with:
```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
```

### Missing dependencies
Dependencies are handled automatically by `uv` with inline metadata. Make sure `uv` is installed:
```bash
# Check if uv is installed
uv --version

# If not installed, see the Prerequisites section above
```

### Browser not opening
The tool will fall back to creating the HTML file and showing the path if browser launching fails.

## Examples

### Convert project README
```bash
./mdpreview.py README.md
```

### Browse and preview markdown files interactively
```bash
# Find and preview any markdown file in current directory
./mdp

# Browse documentation folder
./mdp docs/
```

### Preview documentation with Chrome
```bash
./mdpreview.py docs/api.md -g    # Using short option
# or
./mdpreview.py docs/api.md -b "Google Chrome"
```

### Force regeneration
```bash
./mdpreview.py notes.md --no-cache
```

### Clean up cache
```bash
./mdpreview.py --clean-cache
```

## File Structure

```
mdpreview/
├── mdpreview.py          # Main CLI script with inline dependencies
├── mdp                   # Interactive file selector using fzf
├── pyproject.toml        # Project metadata
├── INSTALL.md           # This file
└── README.md            # Project documentation
```

## Integration Tips

### Add alias for convenience
```bash
# Add to ~/.zshrc
alias mdp='./mdpreview.py'

# Usage: mdp document.md
```

### Use with VS Code
Set up a custom task in `.vscode/tasks.json`:
```json
{
    "version": "2.0.0",
    "tasks": [
        {
            "label": "Preview Markdown",
            "type": "shell",
            "command": "./mdpreview.py",
            "args": ["${file}"],
            "group": "build",
            "presentation": {
                "echo": true,
                "reveal": "silent",
                "focus": false,
                "panel": "shared"
            }
        }
    ]
}
```

## Limitations

- **Single file preview** - Each invocation previews one markdown file
- **No image support** - Images in markdown are not displayed
- **Local files only** - Cannot preview remote URLs
- **No live reload** - Changes require re-running the command

These limitations keep the tool fast and simple for its primary use case: quickly viewing markdown files with beautiful formatting.

## Performance Benefits

- **Instant startup** - No heavy dependencies or frameworks
- **Cached rendering** - Previously viewed files open instantly
- **Minimal resource usage** - Just converts and displays
- **Zero configuration** - Works immediately with uv

The tool is now ready to use! It provides an extremely fast and simple way to preview Markdown files with professional GitHub-like styling.
