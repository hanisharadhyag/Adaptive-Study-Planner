import { useEffect, useState } from 'react';
import {
  BookOpen,
  Calendar,
  CheckCircle2,
  CheckSquare,
  GraduationCap,
  History,
  LayoutDashboard,
  Menu,
  RotateCcw,
  UserCheck,
  X,
} from 'lucide-react';
import { AttemptHistoryView } from './components/AttemptHistoryView';
import { AuthModal } from './components/AuthModal';
import { DashboardView } from './components/DashboardView';
import { QuizRunnerView } from './components/QuizRunnerView';
import { SubjectsManagerView } from './components/SubjectsManagerView';
import { WeeklyPlannerView } from './components/WeeklyPlannerView';
import { createInitialAppState } from './data/seedData';
import {
  AppState,
  BktParams,
  DayOfWeek,
  PlannerConfig,
  QuizQuestion,
  StudentProfile,
  ViewId,
} from './types/study';
import { getMasteryTier } from './utils/bkt';
import { ALL_DAYS, generateAdaptiveSchedule } from './utils/scheduler';

const STORAGE_KEY = 'adaptive-study-planner-bkt-v1';

const NAV_ITEMS: { id: ViewId; label: string; icon: typeof LayoutDashboard }[] = [
  { id: 'dashboard', label: 'Progress Dashboard', icon: LayoutDashboard },
  { id: 'subjects', label: 'Subjects & Topics', icon: BookOpen },
  { id: 'quiz', label: 'MCQ Quiz Runner', icon: CheckSquare },
  { id: 'planner', label: 'Weekly Study Planner', icon: Calendar },
  { id: 'history', label: 'Attempt History', icon: History },
];

function loadInitialState(): AppState {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return createInitialAppState();
    const parsed = JSON.parse(raw) as Partial<AppState>;
    if (
      !parsed ||
      !Array.isArray(parsed.subjects) ||
      !Array.isArray(parsed.topics) ||
      !Array.isArray(parsed.schedule) ||
      !Array.isArray(parsed.attempts) ||
      !parsed.student ||
      !parsed.plannerConfig ||
      !parsed.bktParams
    ) {
      return createInitialAppState();
    }
    return parsed as AppState;
  } catch {
    return createInitialAppState();
  }
}

