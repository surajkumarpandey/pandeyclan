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
    peopleCache = await res.json();
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
    if (!p.unnamedPlaceholder) return p.name;
    return p.gender === 'F' ? 'Daughter (name not recorded)' : 'Son (name not recorded)';
  }

  return { loadPeople, byId, children, ancestorChain, displayName };
})();
