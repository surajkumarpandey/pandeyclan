/* ============================================================
   i18n.js — English / Hindi / Kumaoni toggle for the site's own
   text (navigation, headings, buttons, labels). Person names,
   bios, and other content typed in by family members are NOT
   machine-translated — they stay exactly as entered, in
   whichever language the editor used.

   A NOTE ON THE KUMAONI ENTRIES:
   Kumaoni is a much lower-resource language than Hindi for
   translation, and getting it visibly wrong on a family site is
   worse than leaving it blank. So the `kum` field below is only
   filled in where there's real confidence; everywhere else it's
   left out on purpose, and the site falls back to Hindi rather
   than guess — with a small on-page notice explaining that, so
   it reads as "still being filled in" rather than "broken." If
   someone in the family speaks Kumaoni, this file is the place
   to fill the rest in — every entry follows the same
   { hi: '...', kum: '...' } shape.

   USAGE FOR OTHER SCRIPTS:
   - PandeyI18n.t(key) returns the current-language string for a
     dictionary key (falling back to English), for use inside
     JS-generated HTML (e.g. the tree's panel).
   - PandeyI18n.currentLang() returns 'en' | 'hi' | 'kum'.
   - Listen for `window.addEventListener('pandey-lang-changed', ...)`
     to re-render any dynamic content (like SVG text) that was
     already drawn before the toggle was clicked.
   ============================================================ */

