import fs from "fs";
import path from "path";

export function getFontData(fileName: string): Buffer {
  const filePath = path.join(process.cwd(), "public", "fonts", fileName);
  if (!fs.existsSync(filePath)) {
    throw new Error(`Font file not found: ${filePath}`);
  }
  return fs.readFileSync(filePath);
}

// Font files never change at runtime, so cache their base64 data URIs instead
// of re-reading and re-encoding them from disk on every card/email render.
const fontDataUriCache = new Map<string, string>();

export function getFontDataUri(fileName: string): string {
  const cached = fontDataUriCache.get(fileName);
  if (cached) return cached;

  const dataUri = `data:font/ttf;base64,${getFontData(fileName).toString("base64")}`;
  fontDataUriCache.set(fileName, dataUri);
  return dataUri;
}

// Static local assets never change at runtime either, so cache these too.
const imageDataUriCache = new Map<string, string>();

export function getImageDataUri(fileName: string, mimeType: string): string {
  const cacheKey = `${fileName}|${mimeType}`;
  const cached = imageDataUriCache.get(cacheKey);
  if (cached !== undefined) return cached;

  const filePath = path.join(process.cwd(), "public", fileName);
  const dataUri = fs.existsSync(filePath)
    ? `data:${mimeType};base64,${fs.readFileSync(filePath).toString("base64")}`
    : "";
  imageDataUriCache.set(cacheKey, dataUri);
  return dataUri;
}
