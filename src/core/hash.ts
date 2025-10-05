import { createHash } from "crypto";
import { readFileSync } from "fs";

/**
 * Generate SHA256 hash of file content
 * @param filePath - Absolute or relative path to file
 * @returns 64-character hexadecimal hash string
 * @throws Error if file cannot be read
 */
export function getFileHash(filePath: string): string {
  try {
    const content = readFileSync(filePath);
    const hash = createHash("sha256");
    hash.update(content);
    return hash.digest("hex");
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to hash file "${filePath}": ${error.message}`);
    }
    throw error;
  }
}
