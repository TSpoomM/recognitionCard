'use client';

import { createContext, useContext } from 'react';
import { Language, TRANSLATIONS, Translations } from '../constants/translations';

type LanguageContextType = {
  lang: Language;
  t: Translations;
  setLang: (lang: Language) => void;
};

export const LanguageContext = createContext<LanguageContextType>({
  lang: 'en',
  t: TRANSLATIONS['en'],
  setLang: () => { },
});

export function useLanguage() {
  return useContext(LanguageContext);
}
