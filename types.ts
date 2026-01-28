
export interface User {
  id: string;
  name: string;
  email: string;
  passedExamBatches: string[];
  role: 'user' | 'admin';
}

export interface Question {
  id: string;
  text: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface Course {
  id: string;
  name: string;
  description: string;
  questions: Question[];
  category: string;
}

export interface ExamBatch {
  id: string;
  name: string;
  description: string;
  totalQuestions: number;
  timeLimitMinutes: number;
  questions: Question[];
  order: number;
}

export type AppMode = 'AUTH' | 'DASHBOARD' | 'PRACTICE_LIST' | 'EXAM_LIST' | 'PRACTICE_SESSION' | 'EXAM_SESSION' | 'ADMIN_DASHBOARD';

export interface ExamState {
  answers: Record<string, number | null>;
  flags: Record<string, boolean>;
  currentIndex: number;
  timeRemaining: number;
  isCompleted: boolean;
}
