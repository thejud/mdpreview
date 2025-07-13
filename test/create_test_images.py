#!/usr/bin/env python3
"""Create test images for mdpreview testing."""

import base64
from pathlib import Path

# Create test directory
test_dir = Path(__file__).parent
test_dir.mkdir(exist_ok=True)

# 100x100 blue square PNG (base64 encoded)
blue_square_png = base64.b64decode(
    b'iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAYAAABw4pVUAAAABmJLR0QA/wD/AP+gvaeTAAAACXBI'
    b'WXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH6AENEjcNJ5E9fgAAABl0RVh0Q29tbWVudABDcmVhdGVk'
    b'IHdpdGggR0lNUFeBDhcAAABESURBVHja7dAxAQAAAMKg9U9tCy+gAAAAAAAAAAAAAAAAAAAAAAAA'
    b'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAG4MpwABHVpGTAAAAABJRU5ErkJggg=='
)

# Create a simple SVG
svg_content = '''<svg width="100" height="100" xmlns="http://www.w3.org/2000/svg">
  <rect width="100" height="100" fill="green"/>
  <text x="50" y="50" text-anchor="middle" fill="white" font-size="20">SVG</text>
</svg>'''

# Create test images
print("Creating test images...")

# PNG image
with open(test_dir / 'test_image.png', 'wb') as f:
    f.write(blue_square_png)
print("✓ Created test_image.png (100x100 blue square)")

# SVG image
with open(test_dir / 'test_image.svg', 'w') as f:
    f.write(svg_content)
print("✓ Created test_image.svg (100x100 green square)")

# Create a simple "JPG" (actually PNG with .jpg extension for testing)
with open(test_dir / 'test_image.jpg', 'wb') as f:
    f.write(blue_square_png)
print("✓ Created test_image.jpg (100x100 blue square)")

# Create images subdirectory
images_dir = test_dir / 'images'
images_dir.mkdir(exist_ok=True)

# Create nested image
with open(images_dir / 'nested_image.png', 'wb') as f:
    f.write(blue_square_png)
print("✓ Created images/nested_image.png")

print("\nTest images created successfully!")