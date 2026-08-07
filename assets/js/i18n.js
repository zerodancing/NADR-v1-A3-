const SUPPORTED = new Set(['ru','en']);
let locale = localStorage.getItem('nadr.locale') || (navigator.language?.toLowerCase().startsWith('ru') ? 'ru' : 'ru');
if (!SUPPORTED.has(locale)) locale = 'ru';
let dictionary = {};
let readyPromise = null;

export function getLocale(){ return locale; }
export async function initI18n(){
  if (!readyPromise) readyPromise = fetch(`/NADR-v1-A3-/locales/${locale}.json`, { cache:'force-cache' }).then(async response => {
    if (!response.ok) throw new Error('locale_load_failed');
    dictionary = await response.json();
    document.documentElement.lang = locale;
    return dictionary;
  }).catch(error => { console.error(error); dictionary = {}; return dictionary; });
  return readyPromise;
}
export function t(key, fallback=''){ return dictionary[key] ?? fallback ?? key; }
export function localize(value){
  if (value == null) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'object') return String(value[locale] ?? value.ru ?? value.en ?? '');
  return String(value);
}
export function localizeList(value){
  if (Array.isArray(value)) return value;
  if (!value || typeof value !== 'object') return [];
  const list = value[locale] ?? value.ru ?? value.en;
  return Array.isArray(list) ? list : [];
}
export function applyTranslations(root=document){
  root.querySelectorAll?.('[data-i18n]').forEach(node => { const value=t(node.dataset.i18n); if(value) node.textContent=value; });
  root.querySelectorAll?.('[data-i18n-placeholder]').forEach(node => { const value=t(node.dataset.i18nPlaceholder); if(value) node.setAttribute('placeholder',value); });
  root.querySelectorAll?.('[data-i18n-aria]').forEach(node => { const value=t(node.dataset.i18nAria); if(value) node.setAttribute('aria-label',value); });
}
export function setLocale(next){
  if(!SUPPORTED.has(next)||next===locale)return;
  localStorage.setItem('nadr.locale',next); location.reload();
}