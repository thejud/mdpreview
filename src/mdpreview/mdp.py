#!/usr/bin/env python3
"""
Interactive markdown file selector using fzf.

This is a Python implementation of the mdp bash script for better cross-platform support.
"""

import subprocess
import sys
import os
from pathlib import Path


def find_mdpreview_command():
    """Find the mdpreview command - either in PATH or as a local script."""
    # Try to find mdpreview in PATH first
    try:
        subprocess.run(['mdpreview', '--help'], capture_output=True, check=True)
        return 'mdpreview'
    except (subprocess.CalledProcessError, FileNotFoundError):
        pass
    
    # Try to find local mdpreview.py script
    script_locations = [
        Path(__file__).parent.parent.parent / 'mdpreview.py',  # From installed package
        Path.cwd() / 'mdpreview.py',  # Current directory
        Path(__file__).parent / 'mdpreview.py',  # Same directory
    ]
    
    for script in script_locations:
        if script.exists() and script.is_file():
            return str(script.absolute())
    
    # If we can't find it, assume it's in PATH (will error later if not)
    return 'mdpreview'


def main():
    """Main entry point for mdp command."""
    # Check if fzf is available
    try:
        subprocess.run(['fzf', '--version'], capture_output=True, check=True)
    except (subprocess.CalledProcessError, FileNotFoundError):
        print("Error: fzf is not installed. Please install it first:")
        print("  macOS: brew install fzf")
        print("  Linux: apt install fzf (or your package manager)")
        print("  See: https://github.com/junegunn/fzf#installation")
        sys.exit(1)
    
    # Parse arguments
    mdpreview_options = []
    paths = []
    parsing_paths = False
    
    for arg in sys.argv[1:]:
        if arg == "--":
            parsing_paths = True
        elif parsing_paths:
            paths.append(arg)
        elif arg.startswith('-'):
            mdpreview_options.append(arg)
        elif os.path.exists(arg):
            paths.append(arg)
        else:
            mdpreview_options.append(arg)
    
    # If no paths provided, use current directory
    if not paths:
        paths = ['.']
    
    # Check if single file was provided
    if len(paths) == 1 and os.path.isfile(paths[0]) and paths[0].endswith('.md'):
        # Direct file specified, no need for fzf
        mdpreview_cmd = find_mdpreview_command()
        cmd = [mdpreview_cmd] + mdpreview_options + [paths[0]]
        sys.exit(subprocess.run(cmd).returncode)
    
    # Build find command for markdown files
    find_cmd = ['find'] + paths + [
        '-type', 'f',
        '(', '-name', '*.md', '-o', '-name', '*.markdown', ')',
        '-print'
    ]
    
    # Run find and pipe to fzf
    try:
        find_proc = subprocess.Popen(find_cmd, stdout=subprocess.PIPE, stderr=subprocess.DEVNULL)
        fzf_proc = subprocess.Popen(
            ['fzf', '--preview', 'head -100 {}', '--preview-window=right:50%:wrap'],
            stdin=find_proc.stdout,
            stdout=subprocess.PIPE,
            text=True
        )
        find_proc.stdout.close()
        
        selected_file, _ = fzf_proc.communicate()
        
        if fzf_proc.returncode == 0 and selected_file.strip():
            # User selected a file
            mdpreview_cmd = find_mdpreview_command()
            cmd = [mdpreview_cmd] + mdpreview_options + [selected_file.strip()]
            sys.exit(subprocess.run(cmd).returncode)
        elif fzf_proc.returncode == 130:
            # User cancelled (Ctrl-C or Esc)
            sys.exit(0)
        else:
            print("No file selected")
            sys.exit(1)
            
    except KeyboardInterrupt:
        sys.exit(0)
    except Exception as e:
        print(f"Error: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()