
import React from 'react';
import { Course, Language, Region, SubscriptionTier } from '../types';
import { MOCK_COURSES, UI_TEXT } from '../constants';

interface Props {
  lang: Language;
  region: Region;
  enrolledIds: string[];
  subscription: SubscriptionTier;
  onToggleEnroll: (id: string) => void;
  onPractice: (course: Course) => void;
  showOnlyEnrolled?: boolean;
}

const CourseGrid: React.FC<Props> = ({ 
  lang, 
  region, 
  enrolledIds, 
  subscription,
  onToggleEnroll, 
  onPractice,
  showOnlyEnrolled = false 
}) => {
  const filteredCourses = MOCK_COURSES.filter(c => {
    if (showOnlyEnrolled) {
      return enrolledIds.includes(c.id);
    }
    return c.region.includes(region);
  });

  if (showOnlyEnrolled && filteredCourses.length === 0) {
    return (
      <div className="text-center py-20 bg-slate-100 rounded-2xl border-2 border-dashed border-slate-300">
        <p className="text-slate-500 font-medium">{UI_TEXT[lang].emptyLearning}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {filteredCourses.map((course) => {
        const isEnrolled = enrolledIds.includes(course.id);
        const isPro = subscription === 'pro';
        
        return (
          <div key={course.id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 border border-slate-100 group flex flex-col h-full">
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
              <p className="text-slate-500 text-sm mb-6 line-clamp-3">
                {course.description[lang]}
              </p>
              
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
  );
};

export default CourseGrid;
