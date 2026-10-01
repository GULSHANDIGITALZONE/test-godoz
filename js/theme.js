/* ==========================================================================
   GoDoz Technology - Theme (Dark/Light) & Language Switcher (HI/EN) Module
   ========================================================================== */

/* 1. Theme Switcher */
function initTheme() {
  const savedTheme = localStorage.getItem('godoz_theme') ||
    (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');

  applyTheme(savedTheme, false);

  document.addEventListener('click', (e) => {
    const target = e.target.closest('#themeToggleBtn, .theme-toggle-btn, .header-btn-theme, [data-action="toggle-theme"]');
    if (target) {
      e.preventDefault();
      window.toggleGoDozTheme();
    }
  });

  if (window.matchMedia) {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if (!localStorage.getItem('godoz_theme')) {
        applyTheme(e.matches ? 'dark' : 'light', false);
      }
    });
  }
}

function applyTheme(theme, save = true) {
  document.documentElement.setAttribute('data-theme', theme);
  if (save) {
    localStorage.setItem('godoz_theme', theme);
  }
  updateThemeIcon(theme);
}

window.toggleGoDozTheme = function() {
  const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  applyTheme(newTheme, true);
};

function updateThemeIcon(theme) {
  const toggleBtns = document.querySelectorAll('#themeToggleBtn, .theme-toggle-btn, .header-btn-theme, [data-action="toggle-theme"]');
  toggleBtns.forEach(btn => {
    const isDark = theme === 'dark';
    btn.innerHTML = isDark ? '<i class="fa-solid fa-sun"></i>' : '<i class="fa-solid fa-moon"></i>';
    btn.setAttribute('title', isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode');
  });
}

/* 2. Language Switcher (HI / EN) */
function initGoDozLanguage() {
  let gtContainer = document.getElementById('google_translate_element');
  if (!gtContainer) {
    gtContainer = document.createElement('div');
    gtContainer.id = 'google_translate_element';
    gtContainer.style.display = 'none';
    document.body.appendChild(gtContainer);
  }

  if (!document.getElementById('google-translate-script')) {
    const script = document.createElement('script');
    script.id = 'google-translate-script';
    script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
    script.async = true;
    document.head.appendChild(script);
  }

  window.googleTranslateElementInit = function() {
    try {
      new google.translate.TranslateElement({
        pageLanguage: 'en',
        includedLanguages: 'hi,en',
        autoDisplay: false
      }, 'google_translate_element');

      const savedLang = localStorage.getItem('godoz_lang') || 'en';
      if (savedLang === 'hi') {
        setTimeout(() => applyLanguage('hi'), 300);
      }
    } catch(e) {}
  };

  document.addEventListener('click', (e) => {
    const target = e.target.closest('#langToggleBtn, .lang-toggle-btn, .header-btn-lang, [data-action="toggle-lang"]');
    if (target) {
      e.preventDefault();
      window.toggleGoDozLanguage();
    }
  });

  updateLangBtnUI(localStorage.getItem('godoz_lang') || 'en');
}

function applyLanguage(lang) {
  localStorage.setItem('godoz_lang', lang);
  updateLangBtnUI(lang);

  const select = document.querySelector('.goog-te-combo');
  if (select) {
    select.value = lang === 'hi' ? 'hi' : 'en';
    select.dispatchEvent(new Event('change'));
  } else {
    document.cookie = `googtrans=/en/${lang}; path=/; domain=${window.location.hostname}`;
    document.cookie = `googtrans=/en/${lang}; path=/;`;
  }
}

window.toggleGoDozLanguage = function() {
  const currentLang = localStorage.getItem('godoz_lang') || 'en';
  const newLang = currentLang === 'hi' ? 'en' : 'hi';
  applyLanguage(newLang);

  const select = document.querySelector('.goog-te-combo');
  if (select) {
    select.value = newLang === 'hi' ? 'hi' : 'en';
    select.dispatchEvent(new Event('change'));
  } else {
    window.location.reload();
  }
};

function updateLangBtnUI(lang) {
  const langBtns = document.querySelectorAll('#langToggleBtn, .lang-toggle-btn, .header-btn-lang, [data-action="toggle-lang"]');
  langBtns.forEach(btn => {
    const isHi = lang === 'hi';
    btn.innerHTML = isHi ? `<i class="fa-solid fa-language"></i> <span class="btn-text">English</span>` : `<i class="fa-solid fa-language"></i> <span class="btn-text">हिन्दी</span>`;
    btn.setAttribute('title', isHi ? 'Switch to English Language' : 'Switch to Hindi (हिन्दी) Language');
  });
}

window.initTheme = initTheme;
window.applyTheme = applyTheme;
window.initGoDozLanguage = initGoDozLanguage;
window.applyLanguage = applyLanguage;
