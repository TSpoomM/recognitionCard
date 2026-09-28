'use client';

import { createContext } from 'react';
import { Language, TRANSLATIONS, Translations } from '../core/constants/translations';

const LANGUAGE_STORAGE_KEY = 'recognition-card-language';

export type LanguageContextType = {
  lang: Language;
  t: Translations;
  setLang: (lang: Language) => void;
};

export function getInitialLanguage(): Language {
  if (typeof window === 'undefined') return 'th';

  const stored = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
  return stored === 'th' || stored === 'en' ? stored : 'th';
}

export function persistLanguage(lang: Language) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
}

export const LanguageContext = createContext<LanguageContextType>({
  lang: 'th',
  t: TRANSLATIONS['th'],
  setLang: () => { },
});
