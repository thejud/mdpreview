import { existsSync, mkdirSync, copyFileSync, readFileSync } from "fs";
import { join, dirname, basename, resolve } from "path";

export interface ImageInfo {
  src: string;
  alt?: string;
}

export class LocalImageProcessor {
  /**
   * Detect local images in HTML
   * @param html - HTML string to search
   * @returns Array of local image information
   */
  detectLocalImages(html: string): ImageInfo[] {
    const images: ImageInfo[] = [];
    const imgRegex = /<img\s+([^>]*?)src=["']([^"']+)["']([^>]*?)>/gi;
    let match;

    while ((match = imgRegex.exec(html)) !== null) {
      const src = match[2];
      if (!src) continue;

      // Skip remote URLs and data URLs
      if (this.isRemoteUrl(src)) continue;

      // Extract alt text if present
      const altMatch = match[0]?.match(/alt=["']([^"']*)["']/i);
      const alt = altMatch?.[1];

      images.push({ src, alt });
    }

    return images;
  }

  /**
   * Check if a URL is remote (http, https, //, data:)
   * @param url - URL to check
   * @returns true if URL is remote
   */
  private isRemoteUrl(url: string): boolean {
    return (
      url.startsWith("http://") ||
      url.startsWith("https://") ||
      url.startsWith("//") ||
      url.startsWith("data:")
    );
  }

  /**
   * Process images in HTML: copy local images to cache and rewrite paths
   * @param html - HTML string with image tags
   * @param sourceDir - Directory containing the source markdown file
   * @param cacheDir - Cache directory
   * @param hash - Content hash for cache subdirectory naming
   * @returns HTML with updated image paths
   */
  processImages(html: string, sourceDir: string, cacheDir: string, hash: string): string {
    if (!html) return "";

    const images = this.detectLocalImages(html);
    if (images.length === 0) return html;

    // Create images cache directory
    const imagesCacheDir = join(cacheDir, `${hash}_images`);
    if (!existsSync(imagesCacheDir)) {
      mkdirSync(imagesCacheDir, { recursive: true });
    }

    let result = html;
    const copiedImages = new Set<string>(); // Track copied images to avoid duplicates

    for (const image of images) {
      try {
        // Resolve the image path relative to source directory
        const imagePath = this.resolveImagePath(image.src, sourceDir);

        if (!existsSync(imagePath)) {
          console.warn(`Warning: Image not found: ${image.src}`);
          continue;
        }

        // Get just the filename (without nested path structure)
        const imageFileName = basename(imagePath);

        // Copy image to cache if not already copied
        if (!copiedImages.has(imageFileName)) {
          const destPath = join(imagesCacheDir, imageFileName);
          copyFileSync(imagePath, destPath);
          copiedImages.add(imageFileName);
        }

        // Update HTML with new path (relative to cache directory)
        const newSrc = `${hash}_images/${imageFileName}`;
        result = result.replace(
          new RegExp(`(src=["'])${this.escapeRegex(image.src)}(["'])`, "g"),
          `$1${newSrc}$2`
        );
      } catch (error) {
        console.warn(`Warning: Failed to process image ${image.src}:`, error);
        continue;
      }
    }

    return result;
  }

  /**
   * Resolve image path relative to source directory
   * @param imageSrc - Image src attribute value
   * @param sourceDir - Source directory
   * @returns Absolute path to image
   */
  private resolveImagePath(imageSrc: string, sourceDir: string): string {
    // Remove query parameters
    const cleanSrc = imageSrc.split("?")[0] || imageSrc;

    // Handle relative paths (./image.png, ../image.png, image.png)
    if (cleanSrc.startsWith("./") || cleanSrc.startsWith("../") || !cleanSrc.startsWith("/")) {
      return resolve(sourceDir, cleanSrc);
    }

    // Handle absolute paths
    return cleanSrc;
  }

  /**
   * Escape special regex characters in a string
   * @param str - String to escape
   * @returns Escaped string
   */
  private escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }
}
