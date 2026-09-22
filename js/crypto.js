/* ============================================================
   crypto.js — password-based encryption for the shared write token
   Uses the browser's built-in Web Crypto API (no library needed).
   Nothing here ever sends a password anywhere; it only runs
   locally in the editor's own browser.
   ============================================================ */

const PandeyCrypto = (() => {
  const enc = new TextEncoder();
  const dec = new TextDecoder();

  async function deriveKey(password, saltBytes) {
    const baseKey = await crypto.subtle.importKey(
      'raw', enc.encode(password), 'PBKDF2', false, ['deriveKey']
    );
    return crypto.subtle.deriveKey(
      { name: 'PBKDF2', salt: saltBytes, iterations: 250000, hash: 'SHA-256' },
      baseKey,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    );
  }

  function toB64(bytes) {
    return btoa(String.fromCharCode(...new Uint8Array(bytes)));
  }
  function fromB64(str) {
    return Uint8Array.from(atob(str), c => c.charCodeAt(0));
  }

  /**
   * Encrypt `token` with `password`. Returns a self-contained
   * object {salt, iv, cipher} — all base64 — safe to store publicly.
   * Without the correct password this is computationally infeasible
   * to reverse for a token of this length.
   */
  async function encryptToken(token, password) {
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const key = await deriveKey(password, salt);
    const cipherBuf = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv }, key, enc.encode(token)
    );
    return { salt: toB64(salt), iv: toB64(iv), cipher: toB64(cipherBuf) };
  }

  /**
   * Attempt to decrypt an entry with the given password.
   * Returns the plaintext token on success, or null on wrong password.
   */
  async function decryptToken(entry, password) {
    try {
      const salt = fromB64(entry.salt);
      const iv = fromB64(entry.iv);
      const cipher = fromB64(entry.cipher);
      const key = await deriveKey(password, salt);
      const plainBuf = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, cipher);
      return dec.decode(plainBuf);
    } catch (e) {
      return null; // wrong password, or corrupted entry
    }
  }

  return { encryptToken, decryptToken };
})();
