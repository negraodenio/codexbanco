export function splitTextIntoPseudoPages(text: string, pageCount: number): string[] {
  if (text.includes("\f")) return text.split("\f").map((page) => page.trim());
  if (pageCount <= 1) return [text];
  const chunkSize = Math.ceil(text.length / pageCount);
  return Array.from({ length: pageCount }, (_, index) => text.slice(index * chunkSize, (index + 1) * chunkSize).trim());
}

