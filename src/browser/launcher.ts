import { spawnSync } from "child_process";

export interface BrowserOptions {
  chrome?: boolean;
  safari?: boolean;
  firefox?: boolean;
  browser?: string;
}

/**
 * Get the browser command to open the HTML file
 * @param htmlPath - Absolute path to HTML file
 * @param options - Browser selection options
 * @returns Shell command to open file in browser
 */
export function getBrowserCommand(htmlPath: string, options: BrowserOptions): string {
  const browserName = selectBrowser(options);
  const quotedPath = `"${htmlPath}"`;
  const quotedBrowser = `"${browserName}"`;

  // macOS: use open -a
  return `open -a ${quotedBrowser} ${quotedPath}`;
}

/**
 * Select browser name based on options
 * @param options - Browser selection options
 * @returns Browser application name
 */
function selectBrowser(options: BrowserOptions): string {
  // Custom browser takes precedence
  if (options.browser) {
    return options.browser;
  }

  // Check flags in order of precedence
  if (options.chrome) {
    return "Google Chrome";
  }

  if (options.safari) {
    return "Safari";
  }

  if (options.firefox) {
    return "Firefox";
  }

  // Default to Firefox
  return "Firefox";
}

/**
 * Open HTML file in browser
 * @param htmlPath - Absolute path to HTML file
 * @param options - Browser selection options
 */
export function openInBrowser(htmlPath: string, options: BrowserOptions = {}): void {
  const command = getBrowserCommand(htmlPath, options);

  try {
    const result = spawnSync(command, {
      shell: true,
      stdio: "inherit",
    });

    if (result.error) {
      console.error(`Failed to open browser: ${result.error.message}`);
      console.log(`You can manually open the file at: ${htmlPath}`);
    }
  } catch (error) {
    console.error(`Error launching browser:`, error);
    console.log(`You can manually open the file at: ${htmlPath}`);
  }
}
