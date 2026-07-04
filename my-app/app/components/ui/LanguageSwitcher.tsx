'use client';

import { useLanguage } from '../../context/LanguageContext';
import { Language } from '../../constants/translations';

export default function LanguageSwitcher() {
  const { lang, setLang } = useLanguage();

  return (
    <div className="flex items-center gap-1.5 rounded-full border-[1.5px] border-amber-300 bg-teal-50 p-1.5">
      {(['en', 'th'] as Language[]).map((code) => (
        <button
          key={code}
          type="button"
          onClick={() => setLang(code)}
          className={`inline-flex h-10 min-w-[3.25rem] items-center justify-center rounded-full px-4 text-base font-semibold transition-all duration-200 ${lang === code
            ? 'bg-teal-800 text-white shadow-sm'
            : 'text-slate-500 hover:text-teal-900'
            }`}
          aria-label={`Switch to ${code === 'en' ? 'English' : 'Thai'}`}
        >
          {code.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
