import fs from "fs";
import path from "path";

export function getFontData(fileName: string): Buffer {
  const filePath = path.join(process.cwd(), "public", "fonts", fileName);
  if (!fs.existsSync(filePath)) {
    throw new Error(`Font file not found: ${filePath}`);
  }
  return fs.readFileSync(filePath);
}

export function getFontDataUri(fileName: string): string {
  return `data:font/ttf;base64,${getFontData(fileName).toString("base64")}`;
}

export function getImageDataUri(fileName: string, mimeType: string): string {
  const filePath = path.join(process.cwd(), "public", fileName);
  if (!fs.existsSync(filePath)) {
    return "";
  }
  const buffer = fs.readFileSync(filePath);
  return `data:${mimeType};base64,${buffer.toString("base64")}`;
}
