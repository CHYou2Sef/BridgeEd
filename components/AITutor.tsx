
import React, { useState, useRef, useEffect } from 'react';
import { Language, ChatMessage } from '../types';
import { getTutorResponse } from '../services/gemini';
import { UI_TEXT } from '../constants';

interface Props {
  lang: Language;
}

const AITutor: React.FC<Props> = ({ lang }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load history from localStorage on mount
  useEffect(() => {
    const savedHistory = localStorage.getItem(`bridge_ed_tutor_chat_${lang}`);
    if (savedHistory) {
      try {
        setMessages(JSON.parse(savedHistory));
      } catch (e) {
        console.error("Failed to parse chat history", e);
      }
    }
  }, [lang]);

  // Save history to localStorage when messages change
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem(`bridge_ed_tutor_chat_${lang}`, JSON.stringify(messages));
    }
  }, [messages, lang]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    
    const userMsg: ChatMessage = { 
      role: 'user', 
      text: input, 
      timestamp: Date.now() 
    };
    
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      const response = await getTutorResponse(newMessages, lang);
      const modelMsg: ChatMessage = { 
        role: 'model', 
        text: response, 
        timestamp: Date.now() 
      };
      setMessages(prev => [...prev, modelMsg]);
    } catch (error) {
      console.error("Tutor Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const clearHistory = () => {
    if (window.confirm(lang === 'ar' ? 'هل تريد مسح سجل الدردشة؟' : 'Clear chat history?')) {
      setMessages([]);
      localStorage.removeItem(`bridge_ed_tutor_chat_${lang}`);
    }
  };

  return (
    <div className="flex flex-col h-[500px] bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm">
      {/* Header */}
      <div className="p-5 border-b bg-white flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-100 font-black">
              AI
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></span>
          </div>
          <div>
            <h3 className="font-black text-slate-900 text-sm leading-tight">
              {UI_TEXT[lang].aiTutor}
            </h3>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Insight</span>
          </div>
        </div>
        
        <button 
          onClick={clearHistory}
          className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
          title="Clear History"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
      
      {/* Chat Area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/30">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-4">
            <div className="w-16 h-16 bg-white rounded-3xl shadow-sm border border-slate-100 flex items-center justify-center">
              <svg className="w-8 h-8 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <p className="text-slate-400 text-sm font-medium italic">
              {lang === 'ar' ? 'ابدأ حواراً مع معلمك الذكي' : 'Start a conversation with your tutor. Your history is saved automatically.'}
            </p>
          </div>
        )}
        
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
            <div className={`max-w-[85%] p-4 rounded-3xl ${
              m.role === 'user' 
                ? 'bg-slate-900 text-white rounded-tr-none shadow-xl shadow-slate-200' 
                : 'bg-white text-slate-700 rounded-tl-none border border-slate-100 shadow-sm'
            }`}>
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{m.text}</p>
              <span className={`text-[9px] mt-2 block font-bold uppercase tracking-widest ${m.role === 'user' ? 'text-white/40' : 'text-slate-300'}`}>
                {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start animate-in fade-in duration-300">
            <div className="bg-white border border-slate-100 p-4 rounded-3xl rounded-tl-none shadow-sm flex items-center space-x-2">
              <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce"></div>
              <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
              <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-5 bg-white border-t border-slate-100">
        <div className="relative flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder={UI_TEXT[lang].chatPlaceholder}
            className="w-full pl-6 pr-14 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 transition-all font-medium text-slate-700"
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="absolute right-2 p-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all disabled:opacity-30 disabled:grayscale shadow-lg shadow-indigo-100 active:scale-95"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AITutor;
