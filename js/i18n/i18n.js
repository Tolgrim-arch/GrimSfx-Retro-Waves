import { es } from './es.js';
import { en } from './en.js';

const STORAGE_KEY = 'grimsfx_lang';
const dictionaries = { es, en };

let currentLang = localStorage.getItem(STORAGE_KEY) || (navigator.language?.startsWith('es') ? 'es' : 'en');
if (!dictionaries[currentLang]) currentLang = 'en';

const listeners = new Set();

export function getLanguage() {
  return currentLang;
}

export function t(key) {
  const parts = key.split('.');
  let value = dictionaries[currentLang];
  for (const part of parts) {
    if (value && typeof value === 'object' && part in value) {
      value = value[part];
    } else {
      return key;
    }
  }
  return value;
}

export function applyTranslations(root = document) {
  root.querySelectorAll('[data-i18n]').forEach((el) => {
    const key = el.getAttribute('data-i18n');
    el.textContent = t(key);
  });
  document.documentElement.lang = currentLang;
  document.title = `${t('app.title')} // ${t('app.subtitle')}`;
}

export function setLanguage(lang) {
  if (!dictionaries[lang]) return;
  currentLang = lang;
  localStorage.setItem(STORAGE_KEY, lang);
  applyTranslations();
  listeners.forEach((cb) => cb(lang));
}

export function onLanguageChange(cb) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}
