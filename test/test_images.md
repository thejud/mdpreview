# Image Support Test

This document tests various image formats and paths in mdpreview.

## Test Image Placeholder

Since we need actual images to test, here are instructions for testing:

1. Place test images in the test directory:
   - test_image.png
   - test_image.jpg
   - test_image.svg
   - test_image.gif

2. Create a subdirectory `images/` with:
   - images/nested_image.png

3. Test cases:

### Same Directory
![Test PNG](test_image.png)
![Test JPEG](test_image.jpg)
![Test SVG](test_image.svg)
![Test GIF](test_image.gif)

### Relative Path
![Nested Image](images/nested_image.png)

### Parent Directory
![Parent Image](../logo.png)

### Absolute Path (requires actual path)
<!-- ![Absolute Path](/path/to/image.png) -->

### Remote Image (should work without copying)
![Remote Image](https://via.placeholder.com/150)

### Missing Image (should show warning)
![Missing Image](non_existent.png)

### Unsupported Format (should be ignored)
![Text File](test_file.txt)

## Notes

- Local images are copied to the cache directory
- Remote images are left as-is
- Missing images show a warning in stderr
- Unsupported formats are ignored