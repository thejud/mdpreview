# Local Image Support Specification

## Overview
This specification outlines the implementation of local image support for mdpreview using a custom markdown TreeProcessor extension. The solution copies referenced images to the cache directory alongside the HTML file, making them accessible when viewing the cached HTML.

## Problem Statement
Currently, mdpreview converts markdown to HTML but doesn't handle local images. When markdown contains image references like `![alt text](image.png)`, the generated HTML has `<img src="image.png">` tags, but since the HTML is opened via `file://` protocol from a temporary cache location, relative image paths don't resolve correctly.

## Solution Design

### Architecture
1. **Custom TreeProcessor Extension**: Processes the markdown document tree after parsing to handle image elements
2. **Image Caching System**: Copies local images to a subdirectory within the cache
3. **Path Resolution**: Resolves relative paths based on the source markdown file's location

### Implementation Details

#### 1. TreeProcessor Implementation
```python
class LocalImageProcessor(Treeprocessor):
    def __init__(self, md, source_dir, cache_dir, file_hash):
        super().__init__(md)
        self.source_dir = source_dir
        self.cache_dir = cache_dir
        self.file_hash = file_hash
        self.images_dir = cache_dir / f"{file_hash}_images"
    
    def run(self, root):
        # Process all img elements in the document tree
        for element in root.iter('img'):
            src = element.get('src', '')
            if src and self._is_local_image(src):
                new_src = self._process_local_image(src)
                element.set('src', new_src)
```

#### 2. Image Path Processing
- **Local paths**: Copy to cache and update src
  - `image.png` → `{hash}_images/image.png`
  - `../images/diagram.jpg` → `{hash}_images/diagram.jpg`
  - `/absolute/path/image.svg` → `{hash}_images/image.svg`
- **Remote URLs**: Leave unchanged
  - `http://example.com/image.png`
  - `https://example.com/image.jpg`
- **Data URLs**: Leave unchanged
  - `data:image/png;base64,...`

#### 3. File Structure
```
/tmp/mdpreview/
├── {hash1}.html                 # Cached HTML file
├── {hash1}_images/              # Images for this HTML
│   ├── screenshot.png
│   ├── diagram.jpg
│   └── logo.svg
├── {hash2}.html
└── {hash2}_images/
    └── chart.png
```

#### 4. Image Copying Logic
```python
def _process_local_image(self, src):
    # Resolve absolute path based on source directory
    if src.startswith('/'):
        source_path = Path(src)
    else:
        source_path = (self.source_dir / src).resolve()
    
    if source_path.exists() and source_path.is_file():
        # Create images directory if needed
        self.images_dir.mkdir(exist_ok=True)
        
        # Copy image to cache
        dest_path = self.images_dir / source_path.name
        shutil.copy2(source_path, dest_path)
        
        # Return relative path from HTML location
        return f"{self.file_hash}_images/{source_path.name}"
    
    # Return original if can't process
    return src
```

### Integration Points

#### 1. Markdown Extension Registration
```python
class LocalImageExtension(Extension):
    def __init__(self, **kwargs):
        self.config = {
            'source_dir': ['', 'Source directory'],
            'cache_dir': ['', 'Cache directory'],
            'file_hash': ['', 'File hash for naming']
        }
        super().__init__(**kwargs)
    
    def extendMarkdown(self, md):
        processor = LocalImageProcessor(
            md,
            Path(self.getConfig('source_dir')),
            Path(self.getConfig('cache_dir')),
            self.getConfig('file_hash')
        )
        md.treeprocessors.register(processor, 'local_images', 5)
```

#### 2. Update convert_markdown_to_html
- Add LocalImageExtension to the extensions list
- Pass configuration parameters (source_dir, cache_dir, file_hash)
- Extension runs automatically during markdown conversion

#### 3. Cache Cleaning
- Update clean_cache() to remove both HTML files and image directories
- Use glob pattern to find `*_images` directories

### Error Handling

1. **Missing Images**: Log warning but don't fail conversion
2. **Permission Errors**: Skip images that can't be read
3. **Large Images**: Consider adding size limits or optimization
4. **Unsupported Formats**: Only copy common image formats (png, jpg, jpeg, gif, svg, webp)

### Performance Considerations

1. **Lazy Copying**: Only copy images that are actually referenced
2. **Duplicate Detection**: If same image appears multiple times, copy only once
3. **Cache Reuse**: If HTML is cached and images exist, skip copying
4. **File Size**: Consider warning for very large images

### Testing Strategy

1. **Basic functionality**: Single image in same directory
2. **Relative paths**: Images in parent/child directories
3. **Absolute paths**: Images with absolute file paths
4. **Mixed content**: Documents with local and remote images
5. **Edge cases**: Missing images, permission errors, special characters
6. **File formats**: Test common formats (PNG, JPEG, GIF, SVG, WebP)

### Future Enhancements

1. **Image optimization**: Resize/compress large images
2. **Lazy loading**: Add loading="lazy" attribute
3. **Alt text validation**: Warn about missing alt text
4. **Security**: Validate image paths to prevent directory traversal
5. **Configuration**: Add CLI options for image handling behavior