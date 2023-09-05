/**
 * Shuffles a list
 * @param list The list to shuffle.
 * @returns The shuffled list.
 */
export function shuffle<T>(list: T[]): T[] {
  const shuffled: T[] = [...list];
  for (let i: number = shuffled.length - 1; i > 0; i--) {
    const j: number = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Split a list into chunks.
 * @param list The list to split.
 * @param size The size of each chunk.
 * @returns The list of chunks.
 */
export function chunk<T>(list: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i: number = 0; i < list.length; i += size) {
    chunks.push(list.slice(i, i + size));
  }
  return chunks;
}