const PandeyI18n = (() => {
  const LANGS = ['en', 'hi', 'kum'];
  const LANG_LABEL = { en: 'English', hi: 'हिंदी', kum: 'कुमाऊँनी' };

  const DICT = {
    'nav.home': { hi: 'मुख पृष्ठ', kum: 'घर' },
    'nav.tree': { hi: 'वंश वृक्ष' },
    'nav.map': { hi: 'यात्रा मानचित्र' },
    'nav.village': { hi: 'गाँव बैरती' },
    'nav.archive': { hi: 'अभिलेखागार' },
    'nav.audit': { hi: 'परिवर्तनों का लॉग' },

    'home.h1': { hi: 'परिवार की कई पीढ़ियाँ,<br>एक पर्वत श्रृंखला — <span class="place">बैरती</span> में।' },
    'home.lede': { hi: 'कुमाऊं की पहाड़ियों में श्री सुखदेव के घर से लेकर आज उनका नाम धारण करने वाले हर सदस्य तक — परिवार द्वारा ही संजोया और संकलित।' },
    'home.cta.tree': { hi: 'वंश वृक्ष देखें' },
    'home.cta.map': { hi: 'सब कहाँ हैं, देखें' },
    'home.stat.people': { hi: 'सदस्य दर्ज' },
    'home.stat.gens': { hi: 'पीढ़ियाँ' },
    'home.stat.village': { hi: 'पैतृक गाँव — बैरती, अल्मोड़ा' },
    'home.intro.title': { hi: 'कुमाऊं की पहाड़ियों में एक घर' },
    'home.explore.title': { hi: 'अपनी जगह खोजें' },
    'home.explore.lede': { hi: 'परिवार के अभिलेख में प्रवेश के तीन रास्ते।' },
    'home.card.tree.title': { hi: 'वंश वृक्ष' },
    'home.card.tree.body': { hi: 'कोई भी नाम खोजें और श्री सुखदेव तक ऊपर, या सबसे नई पीढ़ी तक नीचे तक अनुसरण करें।' },
    'home.card.map.title': { hi: 'यात्रा मानचित्र' },
    'home.card.map.body': { hi: 'बैरती से लेकर आज तक — परिवार कहाँ-कहाँ रहा और गया, पीढ़ी दर पीढ़ी।' },
    'home.card.audit.title': { hi: 'परिवर्तनों का लॉग' },
    'home.card.audit.body': { hi: 'इस अभिलेख में हुए हर बदलाव का रिकॉर्ड, और किसने किया।' },
    'home.grows.title': { hi: 'यह अभिलेख कैसे बढ़ता है' },
    'home.grows.body': { hi: 'यह कोई पूर्ण दस्तावेज़ नहीं — एक जीवंत अभिलेख है, जिसे समय के साथ अद्यतन रखा जाता है। कुछ छूटा या गलत लगे तो परिवार को बताएं, जोड़ दिया जाएगा।' },

    'tree.search.placeholder': { hi: 'नाम खोजें…' },
    'tree.download.pdf': { hi: 'PDF के रूप में डाउनलोड करें' },
    'tree.field.fullname': { hi: 'पूरा नाम' },
    'tree.field.spouse': { hi: 'जीवनसाथी' },
    'tree.field.occupation': { hi: 'व्यवसाय' },
    'tree.field.born': { hi: 'जन्म' },
    'tree.field.currentlocation': { hi: 'वर्तमान स्थान' },
    'tree.field.placesvisited': { hi: 'भ्रमण किए स्थान' },
    'tree.field.description': { hi: 'विवरण' },
    'tree.field.note': { hi: 'टिप्पणी' },
    'tree.field.photos': { hi: 'तस्वीरें' },
    'tree.field.voicemessage': { hi: 'आवाज़ संदेश' },
    'tree.field.journey': { hi: 'यात्रा देखें' },
    'tree.field.namenotrecorded': { hi: 'नाम दर्ज नहीं' },
    'tree.sidebar.hint': { hi: 'वंश वृक्ष में नीचे स्क्रॉल करें — यह पैनल हर पीढ़ी के बारे में साथ-साथ जानकारी देगा।' },
    'tree.sidebar.empty': { hi: 'इस पीढ़ी के लिए अभी कोई विवरण नहीं जोड़ा गया।' },

    'village.title': { hi: 'बैरती, अल्मोड़ा — पैतृक गाँव' },
    'archive.title': { hi: 'पारिवारिक अभिलेखागार' },
    'archive.lede': { hi: 'जो किसी एक व्यक्ति या पीढ़ी से नहीं जुड़ा — पुरानी तस्वीरें, दस्तावेज़, वस्तुएं, कुछ भी रखने लायक।' },
    'audit.title': { hi: 'परिवर्तनों का लॉग' },
    'audit.lede': { hi: 'इस अभिलेख में किया गया हर संपादन — किसने क्या बदला, और कब।' },
  };

  function textFor(key, lang) {
    const entry = DICT[key];
    if (!entry) return null;
    return entry[lang] || (lang === 'kum' ? entry.hi : null) || null;
  }

  /** Public: get the current-language string for a key, for JS-generated HTML. Falls back to `fallback` (or the key itself) if untranslated. */
  function t(key, fallback) {
    const lang = currentLang();
    if (lang === 'en') return fallback !== undefined ? fallback : key;
    return textFor(key, lang) || (fallback !== undefined ? fallback : key);
  }

  function currentLang() {
    const saved = localStorage.getItem('pandey_lang') || 'en';
    return LANGS.includes(saved) ? saved : 'en';
  }

  function showKumaoniNotice(show) {
    let bar = document.getElementById('kumaoni-notice');
    if (show) {
      if (!bar) {
        bar = document.createElement('div');
        bar.id = 'kumaoni-notice';
        bar.style.cssText = 'background:#E0952A; color:#3E1218; padding:8px 16px; font-size:13px; text-align:center;';
        bar.textContent = 'कुमाऊँनी अनुवाद अभी जोड़ा जा रहा है — जहाँ उपलब्ध नहीं, वहाँ हिंदी दिखाई जा रही है। (Kumaoni translation is still being filled in — showing Hindi where it isn\'t ready yet.)';
        document.body.prepend(bar);
      }
    } else if (bar) {
      bar.remove();
    }
  }

  function apply(lang) {
    if (!LANGS.includes(lang)) lang = 'en';
    document.documentElement.lang = lang === 'en' ? 'en' : 'hi';
    document.body.classList.toggle('lang-hi', lang !== 'en');
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (!el.dataset.enOriginal) el.dataset.enOriginal = el.innerHTML;
      const text = lang === 'en' ? null : textFor(key, lang);
      el.innerHTML = text || el.dataset.enOriginal;
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      if (!el.dataset.enOriginalPlaceholder) el.dataset.enOriginalPlaceholder = el.getAttribute('placeholder') || '';
      const text = lang === 'en' ? null : textFor(key, lang);
      el.setAttribute('placeholder', text || el.dataset.enOriginalPlaceholder);
    });
    localStorage.setItem('pandey_lang', lang);
    showKumaoniNotice(lang === 'kum');
    window.dispatchEvent(new CustomEvent('pandey-lang-changed', { detail: { lang } }));
  }

  function init() {
    apply(currentLang());
    const btn = document.getElementById('lang-toggle');
    if (btn) {
      const label = (lang) => LANG_LABEL[LANGS[(LANGS.indexOf(lang) + 1) % LANGS.length]];
      btn.textContent = label(currentLang());
      btn.addEventListener('click', () => {
        const next = LANGS[(LANGS.indexOf(currentLang()) + 1) % LANGS.length];
        apply(next);
        btn.textContent = label(next);
      });
    }
  }

  document.addEventListener('DOMContentLoaded', init);
  return { apply, t, currentLang };
})();
