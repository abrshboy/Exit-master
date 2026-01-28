
import { Course, ExamBatch, Question } from './types';

const generateQuestions = (count: number, prefix: string): Question[] => {
  return Array.from({ length: count }, (_, i) => ({
    id: `${prefix}-q-${i}`,
    text: `Sample Question ${i + 1}: What is the primary purpose of this specific educational module?`,
    options: [
      "To test theoretical knowledge",
      "To provide practical applications",
      "To assess comprehensive understanding",
      "To encourage critical thinking"
    ],
    correctIndex: i % 4,
    explanation: `This is a detailed explanation for question ${i + 1}. The correct answer is selected because it represents the fundamental goal of educational assessment in this context.`
  }));
};

const DEFAULT_COURSES: Course[] = [
  {
    id: 'c1',
    name: 'Advanced React Development',
    description: 'Master hooks, state management, and performance optimization.',
    category: 'Technology',
    questions: generateQuestions(15, 'react')
  },
  {
    id: 'c2',
    name: 'Modern UI/UX Design',
    description: 'Learn the principles of human-centered design and visual aesthetics.',
    category: 'Design',
    questions: generateQuestions(10, 'design')
  }
];

const DEFAULT_EXAMS: ExamBatch[] = [
  {
    id: 'b1',
    name: 'Foundation Level Exam',
    description: 'Basic certification for entry-level candidates.',
    totalQuestions: 100,
    timeLimitMinutes: 300,
    order: 1,
    questions: generateQuestions(100, 'foundation')
  }
];

export const getStoredCourses = (): Course[] => {
  const stored = localStorage.getItem('eduquest_courses');
  return stored ? JSON.parse(stored) : DEFAULT_COURSES;
};

export const getStoredExams = (): ExamBatch[] => {
  const stored = localStorage.getItem('eduquest_exams');
  return stored ? JSON.parse(stored) : DEFAULT_EXAMS;
};

export const COURSES = getStoredCourses();
export const EXAM_BATCHS = getStoredExams();
