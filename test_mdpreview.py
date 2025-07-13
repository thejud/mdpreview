#!/usr/bin/env python3
"""Tests for mdpreview image functionality."""

import os
import shutil
import tempfile
import unittest
from pathlib import Path
import sys

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from mdpreview import LocalImageProcessor, LocalImageExtension, get_cache_dir, get_file_hash, convert_markdown_to_html


class TestLocalImageProcessor(unittest.TestCase):
    """Test the LocalImageProcessor class."""
    
    def setUp(self):
        """Set up test environment."""
        self.test_dir = Path(tempfile.mkdtemp())
        self.cache_dir = self.test_dir / "cache"
        self.cache_dir.mkdir()
        self.source_dir = self.test_dir / "source"
        self.source_dir.mkdir()
        
        # Create test images
        self.test_image = self.source_dir / "test.png"
        self.test_image.write_bytes(b'PNG_TEST_DATA')
        
        self.test_jpg = self.source_dir / "photo.jpg"
        self.test_jpg.write_bytes(b'JPG_TEST_DATA')
        
        # Create subdirectory with image
        (self.source_dir / "images").mkdir()
        self.nested_image = self.source_dir / "images" / "nested.png"
        self.nested_image.write_bytes(b'NESTED_PNG_DATA')
    
    def tearDown(self):
        """Clean up test environment."""
        shutil.rmtree(self.test_dir)
    
    def test_is_local_image(self):
        """Test detection of local vs remote images."""
        # Mock markdown object
        class MockMd:
            pass
        
        processor = LocalImageProcessor(
            MockMd(), 
            str(self.source_dir), 
            str(self.cache_dir), 
            "testhash"
        )
        
        # Local images
        self.assertTrue(processor._is_local_image("image.png"))
        self.assertTrue(processor._is_local_image("./image.jpg"))
        self.assertTrue(processor._is_local_image("../image.gif"))
        self.assertTrue(processor._is_local_image("/absolute/path.svg"))
        
        # Remote images
        self.assertFalse(processor._is_local_image("http://example.com/image.png"))
        self.assertFalse(processor._is_local_image("https://example.com/image.jpg"))
        self.assertFalse(processor._is_local_image("//example.com/image.gif"))
        self.assertFalse(processor._is_local_image("data:image/png;base64,abc123"))
    
    def test_process_local_image(self):
        """Test processing of local images."""
        class MockMd:
            pass
        
        processor = LocalImageProcessor(
            MockMd(), 
            str(self.source_dir), 
            str(self.cache_dir), 
            "testhash"
        )
        
        # Test existing image
        result = processor._process_local_image("test.png")
        self.assertEqual(result, "testhash_images/test.png")
        
        # Check image was copied
        expected_path = self.cache_dir / "testhash_images" / "test.png"
        self.assertTrue(expected_path.exists())
        self.assertEqual(expected_path.read_bytes(), b'PNG_TEST_DATA')
        
        # Test nested image
        result = processor._process_local_image("images/nested.png")
        self.assertEqual(result, "testhash_images/nested.png")
        
        # Test missing image
        result = processor._process_local_image("missing.png")
        self.assertIsNone(result)
        
        # Test unsupported format
        txt_file = self.source_dir / "doc.txt"
        txt_file.write_text("text content")
        result = processor._process_local_image("doc.txt")
        self.assertIsNone(result)
    
    def test_duplicate_image_handling(self):
        """Test that duplicate images are not copied multiple times."""
        class MockMd:
            pass
        
        processor = LocalImageProcessor(
            MockMd(), 
            str(self.source_dir), 
            str(self.cache_dir), 
            "testhash"
        )
        
        # Process same image twice
        result1 = processor._process_local_image("test.png")
        result2 = processor._process_local_image("test.png")
        
        # Both should return same path
        self.assertEqual(result1, result2)
        self.assertEqual(result1, "testhash_images/test.png")
        
        # Image should only be in processed set once
        self.assertEqual(len(processor.processed_images), 1)


