# MDPreview Bun/TypeScript Rewrite with TDD

## Project Setup
1. Initialize Bun project with `package.json` and TypeScript configuration
2. Set up testing framework (Bun's built-in test runner)
3. Configure project structure following PRD specifications

## Core Implementation (TDD Approach)

### Phase 1: Foundation & Hashing (TDD)
**Tests first, then implementation:**
- Write tests for `getFileHash()` - SHA256 content hashing
- Write tests for `getCacheDir()` - cache directory management
- Implement hash and cache directory functions

### Phase 2: Markdown Processing (TDD)
**Tests first, then implementation:**
- Write tests for basic markdown-to-HTML conversion using `marked` library
- Write tests for GFM features (tables, fenced code, strikethrough)
- Write tests for syntax highlighting integration with `highlight.js`
- Implement markdown processor with all extensions

### Phase 3: Image Processing (TDD)
**Tests first, then implementation:**
- Write tests for local image detection in HTML
- Write tests for image copying to cache directory
- Write tests for path rewriting (relative → cached)
- Write tests for remote URL preservation
- Implement `LocalImageProcessor` class

### Phase 4: Mermaid Diagrams (TDD)
**Tests first, then implementation:**
- Write tests for mermaid code block detection
- Write tests for HTML structure generation (diagram + toggle button)
- Implement mermaid integration with toggle functionality

### Phase 5: Caching System (TDD)
**Tests first, then implementation:**
- Write tests for cache lookup by hash
- Write tests for cache write/read operations
- Write tests for cache invalidation with `-N` flag
- Write tests for cache cleaning with `-X` flag
- Implement complete caching system

### Phase 6: HTML Template & Styling (TDD)
**Tests first, then implementation:**
- Write tests for GitHub CSS generation (light/dark mode)
- Write tests for HTML template assembly
- Write tests for configurable width
- Implement template system

### Phase 7: Browser Integration (TDD)
**Tests first, then implementation:**
- Write tests for browser selection logic
- Write tests for macOS `open` command construction
- Write tests for fallback mechanisms
- Implement `openInBrowser()` function

### Phase 8: CLI Interface (TDD)
**Tests first, then implementation:**
- Write tests for argument parsing
- Write tests for browser flags (-g, -s, -f)
- Write tests for width option (-w)
- Write tests for cache flags (-N, -X)
- Implement CLI with all options

### Phase 9: Integration Tests
- End-to-end test: simple markdown → HTML → browser
- Test with all PRD test files (demo.md, test_images.md, etc.)
- Test cache hit/miss scenarios
- Test error handling (missing files, write failures, etc.)

## Technology Stack
- **Runtime:** Bun
- **Language:** TypeScript
- **Markdown:** marked (fast, GFM support)
- **Syntax Highlighting:** highlight.js
- **Mermaid:** mermaid.js (CDN in HTML)
- **Testing:** Bun test runner
- **Hashing:** Node crypto (built into Bun)

## Success Criteria
- All tests pass
- 100% PRD feature coverage
- Performance: <100ms cached, <500ms fresh
- Works with existing test files in `test/` directory
- Compatible with `mdp` wrapper script

## Detailed Phase Breakdown

### Phase 1: Foundation & Hashing
```typescript
// Test: src/core/hash.test.ts
// Implementation: src/core/hash.ts

Functions to test:
- getFileHash(filePath: string): string
  - Returns consistent SHA256 hash for same content
  - Throws error for non-existent files
  - Handles UTF-8 encoding correctly

// Test: src/core/cache.test.ts
// Implementation: src/core/cache.ts

Functions to test:
- getCacheDir(): string
  - Returns /tmp/mdpreview path
  - Creates directory if doesn't exist
  - Sets correct permissions (755)
- cleanCache(): void
  - Removes all files in cache directory
  - Recreates empty cache directory
  - Handles missing cache gracefully
```

### Phase 2: Markdown Processing
```typescript
// Test: src/core/markdown.test.ts
// Implementation: src/core/markdown.ts

Functions to test:
- convertMarkdown(content: string, options?: MarkdownOptions): string
  - Converts basic markdown (headers, lists, paragraphs)
  - Supports GFM tables
  - Supports fenced code blocks with language detection
  - Supports strikethrough (~~text~~)
  - Applies syntax highlighting to code blocks
  - Returns valid HTML
```

### Phase 3: Image Processing
```typescript
// Test: src/processors/images.test.ts
// Implementation: src/processors/images.ts

Class to test: LocalImageProcessor
- detectLocalImages(html: string): ImageInfo[]
  - Finds all <img> tags
  - Identifies local vs remote images
  - Returns image metadata (src, alt, format)
- copyImageToCache(imagePath: string, sourceDir: string, cacheDir: string, hash: string): string
  - Copies local image to cache/{hash}_images/
  - Returns new path for src attribute
  - Handles missing images with warnings
  - Skips unsupported formats
- processImages(html: string, sourceDir: string, cacheDir: string, hash: string): string
  - Rewrites all local image src attributes
  - Preserves remote URLs
  - Returns modified HTML
```

### Phase 4: Mermaid Diagrams
```typescript
// Test: src/processors/mermaid.test.ts
// Implementation: src/processors/mermaid.ts

Functions to test:
- detectMermaidBlocks(html: string): MermaidBlock[]
  - Finds code blocks with language="mermaid"
  - Extracts mermaid source code
- wrapMermaidBlock(source: string): string
  - Wraps in mermaid-container div
  - Adds mermaid-diagram and mermaid-source sections
  - Adds toggle button HTML
  - Returns complete HTML structure
- processMermaidBlocks(html: string): string
  - Replaces all mermaid code blocks with wrapped versions
  - Preserves non-mermaid code blocks
```

### Phase 5: Caching System
```typescript
// Test: src/core/cache.test.ts (additional tests)
// Implementation: src/core/cache.ts (additional functions)

Functions to test:
- getCachedHtml(hash: string): string | null
  - Returns cached HTML content if exists
  - Returns null if not cached
- writeCachedHtml(hash: string, html: string): string
  - Writes HTML to cache/{hash}.html
  - Returns path to cached file
  - Falls back to temp file on write failure
- shouldUseCache(hash: string, noCache: boolean): boolean
  - Returns false if noCache flag set
  - Returns true if cache exists
  - Returns false if no cache exists
```

### Phase 6: HTML Template & Styling
```typescript
// Test: src/rendering/styles.test.ts
// Implementation: src/rendering/styles.ts

Functions to test:
- getGithubCSS(maxWidth: number): string
  - Returns complete <style> tag
  - Includes light mode styles
  - Includes dark mode media query
  - Uses provided maxWidth
  - Matches GitHub visual style

// Test: src/rendering/template.test.ts
// Implementation: src/rendering/template.ts

Functions to test:
- generateHtml(title: string, content: string, styles: string): string
  - Returns complete HTML5 document
  - Includes DOCTYPE and meta tags
  - Includes mermaid.js CDN script
  - Includes toggle button JavaScript
  - Embeds provided styles
  - Embeds provided content
```

### Phase 7: Browser Integration
```typescript
// Test: src/browser/launcher.test.ts
// Implementation: src/browser/launcher.ts

Functions to test:
- openInBrowser(htmlPath: string, browser: string): Promise<void>
  - Constructs correct open command for macOS
  - Uses browser name in command
  - Handles spaces in paths and browser names
  - Logs error on failure with file path
- getBrowserName(options: BrowserOptions): string
  - Returns "Google Chrome" for chrome flag
  - Returns "Safari" for safari flag
  - Returns "Firefox" for firefox flag or default
  - Returns custom browser name if provided
```

### Phase 8: CLI Interface
```typescript
// Test: src/cli.test.ts
// Implementation: src/cli.ts

Functions to test:
- parseArgs(args: string[]): CliOptions
  - Parses markdown_file positional argument
  - Parses browser flags (-g, -s, -f, -b)
  - Parses width option (-w)
  - Parses cache flags (-N, -X)
  - Shows help with -h
  - Validates required arguments
- main(args: string[]): Promise<number>
  - Orchestrates entire conversion process
  - Handles clean-cache mode
  - Returns 0 on success, 1 on error
```

## File Structure
```
mdpreview/
├── package.json
├── tsconfig.json
├── bun.lockb
├── README.md
├── PRD.md
├── docs/
│   └── bun_implementation_plan.md
├── src/
│   ├── cli.ts              # Main CLI entry point
│   ├── core/
│   │   ├── hash.ts         # SHA256 hashing
│   │   ├── cache.ts        # Cache management
│   │   └── markdown.ts     # Markdown conversion
│   ├── processors/
│   │   ├── images.ts       # Image processing
│   │   └── mermaid.ts      # Mermaid diagram processing
│   ├── rendering/
│   │   ├── styles.ts       # CSS generation
│   │   └── template.ts     # HTML template
│   └── browser/
│       └── launcher.ts     # Browser launching
└── tests/
    ├── unit/
    │   ├── hash.test.ts
    │   ├── cache.test.ts
    │   ├── markdown.test.ts
    │   ├── images.test.ts
    │   ├── mermaid.test.ts
    │   ├── styles.test.ts
    │   ├── template.test.ts
    │   ├── launcher.test.ts
    │   └── cli.test.ts
    ├── integration/
    │   └── e2e.test.ts
    └── fixtures/
        ├── sample.md
        └── images/
```

## Dependencies to Install
```json
{
  "dependencies": {
    "marked": "^11.0.0",
    "marked-gfm-heading-id": "^3.1.3",
    "marked-mangle": "^1.1.7",
    "highlight.js": "^11.9.0"
  },
  "devDependencies": {
    "@types/bun": "latest",
    "@types/marked": "^6.0.0",
    "@types/node": "^20.10.0"
  }
}
```

## Testing Strategy

### Unit Tests
- Each function tested independently
- Mock file system operations where needed
- Test both success and error paths
- Aim for >90% code coverage

### Integration Tests
- Test complete workflows
- Use real test files from `test/` directory
- Verify cache behavior
- Test browser integration (mock exec calls)

### TDD Workflow
1. Write failing test
2. Run test (should fail - red)
3. Write minimal implementation
4. Run test (should pass - green)
5. Refactor if needed
6. Repeat

## Implementation Order
1. Project setup (package.json, tsconfig.json)
2. Phase 1: Hash + Cache (foundation)
3. Phase 2: Markdown conversion (core feature)
4. Phase 6: HTML template (needed for testing)
5. Phase 3: Image processing (enhancement)
6. Phase 4: Mermaid diagrams (enhancement)
7. Phase 5: Complete caching system
8. Phase 7: Browser integration
9. Phase 8: CLI interface
10. Phase 9: Integration tests
11. Documentation and polish

## Performance Targets
- Cache hit: < 100ms
- Fresh conversion (small file): < 500ms
- File hash calculation: < 10ms
- Image processing: < 50ms per image
- Overall responsiveness: < 1 second perceived time

## Error Handling Strategy
- File not found: Exit with clear error message
- Permission denied: Exit with clear error message
- Cache write failure: Fallback to temp file, warn user
- Image copy failure: Warn to stderr, continue processing
- Browser launch failure: Print file path for manual opening
- Invalid arguments: Show usage help

## Next Steps
1. Initialize Bun project: `bun init`
2. Install dependencies: `bun add marked highlight.js`
3. Configure TypeScript with strict mode
4. Create directory structure
5. Start Phase 1: Write first test for `getFileHash()`
