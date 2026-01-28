
import React from 'react';
import { Question } from '../types';

interface ExamSidebarProps {
  questions: Question[];
  currentIndex: number;
  answers: Record<string, number | null>;
  flags: Record<string, boolean>;
  onNavigate: (index: number) => void;
}

export const ExamSidebar: React.FC<ExamSidebarProps> = ({ 
  questions, 
  currentIndex, 
  answers, 
  flags, 
  onNavigate 
}) => {
  return (
    <div className="flex flex-col h-full">
      <h3 className="text-lg font-black mb-4 text-gray-800 uppercase tracking-tighter">Session Map</h3>
      <div className="grid grid-cols-5 gap-2 overflow-y-auto pr-2 max-h-[calc(100vh-300px)]">
        {questions.map((q, idx) => {
          const isAnswered = answers[q.id] !== undefined && answers[q.id] !== null;
          const isFlagged = flags[q.id];
          const isCurrent = currentIndex === idx;

          let bgColor = "bg-white border-gray-200";
          let textColor = "text-gray-600";

          if (isCurrent) {
            bgColor = "bg-teal-600 border-teal-600";
            textColor = "text-white";
          } else if (isFlagged) {
            bgColor = "bg-amber-100 border-amber-400";
            textColor = "text-amber-800";
          } else if (isAnswered) {
            bgColor = "bg-emerald-100 border-emerald-400";
            textColor = "text-emerald-800";
          }

          return (
            <button
              key={q.id}
              onClick={() => onNavigate(idx)}
              className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold border transition-all ${bgColor} ${textColor} hover:brightness-95 active:scale-90`}
            >
              {idx + 1}
            </button>
          );
        })}
      </div>
      
      <div className="mt-8 space-y-3 pt-6 border-t border-gray-100">
        <div className="flex items-center gap-3 text-xs font-bold text-gray-500 uppercase tracking-widest">
          <div className="w-3 h-3 rounded bg-emerald-100 border border-emerald-400" />
          <span>Completed</span>
        </div>
        <div className="flex items-center gap-3 text-xs font-bold text-gray-500 uppercase tracking-widest">
          <div className="w-3 h-3 rounded bg-amber-100 border border-amber-400" />
          <span>Flagged</span>
        </div>
        <div className="flex items-center gap-3 text-xs font-bold text-gray-500 uppercase tracking-widest">
          <div className="w-3 h-3 rounded bg-white border border-gray-200" />
          <span>Pending</span>
        </div>
        <div className="flex items-center gap-3 text-xs font-bold text-gray-500 uppercase tracking-widest">
          <div className="w-3 h-3 rounded bg-teal-600" />
          <span>Active</span>
        </div>
      </div>
    </div>
  );
};
