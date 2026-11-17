export type ViewId =
  | 'dashboard'
  | 'subjects'
  | 'quiz'
  | 'planner'
  | 'history';

export type MasteryTier = 'weak' | 'developing' | 'strong';

export type DayOfWeek = 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun';

export interface BktParams {
  pL0: number; // Initial prior mastery probability P(L0)
  pT: number;  // Learning / transition probability P(T)
  pG: number;  // Guess probability P(G)
  pS: number;  // Slip probability P(S)
}

export interface QuizQuestion {
  id: string;
  prompt: string;
  options: [string, string, string, string];
  correctIndex: 0 | 1 | 2 | 3;
  explanation: string;
}

export interface Topic {
  id: string;
  subjectId: string;
  name: string;
  description: string;
  mastery: number; // 0 to 1
  enabled: boolean; // Checked in Subjects & Topics Manager
  questions: QuizQuestion[];
  lastPracticedAt?: string;
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  enabled: boolean;
}

export interface StudySession {
  id: string;
  day: DayOfWeek;
  topicId: string;
  topicName: string;
  subjectName: string;
  tier: MasteryTier;
  masteryAtGeneration: number;
  sessionType: 'Concept Review + Practice' | 'Guided Problem Solving' | 'Quick Revision';
  durationMinutes: number;
  completed: boolean;
}

export interface QuizAttempt {
  id: string;
  timestamp: string;
  topicId: string;
  topicName: string;
  subjectName: string;
  correctCount: number;
  totalQuestions: number;
  masteryBefore: number;
  masteryAfter: number;
  tierBefore: MasteryTier;
  tierAfter: MasteryTier;
}

export interface StudentProfile {
  name: string;
  major: string;
  year: string;
  email: string;
  avatarUrl: string;
  isSignedIn: boolean;
}

export interface PlannerConfig {
  weeklyHours: number;
  preferredDays: DayOfWeek[];
}

export interface AppState {
  student: StudentProfile;
  bktParams: BktParams;
  subjects: Subject[];
  topics: Topic[];
  schedule: StudySession[];
  plannerConfig: PlannerConfig;
  attempts: QuizAttempt[];
}
