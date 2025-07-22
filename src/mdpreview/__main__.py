#!/usr/bin/env python3
"""
Allow mdpreview to be run as a module:
python -m mdpreview
"""

from .cli import main

if __name__ == "__main__":
    main()