"""
Markdown Preview Tool

A command-line utility that converts Markdown files to HTML with GitHub-like styling
and opens them in a web browser.
"""

__version__ = "0.1.0"

from .cli import main

__all__ = ["main"]