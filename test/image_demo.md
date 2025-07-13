# MDPreview Image Support Demo

This demonstrates the image support functionality in mdpreview.

## Local Images

MDPreview automatically copies local images to the cache directory so they display correctly.

### PNG Image
![Blue Square](test_image.png)

### JPEG Image  
![Blue Square JPEG](test_image.jpg)

### SVG Image
![Green SVG](test_image.svg)

### Nested Directory Image
![Nested Blue Square](images/nested_image.png)

## Remote Images

Remote images work without any changes:

![Placeholder](https://via.placeholder.com/200x100/0000FF/FFFFFF?text=Remote+Image)

## How It Works

When you preview this file:
1. MDPreview detects all local image references
2. Copies them to `/tmp/mdpreview/{hash}_images/`
3. Updates the HTML to use the cached copies
4. Remote images (https://) are left unchanged

This ensures your images display correctly even though the HTML is served from the cache directory!