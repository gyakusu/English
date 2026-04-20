import { OWNER, REPO, BRANCH } from '../config.js';

export async function fetchRaw(path: string): Promise<string> {
  const url = `https://raw.githubusercontent.com/${OWNER}/${REPO}/${BRANCH}/${path}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`fetchRaw failed: ${res.status} ${res.statusText}`);
  }
  return res.text();
}

export async function listReading(): Promise<{ name: string; path: string; sha: string }[]> {
  const url = `https://api.github.com/repos/${OWNER}/${REPO}/contents/Reading`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`listReading failed: ${res.status} ${res.statusText}`);
  }
  const data = await res.json() as { name: string; path: string; sha: string }[];
  return data;
}

export async function getContent(path: string): Promise<{ content: string; sha: string }> {
  const url = `https://api.github.com/repos/${OWNER}/${REPO}/contents/${path}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`getContent failed: ${res.status} ${res.statusText}`);
  }
  const data = await res.json() as { content: string; sha: string };
  const decoded = decodeURIComponent(escape(atob(data.content.replace(/\n/g, ''))));
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
    content: btoa(unescape(encodeURIComponent(opts.content))),
    sha: opts.sha,
    branch: BRANCH,
  };
  const res = await fetch(url, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${opts.pat}`,
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    throw new Error(`putContent failed: ${res.status} ${res.statusText}`);
  }
}
