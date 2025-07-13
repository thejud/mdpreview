#!/usr/bin/env python3
"""Create a simple test image for testing mdpreview image support."""

import base64

# 100x100 blue square PNG (base64 encoded)
blue_square_png = base64.b64decode(
    b'iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAYAAABw4pVUAAAABmJLR0QA/wD/AP+gvaeTAAAACXBI'
    b'WXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH6AENEjcNJ5E9fgAAABl0RVh0Q29tbWVudABDcmVhdGVk'
    b'IHdpdGggR0lNUFeBDhcAAABESURBVHja7dAxAQAAAMKg9U9tCy+gAAAAAAAAAAAAAAAAAAAAAAAA'
    b'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAG4MpwABHVpGTAAAAABJRU5ErkJggg=='
)

with open('test_image.png', 'wb') as f:
    f.write(blue_square_png)

print("Created test_image.png (100x100 blue square)")