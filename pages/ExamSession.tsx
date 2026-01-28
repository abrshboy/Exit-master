
import React, { useState, useEffect } from 'react';
import { ExamBatch, ExamState } from '../types';
import { Button, Card, Badge } from '../components/UI';
import { ExamSidebar } from '../components/ExamSidebar';
import { Timer, Flag, ChevronLeft, ChevronRight, Send, AlertTriangle, CheckCircle, XCircle, GraduationCap, ArrowLeft } from 'lucide-react';

interface ExamSessionProps {
  batch: ExamBatch;
  onExit: () => void;
  onPass: () => void;
}

const ExamSession: React.FC<ExamSessionProps> = ({ batch, onExit, onPass }) => {
  const [examState, setExamState] = useState<ExamState>({
    answers: {},
    flags: {},
    currentIndex: 0,
    timeRemaining: batch.timeLimitMinutes * 60,
    isCompleted: false
  });

  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);

  useEffect(() => {
    if (examState.timeRemaining > 0 && !examState.isCompleted) {
      const timer = setInterval(() => {
        setExamState(prev => ({ ...prev, timeRemaining: prev.timeRemaining - 1 }));
      }, 1000);
      return () => clearInterval(timer);
    } else if (examState.timeRemaining === 0 && !examState.isCompleted) {
      setExamState(prev => ({ ...prev, isCompleted: true }));
    }
  }, [examState.timeRemaining, examState.isCompleted]);

  const currentQuestion = batch.questions[examState.currentIndex];

  const handleAnswer = (idx: number) => {
    setExamState(prev => ({
      ...prev,
      answers: { ...prev.answers, [currentQuestion.id]: idx }
    }));
  };

  const toggleFlag = () => {
    setExamState(prev => ({
      ...prev,
      flags: { ...prev.flags, [currentQuestion.id]: !prev.flags[currentQuestion.id] }
    }));
  };

  const navigateTo = (index: number) => {
    if (index >= 0 && index < batch.questions.length) {
      setExamState(prev => ({ ...prev, currentIndex: index }));
    }
  };

  const calculateScore = () => {
    let score = 0;
    batch.questions.forEach(q => {
      if (examState.answers[q.id] === q.correctIndex) {
        score++;
      }
    });
    return (score / batch.questions.length) * 100;
  };

  const finishExam = () => {
    const finalScore = calculateScore();
    if (finalScore >= 50) {
      onPass();
    }
    setExamState(prev => ({ ...prev, isCompleted: true }));
    setShowConfirmSubmit(false);
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (examState.isCompleted) {
    const finalScore = calculateScore();
    const passed = finalScore >= 50;
    
    return (
      <div className="min-h-screen bg-[#f8fafc] py-12 px-6">
        <div className="max-w-4xl mx-auto">
          <Card className="text-center p-16 mb-10 shadow-2xl border-none">
            <div className={`w-28 h-28 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-xl ${passed ? 'bg-emerald-100 text-emerald-600 shadow-emerald-100' : 'bg-red-100 text-red-600 shadow-red-100'}`}>
              {passed ? <CheckCircle className="w-16 h-16" /> : <XCircle className="w-16 h-16" />}
            </div>
            <h1 className="text-5xl font-black text-gray-900 mb-4 tracking-tight">
              {passed ? 'Certification Earned!' : 'Keep Learning'}
            </h1>
            <p className="text-xl text-gray-500 mb-10">{batch.name}</p>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
              <div className="p-8 rounded-3xl bg-indigo-50 border border-indigo-100">
                <p className="text-xs font-black text-indigo-400 uppercase tracking-widest">Score</p>
                <p className="text-5xl font-black text-indigo-900 mt-2">{finalScore.toFixed(0)}%</p>
              </div>
              <div className="p-8 rounded-3xl bg-white border border-gray-100 shadow-sm">
                <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Result</p>
                <p className={`text-4xl font-black mt-2 ${passed ? 'text-emerald-600' : 'text-red-600'}`}>
                  {passed ? 'PASSED' : 'FAILED'}
                </p>
              </div>
              <div className="p-8 rounded-3xl bg-white border border-gray-100 shadow-sm">
                <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Target</p>
                <p className="text-4xl font-black text-gray-900 mt-2">50%</p>
              </div>
            </div>

            <Button onClick={onExit} className="px-12 py-5 text-xl font-bold rounded-2xl">
              Back to Dashboard
            </Button>
          </Card>

          <div className="flex items-center justify-between mb-8">
            <h3 className="text-2xl font-black text-gray-900">Performance Breakdown</h3>
            <Badge variant={passed ? 'success' : 'locked'}>Reviewing {batch.questions.length} Items</Badge>
          </div>

          <div className="space-y-8">
            {batch.questions.map((q, idx) => {
              const userAnswer = examState.answers[q.id];
              const isCorrect = userAnswer === q.correctIndex;
              
              return (
                <Card key={q.id} className={`border-none shadow-md overflow-hidden p-0`}>
                  <div className={`h-2 w-full ${isCorrect ? 'bg-emerald-500' : 'bg-red-500'}`} />
                  <div className="p-8">
                    <div className="flex gap-6">
                      <span className="text-2xl font-black text-gray-200">#{idx + 1}</span>
                      <div className="flex-1">
                        <p className="text-xl font-bold text-gray-900 mb-6 leading-tight">{q.text}</p>
                        <div className="space-y-3">
                          {q.options.map((opt, oIdx) => (
                            <div 
                              key={oIdx}
                              className={`p-4 rounded-xl border-2 text-sm flex justify-between items-center ${
                                oIdx === q.correctIndex ? 'bg-emerald-50 border-emerald-200 text-emerald-800 font-bold' :
                                oIdx === userAnswer ? 'bg-red-50 border-red-200 text-red-800 font-bold' :
                                'bg-gray-50 border-gray-100 text-gray-400'
                              }`}
                            >
                              <span>{opt}</span>
                              {oIdx === q.correctIndex && <CheckCircle className="w-4 h-4 text-emerald-600" />}
                              {oIdx === userAnswer && !isCorrect && <XCircle className="w-4 h-4 text-red-600" />}
                            </div>
                          ))}
                        </div>
                        <div className="mt-6 p-6 bg-slate-50 rounded-2xl text-sm leading-relaxed border border-slate-100">
                          <span className="font-black text-slate-800 uppercase tracking-tighter mr-2">Core Insight:</span>
                          <span className="text-slate-600">{q.explanation}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col">
      <header className="bg-white border-b border-gray-100 py-6 px-8 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-100">
              <GraduationCap className="text-white w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-black text-gray-900 leading-none">{batch.name}</h1>
              <div className="flex items-center gap-2 mt-1">
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Live Exam Session</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-8">
            <div className={`flex items-center gap-3 font-mono text-2xl font-black px-8 py-3 rounded-2xl border-2 transition-all ${
              examState.timeRemaining < 300 ? 'text-red-600 border-red-200 bg-red-50 animate-pulse' : 'text-gray-900 border-gray-100 bg-white'
            }`}>
              <Timer className="w-6 h-6 text-indigo-500" />
              {formatTime(examState.timeRemaining)}
            </div>
            <Button variant="danger" onClick={() => setShowConfirmSubmit(true)} className="px-8 py-3 rounded-xl font-bold">
              Submit Results
            </Button>
          </div>
        </div>
      </header>

      <div className="flex-1 max-w-7xl w-full mx-auto p-8 flex gap-10">
        <main className="flex-1 space-y-8 pb-32">
          <div className="flex items-center justify-between">
            <Badge variant="info">Question {examState.currentIndex + 1} / {batch.totalQuestions}</Badge>
            <button 
              onClick={toggleFlag}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl border-2 font-bold transition-all ${
                examState.flags[currentQuestion.id] 
                ? 'bg-amber-100 border-amber-400 text-amber-700 shadow-md shadow-amber-50' 
                : 'bg-white border-gray-100 text-gray-400 hover:border-indigo-200 hover:text-indigo-600'
              }`}
            >
              <Flag className={`w-4 h-4 ${examState.flags[currentQuestion.id] ? 'fill-current' : ''}`} />
              {examState.flags[currentQuestion.id] ? 'Flagged for Review' : 'Flag Question'}
            </button>
          </div>

          <Card className="p-12 shadow-2xl border-none min-h-[500px] flex flex-col">
            <h2 className="text-3xl font-black text-gray-900 mb-12 leading-tight">
              {currentQuestion.text}
            </h2>

            <div className="space-y-4 flex-1">
              {currentQuestion.options.map((option, idx) => {
                const isSelected = examState.answers[currentQuestion.id] === idx;
                return (
                  <button
                    key={idx}
                    onClick={() => handleAnswer(idx)}
                    className={`w-full p-6 text-left rounded-2xl border-2 transition-all group relative flex items-center gap-5 ${
                      isSelected 
                      ? 'border-indigo-600 bg-indigo-50 shadow-lg shadow-indigo-50' 
                      : 'border-gray-50 bg-gray-50 hover:border-indigo-200 hover:bg-white'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-xl border-2 flex items-center justify-center font-black text-sm transition-colors ${
                      isSelected ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-gray-200 text-gray-400'
                    }`}>
                      {String.fromCharCode(65 + idx)}
                    </div>
                    <span className={`text-lg font-bold ${isSelected ? 'text-indigo-900' : 'text-gray-700'}`}>
                      {option}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="mt-12 flex justify-between items-center pt-8 border-t border-gray-50">
              <Button 
                variant="secondary" 
                onClick={() => navigateTo(examState.currentIndex - 1)}
                disabled={examState.currentIndex === 0}
                className="flex items-center gap-2 border-none bg-gray-100 hover:bg-gray-200"
              >
                <ChevronLeft className="w-5 h-5" /> Previous
              </Button>
              
              <div className="flex gap-4">
                {examState.currentIndex < batch.questions.length - 1 ? (
                  <Button 
                    onClick={() => navigateTo(examState.currentIndex + 1)}
                    className="flex items-center gap-3 px-10 py-4 rounded-xl font-black"
                  >
                    Next Question <ChevronRight className="w-5 h-5" />
                  </Button>
                ) : (
                  <Button 
                    onClick={() => setShowConfirmSubmit(true)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-3 px-10 py-4 rounded-xl font-black"
                  >
                    Finish Exam <Send className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          </Card>
        </main>

        <aside className="w-80 hidden lg:flex flex-col gap-6">
          <Card className="p-8 sticky top-28 border-none shadow-xl h-[calc(100vh-160px)] flex flex-col">
            <ExamSidebar 
              questions={batch.questions}
              currentIndex={examState.currentIndex}
              answers={examState.answers}
              flags={examState.flags}
              onNavigate={navigateTo}
            />
          </Card>
        </aside>
      </div>

      {showConfirmSubmit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-md">
          <Card className="max-w-md w-full p-10 text-center animate-in zoom-in-95 duration-200 shadow-2xl border-none">
            <div className="w-20 h-20 bg-amber-100 rounded-3xl flex items-center justify-center mx-auto mb-6 text-amber-600">
              <AlertTriangle className="w-10 h-10" />
            </div>
            <h2 className="text-3xl font-black text-gray-900 mb-3 tracking-tight">Finish Session?</h2>
            <p className="text-gray-500 mb-10 leading-relaxed font-medium">
              You've answered <span className="text-indigo-600 font-black">{Object.keys(examState.answers).length}</span> out of <span className="font-black">{batch.totalQuestions}</span> questions. Once submitted, your scores will be final.
            </p>
            <div className="flex flex-col gap-3">
              <Button onClick={finishExam} variant="primary" className="py-4 text-lg font-bold rounded-xl shadow-lg shadow-indigo-100">
                Confirm & Submit
              </Button>
              <Button variant="ghost" onClick={() => setShowConfirmSubmit(false)} className="py-4 font-bold text-gray-400 hover:text-gray-600">
                Continue Working
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ExamSession;
