
import React, { useState } from 'react';
import { ForumPost, Language } from '../types';
import { translateText } from '../services/gemini';
import { UI_TEXT } from '../constants';

interface Props {
  lang: Language;
}

const INITIAL_POSTS: ForumPost[] = [
  {
    id: '1',
    author: 'Sarah (UK)',
    content: "How does the study of Al-Jabr influence modern algorithms?",
    language: 'en',
    timestamp: new Date()
  },
  {
    id: '2',
    author: 'Ahmed (Egypt)',
    content: "التفكير النقدي ضروري جداً لتطوير المجتمعات العربية.",
    language: 'ar',
    timestamp: new Date()
  },
  {
    id: '3',
    author: 'Lucie (France)',
    content: "La collaboration interdisciplinaire est la clé du futur.",
    language: 'fr',
    timestamp: new Date()
  }
];

const Forum: React.FC<Props> = ({ lang }) => {
  const [posts, setPosts] = useState<ForumPost[]>(INITIAL_POSTS);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleTranslate = async (post: ForumPost) => {
    if (post.translations?.[lang]) return;

    setLoadingId(post.id);
    try {
      const translation = await translateText(post.content, lang);
      setPosts(prev => prev.map(p => 
        p.id === post.id 
          ? { ...p, translations: { ...p.translations, [lang]: translation } } 
          : p
      ));
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-slate-100">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
        </svg>
        {UI_TEXT[lang].forum}
      </h2>

      <div className="space-y-4">
        {posts.map((post) => (
          <div key={post.id} className={`p-4 rounded-lg border bg-slate-50 transition-all ${post.language === 'ar' ? 'rtl' : 'ltr'}`}>
            <div className="flex justify-between items-start mb-2">
              <span className="font-bold text-slate-900">{post.author}</span>
              <span className="text-xs text-slate-500">{post.timestamp.toLocaleDateString()}</span>
            </div>
            
            <p className="text-slate-800 mb-3">{post.content}</p>
            
            {post.translations?.[lang] && (
              <div className={`p-3 bg-white rounded border border-indigo-100 text-sm italic text-slate-700 mb-3 ${lang === 'ar' ? 'rtl' : 'ltr'}`}>
                {post.translations[lang]}
              </div>
            )}

            {post.language !== lang && !post.translations?.[lang] && (
              <button 
                onClick={() => handleTranslate(post)}
                disabled={loadingId === post.id}
                className="text-xs text-indigo-600 font-bold hover:underline flex items-center gap-1"
              >
                {loadingId === post.id ? (
                  <span className="animate-spin h-3 w-3 border-2 border-indigo-600 border-t-transparent rounded-full"></span>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5a18.022 18.022 0 01-3.827-5.802M13.5 13.1c1.138 2.015 2.85 3.513 4.8 4.312M13 11a18.145 18.145 0 01-2.836 5.618M11.5 13H5m3-3a16.66 16.66 0 011.092-3.416M11 21l1.9-2m3.2-1l1.9-2" />
                  </svg>
                )}
                {UI_TEXT[lang].translate}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Forum;
