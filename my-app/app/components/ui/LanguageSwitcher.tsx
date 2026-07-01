'use client';

import { useLanguage } from '../../context/LanguageContext';
import { Language } from '../../constants/translations';

export default function LanguageSwitcher() {
  const { lang, setLang } = useLanguage();

  return (
    <div className="flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 p-1">
      {(['en', 'th'] as Language[]).map((code) => (
        <button
          key={code}
          type="button"
          onClick={() => setLang(code)}
          className={`inline-flex h-8 min-w-[2.5rem] items-center justify-center rounded-full px-3 text-sm font-semibold transition-all duration-200 ${
            lang === code
              ? 'bg-slate-950 text-white shadow-sm'
              : 'text-slate-500 hover:text-slate-900'
          }`}
          aria-label={`Switch to ${code === 'en' ? 'English' : 'Thai'}`}
        >
          {code.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
