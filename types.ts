
export type Language = 'en' | 'fr' | 'ar';
export type Region = 'west' | 'arab';
export type SubscriptionTier = 'free' | 'student' | 'pro';

export interface ServiceStatus {
  name: string;
  status: 'online' | 'degraded' | 'offline';
  latency: number;
}

export interface UserStats {
  coursesCompleted: number;
  avgScore: number;
  totalXp: number;
  streak: number;
}

export interface Enrollment {
  courseId: string;
  dueDate?: string; // ISO date string
  progress: number; // 0 to 100
}

export interface User {
  id: string;
  email: string;
  name: string;
  tier: SubscriptionTier;
  enrolled: Enrollment[];
  stats: UserStats;
}

export interface AuthSession {
  user: User | null;
  token: string | null;
}

export interface Course {
  id: string;
  title: Record<Language, string>;
  description: Record<Language, string>;
  category: 'science' | 'humanities' | 'values' | 'tech';
  region: Region[];
  thumbnail: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: string;
}

export interface Exercise {
  id: string;
  question: string;
  options?: string[];
  correctAnswer?: string;
  type: 'multiple-choice' | 'open-ended';
}

export interface GradeResult {
  score: number;
  feedback: string;
  isCorrect: boolean;
  metadata?: {
    processingTime: number;
    tokens: number;
  };
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export interface ForumPost {
  id: string;
  author: string;
  content: string;
  language: Language;
  timestamp: Date;
  translations?: Partial<Record<Language, string>>;
}
