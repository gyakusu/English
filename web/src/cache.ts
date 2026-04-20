import { fetchRaw } from './api/github.js';

const rawCache = new Map<string, string>();

export async function cachedFetchRaw(path: string): Promise<string> {
  if (rawCache.has(path)) return rawCache.get(path)!;
  const text = await fetchRaw(path);
  rawCache.set(path, text);
  return text;
}

export function clearCache(): void {
  rawCache.clear();
}
