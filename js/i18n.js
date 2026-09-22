/* ============================================================
   i18n.js — English/Hindi toggle for the site's own text
   (navigation, headings, buttons, labels). Person names, bios,
   and other content typed in by family members are NOT
   machine-translated — they stay exactly as entered, in
   whichever language the editor used.
   ============================================================ */

const PandeyI18n = (() => {
  const DICT = {
    'nav.home': { hi: 'मुख पृष्ठ' },
    'nav.tree': { hi: 'वंश वृक्ष' },
    'nav.map': { hi: 'यात्रा मानचित्र' },
    'nav.village': { hi: 'गाँव बैरती' },
    'nav.audit': { hi: 'परिवर्तन इतिहास' },
    'nav.admin': { hi: 'संपादित करें' },

    'home.h1': { hi: 'तेरह पीढ़ियाँ,<br>एक पर्वत श्रृंखला — <span class="place">बैरती</span> में।' },
    'home.lede': { hi: 'कुमाऊं की पहाड़ियों में सुखदेव जी के घर से लेकर आज उनका नाम धारण करने वाले हर सदस्य तक — परिवार द्वारा ही संजोया और संकलित।' },
    'home.cta.tree': { hi: 'वंश वृक्ष देखें' },
    'home.cta.map': { hi: 'सब कहाँ हैं, देखें' },
    'home.stat.people': { hi: 'सदस्य दर्ज' },
    'home.stat.gens': { hi: 'पीढ़ियाँ' },
    'home.stat.village': { hi: 'पैतृक गाँव — बैरती, अल्मोड़ा' },
    'home.intro.title': { hi: 'कुमाऊं की पहाड़ियों में एक घर' },
    'home.explore.title': { hi: 'अपनी जगह खोजें' },
    'home.explore.lede': { hi: 'परिवार के अभिलेख में प्रवेश के तीन रास्ते।' },
    'home.card.tree.title': { hi: 'वंश वृक्ष' },
    'home.card.tree.body': { hi: 'कोई भी नाम खोजें और सुखदेव जी तक ऊपर, या सबसे नई पीढ़ी तक नीचे तक अनुसरण करें।' },
    'home.card.map.title': { hi: 'यात्रा मानचित्र' },
    'home.card.map.body': { hi: 'बैरती से लेकर आज तक — परिवार कहाँ-कहाँ रहा और गया, पीढ़ी दर पीढ़ी।' },
    'home.card.audit.title': { hi: 'परिवर्तन इतिहास' },
    'home.card.audit.body': { hi: 'इस अभिलेख में हुए हर बदलाव का रिकॉर्ड, और किसने किया।' },
    'home.grows.title': { hi: 'यह अभिलेख कैसे बढ़ता है' },
    'home.grows.body': { hi: 'यह कोई पूर्ण दस्तावेज़ नहीं — एक साझा, जीवंत अभिलेख है। पासवर्ड रखने वाला कोई भी सदस्य फ़ोटो जोड़ सकता है, नाम ठीक कर सकता है, या छूटी हुई शाखा भर सकता है।' },
    'home.grows.cta': { hi: 'संपादन पृष्ठ पर जाएँ' },

    'tree.search.placeholder': { hi: 'नाम खोजें…' },
    'tree.legend.named': { hi: 'नामांकित' },
    'tree.legend.placeholder': { hi: 'अनाम / स्थान-धारक' },
    'tree.hint': { hi: 'किसी व्यक्ति पर क्लिक करें — विवरण के लिए नाम पर क्लिक करें।' },

    'village.title': { hi: 'बैरती, अल्मोड़ा — पैतृक गाँव' },
    'audit.title': { hi: 'परिवर्तन इतिहास' },
    'audit.lede': { hi: 'इस अभिलेख में किया गया हर संपादन — किसने क्या बदला, और कब।' },

    'admin.signin.title': { hi: 'संपादन के लिए साइन इन करें' },
    'admin.title': { hi: 'अभिलेख संपादित करें' },
  };

  function apply(lang) {
    document.documentElement.lang = lang === 'hi' ? 'hi' : 'en';
    document.body.classList.toggle('lang-hi', lang === 'hi');
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      const entry = DICT[key];
      if (entry && lang === 'hi' && entry.hi) {
        if (!el.dataset.enOriginal) el.dataset.enOriginal = el.innerHTML;
        el.innerHTML = entry.hi;
      } else if (el.dataset.enOriginal) {
        el.innerHTML = el.dataset.enOriginal;
      }
    });
    localStorage.setItem('pandey_lang', lang);
  }

  function init() {
    const saved = localStorage.getItem('pandey_lang') || 'en';
    apply(saved);
    const btn = document.getElementById('lang-toggle');
    if (btn) {
      btn.textContent = saved === 'hi' ? 'English' : 'हिंदी';
      btn.addEventListener('click', () => {
        const next = (localStorage.getItem('pandey_lang') || 'en') === 'hi' ? 'en' : 'hi';
        apply(next);
        btn.textContent = next === 'hi' ? 'English' : 'हिंदी';
      });
    }
  }

  document.addEventListener('DOMContentLoaded', init);
  return { apply };
})();
