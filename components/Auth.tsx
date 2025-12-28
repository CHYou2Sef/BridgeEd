
import React, { useState } from 'react';
import { Language, SubscriptionTier, User } from '../types';
import { UI_TEXT } from '../constants';
import { auth } from '../services/auth';

interface Props {
  lang: Language;
  onAuthComplete: (user: User) => void;
}

const Auth: React.FC<Props> = ({ lang, onAuthComplete }) => {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [tier, setTier] = useState<SubscriptionTier>('free');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (mode === 'login') {
        const session = await auth.signIn(email, password);
        if (session.user) onAuthComplete(session.user);
      } else {
        const session = await auth.signUp(email, name, tier);
        if (session.user) onAuthComplete(session.user);
      }
    } catch (err) {
      setError('Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] p-6 relative overflow-hidden">
      {/* Dynamic Background */}
      <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-500 rounded-full blur-[120px]"></div>
      </div>

      <div className="w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 p-8 md:p-12 relative z-10 animate-in fade-in zoom-in duration-500">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-indigo-600 rounded-3xl flex items-center justify-center text-white text-3xl font-black shadow-2xl shadow-indigo-100 mx-auto mb-6">B</div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">
            {mode === 'login' ? UI_TEXT[lang].login : UI_TEXT[lang].createAccount}
          </h1>
          <p className="text-slate-400 font-medium text-sm">
            {UI_TEXT[lang].authSubtitle}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {mode === 'signup' && (
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ms-1">{UI_TEXT[lang].fullName}</label>
              <input
                required
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 outline-none transition-all font-medium text-slate-700"
                placeholder="Jane Doe"
              />
            </div>
          )}

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ms-1">{UI_TEXT[lang].email}</label>
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 outline-none transition-all font-medium text-slate-700"
              placeholder="jane@example.com"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ms-1">{UI_TEXT[lang].password}</label>
            <input
              required
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 outline-none transition-all font-medium text-slate-700"
              placeholder="••••••••"
            />
          </div>

          {mode === 'signup' && (
            <div className="space-y-4 pt-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ms-1">{UI_TEXT[lang].selectTier}</label>
              <div className="grid grid-cols-3 gap-3">
                {(['free', 'student', 'pro'] as SubscriptionTier[]).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTier(t)}
                    className={`py-3 rounded-xl border-2 text-[10px] font-black uppercase tracking-widest transition-all ${
                      tier === t ? 'border-indigo-600 bg-indigo-600 text-white shadow-lg' : 'border-slate-100 text-slate-400 hover:border-slate-200'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          )}

          {error && <p className="text-red-500 text-xs font-bold text-center mt-4">{error}</p>}

          <button
            disabled={loading}
            type="submit"
            className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black text-lg hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 mt-4 disabled:opacity-50 flex justify-center items-center gap-2"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              mode === 'login' ? UI_TEXT[lang].login : UI_TEXT[lang].signup
            )}
          </button>
        </form>

        <div className="mt-10 text-center">
          <p className="text-slate-400 text-sm font-medium">
            {mode === 'login' ? UI_TEXT[lang].noAccount : UI_TEXT[lang].hasAccount}{' '}
            <button
              onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
              className="text-indigo-600 font-black hover:underline transition-all"
            >
              {mode === 'login' ? UI_TEXT[lang].signup : UI_TEXT[lang].login}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
