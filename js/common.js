/* ============================================================
   common.js — small shared helpers used across pages
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.querySelector('.nav-toggle');
  const links = document.querySelector('.site-nav .links');
  if (toggle && links) {
    toggle.addEventListener('click', () => links.classList.toggle('open'));
  }
});

const PandeyData = (() => {
  let peopleCache = null;

  async function loadPeople() {
    if (peopleCache) return peopleCache;
    const res = await fetch('data/people.json?_=' + Date.now());
    if (!res.ok) throw new Error(`Could not load data/people.json (HTTP ${res.status}).`);
    try {
      peopleCache = await res.json();
    } catch (e) {
      throw new Error('data/people.json is not valid JSON — check it on GitHub for a syntax error (a missing or stray comma is the usual cause).');
    }
    return peopleCache;
  }

  function byId(people) {
    const map = {};
    people.forEach(p => { map[p.id] = p; });
    return map;
  }

  function children(people, parentId) {
    return people.filter(p => p.parentId === parentId);
  }

  function ancestorChain(people, id) {
    const map = byId(people);
    const chain = [];
    let node = map[id];
    while (node) {
      chain.unshift(node);
      node = node.parentId ? map[node.parentId] : null;
    }
    return chain;
  }

  function displayName(p) {
    if (p.unnamedPlaceholder) return p.gender === 'F' ? 'Daughter (name not recorded)' : 'Son (name not recorded)';
    if (p.gender === 'M') return `Shri ${p.name}`;
    if (p.gender === 'F') return `Smt. ${p.name}`;
    return p.name;
  }

  return { loadPeople, byId, children, ancestorChain, displayName };
})();

/** Show a visible, unmissable error banner at the top of the page — used when
 *  essential data (like people.json) fails to load, so a broken page says why
 *  instead of just sitting blank. */
function showFatalError(message) {
  const bar = document.createElement('div');
  bar.style.cssText = 'position:sticky; top:0; z-index:50; background:#8C2F1F; color:#FFFBF3; padding:14px 20px; font-family:sans-serif; font-size:14.5px; text-align:center;';
  bar.textContent = message;
  document.body.prepend(bar);
}
