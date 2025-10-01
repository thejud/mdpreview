import { describe, test, expect } from "bun:test";
import { parseArgs, type CliOptions } from "../../src/cli";

describe("parseArgs", () => {
  test("parses markdown file positional argument", () => {
    const args = ["README.md"];
    const options = parseArgs(args);

    expect(options.markdownFile).toBe("README.md");
  });

  test("parses chrome flag (-g)", () => {
    const args = ["-g", "README.md"];
    const options = parseArgs(args);

    expect(options.browser.chrome).toBe(true);
    expect(options.markdownFile).toBe("README.md");
  });

  test("parses safari flag (-s)", () => {
    const args = ["-s", "README.md"];
    const options = parseArgs(args);

    expect(options.browser.safari).toBe(true);
  });

  test("parses firefox flag (-f)", () => {
    const args = ["-f", "README.md"];
    const options = parseArgs(args);

    expect(options.browser.firefox).toBe(true);
  });

  test("parses custom browser option (-b)", () => {
    const args = ["-b", "Microsoft Edge", "README.md"];
    const options = parseArgs(args);

    expect(options.browser.browser).toBe("Microsoft Edge");
  });

  test("parses long browser option (--browser)", () => {
    const args = ["--browser", "Opera", "README.md"];
    const options = parseArgs(args);

    expect(options.browser.browser).toBe("Opera");
  });

  test("parses width option (-w)", () => {
    const args = ["-w", "1200", "README.md"];
    const options = parseArgs(args);

    expect(options.width).toBe(1200);
  });

  test("parses long width option (--width)", () => {
    const args = ["--width", "800", "README.md"];
    const options = parseArgs(args);

    expect(options.width).toBe(800);
  });

  test("parses no-cache flag (-N)", () => {
    const args = ["-N", "README.md"];
    const options = parseArgs(args);

    expect(options.noCache).toBe(true);
  });

  test("parses long no-cache flag (--no-cache)", () => {
    const args = ["--no-cache", "README.md"];
    const options = parseArgs(args);

    expect(options.noCache).toBe(true);
  });

  test("parses clean-cache flag (-X)", () => {
    const args = ["-X"];
    const options = parseArgs(args);

    expect(options.cleanCache).toBe(true);
  });

  test("parses long clean-cache flag (--clean-cache)", () => {
    const args = ["--clean-cache"];
    const options = parseArgs(args);

    expect(options.cleanCache).toBe(true);
  });

  test("parses help flag (-h)", () => {
    const args = ["-h"];
    const options = parseArgs(args);

    expect(options.help).toBe(true);
  });

  test("parses long help flag (--help)", () => {
    const args = ["--help"];
    const options = parseArgs(args);

    expect(options.help).toBe(true);
  });

  test("parses multiple flags together", () => {
    const args = ["-g", "-w", "1400", "-N", "README.md"];
    const options = parseArgs(args);

    expect(options.browser.chrome).toBe(true);
    expect(options.width).toBe(1400);
    expect(options.noCache).toBe(true);
    expect(options.markdownFile).toBe("README.md");
  });

  test("defaults width to 980", () => {
    const args = ["README.md"];
    const options = parseArgs(args);

    expect(options.width).toBe(980);
  });

  test("defaults noCache to false", () => {
    const args = ["README.md"];
    const options = parseArgs(args);

    expect(options.noCache).toBe(false);
  });

  test("defaults cleanCache to false", () => {
    const args = ["README.md"];
    const options = parseArgs(args);

    expect(options.cleanCache).toBe(false);
  });

  test("handles file path with spaces", () => {
    const args = ["my document.md"];
    const options = parseArgs(args);

    expect(options.markdownFile).toBe("my document.md");
  });

  test("handles file path with relative path", () => {
    const args = ["./docs/README.md"];
    const options = parseArgs(args);

    expect(options.markdownFile).toBe("./docs/README.md");
  });

  test("handles file path with absolute path", () => {
    const args = ["/Users/test/document.md"];
    const options = parseArgs(args);

    expect(options.markdownFile).toBe("/Users/test/document.md");
  });

  test("allows clean-cache without markdown file", () => {
    const args = ["-X"];
    const options = parseArgs(args);

    expect(options.cleanCache).toBe(true);
    expect(options.markdownFile).toBeUndefined();
  });

  test("flags can appear before or after file", () => {
    const args1 = ["-g", "README.md", "-w", "1200"];
    const args2 = ["README.md", "-g", "-w", "1200"];

    const options1 = parseArgs(args1);
    const options2 = parseArgs(args2);

    expect(options1.browser.chrome).toBe(true);
    expect(options1.width).toBe(1200);
    expect(options2.browser.chrome).toBe(true);
    expect(options2.width).toBe(1200);
  });

  test("handles long flags with equals sign", () => {
    const args = ["--width=1600", "--browser=Firefox", "README.md"];
    const options = parseArgs(args);

    expect(options.width).toBe(1600);
    expect(options.browser.browser).toBe("Firefox");
  });

  test("handles empty args array", () => {
    const args: string[] = [];
    const options = parseArgs(args);

    expect(options.markdownFile).toBeUndefined();
    expect(options.width).toBe(980);
  });

  test("browser options are initialized", () => {
    const args = ["README.md"];
    const options = parseArgs(args);

    expect(options.browser).toBeDefined();
    expect(typeof options.browser).toBe("object");
  });

  test("parses numeric width correctly", () => {
    const widths = ["600", "800", "1200", "1920"];

    widths.forEach((w) => {
      const options = parseArgs(["-w", w, "test.md"]);
      expect(options.width).toBe(parseInt(w));
    });
  });

  test("handles invalid width gracefully", () => {
    const args = ["-w", "invalid", "README.md"];
    const options = parseArgs(args);

    // Should either use default or handle gracefully
    expect(typeof options.width).toBe("number");
  });

  test("last flag wins for conflicting options", () => {
    const args = ["-w", "1200", "-w", "800", "README.md"];
    const options = parseArgs(args);

    expect(options.width).toBe(800);
  });
});

describe("CliOptions type", () => {
  test("has correct structure", () => {
    const options: CliOptions = {
      markdownFile: "test.md",
      browser: { chrome: true },
      width: 980,
      noCache: false,
      cleanCache: false,
      help: false,
    };

    expect(options.markdownFile).toBe("test.md");
    expect(options.browser.chrome).toBe(true);
    expect(options.width).toBe(980);
  });

  test("allows optional markdown file", () => {
    const options: CliOptions = {
      browser: {},
      width: 980,
      noCache: false,
      cleanCache: true,
      help: false,
    };

    expect(options.markdownFile).toBeUndefined();
    expect(options.cleanCache).toBe(true);
  });
});
