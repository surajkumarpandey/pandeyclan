/* ============================================================
   github.js — thin wrapper around the GitHub Contents API.
   Every write from this site goes through here, straight to
   GitHub, from the editor's own browser. Nothing passes through
   any third-party server.

   IMPORTANT: set OWNER and REPO below to your GitHub username
   and the name of the repo you create for this site.
   ============================================================ */

const GH_CONFIG = {
  owner: 'surajkumarpandey',   // <-- change this
  repo: 'pandeyclan',  // <-- change this if you name the repo differently
  branch: 'main'
};

const PandeyGitHub = (() => {
  const API = 'https://api.github.com';

  function b64EncodeUnicode(str) {
    return btoa(unescape(encodeURIComponent(str)));
  }
  function b64DecodeUnicode(str) {
    return decodeURIComponent(escape(atob(str)));
  }

  // The sha that OUR most recent successful write produced, per path.
  // GitHub's API is eventually consistent: for a few seconds after a write,
  // a read can still come back with the PREVIOUS sha. Writing against that
  // stale sha is what caused the repeated 409 errors. Remembering our own
  // latest sha lets reads wait until GitHub has caught up.
  const lastWrittenSha = {};
  const sleep = (ms) => new Promise(r => setTimeout(r, ms));

  async function fetchFileOnce(path, token) {
    const res = await fetch(
      `${API}/repos/${GH_CONFIG.owner}/${GH_CONFIG.repo}/contents/${path}?ref=${GH_CONFIG.branch}&_=${Date.now()}`,
      { cache: 'no-store', headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json' } }
    );
    if (res.status === 404) return { content: null, sha: null };
    if (!res.ok) throw new Error(`GitHub read failed (${res.status}): ${await res.text()}`);
    const data = await res.json();
    return { content: b64DecodeUnicode(data.content.replace(/\n/g, '')), sha: data.sha };
  }

  /** Read a file's current content + sha (sha is required to update it).
   *  If we wrote this file moments ago and GitHub still returns the older
   *  version, wait briefly and re-read until it reflects our write. */
  async function getFile(path, token) {
    let result = await fetchFileOnce(path, token);
    const expected = lastWrittenSha[path];
    for (let i = 0; expected && result.sha !== expected && i < 6; i++) {
      await sleep(700 * (i + 1));
      result = await fetchFileOnce(path, token);
    }
    return result;
  }

  /** Read a binary file (e.g. an existing image) as a base64 string, unmodified. */
  async function getFileRaw(path, token) {
    const res = await fetch(
      `${API}/repos/${GH_CONFIG.owner}/${GH_CONFIG.repo}/contents/${path}?ref=${GH_CONFIG.branch}`,
      { cache: 'no-store', headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json' } }
    );
    if (res.status === 404) return { content: null, sha: null };
    if (!res.ok) throw new Error(`GitHub read failed (${res.status}): ${await res.text()}`);
    const data = await res.json();
    return { content: data.content.replace(/\n/g, ''), sha: data.sha };
  }

  /** Create or update a text file. `content` is a plain JS string. */
  async function putFile(path, content, message, token, sha = null) {
    const body = {
      message,
      content: b64EncodeUnicode(content),
      branch: GH_CONFIG.branch
    };
    if (sha) body.sha = sha;
    const res = await fetch(
      `${API}/repos/${GH_CONFIG.owner}/${GH_CONFIG.repo}/contents/${path}`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/vnd.github+json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      }
    );
    if (!res.ok) throw new Error(`GitHub write failed (${res.status}): ${await res.text()}`);
    const json = await res.json();
    if (json && json.content && json.content.sha) lastWrittenSha[path] = json.content.sha;
    return json;
  }

  /** Create or update a binary file. `base64Content` is already base64 (no data: prefix). */
  async function putFileRaw(path, base64Content, message, token, sha = null) {
    const body = { message, content: base64Content, branch: GH_CONFIG.branch };
    if (sha) body.sha = sha;
    const res = await fetch(
      `${API}/repos/${GH_CONFIG.owner}/${GH_CONFIG.repo}/contents/${path}`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/vnd.github+json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      }
    );
    if (!res.ok) throw new Error(`GitHub write failed (${res.status}): ${await res.text()}`);
    return res.json();
  }

  /** Quick check that a token actually works and can write to this repo. */
  async function verifyToken(token) {
    const res = await fetch(`${API}/repos/${GH_CONFIG.owner}/${GH_CONFIG.repo}`, {
      cache: 'no-store',
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json' }
    });
    return res.ok;
  }

  /**
   * Read a JSON file, apply `mutateFn(parsedContent) => newParsedContent`,
   * and write it back. If GitHub rejects the write because the file moved
   * on since we read it (a 409 — someone else saved, or a cached response
   * slipped through), this re-reads the latest version and retries the
   * same mutation against it, up to `maxRetries` times, instead of just
   * failing. Returns the final written content.
   */
  async function readModifyWriteJSON(path, mutateFn, message, token, maxRetries = 4) {
    let lastErr;
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      const { content, sha } = await getFile(path, token);
      const parsed = content ? JSON.parse(content) : null;
      const updated = mutateFn(parsed);
      const newContent = JSON.stringify(updated, null, 2);
      try {
        await putFile(path, newContent, message, token, sha);
        return updated;
      } catch (e) {
        lastErr = e;
        if (!String(e.message).includes('409')) throw e;
        // 409: GitHub had a newer version than the one we read (usually a
        // replica still catching up to a write made seconds ago). Forget
        // our remembered sha, back off, re-read, and reapply the change.
        delete lastWrittenSha[path];
        await sleep(1000 * Math.pow(2, attempt));
      }
    }
    throw new Error('GitHub is still catching up with a recent save — wait about 10 seconds and try again. (' + lastErr.message + ')');
  }

  return { getFile, getFileRaw, putFile, putFileRaw, verifyToken, readModifyWriteJSON };
})();
