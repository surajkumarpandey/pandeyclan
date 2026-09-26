/* ============================================================
   common.js — small shared helpers used across pages
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.querySelector('.nav-toggle');
  const links = document.querySelector('.site-nav .links');
  if (toggle && links) {
    toggle.addEventListener('click', () => links.classList.toggle('open'));
  }
  addSiteCredit();
  initSiteStats();
});

/* ---------- Site credit: "Created and maintained by …" ----------
   Added to every public page from here, so it only ever needs editing
   in this one place. Pages with a footer get it inside the footer;
   pages without one get a slim credit bar at the very bottom. */
const SITE_CREDIT = {
  en: 'Created and maintained by Suraj Kumar Pandey and Ashok Kumar Pandey',
  hi: 'निर्माण एवं देखरेख: सूरज कुमार पाण्डेय एवं अशोक कुमार पाण्डेय'
};
function addSiteCredit() {
  if (!document.querySelector('.site-nav .links')) return;   // skip admin / setup pages
  if (document.getElementById('site-credit')) return;
  const credit = document.createElement('div');
  credit.id = 'site-credit';
  credit.setAttribute('data-i18n', 'footer.credit');
  credit.textContent = SITE_CREDIT.en;
  const footer = document.querySelector('.site-footer');
  if (footer) {
    credit.style.cssText = 'width:100%; text-align:center; font-size:13px; color:rgba(255,251,243,0.7); padding:14px 28px 0; margin-top:14px; border-top:1px solid rgba(255,251,243,0.12);';
    footer.appendChild(credit);
  } else {
    credit.style.cssText = 'text-align:center; font-size:13px; color:rgba(255,251,243,0.75); background:var(--maroon-deep, #3E1218); padding:14px 20px;';
    document.body.appendChild(credit);
  }
}

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
    const lang = (typeof PandeyI18n !== 'undefined' && PandeyI18n.currentLang) ? PandeyI18n.currentLang() : (localStorage.getItem('pandey_lang') || 'en');
    if (p.unnamedPlaceholder) {
      if (lang !== 'en') return p.gender === 'F' ? 'पुत्री (नाम दर्ज नहीं)' : 'पुत्र (नाम दर्ज नहीं)';
      return p.gender === 'F' ? 'Daughter (name not recorded)' : 'Son (name not recorded)';
    }
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

/* ---------- Visitor statistics (GoatCounter) ----------
   Fill these two settings in once, after creating a free GoatCounter account.
   Until goatcounterCode is set, nothing is counted and no widget is shown. */
const SITE_STATS = {
  goatcounterCode: 'surajpandey',   // e.g. 'pandey-bairati' for https://pandey-bairati.goatcounter.com
  dashboardUrl: ''       // GoatCounter's shareable dashboard link (the one ending in ?access-token=…)
};
function statsBase() { return SITE_STATS.goatcounterCode ? `https://${SITE_STATS.goatcounterCode}.goatcounter.com` : null; }
function fetchVisitCount(params) {
  const base = statsBase(); if (!base) return Promise.resolve(null);
  return fetch(`${base}/counter/TOTAL.json${params || ''}`).then(r => r.ok ? r.json() : null).then(d => d ? d.count : null).catch(() => null);
}
function initSiteStats() {
  if (!document.querySelector('.site-nav .links')) return;   // never count the admin or setup pages
  const base = statsBase(); if (!base) return;
  const tag = document.createElement('script');
  tag.async = true; tag.src = 'https://gc.zgo.at/count.js'; tag.dataset.goatcounter = base + '/count';
  document.head.appendChild(tag);
  // small widget under the site credit
  const credit = document.getElementById('site-credit');
  if (!credit || document.getElementById('site-stats-widget')) return;
  const w = document.createElement('a');
  w.id = 'site-stats-widget'; w.href = 'stats.html';
  w.style.cssText = 'display:inline-flex; align-items:center; gap:6px; margin-top:8px; padding:4px 12px; border-radius:999px; font-size:12.5px; text-decoration:none;'
                  + 'color:inherit; border:1px solid rgba(224,149,42,0.55); background:rgba(224,149,42,0.12);';
  w.innerHTML = '<span aria-hidden="true">👁</span><span id="site-stats-count">…</span>';
  credit.appendChild(document.createElement('br')); credit.appendChild(w);
  fetchVisitCount().then(n => {
    const hi = (typeof PandeyI18n !== 'undefined' && PandeyI18n.currentLang() !== 'en');
    document.getElementById('site-stats-count').textContent = n ? (hi ? `${n} विज़िट · आँकड़े देखें` : `${n} visits · site stats`) : (hi ? 'साइट के आँकड़े' : 'Site stats');
  });
}
