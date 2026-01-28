import React, { useState } from 'react';
import { Card, Button, Badge } from '../components/UI.tsx';
import { db } from '../services/firebase.ts';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { 
  ArrowLeft, 
  Terminal, 
  UploadCloud, 
  CheckCircle, 
  AlertCircle, 
  Settings, 
  Database,
  BookOpen,
  ClipboardList,
  Loader2
} from 'lucide-react';
import { Question } from '../types.ts';

interface AdminDashboardProps {
  onExit: () => void;
  onDataUpdate: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onExit, onDataUpdate }) => {
  const [jsonInput, setJsonInput] = useState('');
  const [targetType, setTargetType] = useState<'PRACTICE' | 'EXAM'>('PRACTICE');
  const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const [isDeploying, setIsDeploying] = useState(false);

  const handleImport = async () => {
    setIsDeploying(true);
    setStatus(null);
    try {
      const data = JSON.parse(jsonInput);
      if (!data.quiz_data || !data.quiz_data.questions) {
        throw new Error('Invalid JSON structure: Missing quiz_data or questions');
      }

      const qData = data.quiz_data;
      const transformedQuestions: Question[] = qData.questions.map((q: any) => ({
        id: `imported-${Date.now()}-${q.id}`,
        text: q.question_text,
        options: Object.values(q.options),
        correctIndex: q.correct_answer.charCodeAt(0) - 65,
        explanation: q.explanation || "No explanation provided."
      }));

      if (targetType === 'PRACTICE') {
        await addDoc(collection(db, "content/practice/courses"), {
          name: qData.chapter.title,
          description: qData.chapter.description,
          category: qData.metadata?.subject || 'General',
          questions: transformedQuestions,
          createdAt: serverTimestamp()
        });
      } else {
        await addDoc(collection(db, "content/exams/batches"), {
          name: qData.chapter.title,
          description: qData.chapter.description,
          totalQuestions: transformedQuestions.length,
          timeLimitMinutes: 300,
          order: Date.now(),
          questions: transformedQuestions,
          createdAt: serverTimestamp()
        });
      }

      setStatus({ type: 'success', message: `Successfully deployed to Cloud Firestore.` });
      setJsonInput('');
      onDataUpdate();
    } catch (err: any) {
      setStatus({ type: 'error', message: `Import Failed: ${err.message}` });
    } finally {
      setIsDeploying(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f1f5f9] p-8 font-sans">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-10">
          <div>
            <button onClick={onExit} className="flex items-center gap-2 text-slate-400 hover:text-teal-600 font-bold mb-4 transition-colors group">
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" /> Exit Admin Console
            </button>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight flex items-center gap-4">
              <Settings className="w-10 h-10 text-teal-600" /> Exit Prep Admin
            </h1>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-none shadow-xl p-8">
              <div className="flex items-center gap-2 mb-6 text-slate-800 font-black text-xl">
                <Terminal className="w-6 h-6 text-teal-600" />
                Firestore Deployment Terminal
              </div>
              <textarea
                value={jsonInput}
                onChange={(e) => setJsonInput(e.target.value)}
                placeholder="Paste the Quiz JSON structure here..."
                className="w-full h-[400px] p-6 rounded-2xl bg-slate-900 text-teal-400 font-mono text-sm border-4 border-slate-800 focus:border-teal-500 focus:outline-none transition-all resize-none"
              />
              <div className="mt-6 flex items-center justify-between">
                <div className="flex bg-slate-100 p-1.5 rounded-xl border border-slate-200">
                  <button onClick={() => setTargetType('PRACTICE')} className={`px-6 py-2.5 rounded-lg font-bold text-sm flex items-center gap-2 transition-all ${targetType === 'PRACTICE' ? 'bg-white shadow-md text-teal-600' : 'text-slate-500 hover:text-slate-700'}`}><BookOpen className="w-4 h-4" /> Practice</button>
                  <button onClick={() => setTargetType('EXAM')} className={`px-6 py-2.5 rounded-lg font-bold text-sm flex items-center gap-2 transition-all ${targetType === 'EXAM' ? 'bg-white shadow-md text-teal-600' : 'text-slate-500 hover:text-slate-700'}`}><ClipboardList className="w-4 h-4" /> Exam</button>
                </div>
                <Button onClick={handleImport} disabled={!jsonInput.trim() || isDeploying} className="flex items-center gap-2 px-10 py-4">
                  {isDeploying ? <Loader2 className="w-5 h-5 animate-spin" /> : <UploadCloud className="w-5 h-5" />}
                  Deploy Content
                </Button>
              </div>
              {status && (
                <div className={`mt-6 p-4 rounded-xl flex items-center gap-3 ${status.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-rose-50 text-rose-700 border border-rose-100'}`}>
                  {status.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                  <span className="font-bold">{status.message}</span>
                </div>
              )}
            </Card>
          </div>
          <div className="space-y-6">
            <Card className="border-none shadow-xl bg-teal-600 text-white p-8">
              <Database className="w-10 h-10 mb-6 opacity-50" />
              <h3 className="text-xl font-bold mb-2">Cloud Infrastructure</h3>
              <p className="text-teal-100 mb-6">Connected to live Firebase clusters.</p>
              <div className="p-4 bg-teal-700 rounded-xl border border-teal-500">
                <p className="text-xs font-bold uppercase tracking-widest text-teal-200 mb-2">Security Audit</p>
                <p className="text-sm leading-relaxed text-teal-50">Content is protected via Firestore rules. Deployments are final.</p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;