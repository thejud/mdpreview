#!/usr/bin/env uv run
# /// script
# dependencies = [
#   "markdown>=3.0",
#   "pygments",
# ]
# ///
"""
Markdown Preview Tool

A command-line utility that converts Markdown files to HTML with GitHub-like styling
and opens them in a web browser. Features intelligent caching based on file content
hashes and supports multiple browser options.

Usage:
    mdpreview.py README.md                    # Convert and open README.md (Firefox default)
    mdpreview.py doc.md -g                   # Open with Google Chrome
    mdpreview.py doc.md --clean-cache        # Clean cache directory
"""

import argparse
import hashlib
import os
import shutil
import subprocess
import sys
import tempfile
import webbrowser
from pathlib import Path

import markdown
from markdown.extensions import codehilite, fenced_code, tables, toc, nl2br, sane_lists


def get_cache_dir():
    """Get the cache directory in /tmp/ for fast access."""
    cache_dir = Path("/tmp") / "mdpreview"
    cache_dir.mkdir(parents=True, exist_ok=True)
    return cache_dir


def get_file_hash(file_path):
    """Generate SHA256 hash of file content for cache key."""
    try:
        with open(file_path, 'rb') as f:
            return hashlib.sha256(f.read()).hexdigest()
    except Exception as e:
        print(f"Error reading file {file_path}: {e}", file=sys.stderr)
        sys.exit(1)


def get_github_css():
    """Return GitHub-like CSS styling for markdown."""
    return """
    <style>
    body {
        box-sizing: border-box;
        min-width: 200px;
        max-width: 980px;
        margin: 0 auto;
        padding: 45px;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji";
        font-size: 16px;
        line-height: 1.5;
        color: #1f2328;
        background-color: #ffffff;
    }

    @media (prefers-color-scheme: dark) {
        body {
            color: #e6edf3;
            background-color: #0d1117;
        }
        
        h1, h2, h3, h4, h5, h6 {
            color: #e6edf3;
        }
        
        code {
            background-color: #21262d;
            color: #f0f6fc;
        }
        
        pre {
            background-color: #161b22;
            border: 1px solid #30363d;
        }
        
        blockquote {
            border-left: 0.25em solid #656d76;
            color: #656d76;
        }
        
        table th, table td {
            border: 1px solid #30363d;
        }
        
        table tr {
            background-color: #0d1117;
            border-top: 1px solid #30363d;
        }
        
        table tr:nth-child(2n) {
            background-color: #161b22;
        }
    }

    h1, h2, h3, h4, h5, h6 {
        margin-top: 24px;
        margin-bottom: 16px;
        font-weight: 600;
        line-height: 1.25;
    }

    h1 {
        font-size: 2em;
        border-bottom: 1px solid #d0d7de;
        padding-bottom: 0.3em;
    }

    h2 {
        font-size: 1.5em;
        border-bottom: 1px solid #d0d7de;
        padding-bottom: 0.3em;
    }

    h3 {
        font-size: 1.25em;
    }

    h4 {
        font-size: 1em;
    }

    h5 {
        font-size: 0.875em;
    }

    h6 {
        font-size: 0.85em;
        color: #656d76;
    }

    p {
        margin-top: 0;
        margin-bottom: 16px;
    }

    blockquote {
        margin: 0;
        padding: 0 1em;
        color: #656d76;
        border-left: 0.25em solid #d0d7de;
    }

    ul, ol {
        margin-top: 0;
        margin-bottom: 16px;
        padding-left: 2em;
    }

    li + li {
        margin-top: 0.25em;
    }

    code {
        padding: 0.2em 0.4em;
        margin: 0;
        font-size: 85%;
        color: #24292f;
        background-color: #f6f8fa;
        border-radius: 6px;
        font-family: ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace;
    }

    pre {
        margin-top: 0;
        margin-bottom: 16px;
        padding: 16px;
        overflow: auto;
        font-size: 85%;
        line-height: 1.45;
        background-color: #f6f8fa;
        border-radius: 6px;
        font-family: ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace;
    }

    pre code {
        display: inline;
        max-width: auto;
        padding: 0;
        margin: 0;
        overflow: visible;
        line-height: inherit;
        word-wrap: normal;
        background-color: transparent;
        border: 0;
    }

    table {
        border-spacing: 0;
        border-collapse: collapse;
        margin-top: 0;
        margin-bottom: 16px;
        width: 100%;
        overflow: auto;
    }

    table th {
        font-weight: 600;
        padding: 6px 13px;
        border: 1px solid #d0d7de;
        background-color: #f6f8fa;
    }

    table td {
        padding: 6px 13px;
        border: 1px solid #d0d7de;
    }

    table tr {
        background-color: #ffffff;
        border-top: 1px solid #c6cbd1;
    }

    table tr:nth-child(2n) {
        background-color: #f6f8fa;
    }

    hr {
        height: 0.25em;
        padding: 0;
        margin: 24px 0;
        background-color: #d0d7de;
        border: 0;
    }

    a {
        color: #0969da;
        text-decoration: none;
    }

    a:hover {
        text-decoration: underline;
    }

    img {
        max-width: 100%;
        height: auto;
    }
    </style>
    """


