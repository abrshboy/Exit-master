import React, { useState, useEffect } from 'react';
import { User, AppMode, Course, ExamBatch } from './types';
import { auth, db, googleProvider } from './services/firebase';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut 
} from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  setDoc, 
  collection, 
  onSnapshot,
  query,
  orderBy 
} from 'firebase/firestore';
import { Button, Card, Badge } from './components/UI';
import PracticeSession from './pages/PracticeSession';
import ExamSession from './pages/ExamSession';
import AdminDashboard from './pages/AdminDashboard';
import { 
  Lock, 
  Play, 
  GraduationCap, 
  ClipboardCheck, 
  LogOut, 
  ChevronRight, 
  User as UserIcon, 
  ArrowLeft,
  BookOpen,
  Trophy,
  ShieldCheck,
  Loader2
} from 'lucide-react';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [mode, setMode] = useState<AppMode>('AUTH');
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [selectedExam, setSelectedExam] = useState<ExamBatch | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [exams, setExams] = useState<ExamBatch[]>([]);
  const [isLogin, setIsLogin] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
        const userData = userDoc.data();
        
        const platformUser: User = {
          id: firebaseUser.uid,
          name: userData?.name || firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Scholar',
          email: firebaseUser.email || '',
          passedExamBatches: userData?.passedExamBatches || [],
          role: firebaseUser.email === 'abrshethiodj44@gmail.com' ? 'admin' : 'user'
        };
        
        setUser(platformUser);
        setMode('DASHBOARD');
      } else {
        setUser(null);
        setMode('AUTH');
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!user) return;

    const qCourses = query(collection(db, "content/practice/courses"));
    const unsubCourses = onSnapshot(qCourses, (snapshot) => {
      setCourses(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Course)));
    });

    const qExams = query(collection(db, "content/exams/batches"), orderBy("order", "asc"));
    const unsubExams = onSnapshot(qExams, (snapshot) => {
      setExams(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ExamBatch)));
    });

    return () => {
      unsubCourses();
      unsubExams();
    };
  }, [user]);

  const handleAuth = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setAuthError(null);
    const email = (e.currentTarget.elements.namedItem('email') as HTMLInputElement).value;
    const password = (e.currentTarget.elements.namedItem('password') as HTMLInputElement).value;

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        const res = await createUserWithEmailAndPassword(auth, email, password);
        await setDoc(doc(db, "users", res.user.uid), {
          name: email.split('@')[0],
          email: email,
          passedExamBatches: [],
          createdAt: new Date().toISOString()
        });
      }
    } catch (err: any) {
      setAuthError(err.message);
    }
  };

  const handleGoogleSignIn = async () => {
    setAuthError(null);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const firebaseUser = result.user;
      
      const userRef = doc(db, "users", firebaseUser.uid);
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists()) {
        await setDoc(userRef, {
          name: firebaseUser.displayName || firebaseUser.email?.split('@')[0],
          email: firebaseUser.email,
          passedExamBatches: [],
          createdAt: new Date().toISOString()
        });
      }
    } catch (err: any) {
      setAuthError(err.message);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    setMode('AUTH');
  };

  const unlockNextBatch = async (batchId: string) => {
    if (user) {
      const updatedPassed = Array.from(new Set([...user.passedExamBatches, batchId]));
      await setDoc(doc(db, "users", user.id), { passedExamBatches: updatedPassed }, { merge: true });
      setUser({ ...user, passedExamBatches: updatedPassed });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-teal-600 animate-spin mx-auto mb-4" />
          <p className="text-slate-500 font-bold">Synchronizing Exit Prep...</p>
        </div>
      </div>
    );
  }

  if (mode === 'AUTH') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <Card className="max-w-md w-full p-10 border-none shadow-2xl">
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-teal-600 rounded-3xl mb-6 shadow-lg shadow-teal-200">
              <GraduationCap className="text-white w-10 h-10" />
            </div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">Exit Prep</h1>
            <p className="text-gray-500 mt-2 font-medium">Streamlined exam preparation.</p>
          </div>
          <form onSubmit={handleAuth} className="space-y-5">
            <div>
              <input 
                name="email"
                type="email" 
                required 
                className="w-full px-5 py-4 rounded-xl border-2 border-gray-100 focus:border-teal-500 focus:outline-none transition-all bg-gray-50 font-medium"
                placeholder="Email Address"
              />
            </div>
            <div>
              <input 
                name="password"
                type="password" 
                required 
                className="w-full px-5 py-4 rounded-xl border-2 border-gray-100 focus:border-teal-500 focus:outline-none transition-all bg-gray-50 font-medium"
                placeholder="Password"
              />
            </div>
            {authError && (
              <p className="text-rose-500 text-sm font-bold bg-rose-50 p-3 rounded-lg border border-rose-100">
                {authError}
              </p>
            )}
            <Button type="submit" className="w-full py-4 text-lg font-bold rounded-xl shadow-teal-200">
              {isLogin ? 'Launch Platform' : 'Create Account'}
            </Button>
            
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-200"></span>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-4 text-gray-400 font-bold">Or continue with</span>
              </div>
            </div>

            <button 
              type="button"
              onClick={handleGoogleSignIn}
              className="w-full py-4 px-4 bg-white border-2 border-gray-100 rounded-xl font-bold text-gray-700 flex items-center justify-center gap-3 hover:bg-gray-50 transition-all active:scale-95 shadow-sm"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Google Account
            </button>

            <div className="text-center pt-6">
              <button 
                type="button" 
                onClick={() => setIsLogin(!isLogin)}
                className="text-sm font-bold text-teal-600 hover:underline"
              >
                {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Log In"}
              </button>
            </div>
          </form>
        </Card>
      </div>
    );
  }

  const Navigation = () => (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setMode('DASHBOARD')}>
          <div className="w-10 h-10 bg-teal-600 rounded-xl flex items-center justify-center shadow-md shadow-teal-100">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-black text-gray-900 tracking-tight">Exit Prep</span>
        </div>
        <div className="flex items-center gap-8">
          {user?.role === 'admin' && (
            <button 
              onClick={() => setMode('ADMIN_DASHBOARD')}
              className="hidden md:flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 font-bold text-sm rounded-lg hover:bg-slate-200 transition-colors"
            >
              <ShieldCheck className="w-4 h-4" /> Admin Console
            </button>
          )}
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-gray-900">{user?.name}</p>
              <p className="text-xs font-medium text-gray-400">{user?.role === 'admin' ? 'Administrator' : 'Scholar'}</p>
            </div>
            <div className="w-10 h-10 bg-teal-50 border border-teal-100 rounded-full flex items-center justify-center">
              <UserIcon className="w-5 h-5 text-teal-600" />
            </div>
          </div>
          <button onClick={handleLogout} className="p-2 hover:bg-rose-50 rounded-lg text-gray-400 hover:text-rose-500 transition-colors">
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </nav>
  );

  if (mode === 'ADMIN_DASHBOARD' && user?.role === 'admin') {
    return <AdminDashboard onExit={() => setMode('DASHBOARD')} onDataUpdate={() => {}} />;
  }

  if (mode === 'PRACTICE_SESSION' && selectedCourse) {
    return <PracticeSession course={selectedCourse} user={user!} onExit={() => setMode('PRACTICE_LIST')} />;
  }

  if (mode === 'EXAM_SESSION' && selectedExam) {
    return <ExamSession batch={selectedExam} onExit={() => setMode('EXAM_LIST')} onPass={() => unlockNextBatch(selectedExam.id)} />;
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col">
      <Navigation />
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-12">
        {mode === 'DASHBOARD' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <header className="mb-12">
              <h2 className="text-4xl font-black text-gray-900 tracking-tight">Welcome back, {user?.name}</h2>
              <p className="text-lg text-gray-500 mt-2">Ready to master your curriculum? Select your pathway.</p>
            </header>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <button onClick={() => setMode('PRACTICE_LIST')} className="group relative bg-white p-10 rounded-3xl border-2 border-transparent hover:border-emerald-500 shadow-xl shadow-slate-200/50 transition-all text-left overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity"><BookOpen className="w-32 h-32 text-emerald-600" /></div>
                <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform"><Play className="w-8 h-8 text-emerald-600 fill-current" /></div>
                <h3 className="text-3xl font-black text-gray-900">Practice Mode</h3>
                <p className="text-gray-500 mt-4 text-lg leading-relaxed max-w-xs">Flexible learning with immediate feedback and core insights.</p>
                <div className="mt-10 flex items-center gap-2 text-emerald-600 font-bold group-hover:gap-4 transition-all">Start Practicing <ChevronRight className="w-5 h-5" /></div>
              </button>
              <button onClick={() => setMode('EXAM_LIST')} className="group relative bg-white p-10 rounded-3xl border-2 border-transparent hover:border-teal-500 shadow-xl shadow-slate-200/50 transition-all text-left overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity"><Trophy className="w-32 h-32 text-teal-600" /></div>
                <div className="w-16 h-16 bg-teal-100 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform"><ClipboardCheck className="w-8 h-8 text-teal-600" /></div>
                <h3 className="text-3xl font-black text-gray-900">Exam Mode</h3>
                <p className="text-gray-500 mt-4 text-lg leading-relaxed max-w-xs">Simulated proctored environment to validate your readiness.</p>
                <div className="mt-10 flex items-center gap-2 text-teal-600 font-bold group-hover:gap-4 transition-all">Enter Exam Hall <ChevronRight className="w-5 h-5" /></div>
              </button>
            </div>
          </div>
        )}

        {mode === 'PRACTICE_LIST' && (
          <div className="animate-in fade-in slide-in-from-left-4 duration-500">
            <button onClick={() => setMode('DASHBOARD')} className="flex items-center gap-2 text-gray-400 hover:text-teal-600 mb-8 font-bold transition-colors group"><ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" /> Back to Home</button>
            <h2 className="text-3xl font-black text-gray-900 mb-8">Practice Library</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map(course => (
                <Card key={course.id} className="hover:translate-y-[-4px] transition-all border-none shadow-lg h-full flex flex-col">
                  <Badge variant="info">{course.category}</Badge>
                  <h4 className="text-xl font-bold text-gray-900 mt-4 mb-2">{course.name}</h4>
                  <p className="text-gray-500 text-sm mb-6 line-clamp-2">{course.description}</p>
                  <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-50">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{course.questions.length} Items</span>
                    <Button onClick={() => { setSelectedCourse(course); setMode('PRACTICE_SESSION'); }}>Enter Session</Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {mode === 'EXAM_LIST' && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-500">
            <button onClick={() => setMode('DASHBOARD')} className="flex items-center gap-2 text-gray-400 hover:text-teal-600 mb-8 font-bold transition-colors group"><ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" /> Back to Home</button>
            <h2 className="text-3xl font-black text-gray-900 mb-8">Accreditation Batches</h2>
            <div className="space-y-6">
              {exams.map((batch, index) => {
                const isPreviousPassed = index === 0 || user?.passedExamBatches.includes(exams[index-1].id);
                const isPassed = user?.passedExamBatches.includes(batch.id);
                return (
                  <Card key={batch.id} className={`flex flex-col md:flex-row md:items-center justify-between gap-6 transition-all border-2 ${!isPreviousPassed ? 'opacity-60 bg-gray-50 grayscale' : 'hover:border-teal-200'}`}>
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h4 className="text-2xl font-bold text-gray-900">{batch.name}</h4>
                        {isPassed && <Badge variant="success">Achieved</Badge>}
                        {!isPreviousPassed && <Badge variant="locked">Pending Prerequisites</Badge>}
                      </div>
                      <p className="text-gray-500 mt-2 max-w-2xl">{batch.description}</p>
                      <div className="flex gap-4 mt-4">
                         <div className="bg-gray-100 px-3 py-1 rounded-lg text-xs font-bold text-gray-600">{batch.totalQuestions} Questions</div>
                         <div className="bg-gray-100 px-3 py-1 rounded-lg text-xs font-bold text-gray-600">{batch.timeLimitMinutes} Mins</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      {isPreviousPassed ? (
                        <Button onClick={() => { setSelectedExam(batch); setMode('EXAM_SESSION'); }} className="px-8 py-3 rounded-xl font-bold shadow-lg">{isPassed ? 'Retake Exam' : 'Begin Assessment'}</Button>
                      ) : (
                        <div className="w-14 h-14 rounded-xl bg-gray-200 flex items-center justify-center text-gray-400"><Lock className="w-6 h-6" /></div>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;