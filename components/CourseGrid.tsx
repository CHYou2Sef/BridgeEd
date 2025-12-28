
import React, { useState, useMemo } from 'react';
import { Course, Language, Region, SubscriptionTier, Enrollment } from '../types';
import { MOCK_COURSES, UI_TEXT } from '../constants';

interface Props {
  lang: Language;
  region: Region;
  enrollments: Enrollment[];
  subscription: SubscriptionTier;
  onToggleEnroll: (id: string) => void;
  onPractice: (course: Course) => void;
  onUpdateDueDate: (courseId: string, dueDate: string) => void;
  showOnlyEnrolled?: boolean;
}

const CourseGrid: React.FC<Props> = ({ 
  lang, 
  region, 
  enrollments, 
  subscription,
  onToggleEnroll, 
  onPractice,
  onUpdateDueDate,
  showOnlyEnrolled = false 
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCourses = useMemo(() => {
    return MOCK_COURSES.filter(c => {
      // 1. Filter by enrollment if in "My Learning" tab
      const isEnrolled = enrollments.some(e => e.courseId === c.id);
      if (showOnlyEnrolled && !isEnrolled) return false;
      
      // 2. Filter by region if in "Catalog" tab
      if (!showOnlyEnrolled && !c.region.includes(region)) return false;

      // 3. Filter by search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const titleMatch = c.title[lang]?.toLowerCase().includes(query);
        const descMatch = c.description[lang]?.toLowerCase().includes(query);
        if (!titleMatch && !descMatch) return false;
      }

      return true;
    });
  }, [enrollments, showOnlyEnrolled, region, searchQuery, lang]);

  return (
    <div className="space-y-8">
      {/* Search Bar */}
      <div className="relative group max-w-2xl">
        <div className="absolute inset-y-0 left-0 flex items-center pl-5 pointer-events-none">
          <svg className="w-5 h-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={UI_TEXT[lang].searchPlaceholder}
          className="w-full pl-12 pr-6 py-4 bg-white border border-slate-200 rounded-3xl shadow-sm focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 outline-none transition-all font-medium text-slate-700 placeholder-slate-400"
        />
        {searchQuery && (
          <button 
            onClick={() => setSearchQuery('')}
            className="absolute inset-y-0 right-4 flex items-center px-2 text-slate-300 hover:text-slate-500 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {filteredCourses.length === 0 ? (
        <div className="text-center py-20 bg-slate-100 rounded-2xl border-2 border-dashed border-slate-300">
          <p className="text-slate-500 font-medium">{UI_TEXT[lang].emptyLearning}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredCourses.map((course) => {
            const enrollment = enrollments.find(e => e.courseId === course.id);
            const isEnrolled = !!enrollment;
            const isPro = subscription === 'pro';
            const progress = enrollment?.progress || 0;
            
            return (
              <div key={course.id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 border border-slate-100 group flex flex-col h-full animate-in fade-in zoom-in duration-300">
                <div className="relative h-48 overflow-hidden">
                  <img 
                    src={course.thumbnail} 
                    alt={course.title[lang]} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-4 right-4 bg-white/95 backdrop-blur px-3 py-1 rounded-full text-[10px] font-black text-indigo-600 uppercase tracking-widest shadow-sm">
                    {course.category}
                  </div>
                  <div className="absolute bottom-4 left-4 flex gap-2">
                     <span className="bg-slate-900/80 backdrop-blur text-white px-2 py-0.5 rounded text-[10px] uppercase font-bold">
                       {course.duration}
                     </span>
                     <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold text-white ${
                        course.difficulty === 'beginner' ? 'bg-emerald-500/80' : 
                        course.difficulty === 'intermediate' ? 'bg-orange-500/80' : 'bg-red-500/80'
                     }`}>
                       {course.difficulty}
                     </span>
                  </div>
                </div>
                
                <div className="p-6 flex-1 flex flex-col">
                  <h3 className="text-xl font-bold mb-3 group-hover:text-indigo-600 transition-colors leading-tight">
                    {course.title[lang]}
                  </h3>
                  
                  {isEnrolled && (
                    <div className="mb-4 space-y-2">
                      <div className="flex justify-between items-end">
                        <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                          {UI_TEXT[lang].progress}
                        </span>
                        <span className="text-sm font-black text-indigo-600">{progress}%</span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-indigo-600 transition-all duration-1000 ease-out rounded-full shadow-[0_0_10px_rgba(79,70,229,0.3)]"
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>
                    </div>
                  )}

                  <p className="text-slate-500 text-sm mb-4 line-clamp-2">
                    {course.description[lang]}
                  </p>

                  {isEnrolled && (
                    <div className="mb-6 p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                          {UI_TEXT[lang].dueDate}
                        </span>
                        {!editingId || editingId !== course.id ? (
                          <button 
                            onClick={() => setEditingId(course.id)}
                            className="text-[10px] font-bold text-indigo-600 hover:underline"
                          >
                            {UI_TEXT[lang].setDeadline}
                          </button>
                        ) : null}
                      </div>
                      {editingId === course.id ? (
                        <input 
                          type="date"
                          autoFocus
                          defaultValue={enrollment?.dueDate}
                          className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
                          onChange={(e) => {
                            onUpdateDueDate(course.id, e.target.value);
                            setEditingId(null);
                          }}
                          onBlur={() => setEditingId(null)}
                        />
                      ) : (
                        <p className="text-sm font-bold text-slate-700">
                          {enrollment?.dueDate || UI_TEXT[lang].noDeadline}
                        </p>
                      )}
                    </div>
                  )}
                  
                  <div className="mt-auto space-y-3">
                    {isEnrolled ? (
                      <>
                        <div className="flex gap-2">
                          <button className="flex-1 bg-indigo-600 text-white py-2.5 rounded-xl font-bold text-sm hover:bg-indigo-700 transition-colors shadow-md shadow-indigo-200">
                            {UI_TEXT[lang].startLearning}
                          </button>
                          <button 
                            onClick={() => onPractice(course)}
                            className={`p-2.5 rounded-xl border-2 transition-all flex items-center justify-center relative ${
                              isPro ? 'border-indigo-100 text-indigo-600 hover:bg-indigo-50' : 'border-slate-100 text-slate-300 cursor-not-allowed opacity-60'
                            }`}
                            title={isPro ? UI_TEXT[lang].practice : UI_TEXT[lang].upgrade}
                          >
                             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                               <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                             </svg>
                             {!isPro && <span className="absolute -top-1 -right-1 text-[8px] bg-indigo-600 text-white px-1 rounded-full">PRO</span>}
                          </button>
                        </div>
                        <button 
                          onClick={() => onToggleEnroll(course.id)}
                          className="w-full text-slate-300 hover:text-red-400 text-[10px] uppercase font-bold tracking-widest transition-colors py-1"
                        >
                          {UI_TEXT[lang].unenroll}
                        </button>
                      </>
                    ) : (
                      <button 
                        onClick={() => onToggleEnroll(course.id)}
                        className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold hover:bg-slate-800 transition-all active:scale-[0.98] shadow-lg shadow-slate-200"
                      >
                        {UI_TEXT[lang].enroll}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CourseGrid;
