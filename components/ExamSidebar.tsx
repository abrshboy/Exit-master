
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
      <h3 className="text-lg font-semibold mb-4 text-gray-800">Exam Map</h3>
      <div className="grid grid-cols-5 gap-2 overflow-y-auto pr-2 max-h-[calc(100vh-300px)]">
        {questions.map((q, idx) => {
          const isAnswered = answers[q.id] !== undefined && answers[q.id] !== null;
          const isFlagged = flags[q.id];
          const isCurrent = currentIndex === idx;

          let bgColor = "bg-white border-gray-200";
          let textColor = "text-gray-600";

          if (isCurrent) {
            bgColor = "bg-indigo-600 border-indigo-600";
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
              className={`w-10 h-10 rounded flex items-center justify-center text-sm font-medium border transition-colors ${bgColor} ${textColor} hover:brightness-95`}
            >
              {idx + 1}
            </button>
          );
        })}
      </div>
      
      <div className="mt-8 space-y-3 pt-6 border-t border-gray-100">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <div className="w-4 h-4 rounded bg-emerald-100 border border-emerald-400" />
          <span>Answered</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <div className="w-4 h-4 rounded bg-amber-100 border border-amber-400" />
          <span>Flagged</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <div className="w-4 h-4 rounded bg-white border border-gray-200" />
          <span>Not Visited</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <div className="w-4 h-4 rounded bg-indigo-600" />
          <span>Current</span>
        </div>
      </div>
    </div>
  );
};
