export interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string | null;
  dailyGoal: number;
  level: number;
  xp: number;
  streak: number;
  totalWordsLearned: number;
  createdAt: Date;
}

export interface Word {
  id: string;
  word: string;
  meaning: string;
  example: string;
  difficulty: 'easy' | 'medium' | 'hard';
  learningStatus: 'new' | 'learning' | 'reviewing' | 'mastered';
  interval: number;
  efactor: number;
  repetitions: number;
  nextReviewDate: Date;
  lastReviewed: Date;
  createdAt: Date;
  userId: string;
  reviewCount?: number;
}

export interface QuizQuestion {
  id: string;
  wordId: string;
  type: 'multiple_choice' | 'fill_blank' | 'matching';
  question: string;
  options?: string[];
  correctAnswer: string;
  userAnswer?: string;
  isCorrect?: boolean;
}

export interface DailyStats {
  date: string;
  userId: string;
  wordsLearned: number;
  wordsReviewed: number;
  correctAnswers: number;
  totalQuestions: number;
  xpEarned: number;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  condition: string;
  earned: boolean;
  earnedAt?: Date;
}

export interface NavigationProps {
  navigation: any;
  route: any;
} 