class TestMarkdownIntegration(unittest.TestCase):
    """Test integration with markdown processing."""
    
    def setUp(self):
        """Set up test environment."""
        self.test_dir = Path(tempfile.mkdtemp())
        self.test_image = self.test_dir / "test.png"
        self.test_image.write_bytes(b'PNG_TEST_DATA')
        
        # Create markdown file with images
        self.md_file = self.test_dir / "test.md"
        self.md_file.write_text("""# Test Document

## Local Image
![Local Image](test.png)

## Remote Image
![Remote Image](https://example.com/image.png)

## Missing Image
![Missing](missing.png)
""")
    
    def tearDown(self):
        """Clean up test environment."""
        shutil.rmtree(self.test_dir)
        # Clean test cache
        cache_dir = get_cache_dir()
        if cache_dir.exists():
            shutil.rmtree(cache_dir)
    
    def test_convert_with_images(self):
        """Test full markdown conversion with images."""
        # Convert markdown to HTML
        html_file = convert_markdown_to_html(str(self.md_file), use_cache=False)
        
        # Read generated HTML
        html_content = html_file.read_text()
        
        # Get file hash for checking paths
        file_hash = get_file_hash(self.md_file)
        
        # Check that local image path was updated
        self.assertIn(f'{file_hash}_images/test.png', html_content)
        
        # Check that remote image was preserved
        self.assertIn('https://example.com/image.png', html_content)
        
        # Check that image was copied
        cache_dir = get_cache_dir()
        image_path = cache_dir / f"{file_hash}_images" / "test.png"
        self.assertTrue(image_path.exists())
        self.assertEqual(image_path.read_bytes(), b'PNG_TEST_DATA')
    
    def test_image_formats(self):
        """Test support for various image formats."""
        # Create images with different formats
        for ext, data in [('.png', b'PNG'), ('.jpg', b'JPG'), ('.jpeg', b'JPEG'), 
                         ('.gif', b'GIF'), ('.svg', b'<svg>'), ('.webp', b'WEBP')]:
            img_file = self.test_dir / f"image{ext}"
            img_file.write_bytes(data)
        
        # Create markdown referencing all formats
        self.md_file.write_text("""# Image Formats
![PNG](image.png)
![JPG](image.jpg)
![JPEG](image.jpeg)
![GIF](image.gif)
![SVG](image.svg)
![WebP](image.webp)
![Unsupported](document.pdf)
""")
        
        # Convert
        html_file = convert_markdown_to_html(str(self.md_file), use_cache=False)
        html_content = html_file.read_text()
        file_hash = get_file_hash(self.md_file)
        
        # Check all supported formats were processed
        for ext in ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp']:
            self.assertIn(f'{file_hash}_images/image{ext}', html_content)
        
        # Check unsupported format was not processed
        self.assertNotIn(f'{file_hash}_images/document.pdf', html_content)
        self.assertIn('document.pdf', html_content)  # Original path preserved


class TestCacheCleaning(unittest.TestCase):
    """Test cache cleaning with images."""
    
    def setUp(self):
        """Set up test environment."""
        self.cache_dir = get_cache_dir()
        
        # Create mock cache structure
        self.html_file = self.cache_dir / "test123.html"
        self.html_file.write_text("<html>test</html>")
        
        self.images_dir = self.cache_dir / "test123_images"
        self.images_dir.mkdir()
        
        self.cached_image = self.images_dir / "image.png"
        self.cached_image.write_bytes(b'CACHED_IMAGE')
    
    def test_clean_cache_removes_images(self):
        """Test that clean_cache removes image directories."""
        from mdpreview import clean_cache
        
        # Verify files exist
        self.assertTrue(self.html_file.exists())
        self.assertTrue(self.images_dir.exists())
        self.assertTrue(self.cached_image.exists())
        
        # Clean cache
        clean_cache()
        
        # Verify cache is empty but directory exists
        self.assertTrue(self.cache_dir.exists())
        self.assertFalse(self.html_file.exists())
        self.assertFalse(self.images_dir.exists())
        self.assertFalse(self.cached_image.exists())


if __name__ == '__main__':
    unittest.main()