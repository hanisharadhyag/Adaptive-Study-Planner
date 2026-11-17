import {
  AlertTriangle,
  ArrowRight,
  Calendar,
  CheckCircle2,
  Clock,
  Play,
} from 'lucide-react';
import {
  QuizAttempt,
  StudySession,
  Subject,
  Topic,
  ViewId,
} from '../types/study';
import { formatMasteryPct, getMasteryTier } from '../utils/bkt';
import { DAY_FULL_NAMES, getTodayWeekday } from '../utils/scheduler';
import { MasteryChart } from './MasteryChart';
import { TierBadge } from './TierBadge';

interface DashboardViewProps {
  subjects: Subject[];
  topics: Topic[];
  schedule: StudySession[];
  attempts: QuizAttempt[];
  onStartQuiz: (topicId: string) => void;
  onToggleSessionComplete: (sessionId: string) => void;
  onNavigate: (view: ViewId) => void;
}

export function DashboardView({
  subjects,
  topics,
  schedule,
  attempts,
  onStartQuiz,
  onToggleSessionComplete,
  onNavigate,
}: DashboardViewProps) {
  const activeSubjectIds = new Set(
    subjects.filter((s) => s.enabled).map((s) => s.id)
  );
  const subjectNameMap = new Map(subjects.map((s) => [s.id, s.name]));

  const activeTopics = topics.filter(
    (t) => t.enabled && activeSubjectIds.has(t.subjectId)
  );

  const overallReadiness =
    activeTopics.length > 0
      ? activeTopics.reduce((acc, t) => acc + t.mastery, 0) / activeTopics.length
      : 0;

  const weakTopicsCount = activeTopics.filter(
    (t) => getMasteryTier(t.mastery) === 'weak'
  ).length;

  const totalScheduledMinutes = schedule.reduce(
    (sum, s) => sum + s.durationMinutes,
    0
  );
  const completedMinutes = schedule
    .filter((s) => s.completed)
    .reduce((sum, s) => sum + s.durationMinutes, 0);

  const todayCode = getTodayWeekday();
  const todaySessions = schedule.filter((s) => s.day === todayCode);
  const focusSessions =
    todaySessions.length > 0 ? todaySessions : schedule.slice(0, 3);
  const focusDayLabel =
    todaySessions.length > 0
      ? `Today (${DAY_FULL_NAMES[todayCode]})`
      : focusSessions.length > 0
        ? `Upcoming (${DAY_FULL_NAMES[focusSessions[0].day]})`
        : 'No Sessions Scheduled';

  const barFillClass = (mastery: number) => {
    const tier = getMasteryTier(mastery);
    if (tier === 'weak') return 'bg-red-500';
    if (tier === 'developing') return 'bg-amber-500';
    return 'bg-emerald-500';
  };

  const sortedTopics = [...activeTopics].sort((a, b) => a.mastery - b.mastery);

  return (
    <div className="space-y-6">
      {/* KPI Summary Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <p className="text-xs font-medium text-slate-500">Overall Readiness</p>
          <div className="mt-2 flex items-baseline justify-between gap-2">
            <span className="text-3xl font-bold tracking-tight text-slate-900 font-mono tabular-nums">
              {formatMasteryPct(overallReadiness)}
            </span>
            <span className="text-xs text-slate-500">
              across {activeTopics.length} active topics
            </span>
          </div>
          <div className="mt-3 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-indigo-600 rounded-full transition-all duration-300"
              style={{ width: `${Math.round(overallReadiness * 100)}%` }}
            />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <p className="text-xs font-medium text-slate-500">Weak Topics</p>
          <div className="mt-2 flex items-baseline justify-between gap-2">
            <span className="text-3xl font-bold tracking-tight text-slate-900 font-mono tabular-nums">
              {weakTopicsCount}
            </span>
            <span className="inline-flex items-center gap-1 text-xs font-medium text-red-700">
              <AlertTriangle className="w-3.5 h-3.5" aria-hidden="true" />
              Below 40% mastery
            </span>
          </div>
          <p className="mt-3 text-xs text-slate-500">
            Prioritized for 60m concept review blocks
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <p className="text-xs font-medium text-slate-500">
            Weekly Study Scheduled
          </p>
          <div className="mt-2 flex items-baseline justify-between gap-2">
            <span className="text-3xl font-bold tracking-tight text-slate-900 font-mono tabular-nums">
              {(totalScheduledMinutes / 60).toFixed(1)}h
            </span>
            <span className="text-xs font-mono tabular-nums text-slate-500">
              {completedMinutes}m / {totalScheduledMinutes}m done
            </span>
          </div>
          <p className="mt-3 text-xs text-slate-500">
            {schedule.length} adaptive blocks across week
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <p className="text-xs font-medium text-slate-500">Quizzes Completed</p>
          <div className="mt-2 flex items-baseline justify-between gap-2">
            <span className="text-3xl font-bold tracking-tight text-slate-900 font-mono tabular-nums">
              {attempts.length}
            </span>
            <button
              type="button"
              onClick={() => onNavigate('history')}
              className="text-xs font-medium text-indigo-600 hover:text-indigo-700 inline-flex items-center gap-1 whitespace-nowrap"
            >
              View log
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          <p className="mt-3 text-xs text-slate-500">
            Every answer updates BKT P(L) live
          </p>
        </div>
      </div>

      {/* Main Chart + Today's Study Focus */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <section className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-6 flex flex-col">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <h2 className="text-base font-semibold text-slate-900">
                BKT Mastery Distribution
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Estimated probability P(L) per tracked topic against Weak (&lt;40%) and Strong (≥70%) thresholds
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                if (sortedTopics[0]) onStartQuiz(sortedTopics[0].id);
              }}
              disabled={sortedTopics.length === 0}
              className="px-3 py-1.5 text-xs font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors whitespace-nowrap shrink-0"
            >
              Practice Weakest
            </button>
          </div>

          <div className="flex-1">
            <MasteryChart
              topics={activeTopics}
              onSelectTopicQuiz={onStartQuiz}
            />
          </div>
        </section>

        <section className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-6 flex flex-col">
          <div className="flex items-start justify-between gap-3 mb-4">
            <div>
              <h2 className="text-base font-semibold text-slate-900">
                Today&apos;s Study Focus
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">{focusDayLabel}</p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('planner')}
              className="inline-flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-700 whitespace-nowrap shrink-0"
            >
              <Calendar className="w-3.5 h-3.5" />
              Open Planner
            </button>
          </div>

          {focusSessions.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center py-8">
              <p className="text-sm font-medium text-slate-700">
                No study sessions scheduled
              </p>
              <p className="text-xs text-slate-500 mt-1 max-w-xs">
                Enable topics or regenerate your weekly schedule in the Weekly Study Planner.
              </p>
              <button
                type="button"
                onClick={() => onNavigate('planner')}
                className="mt-4 px-3.5 py-2 text-xs font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors"
              >
                Configure Study Plan
              </button>
            </div>
          ) : (
            <div className="flex-1 divide-y divide-slate-100">
              {focusSessions.map((session) => (
                <div
                  key={session.id}
                  className="py-3.5 first:pt-1 last:pb-1 flex items-start justify-between gap-3"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <button
                      type="button"
                      onClick={() => onToggleSessionComplete(session.id)}
                      aria-label={`Mark ${session.topicName} session as ${
                        session.completed ? 'incomplete' : 'completed'
                      }`}
                      className={`mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-colors ${
                        session.completed
                          ? 'bg-emerald-600 border-emerald-600 text-white'
                          : 'border-slate-300 bg-white hover:border-indigo-500'
                      }`}
                    >
                      {session.completed && <CheckCircle2 className="w-3.5 h-3.5" />}
                    </button>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p
                          className={`text-sm font-medium truncate ${
                            session.completed
                              ? 'line-through text-slate-400'
                              : 'text-slate-900'
                          }`}
                        >
                          {session.topicName}
                        </p>
                        <TierBadge tier={session.tier} />
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        {session.sessionType} · {session.day}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="inline-flex items-center gap-1 text-xs font-mono tabular-nums font-medium text-slate-700">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {session.durationMinutes}m
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Topic-Wise Mastery Breakdown */}
      <section className="bg-white border border-slate-200 rounded-xl p-6">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
          <div>
            <h2 className="text-base font-semibold text-slate-900">
              Topic-Wise Mastery Breakdown
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Sorted from lowest to highest BKT mastery so high-priority topics stay visible
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('subjects')}
            className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors whitespace-nowrap"
          >
            Manage Subjects & Topics
          </button>
        </div>

        {sortedTopics.length === 0 ? (
          <div className="py-10 text-center">
            <p className="text-sm font-medium text-slate-700">
              No active topics tracked
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Open Subjects & Topics Manager to toggle on a subject or topic.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {sortedTopics.map((topic) => {
              const tier = getMasteryTier(topic.mastery);
              const pct = Math.round(topic.mastery * 100);
              const subjectName = subjectNameMap.get(topic.subjectId) ?? 'Course';

              return (
                <div
                  key={topic.id}
                  className="border border-slate-200 rounded-xl p-4 bg-slate-50/40 hover:bg-white hover:border-slate-300 transition-colors flex flex-col justify-between gap-4"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h3 className="text-sm font-semibold text-slate-900 truncate">
                          {topic.name}
                        </h3>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {subjectName} · {topic.questions.length} MCQs
                        </p>
                      </div>
                      <TierBadge tier={tier} />
                    </div>

                    <p className="text-xs text-slate-600 mt-2.5 line-clamp-2">
                      {topic.description}
                    </p>
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="text-slate-500">BKT Mastery P(L)</span>
                      <span className="font-mono tabular-nums font-semibold text-slate-900">
                        {pct}%
                      </span>
                    </div>
                    <div className="h-2 w-full bg-slate-200/80 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${barFillClass(
                          topic.mastery
                        )}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>

                    <div className="mt-3.5 flex items-center justify-end">
                      <button
                        type="button"
                        onClick={() => onStartQuiz(topic.id)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors whitespace-nowrap"
                      >
                        <Play className="w-3 h-3" />
                        Take Quiz
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
