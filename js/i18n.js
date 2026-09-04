(function () {
  'use strict';

  const STORAGE_KEY = 'nursepulse_lang';
  const DEFAULT_LANG = 'en';
  const SUPPORTED_LANGS = ['en', 'es'];

  let translations = {};
  let currentLang = DEFAULT_LANG;

  async function loadTranslations(lang) {
    const res = await fetch(`i18n/${lang}.json`);
    if (!res.ok) throw new Error(`Failed to load i18n/${lang}.json`);
    return res.json();
  }

  function applyTranslations(lang) {
    document.documentElement.lang = lang;

    document.querySelectorAll('[data-i18n]').forEach((el) => {
      const key = el.getAttribute('data-i18n');
      if (translations[key] !== undefined) {
        el.textContent = translations[key];
      }
    });

    document.querySelectorAll('[data-i18n-html]').forEach((el) => {
      const key = el.getAttribute('data-i18n-html');
      if (translations[key] !== undefined) {
        el.innerHTML = translations[key];
      }
    });

    document.querySelectorAll('[data-i18n-aria]').forEach((el) => {
      let key = el.getAttribute('data-i18n-aria');
      if (el.id === 'menuToggle' && el.getAttribute('aria-expanded') === 'true') {
        key = 'accessibility.close-menu';
      }
      if (translations[key] !== undefined) {
        el.setAttribute('aria-label', translations[key]);
      }
    });

    document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
      const key = el.getAttribute('data-i18n-placeholder');
      if (translations[key] !== undefined) {
        el.setAttribute('placeholder', translations[key]);
      }
    });

    document.querySelectorAll('.lang-btn').forEach((btn) => {
      const isActive = btn.dataset.lang === lang;
      btn.classList.toggle('active', isActive);
      btn.setAttribute('aria-pressed', String(isActive));
    });
  }

  async function switchLang(lang) {
    if (!SUPPORTED_LANGS.includes(lang)) return;
    try {
      translations = await loadTranslations(lang);
      currentLang = lang;
      localStorage.setItem(STORAGE_KEY, lang);
      applyTranslations(lang);
    } catch (err) {
      console.warn('[i18n] Could not switch language:', err);
    }
  }

  function translate(key, fallback = '') {
    return translations[key] !== undefined ? translations[key] : fallback;
  }

  async function init() {
    const saved = localStorage.getItem(STORAGE_KEY);
    const browserLang = navigator.language?.slice(0, 2);
    const lang =
      SUPPORTED_LANGS.includes(saved) ? saved
        : SUPPORTED_LANGS.includes(browserLang) ? browserLang
          : DEFAULT_LANG;

    await switchLang(lang);

    document.querySelectorAll('.lang-btn').forEach((btn) => {
      btn.addEventListener('click', () => switchLang(btn.dataset.lang));
    });
  }

  window.i18n = {
    switchLang,
    getCurrent: () => currentLang,
    t: translate
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
