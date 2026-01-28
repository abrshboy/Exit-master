
import React, { useState, useEffect, useCallback } from 'react';
import { Course, Question, User } from '../types';
import { db } from '../services/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { Button, Card } from '../components/UI';
import { Timer, ArrowRight, CheckCircle, XCircle, ChevronLeft, Info, Loader2 } from 'lucide-react';

interface PracticeSessionProps {
  course: Course;
  user: User;
  onExit: () => void;
}

const PracticeSession: React.FC<PracticeSessionProps> = ({ course, user, onExit }) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(120);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  // Load Saved Progress
  useEffect(() => {
    const loadProgress = async () => {
      const progDoc = await getDoc(doc(db, `users/${user.id}/practiceProgress/${course.id}`));
      if (progDoc.exists()) {
        setCurrentIdx(progDoc.data().lastIndex || 0);
      }
      setLoading(false);
    };
    loadProgress();
  }, [course.id, user.id]);

  const saveProgress = async (idx: number) => {
    await setDoc(doc(db, `users/${user.id}/practiceProgress/${course.id}`), {
      lastIndex: idx,
      updatedAt: new Date().toISOString()
    });
  };

  const handleNext = useCallback(async () => {
    if (currentIdx < course.questions.length - 1) {
      const nextIdx = currentIdx + 1;
      setCurrentIdx(nextIdx);
      setSelectedAnswer(null);
      setShowFeedback(false);
      setTimeLeft(120);
      await saveProgress(nextIdx);
    } else {
      await saveProgress(0); // Reset progress on completion
      onExit();
    }
  }, [currentIdx, course.questions.length, onExit]);

  useEffect(() => {
    if (showFeedback && isCorrect) {
      const timer = setTimeout(handleNext, 1500);
      return () => clearTimeout(timer);
    }
  }, [showFeedback, isCorrect, handleNext]);

  useEffect(() => {
    if (timeLeft > 0 && !showFeedback && !loading) {
      const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
      return () => clearInterval(timer);
    } else if (timeLeft === 0 && !showFeedback) {
      setShowFeedback(true);
      setIsCorrect(false);
    }
  }, [timeLeft, showFeedback, loading]);

  const handleSelect = (idx: number) => {
    if (showFeedback) return;
    setSelectedAnswer(idx);
    setShowFeedback(true);
    const correct = idx === course.questions[currentIdx].correctIndex;
    setIsCorrect(correct);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
    </div>
  );

  const question = course.questions[currentIdx];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-white border-b border-gray-200 py-4 px-6 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <button onClick={onExit} className="flex items-center gap-2 text-gray-500 hover:text-indigo-600 transition-colors">
            <ChevronLeft className="w-5 h-5" />
            <span className="font-medium">Exit Practice</span>
          </button>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 font-mono text-lg text-indigo-600 font-bold bg-indigo-50 px-4 py-1 rounded-full">
              <Timer className="w-5 h-5" />
              {formatTime(timeLeft)}
            </div>
            <div className="text-gray-400 font-medium">
              Question {currentIdx + 1} / {course.questions.length}
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-4xl w-full mx-auto p-6 flex flex-col items-center justify-center">
        <div className="w-full bg-gray-200 h-1.5 rounded-full mb-10 overflow-hidden">
          <div className="bg-indigo-600 h-full transition-all duration-500" style={{ width: `${((currentIdx + 1) / course.questions.length) * 100}%` }} />
        </div>
        <Card className="w-full relative overflow-hidden p-10">
          {showFeedback && <div className={`absolute top-0 left-0 w-full h-1 ${isCorrect ? 'bg-emerald-500' : 'bg-red-500'}`} />}
          <h2 className="text-2xl font-bold text-gray-900 mb-8 leading-relaxed">{question.text}</h2>
          <div className="space-y-4">
            {question.options.map((option, idx) => {
              let state = "default";
              if (showFeedback) {
                if (idx === question.correctIndex) state = "correct";
                else if (idx === selectedAnswer && !isCorrect) state = "wrong";
                else state = "disabled";
              }
              const styles = {
                default: "border-gray-200 hover:border-indigo-400 hover:bg-indigo-50",
                correct: "border-emerald-500 bg-emerald-50 ring-2 ring-emerald-500",
                wrong: "border-red-500 bg-red-50 ring-2 ring-red-500",
                disabled: "border-gray-100 opacity-60"
              };
              return (
                <button key={idx} disabled={showFeedback} onClick={() => handleSelect(idx)} className={`w-full p-5 text-left rounded-xl border-2 transition-all flex items-center justify-between group ${styles[state as keyof typeof styles]}`}>
                  <span className={`text-lg font-medium ${state === 'disabled' ? 'text-gray-400' : 'text-gray-800'}`}>{option}</span>
                  {state === 'correct' && <CheckCircle className="text-emerald-600 w-6 h-6" />}
                  {state === 'wrong' && <XCircle className="text-red-600 w-6 h-6" />}
                </button>
              );
            })}
          </div>
          {showFeedback && !isCorrect && (
            <div className="mt-8 animate-in slide-in-from-bottom-4 duration-500">
              <div className="p-6 bg-red-50 rounded-xl border border-red-100">
                <div className="flex items-center gap-2 text-red-700 font-bold mb-3"><Info className="w-5 h-5" /> Explanation</div>
                <p className="text-red-900 leading-relaxed">{question.explanation}</p>
                <div className="mt-6">
                  <Button onClick={handleNext} className="w-full py-4 flex items-center justify-center gap-2">Next Question <ArrowRight className="w-5 h-5" /></Button>
                </div>
              </div>
            </div>
          )}
          {showFeedback && isCorrect && (
            <div className="mt-8 text-center text-emerald-600 font-bold flex items-center justify-center gap-2 animate-pulse">
              <CheckCircle className="w-6 h-6" /> Correct! Resuming...
            </div>
          )}
        </Card>
      </main>
    </div>
  );
};

export default PracticeSession;
