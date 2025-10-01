import { describe, test, expect } from "bun:test";
import { getBrowserCommand, type BrowserOptions } from "../../src/browser/launcher";

describe("getBrowserCommand", () => {
  test("returns Firefox command by default", () => {
    const options: BrowserOptions = {};
    const htmlPath = "/tmp/test.html";

    const command = getBrowserCommand(htmlPath, options);

    expect(command).toContain("Firefox");
    expect(command).toContain(htmlPath);
  });

  test("returns Chrome command with chrome flag", () => {
    const options: BrowserOptions = { chrome: true };
    const htmlPath = "/tmp/test.html";

    const command = getBrowserCommand(htmlPath, options);

    expect(command).toContain("Google Chrome");
    expect(command).toContain(htmlPath);
  });

  test("returns Safari command with safari flag", () => {
    const options: BrowserOptions = { safari: true };
    const htmlPath = "/tmp/test.html";

    const command = getBrowserCommand(htmlPath, options);

    expect(command).toContain("Safari");
    expect(command).toContain(htmlPath);
  });

  test("returns custom browser command with browser option", () => {
    const options: BrowserOptions = { browser: "Microsoft Edge" };
    const htmlPath = "/tmp/test.html";

    const command = getBrowserCommand(htmlPath, options);

    expect(command).toContain("Microsoft Edge");
    expect(command).toContain(htmlPath);
  });

  test("custom browser takes precedence over flags", () => {
    const options: BrowserOptions = {
      browser: "Brave Browser",
      chrome: true,
      safari: true,
    };
    const htmlPath = "/tmp/test.html";

    const command = getBrowserCommand(htmlPath, options);

    expect(command).toContain("Brave Browser");
    expect(command).not.toContain("Google Chrome");
    expect(command).not.toContain("Safari");
  });

  test("chrome flag takes precedence over firefox flag", () => {
    const options: BrowserOptions = {
      chrome: true,
      firefox: true,
    };
    const htmlPath = "/tmp/test.html";

    const command = getBrowserCommand(htmlPath, options);

    expect(command).toContain("Google Chrome");
  });

  test("uses open -a command on macOS", () => {
    const options: BrowserOptions = { chrome: true };
    const htmlPath = "/tmp/test.html";

    const command = getBrowserCommand(htmlPath, options);

    expect(command).toContain("open -a");
  });

  test("quotes paths with spaces correctly", () => {
    const options: BrowserOptions = {};
    const htmlPath = "/tmp/my file with spaces.html";

    const command = getBrowserCommand(htmlPath, options);

    expect(command).toContain(`"${htmlPath}"`);
  });

  test("quotes browser names with spaces correctly", () => {
    const options: BrowserOptions = { browser: "Google Chrome Canary" };
    const htmlPath = "/tmp/test.html";

    const command = getBrowserCommand(htmlPath, options);

    expect(command).toContain('"Google Chrome Canary"');
  });

  test("handles absolute paths", () => {
    const options: BrowserOptions = {};
    const htmlPath = "/Volumes/drive/path/to/file.html";

    const command = getBrowserCommand(htmlPath, options);

    expect(command).toContain(htmlPath);
  });

  test("handles paths with special characters", () => {
    const options: BrowserOptions = {};
    const htmlPath = "/tmp/file-name_v2.0.html";

    const command = getBrowserCommand(htmlPath, options);

    expect(command).toContain(htmlPath);
  });

  test("constructs valid shell command", () => {
    const options: BrowserOptions = { safari: true };
    const htmlPath = "/tmp/test.html";

    const command = getBrowserCommand(htmlPath, options);

    // Should be a valid shell command format
    expect(command).toMatch(/^open -a "[^"]+" "[^"]+"/);
  });

  test("firefox flag uses Firefox", () => {
    const options: BrowserOptions = { firefox: true };
    const htmlPath = "/tmp/test.html";

    const command = getBrowserCommand(htmlPath, options);

    expect(command).toContain("Firefox");
  });

  test("handles empty options object", () => {
    const options: BrowserOptions = {};
    const htmlPath = "/tmp/test.html";

    const command = getBrowserCommand(htmlPath, options);

    // Should default to Firefox
    expect(command).toContain("Firefox");
    expect(command).toContain(htmlPath);
  });

  test("command format is consistent", () => {
    const paths = ["/tmp/test1.html", "/tmp/test2.html", "/tmp/test3.html"];

    paths.forEach((path) => {
      const command = getBrowserCommand(path, { safari: true });
      expect(command).toStartWith('open -a "Safari"');
      expect(command).toEndWith(`"${path}"`);
    });
  });
});

describe("BrowserOptions type", () => {
  test("accepts all browser flags", () => {
    const options: BrowserOptions = {
      chrome: true,
      safari: true,
      firefox: true,
      browser: "Opera",
    };

    expect(options.chrome).toBe(true);
    expect(options.safari).toBe(true);
    expect(options.firefox).toBe(true);
    expect(options.browser).toBe("Opera");
  });

  test("accepts partial options", () => {
    const options1: BrowserOptions = { chrome: true };
    const options2: BrowserOptions = { browser: "Edge" };
    const options3: BrowserOptions = {};

    expect(options1.chrome).toBe(true);
    expect(options2.browser).toBe("Edge");
    expect(options3).toEqual({});
  });
});