export default function App() {
  const [state, setState] = useState<AppState>(() => loadInitialState());
  const [activeView, setActiveView] = useState<ViewId>('dashboard');
  const [selectedQuizTopicId, setSelectedQuizTopicId] = useState<string>(
    () => state.topics.find((t) => t.id === 'topic-linked-lists')?.id ?? state.topics[0]?.id ?? ''
  );
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Ignore storage quota issues gracefully
    }
  }, [state]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    window.setTimeout(() => {
      setToastMessage((curr) => (curr === msg ? null : curr));
    }, 3200);
  };

  const handleNavigate = (view: ViewId) => {
    setActiveView(view);
    setMobileMenuOpen(false);
  };

  const handleStartQuiz = (topicId: string) => {
    setSelectedQuizTopicId(topicId);
    setActiveView('quiz');
    setMobileMenuOpen(false);
  };

  const handleToggleSubject = (subjectId: string) => {
    setState((prev) => {
      const nextSubjects = prev.subjects.map((s) =>
        s.id === subjectId ? { ...s, enabled: !s.enabled } : s
      );
      return {
        ...prev,
        subjects: nextSubjects,
        schedule: generateAdaptiveSchedule(
          nextSubjects,
          prev.topics,
          prev.plannerConfig
        ),
      };
    });
  };

  const handleToggleTopic = (topicId: string) => {
    setState((prev) => {
      const nextTopics = prev.topics.map((t) =>
        t.id === topicId ? { ...t, enabled: !t.enabled } : t
      );
      return {
        ...prev,
        topics: nextTopics,
        schedule: generateAdaptiveSchedule(
          prev.subjects,
          nextTopics,
          prev.plannerConfig
        ),
      };
    });
  };

  const handleAddSubject = (name: string, code: string) => {
    setState((prev) => {
      const newSubject = {
        id: `sub-${Date.now()}`,
        name,
        code,
        enabled: true,
      };
      const nextSubjects = [...prev.subjects, newSubject];
      return {
        ...prev,
        subjects: nextSubjects,
        schedule: generateAdaptiveSchedule(
          nextSubjects,
          prev.topics,
          prev.plannerConfig
        ),
      };
    });
    showToast(`Added subject "${name}"`);
  };

  const handleAddTopic = (payload: {
    subjectId: string;
    name: string;
    description: string;
    initialMastery: number;
    customQuestion?: QuizQuestion;
  }) => {
    const starterQuestions: QuizQuestion[] = [
      {
        id: `starter-1-${Date.now()}`,
        prompt: `Which practice strategy most effectively builds foundational mastery in ${payload.name}?`,
        options: [
          'Active recall with worked edge-case examples',
          'Passive re-reading without testing',
          'Skipping complexity analysis until exams',
          'Memorizing syntax without tracing execution',
        ],
        correctIndex: 0,
        explanation: `Active recall paired with edge-case tracing strengthens mental models for ${payload.name}.`,
      },
      {
        id: `starter-2-${Date.now() + 1}`,
        prompt: `When debugging an unfamiliar problem in ${payload.name}, what should you verify first?`,
        options: [
          'Base cases, invariants, and input constraints',
          'Variable naming style only',
          'Randomly changing loop bounds',
          'Ignoring space/time complexity bounds',
        ],
        correctIndex: 0,
        explanation:
          'Checking base cases, loop/structural invariants, and constraints catches the vast majority of implementation bugs.',
      },
      {
        id: `starter-3-${Date.now() + 2}`,
        prompt: `How does Bayesian Knowledge Tracing prioritize ${payload.name} in your weekly schedule?`,
        options: [
          'Allocates study minutes inversely proportional to current P(L)',
          'Assigns identical fixed hours regardless of quiz scores',
          'Removes weak topics from the calendar automatically',
          'Schedules only on weekends',
        ],
        correctIndex: 0,
        explanation:
          'Lower mastery P(L) increases study allocation so weak concepts receive deep Concept Review blocks.',
      },
    ];

    const questions = payload.customQuestion
      ? [payload.customQuestion, ...starterQuestions.slice(0, 2)]
      : starterQuestions;

    setState((prev) => {
      const nextTopics = [
        ...prev.topics,
        {
          id: `topic-${Date.now()}`,
          subjectId: payload.subjectId,
          name: payload.name,
          description: payload.description,
          mastery: payload.initialMastery,
          enabled: true,
          questions,
        },
      ];
      return {
        ...prev,
        topics: nextTopics,
        schedule: generateAdaptiveSchedule(
          prev.subjects,
          nextTopics,
          prev.plannerConfig
        ),
      };
    });
    showToast(`Added topic "${payload.name}"`);
  };

  const handleUpdateBktParams = (params: BktParams) => {
    setState((prev) => ({ ...prev, bktParams: params }));
  };

  const handleAnswerQuestion = (topicId: string, newMastery: number) => {
    setState((prev) => {
      const nextTopics = prev.topics.map((t) =>
        t.id === topicId
          ? {
              ...t,
              mastery: newMastery,
              lastPracticedAt: new Date().toISOString(),
            }
          : t
      );
      return {
        ...prev,
        topics: nextTopics,
        schedule: generateAdaptiveSchedule(
          prev.subjects,
          nextTopics,
          prev.plannerConfig
        ),
      };
    });
  };

  const handleCompleteQuiz = (summary: {
    topicId: string;
    correctCount: number;
    totalQuestions: number;
    masteryBefore: number;
    masteryAfter: number;
  }) => {
    setState((prev) => {
      const topic = prev.topics.find((t) => t.id === summary.topicId);
      const subject = prev.subjects.find((s) => s.id === topic?.subjectId);
      if (!topic) return prev;

      const newAttempt = {
        id: `att-${Date.now()}`,
        timestamp: new Date().toISOString(),
        topicId: topic.id,
        topicName: topic.name,
        subjectName: subject?.name ?? 'Course',
        correctCount: summary.correctCount,
        totalQuestions: summary.totalQuestions,
        masteryBefore: summary.masteryBefore,
        masteryAfter: summary.masteryAfter,
        tierBefore: getMasteryTier(summary.masteryBefore),
        tierAfter: getMasteryTier(summary.masteryAfter),
      };

      return {
        ...prev,
        attempts: [newAttempt, ...prev.attempts],
        schedule: generateAdaptiveSchedule(
          prev.subjects,
          prev.topics,
          prev.plannerConfig
        ),
      };
    });
  };

  const handleUpdatePlannerConfig = (nextConfig: PlannerConfig) => {
    setState((prev) => ({
      ...prev,
      plannerConfig: nextConfig,
      schedule: generateAdaptiveSchedule(prev.subjects, prev.topics, nextConfig),
    }));
  };

  const handleRegenerateSchedule = () => {
    setState((prev) => ({
      ...prev,
      schedule: generateAdaptiveSchedule(
        prev.subjects,
        prev.topics,
        prev.plannerConfig
      ),
    }));
    showToast('Weekly adaptive schedule regenerated');
  };

  const handleToggleSessionComplete = (sessionId: string) => {
    setState((prev) => ({
      ...prev,
      schedule: prev.schedule.map((s) =>
        s.id === sessionId ? { ...s, completed: !s.completed } : s
      ),
    }));
  };

  const handleAdjustSessionDuration = (sessionId: string, deltaMinutes: number) => {
    setState((prev) => ({
      ...prev,
      schedule: prev.schedule.map((s) =>
        s.id === sessionId
          ? {
              ...s,
              durationMinutes: Math.max(
                10,
                Math.min(180, s.durationMinutes + deltaMinutes)
              ),
            }
          : s
      ),
    }));
  };

  const handleMoveSessionDay = (sessionId: string, newDay: DayOfWeek) => {
    setState((prev) => {
      const nextSchedule = prev.schedule
        .map((s) => (s.id === sessionId ? { ...s, day: newDay } : s))
        .sort((a, b) => ALL_DAYS.indexOf(a.day) - ALL_DAYS.indexOf(b.day));
      return {
        ...prev,
        schedule: nextSchedule,
      };
    });
  };

  const handleDeleteSession = (sessionId: string) => {
    setState((prev) => ({
      ...prev,
      schedule: prev.schedule.filter((s) => s.id !== sessionId),
    }));
  };

  const handleUpdateStudent = (nextStudent: StudentProfile) => {
    setState((prev) => ({ ...prev, student: nextStudent }));
    showToast(
      nextStudent.isSignedIn
        ? `Signed in as ${nextStudent.name}`
        : 'Switched to guest preview mode'
    );
  };

  const handleResetDemoData = () => {
    const fresh = createInitialAppState();
    setState(fresh);
    setSelectedQuizTopicId('topic-linked-lists');
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(fresh));
    } catch {
      // ignore
    }
    showToast('Demo data restored to initial state');
  };

  const currentNavLabel =
    NAV_ITEMS.find((item) => item.id === activeView)?.label ?? 'Progress Dashboard';

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex">
      {/* Mobile Sidebar Backdrop */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 flex flex-col justify-between transition-transform duration-200 lg:static lg:translate-x-0 shrink-0 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          {/* Brand Header */}
          <div className="h-16 px-5 border-b border-slate-200 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0">
                <GraduationCap className="w-4 h-4" />
              </div>
              <span className="font-display font-bold text-sm tracking-tight text-slate-900 whitespace-nowrap truncate">
                Adaptive Study Planner
              </span>
            </div>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              className="lg:hidden p-1.5 text-slate-500 hover:text-slate-900 rounded-md"
              aria-label="Close navigation"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1" aria-label="Main navigation">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = activeView === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleNavigate(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                    isActive
                      ? 'bg-indigo-50 text-indigo-700'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 shrink-0 ${
                      isActive ? 'text-indigo-600' : 'text-slate-400'
                    }`}
                  />
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer: Reset Demo Data */}
        <div className="p-4 border-t border-slate-200 space-y-3">
          <div className="px-2">
            <p className="text-xs font-medium text-slate-700">
              Data Structures · BKT MVP
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5 font-mono tabular-nums">
              P(L0)={state.bktParams.pL0.toFixed(2)} · P(T)=
              {state.bktParams.pT.toFixed(2)}
            </p>
          </div>

          <button
            type="button"
            onClick={handleResetDemoData}
            className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:text-slate-900 transition-colors whitespace-nowrap"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset Demo Data
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-slate-200 px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4 sticky top-0 z-30">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 -ml-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100"
              aria-label="Open navigation menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 text-sm min-w-0">
              <span className="hidden sm:inline text-slate-400 whitespace-nowrap">
                Adaptive Study Planner
              </span>
              <span className="hidden sm:inline text-slate-300" aria-hidden="true">
                /
              </span>
              <h1 className="font-semibold text-slate-900 truncate">
                {currentNavLabel}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => setAuthModalOpen(true)}
              className="inline-flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition-colors whitespace-nowrap shrink-0"
            >
              {state.student.isSignedIn ? (
                <>
                  <img
                    src={state.student.avatarUrl}
                    alt={state.student.name}
                    referrerPolicy="no-referrer"
                    className="w-6 h-6 rounded-full object-cover border border-slate-200"
                  />
                  <span className="text-xs font-medium text-slate-800">
                    {state.student.name}
                  </span>
                </>
              ) : (
                <>
                  <UserCheck className="w-4 h-4 text-indigo-600" />
                  <span className="text-xs font-medium text-indigo-700">
                    Sign In / Register
                  </span>
                </>
              )}
            </button>
          </div>
        </header>

        {/* Active View Viewport */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {activeView === 'dashboard' && (
            <DashboardView
              subjects={state.subjects}
              topics={state.topics}
              schedule={state.schedule}
              attempts={state.attempts}
              onStartQuiz={handleStartQuiz}
              onToggleSessionComplete={handleToggleSessionComplete}
              onNavigate={handleNavigate}
            />
          )}

          {activeView === 'subjects' && (
            <SubjectsManagerView
              subjects={state.subjects}
              topics={state.topics}
              bktParams={state.bktParams}
              onToggleSubject={handleToggleSubject}
              onToggleTopic={handleToggleTopic}
              onAddSubject={handleAddSubject}
              onAddTopic={handleAddTopic}
              onUpdateBktParams={handleUpdateBktParams}
              onStartQuiz={handleStartQuiz}
            />
          )}

          {activeView === 'quiz' && (
            <QuizRunnerView
              subjects={state.subjects}
              topics={state.topics}
              bktParams={state.bktParams}
              selectedTopicId={selectedQuizTopicId}
              onSelectTopic={setSelectedQuizTopicId}
              onAnswerQuestion={handleAnswerQuestion}
              onCompleteQuiz={handleCompleteQuiz}
              onViewSchedule={() => handleNavigate('planner')}
            />
          )}

          {activeView === 'planner' && (
            <WeeklyPlannerView
              subjects={state.subjects}
              topics={state.topics}
              schedule={state.schedule}
              plannerConfig={state.plannerConfig}
              onUpdateConfig={handleUpdatePlannerConfig}
              onRegenerate={handleRegenerateSchedule}
              onToggleSessionComplete={handleToggleSessionComplete}
              onAdjustDuration={handleAdjustSessionDuration}
              onMoveSessionDay={handleMoveSessionDay}
              onDeleteSession={handleDeleteSession}
            />
          )}

          {activeView === 'history' && (
            <AttemptHistoryView
              attempts={state.attempts}
              student={state.student}
              onOpenAuthModal={() => setAuthModalOpen(true)}
              onStartQuiz={handleStartQuiz}
            />
          )}
        </main>
      </div>

      {/* Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        student={state.student}
        onClose={() => setAuthModalOpen(false)}
        onUpdateStudent={handleUpdateStudent}
      />

      {/* Toast Feedback */}
      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-5 right-5 z-50 flex items-center gap-2 px-4 py-2.5 bg-slate-900 text-white text-xs font-medium rounded-lg shadow-lg"
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
