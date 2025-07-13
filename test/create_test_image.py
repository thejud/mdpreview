#!/usr/bin/env python3
"""Create a simple test image for testing mdpreview image support."""

# Create a simple blue square PNG using base64
import base64

# A minimal 1x1 blue pixel PNG
blue_pixel_png = base64.b64decode(
    b'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPj/HwADBwIAMCbHYQAAAABJRU5ErkJggg=='
)

with open('test_image.png', 'wb') as f:
    f.write(blue_pixel_png)

print("Created test_image.png")