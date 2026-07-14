export function detectMimeType(buffer: Buffer | Uint8Array, declaredMimeType = "application/octet-stream"): string {
  const bytes = Array.from(buffer.slice(0, 12));
  const ascii = Buffer.from(bytes).toString("ascii");

  if (ascii.startsWith("%PDF")) return "application/pdf";
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return "image/jpeg";
  if (bytes[0] === 0x89 && ascii.slice(1, 4) === "PNG") return "image/png";
  if (ascii.startsWith("PK")) return "application/zip";
  if (declaredMimeType.startsWith("text/")) return declaredMimeType;
  return declaredMimeType || "application/octet-stream";
}

