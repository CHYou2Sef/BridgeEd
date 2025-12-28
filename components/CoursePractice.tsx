
import React, { useState, useEffect, useCallback } from 'react';
import { Course, Language, Exercise, GradeResult } from '../types';
import { gateway } from '../services/api';
import { UI_TEXT } from '../constants';

interface Props {
  course: Course;
  lang: Language;
  onClose: () => void;
  onSuccessfulPractice?: (courseId: string) => void;
}

const CoursePractice: React.FC<Props> = ({ course, lang, onClose, onSuccessfulPractice }) => {
  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [result, setResult] = useState<GradeResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [grading, setGrading] = useState(false);

  const fetchExercise = useCallback(async () => {
    setLoading(true);
    setResult(null);
    setUserAnswer('');
    try {
      const ex = await gateway.fetchPersonalizedExercise(course, lang);
      setExercise(ex);
    } catch (e) {
      console.error("[Inference Error]", e);
    } finally {
      setLoading(false);
    }
  }, [course, lang]);

  useEffect(() => {
    fetchExercise();
  }, [fetchExercise]);

  const handleGrade = async () => {
    if (!exercise || !userAnswer.trim()) return;
    setGrading(true);
    try {
      const res = await gateway.submitGrading(exercise, userAnswer, lang);
      setResult(res);
      if (res.isCorrect && onSuccessfulPractice) {
        onSuccessfulPractice(course.id);
      }
    } catch (e) {
      console.error("[Grading Svc Error]", e);
    } finally {
      setGrading(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-2xl p-4 md:p-10 max-w-4xl mx-auto border border-slate-100 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500"></div>
      
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">{UI_TEXT[lang].practice}</h2>
          <p className="text-slate-500 text-sm font-medium">{course.title[lang]}</p>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
          <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {loading ? (
        <div className="py-24 flex flex-col items-center justify-center space-y-4">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-slate-100 border-t-indigo-600 rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-2 h-2 bg-indigo-600 rounded-full animate-pulse"></div>
            </div>
          </div>
          <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] animate-pulse">Orchestrating AI Microservice...</p>
        </div>
      ) : exercise ? (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="p-8 bg-indigo-50/50 rounded-2xl border border-indigo-100/50 relative">
             <span className="absolute -top-3 left-6 px-3 py-1 bg-white border border-indigo-100 rounded-full text-[10px] font-black text-indigo-600 uppercase">Question</span>
             <p className="text-xl font-medium text-slate-800 leading-relaxed italic">"{exercise.question}"</p>
          </div>

          <div className="space-y-4">
            {exercise.type === 'multiple-choice' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {exercise.options?.map((opt, i) => (
                  <button
                    key={i}
                    onClick={() => !result && setUserAnswer(opt)}
                    className={`p-5 text-left rounded-2xl border-2 transition-all font-medium ${
                      userAnswer === opt 
                        ? 'border-indigo-600 bg-indigo-600 text-white shadow-lg' 
                        : 'border-slate-100 hover:border-indigo-200 bg-white text-slate-700'
                    } ${result ? 'opacity-50 cursor-default' : ''}`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            ) : (
              <div className="relative">
                <textarea
                  value={userAnswer}
                  disabled={!!result}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  className="w-full h-40 p-6 rounded-2xl border-2 border-slate-100 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 outline-none transition-all resize-none text-slate-700"
                  placeholder="Elaborate your thoughts using critical thinking..."
                ></textarea>
                <div className="absolute bottom-4 right-4 text-[10px] font-bold text-slate-300 uppercase">Input Node: {lang.toUpperCase()}</div>
              </div>
            )}
          </div>

          {result ? (
            <div className={`p-8 rounded-2xl border shadow-xl animate-in zoom-in duration-300 ${
              result.isCorrect ? 'bg-emerald-50 border-emerald-200' : 'bg-orange-50 border-orange-200'
            }`}>
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white ${result.isCorrect ? 'bg-emerald-500' : 'bg-orange-500'}`}>
                    {result.isCorrect ? '✓' : '!'}
                  </div>
                  <div>
                    <div className="text-2xl font-black">{result.score}%</div>
                    <div className="text-[10px] font-bold uppercase tracking-wider opacity-60">System Evaluation</div>
                  </div>
                </div>
                <div className="text-right text-[10px] font-mono text-slate-400">
                  LATENCY: {result.metadata?.processingTime}ms<br/>
                  ENGINE: GEMINI-3-FLASH
                </div>
              </div>
              <p className="text-slate-700 leading-relaxed font-medium">{result.feedback}</p>
              <button 
                onClick={fetchExercise}
                className="mt-6 w-full py-3 bg-white border border-slate-200 rounded-xl font-bold text-slate-900 hover:bg-slate-50 transition-colors shadow-sm"
              >
                {UI_TEXT[lang].next}
              </button>
            </div>
          ) : (
            <div className="flex flex-col md:flex-row gap-4">
              <button
                onClick={handleGrade}
                disabled={grading || !userAnswer}
                className="flex-1 py-4 bg-slate-900 text-white rounded-2xl font-black text-lg hover:bg-slate-800 transition-all disabled:opacity-50 flex justify-center items-center gap-3 shadow-xl"
              >
                {grading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>{UI_TEXT[lang].grading}</span>
                  </>
                ) : (
                  <>
                    <span>{UI_TEXT[lang].getGrade}</span>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </>
                )}
              </button>
              <button onClick={fetchExercise} className="px-6 py-4 border-2 border-slate-100 rounded-2xl font-bold text-slate-500 hover:bg-slate-50 transition-colors">
                 Skip
              </button>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
};

export default CoursePractice;