def convert_markdown_to_html(markdown_file, use_cache=True):
    """Convert markdown file to HTML with caching."""
    file_path = Path(markdown_file)
    
    if not file_path.exists():
        print(f"Error: File '{markdown_file}' not found", file=sys.stderr)
        sys.exit(1)
    
    # Generate cache key from file content
    file_hash = get_file_hash(file_path)
    cache_dir = get_cache_dir()
    cache_file = cache_dir / f"{file_hash}.html"
    
    # Check if cached version exists and is valid
    if use_cache and cache_file.exists():
        return cache_file
    
    # Read markdown content
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            markdown_content = f.read()
    except Exception as e:
        print(f"Error reading markdown file: {e}", file=sys.stderr)
        sys.exit(1)
    
    # Configure markdown extensions
    extensions = [
        'codehilite',
        'fenced_code',
        'tables',
        'toc',
        'nl2br',
        'sane_lists'
    ]
    
    extension_configs = {
        'codehilite': {
            'css_class': 'highlight',
            'use_pygments': True
        }
    }
    
    # Convert markdown to HTML
    try:
        md = markdown.Markdown(extensions=extensions, extension_configs=extension_configs)
        html_content = md.convert(markdown_content)
    except Exception as e:
        print(f"Error converting markdown: {e}", file=sys.stderr)
        sys.exit(1)
    
    # Create complete HTML document
    title = file_path.stem
    full_html = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{title}</title>
    {get_github_css()}
</head>
<body>
    {html_content}
</body>
</html>"""
    
    # Save to cache
    try:
        with open(cache_file, 'w', encoding='utf-8') as f:
            f.write(full_html)
    except Exception as e:
        print(f"Warning: Could not write to cache: {e}", file=sys.stderr)
        # Create temporary file instead
        temp_file = tempfile.NamedTemporaryFile(mode='w', suffix='.html', delete=False, encoding='utf-8')
        temp_file.write(full_html)
        temp_file.close()
        return Path(temp_file.name)
    
    return cache_file


def open_in_browser(html_file, browser=None):
    """Open HTML file in browser using macOS open command."""
    # Default to Firefox if no browser specified
    if browser is None:
        browser = "Firefox"
    
    try:
        # Try to open with specified browser
        subprocess.run(['open', '-a', browser, str(html_file)], check=True)
    except subprocess.CalledProcessError:
        # Fallback to Python's webbrowser module
        try:
            webbrowser.open(f'file://{html_file.absolute()}')
        except Exception as e:
            print(f"Error opening browser: {e}", file=sys.stderr)
            print(f"HTML file created at: {html_file}")


def clean_cache():
    """Clean the markdown preview cache."""
    cache_dir = get_cache_dir()
    if cache_dir.exists():
        try:
            shutil.rmtree(cache_dir)
            cache_dir.mkdir(parents=True, exist_ok=True)
            print("Cache cleaned successfully")
        except Exception as e:
            print(f"Error cleaning cache: {e}", file=sys.stderr)
    else:
        print("Cache directory doesn't exist")


def main():
    parser = argparse.ArgumentParser(
        description="Convert Markdown to HTML and open in browser",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  mdpreview.py README.md                    # Convert and open README.md (Firefox default)
  mdpreview.py doc.md -g                   # Open with Google Chrome
  mdpreview.py doc.md -s                   # Open with Safari
  mdpreview.py doc.md -f                   # Open with Firefox
  mdpreview.py doc.md -b "Google Chrome"    # Open with Chrome (long form)
  mdpreview.py doc.md --no-cache           # Skip cache
  mdpreview.py --clean-cache               # Clean cache
        """
    )
    
    parser.add_argument('markdown_file', nargs='?', help='Markdown file to convert')
    parser.add_argument('-b', '--browser', help='Browser to open with (e.g., "Google Chrome", "Safari", "Firefox")')
    parser.add_argument('-g', '--chrome', action='store_const', const='Google Chrome', dest='browser', help='Open with Google Chrome')
    parser.add_argument('-s', '--safari', action='store_const', const='Safari', dest='browser', help='Open with Safari')
    parser.add_argument('-f', '--firefox', action='store_const', const='Firefox', dest='browser', help='Open with Firefox')
    parser.add_argument('--no-cache', action='store_true', help='Skip cache and regenerate HTML')
    parser.add_argument('--clean-cache', action='store_true', help='Clean the cache directory')
    
    args = parser.parse_args()
    
    if args.clean_cache:
        clean_cache()
        return
    
    if not args.markdown_file:
        parser.print_help()
        sys.exit(1)
    
    # Convert markdown to HTML
    html_file = convert_markdown_to_html(args.markdown_file, use_cache=not args.no_cache)
    
    # Open in browser
    open_in_browser(html_file, args.browser)
    
    print(f"Opened {args.markdown_file} in browser")
    if not args.no_cache:
        print(f"HTML cached at: {html_file}")


if __name__ == '__main__':
    main()