import { describe, test, expect } from "bun:test";
import { getGithubCSS } from "../../src/rendering/styles";

describe("getGithubCSS", () => {
  test("returns CSS string with style tag", () => {
    const css = getGithubCSS(980);

    expect(css).toContain("<style>");
    expect(css).toContain("</style>");
  });

  test("includes maxWidth in CSS", () => {
    const css1 = getGithubCSS(980);
    const css2 = getGithubCSS(1200);

    expect(css1).toContain("max-width: 980px");
    expect(css2).toContain("max-width: 1200px");
  });

  test("includes body styles", () => {
    const css = getGithubCSS(980);

    expect(css).toContain("body");
    expect(css).toContain("margin");
    expect(css).toContain("padding");
  });

  test("includes dark mode media query", () => {
    const css = getGithubCSS(980);

    expect(css).toContain("@media (prefers-color-scheme: dark)");
  });

  test("includes typography styles", () => {
    const css = getGithubCSS(980);

    expect(css).toContain("font-family");
    expect(css).toContain("font-size");
    expect(css).toContain("line-height");
  });

  test("includes heading styles", () => {
    const css = getGithubCSS(980);

    expect(css).toContain("h1");
    expect(css).toContain("h2");
    expect(css).toContain("h3");
  });

  test("includes code and pre styles", () => {
    const css = getGithubCSS(980);

    expect(css).toContain("code");
    expect(css).toContain("pre");
  });

  test("includes table styles", () => {
    const css = getGithubCSS(980);

    expect(css).toContain("table");
    expect(css).toContain("th");
    expect(css).toContain("td");
  });

  test("includes link styles", () => {
    const css = getGithubCSS(980);

    expect(css).toContain("a ");
    expect(css).toContain("color");
  });

  test("includes image styles", () => {
    const css = getGithubCSS(980);

    expect(css).toContain("img");
    expect(css).toContain("max-width: 100%");
  });

  test("includes blockquote styles", () => {
    const css = getGithubCSS(980);

    expect(css).toContain("blockquote");
  });

  test("uses GitHub color scheme for light mode", () => {
    const css = getGithubCSS(980);

    // Light mode colors from PRD
    expect(css).toContain("#ffffff"); // bg-primary
    expect(css).toContain("#1f2328"); // text-primary
  });

  test("uses GitHub color scheme for dark mode", () => {
    const css = getGithubCSS(980);

    // Dark mode colors from PRD
    expect(css).toContain("#0d1117"); // bg-primary
    expect(css).toContain("#e6edf3"); // text-primary
  });

  test("handles different width values", () => {
    const widths = [600, 800, 980, 1200, 1600];

    widths.forEach((width) => {
      const css = getGithubCSS(width);
      expect(css).toContain(`max-width: ${width}px`);
    });
  });

  test("includes syntax highlighting styles", () => {
    const css = getGithubCSS(980);

    // Should include hljs classes for syntax highlighting
    expect(css).toContain(".hljs");
  });
});
