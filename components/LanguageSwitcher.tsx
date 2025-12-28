
import React from 'react';
import { Language, Region } from '../types';

interface Props {
  lang: Language;
  setLang: (l: Language) => void;
  region: Region;
  setRegion: (r: Region) => void;
}

const LanguageSwitcher: React.FC<Props> = ({ lang, setLang, region, setRegion }) => {
  return (
    <div className="flex flex-wrap items-center gap-4 p-4 bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="flex items-center space-x-2 bg-slate-100 p-1 rounded-lg">
        {(['en', 'fr', 'ar'] as Language[]).map((l) => (
          <button
            key={l}
            onClick={() => setLang(l)}
            className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
              lang === l ? 'bg-indigo-600 text-white shadow' : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            {l.toUpperCase()}
          </button>
        ))}
      </div>
      
      <div className="h-6 w-px bg-slate-300 hidden sm:block"></div>

      <div className="flex items-center space-x-2 bg-slate-100 p-1 rounded-lg">
        {(['west', 'arab'] as Region[]).map((r) => (
          <button
            key={r}
            onClick={() => setRegion(r)}
            className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
              region === r ? 'bg-emerald-600 text-white shadow' : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            {r.charAt(0).toUpperCase() + r.slice(1)}
          </button>
        ))}
      </div>
    </div>
  );
};

export default LanguageSwitcher;
