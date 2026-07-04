'use client';

import { createContext, useContext } from 'react';
import { Language, TRANSLATIONS, Translations } from '../constants/translations';

const LANGUAGE_STORAGE_KEY = 'recognition-card-language';

type LanguageContextType = {
  lang: Language;
  t: Translations;
  setLang: (lang: Language) => void;
};

export function getInitialLanguage(): Language {
  if (typeof window === 'undefined') return 'en';

  const stored = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
  return stored === 'th' || stored === 'en' ? stored : 'en';
}

export function persistLanguage(lang: Language) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
}

export const LanguageContext = createContext<LanguageContextType>({
  lang: 'en',
  t: TRANSLATIONS['en'],
  setLang: () => { },
});

export function useLanguage() {
  return useContext(LanguageContext);
}
