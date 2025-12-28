
import React, { useState, useEffect } from 'react';
import { Language, Region, Course, User, SubscriptionTier } from './types';
import { UI_TEXT } from './constants';
import LanguageSwitcher from './components/LanguageSwitcher';
import CourseGrid from './components/CourseGrid';
import AITutor from './components/AITutor';
import Forum from './components/Forum';
import CoursePractice from './components/CoursePractice';
import Auth from './components/Auth';
import { gateway } from './services/api';
import { auth } from './services/auth';

const App: React.FC = () => {
  const [lang, setLang] = useState<Language>('en');
  const [region, setRegion] = useState<Region>('west');
  const [activeTab, setActiveTab] = useState<'explore' | 'my-courses'>('explore');
  const [user, setUser] = useState<User | null>(null);
  const [practicingCourse, setPracticingCourse] = useState<Course | null>(null);
  const [showHealth, setShowHealth] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  // Auth Initialization
  useEffect(() => {
    const session = auth.getSession();
    if (session.user) {
      setUser(session.user);
    }
    setIsInitializing(false);
  }, []);

  // RTL/LTR Orchestration
  useEffect(() => {
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, [lang]);

  const toggleEnroll = (id: string) => {
    if (!user) return;
    const newEnrolled = user.enrolled.includes(id) 
      ? user.enrolled.filter(i => i !== id) 
      : [...user.enrolled, id];
    
    const updatedUser = { ...user, enrolled: newEnrolled };
    setUser(updatedUser);
    // Persist to simulated local session
    const session = auth.getSession();
    localStorage.setItem('bridge_ed_session', JSON.stringify({ ...session, user: updatedUser }));
  };

  const handleLogout = () => {
    auth.signOut();
    setUser(null);
    setPracticingCourse(null);
  };

  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <Auth lang={lang} onAuthComplete={setUser} />;
  }

  const isPro = user.tier === 'pro';

  return (
    <div className={`min-h-screen bg-[#F8FAFC] flex flex-col font-sans selection:bg-indigo-100 selection:text-indigo-900 ${lang === 'ar' ? 'rtl' : 'ltr'}`}>
      <LanguageSwitcher 
        lang={lang} 
        setLang={setLang} 
        region={region} 
        setRegion={setRegion} 
      />

      <main className="max-w-7xl mx-auto w-full px-4 md:px-6 py-10 flex-1">
        
        {/* Pro Dashboard Header */}
        <header className="mb-14 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
          <div className="space-y-2">
            <h1 className="text-5xl font-black text-slate-900 tracking-tight leading-none">
              BridgeEd <span className="text-indigo-600">.</span>
            </h1>
            <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-xs">
              {UI_TEXT[lang].tagline}
            </p>
          </div>
          
          <div className="flex items-center gap-4 bg-white p-3 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100/50">
            <div className="px-4 py-2 flex flex-col border-e border-slate-100 pe-6">
              <span className="text-[10px] font-black uppercase text-slate-400 tracking-tighter">Account</span>
              <span className="text-sm font-bold text-slate-900">{user.name}</span>
            </div>
            <div className={`px-5 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
              isPro ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'bg-slate-100 text-slate-400'
            }`}>
              {isPro ? UI_TEXT[lang].proStatus : UI_TEXT[lang].freeStatus}
            </div>
            <button 
              onClick={handleLogout}
              className="px-5 py-2 text-[10px] font-black uppercase tracking-widest text-red-500 hover:bg-red-50 rounded-2xl transition-all"
            >
              {UI_TEXT[lang].logout}
            </button>
            <div className="w-px h-8 bg-slate-100 mx-1"></div>
            <button 
              onClick={() => setShowHealth(!showHealth)}
              className={`p-2 rounded-xl transition-colors ${showHealth ? 'bg-slate-100 text-slate-900' : 'text-slate-300'}`}
              title="System Health"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </button>
          </div>
        </header>

        {/* Health Dashboard */}
        {showHealth && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10 animate-in slide-in-from-top duration-500">
            {gateway.health.map(svc => (
              <div key={svc.name} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider">{svc.name}</div>
                  <div className="text-sm font-bold text-slate-700">{svc.latency}ms</div>
                </div>
                <div className={`w-2 h-2 rounded-full ${svc.status === 'online' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-red-500 animate-pulse'}`}></div>
              </div>
            ))}
          </div>
        )}

        {/* Dynamic Content Switching */}
        <div className="flex gap-10 border-b border-slate-200/60 mb-12">
          {(['explore', 'my-courses'] as const).map(tab => (
            <button 
              key={tab}
              onClick={() => { setActiveTab(tab); setPracticingCourse(null); }}
              className={`pb-5 text-[11px] font-black uppercase tracking-[0.25em] transition-all border-b-2 px-1 relative ${
                activeTab === tab 
                  ? 'border-indigo-600 text-indigo-600' 
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              {UI_TEXT[lang][tab === 'explore' ? 'explore' : 'courses']}
              {tab === 'my-courses' && user.enrolled.length > 0 && (
                <span className="ms-3 inline-flex items-center justify-center w-5 h-5 bg-indigo-600 text-white rounded-lg text-[9px] shadow-lg shadow-indigo-100">
                  {user.enrolled.length}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          <div className="lg:col-span-8 space-y-16">
            {practicingCourse ? (
              <CoursePractice 
                course={practicingCourse} 
                lang={lang} 
                onClose={() => setPracticingCourse(null)} 
              />
            ) : (
              <div className="animate-in fade-in duration-700">
                <CourseGrid 
                  lang={lang} 
                  region={region} 
                  enrolledIds={user.enrolled}
                  subscription={user.tier}
                  onToggleEnroll={toggleEnroll}
                  onPractice={setPracticingCourse}
                  showOnlyEnrolled={activeTab === 'my-courses'}
                />
              </div>
            )}

            {activeTab === 'explore' && !practicingCourse && (
              <div className="bg-white/50 backdrop-blur rounded-[2.5rem] p-1 shadow-inner border border-slate-200/40">
                <Forum lang={lang} />
              </div>
            )}
          </div>

          <aside className="lg:col-span-4 space-y-10">
            <div className="sticky top-24 space-y-10">
               <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-indigo-50/50 p-1 border border-indigo-50/50">
                 <AITutor lang={lang} />
               </div>
               
               <div className="p-10 bg-slate-900 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden group">
                 <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-500/20 rounded-full -mr-20 -mt-20 blur-3xl group-hover:bg-emerald-500/20 transition-all duration-1000"></div>
                 <div className="relative z-10 space-y-6">
                   <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
                      <svg className="w-6 h-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                   </div>
                   <h4 className="text-2xl font-black tracking-tight">{lang === 'ar' ? 'رؤيتنا الرقمية' : 'Digital Vision'}</h4>
                   <p className="text-slate-400 text-sm leading-relaxed font-medium">
                     {lang === 'ar' 
                       ? 'تحويل التعليم عبر دمج الذكاء الاصطناعي مع القيم الثقافية لتمكين الجيل القادم.'
                       : 'Transforming education by fusing bleeding-edge AI with deep cultural insights for global impact.'}
                   </p>
                   <div className="pt-4 flex flex-wrap gap-2">
                      {['Supabase', 'Edge-Runtime', 'gRPC', 'GenAI'].map(tag => (
                        <span key={tag} className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[8px] font-black uppercase tracking-widest text-slate-500">{tag}</span>
                      ))}
                   </div>
                 </div>
               </div>
            </div>
          </aside>
        </div>
      </main>

      <footer className="bg-white border-t border-slate-100 py-20 px-6 mt-32">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-16 items-center">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-indigo-600 rounded-3xl flex items-center justify-center text-white text-2xl font-black shadow-xl shadow-indigo-100">B</div>
            <div>
              <span className="font-black text-3xl tracking-tighter text-slate-900">BridgeEd</span>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em]">Scalable Learning</div>
            </div>
          </div>
          <div className="text-center">
            <p className="text-slate-400 text-sm font-medium leading-relaxed">
              Standardizing cross-cultural education through high-availability infrastructure.<br/>
              Supporting UNESCO SDG 4 targets.
            </p>
          </div>
          <div className="flex justify-end gap-10">
             {['Platform', 'Engineering', 'Ethics'].map(link => (
               <a key={link} href="#" className="text-slate-900 font-black text-[11px] uppercase tracking-widest hover:text-indigo-600 transition-colors">{link}</a>
             ))}
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
