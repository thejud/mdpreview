# Markdown Preview CLI Tool

A fast, lightweight CLI tool for converting Markdown to HTML and opening it in your browser with intelligent caching.

## Features

- ✅ **GitHub-like styling** with dark mode support
- ✅ **Intelligent caching** using SHA256 hashes
- ✅ **Syntax highlighting** for code blocks
- ✅ **macOS integration** using the `open` command
- ✅ **Multiple browser support** (Chrome, Safari, Firefox)
- ✅ **Markdown extensions** (tables, TOC, fenced code, etc.)

## Installation

1. **Install dependencies:**
   ```bash
   uv sync
   ```

2. **Make the script executable** (already done):
   ```bash
   chmod +x mdpreview.py
   ```

3. **Optional: Add to PATH** for global access:
   ```bash
   # Add to ~/.zshrc or ~/.bash_profile
   export PATH="/Volumes/xdrive/juddagnall/Dropbox/01-projects/mcp_hello:$PATH"
   ```

## Usage

### Basic Usage
```bash
# Convert and open README.md in default browser
./mdpreview.py README.md

# Or if added to PATH
mdpreview.py README.md
```

### Advanced Usage
```bash
# Open with specific browser
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

1. **Content Hashing**: Generates SHA256 hash of markdown content
2. **Cache Check**: Looks for cached HTML in `~/Library/Caches/mdpreview/`
3. **Conversion**: If not cached, converts markdown to HTML with extensions
4. **Styling**: Applies GitHub-like CSS with dark mode support
5. **Browser Launch**: Uses macOS `open` command to launch browser
6. **Caching**: Saves HTML for future use

## Cache Location

HTML files are cached at:
```
~/Library/Caches/mdpreview/[hash].html
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
cd /Volumes/xdrive/juddagnall/Dropbox/01-projects/mcp_hello

# Or use absolute path
/Volumes/xdrive/juddagnall/Dropbox/01-projects/mcp_hello/mdpreview.py README.md
```

### Permission denied
```bash
chmod +x mdpreview.py
```

### Missing dependencies
```bash
uv sync
```

### Browser not opening
The tool will fall back to creating the HTML file and showing the path if browser launching fails.

## Examples

### Convert project README
```bash
./mdpreview.py README.md
```

### Preview documentation with Chrome
```bash
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
mcp_hello/
├── mdpreview.py          # Main CLI script
├── pyproject.toml        # Dependencies (markdown, pygments)
├── INSTALL.md           # This file
└── README.md            # MCP server documentation
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

The tool is now ready to use! It provides a fast, efficient way to preview Markdown files with professional styling and intelligent caching.