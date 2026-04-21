import { OWNER, REPO, BRANCH, VAULT_READING_DIR } from '../config.js';

export async function fetchRaw(path: string): Promise<string> {
  const url = `https://raw.githubusercontent.com/${OWNER}/${REPO}/${BRANCH}/${path}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`fetchRaw failed: ${String(res.status)} ${res.statusText}`);
  }
  return res.text();
}

export async function listReading(): Promise<{ name: string; path: string; sha: string }[]> {
  const url = `https://api.github.com/repos/${OWNER}/${REPO}/contents/${VAULT_READING_DIR}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`listReading failed: ${String(res.status)} ${res.statusText}`);
  }
  const data = (await res.json()) as { name: string; path: string; sha: string }[];
  return data;
}

export async function getContent(path: string): Promise<{ content: string; sha: string }> {
  const url = `https://api.github.com/repos/${OWNER}/${REPO}/contents/${path}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`getContent failed: ${String(res.status)} ${res.statusText}`);
  }
  const data = (await res.json()) as { content: string; sha: string };
  const b64 = data.content.replace(/\n/g, '');
  const bytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
  const decoded = new TextDecoder().decode(bytes);
  return { content: decoded, sha: data.sha };
}

export async function putContent(opts: {
  path: string;
  message: string;
  content: string;
  sha: string;
  pat: string;
}): Promise<void> {
  const url = `https://api.github.com/repos/${OWNER}/${REPO}/contents/${opts.path}`;
  const body = {
    message: opts.message,
    content: (() => {
      const enc = new TextEncoder().encode(opts.content);
      let bin = '';
      for (const byte of enc) bin += String.fromCharCode(byte);
      return btoa(bin);
    })(),
    sha: opts.sha,
    branch: BRANCH,
  };
  const res = await fetch(url, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${opts.pat}`,
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    throw new Error(`putContent failed: ${String(res.status)} ${res.statusText}`);
  }
}
