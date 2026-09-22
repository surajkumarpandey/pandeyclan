/* ============================================================
   github.js — thin wrapper around the GitHub Contents API.
   Every write from this site goes through here, straight to
   GitHub, from the editor's own browser. Nothing passes through
   any third-party server.

   IMPORTANT: set OWNER and REPO below to your GitHub username
   and the name of the repo you create for this site.
   ============================================================ */

const GH_CONFIG = {
  owner: 'YOUR-GITHUB-USERNAME',   // <-- change this
  repo: 'pandey-clan-of-bairati',  // <-- change this if you name the repo differently
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

  /** Read a file's current content + sha (sha is required to update it). */
  async function getFile(path, token) {
    const res = await fetch(
      `${API}/repos/${GH_CONFIG.owner}/${GH_CONFIG.repo}/contents/${path}?ref=${GH_CONFIG.branch}`,
      { headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json' } }
    );
    if (res.status === 404) return { content: null, sha: null };
    if (!res.ok) throw new Error(`GitHub read failed (${res.status}): ${await res.text()}`);
    const data = await res.json();
    return { content: b64DecodeUnicode(data.content.replace(/\n/g, '')), sha: data.sha };
  }

  /** Read a binary file (e.g. an existing image) as a base64 string, unmodified. */
  async function getFileRaw(path, token) {
    const res = await fetch(
      `${API}/repos/${GH_CONFIG.owner}/${GH_CONFIG.repo}/contents/${path}?ref=${GH_CONFIG.branch}`,
      { headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json' } }
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
    return res.json();
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
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json' }
    });
    return res.ok;
  }

  return { getFile, getFileRaw, putFile, putFileRaw, verifyToken };
})();
