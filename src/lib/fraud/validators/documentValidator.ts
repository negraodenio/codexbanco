export function isDuplicateHash(currentHash: string, knownHashes: string[]): boolean {
  return knownHashes.filter((hash) => hash === currentHash).length > 1;
}

