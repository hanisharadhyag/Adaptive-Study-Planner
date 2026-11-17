import {
  Check,
  Clock,
  Minus,
  Plus,
  RefreshCw,
  Trash2,
} from 'lucide-react';
import {
  DayOfWeek,
  PlannerConfig,
  StudySession,
  Subject,
  Topic,
} from '../types/study';
import { ALL_DAYS, DAY_FULL_NAMES } from '../utils/scheduler';
import { TierBadge } from './TierBadge';

interface WeeklyPlannerViewProps {
  subjects: Subject[];
  topics: Topic[];
  schedule: StudySession[];
  plannerConfig: PlannerConfig;
  onUpdateConfig: (next: PlannerConfig) => void;
  onRegenerate: () => void;
  onToggleSessionComplete: (sessionId: string) => void;
  onAdjustDuration: (sessionId: string, deltaMinutes: number) => void;
  onMoveSessionDay: (sessionId: string, newDay: DayOfWeek) => void;
  onDeleteSession: (sessionId: string) => void;
}

export function WeeklyPlannerView({
  schedule,
  plannerConfig,
  onUpdateConfig,
  onRegenerate,
  onToggleSessionComplete,
  onAdjustDuration,
  onMoveSessionDay,
  onDeleteSession,
}: WeeklyPlannerViewProps) {
  const toggleDay = (day: DayOfWeek) => {
    const exists = plannerConfig.preferredDays.includes(day);
    let nextDays: DayOfWeek[];
    if (exists) {
      if (plannerConfig.preferredDays.length === 1) return; // keep at least 1 day
      nextDays = plannerConfig.preferredDays.filter((d) => d !== day);
    } else {
      nextDays = [...plannerConfig.preferredDays, day].sort(
        (a, b) => ALL_DAYS.indexOf(a) - ALL_DAYS.indexOf(b)
      );
    }
    onUpdateConfig({ ...plannerConfig, preferredDays: nextDays });
  };

  const totalMinutes = schedule.reduce((sum, s) => sum + s.durationMinutes, 0);
  const completedMinutes = schedule
    .filter((s) => s.completed)
    .reduce((sum, s) => sum + s.durationMinutes, 0);

  const weakMinutes = schedule
    .filter((s) => s.tier === 'weak')
    .reduce((sum, s) => sum + s.durationMinutes, 0);
  const developingMinutes = schedule
    .filter((s) => s.tier === 'developing')
    .reduce((sum, s) => sum + s.durationMinutes, 0);
  const strongMinutes = schedule
    .filter((s) => s.tier === 'strong')
    .reduce((sum, s) => sum + s.durationMinutes, 0);

  return (
    <div className="space-y-6">
      {/* Top Controls Bar */}
      <section className="bg-white border border-slate-200 rounded-xl p-6">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="flex flex-wrap items-end gap-6">
            <div>
              <label
                htmlFor="weekly-hours-input"
                className="block text-xs font-medium text-slate-700 mb-1.5"
              >
                Available Weekly Study Hours
              </label>
              <div className="flex items-center gap-2">
                <input
                  id="weekly-hours-input"
                  type="number"
                  min={1}
                  max={45}
                  step={0.5}
                  value={plannerConfig.weeklyHours}
                  onChange={(e) => {
                    const val = Math.max(1, Math.min(45, Number(e.target.value) || 1));
                    onUpdateConfig({ ...plannerConfig, weeklyHours: val });
                  }}
                  className="w-24 px-3 py-2 text-sm font-mono tabular-nums bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <span className="text-xs text-slate-500">hrs / week</span>
              </div>
            </div>

            <div>
              <span className="block text-xs font-medium text-slate-700 mb-1.5">
                Preferred Study Days
              </span>
              <div className="flex flex-wrap items-center gap-1.5">
                {ALL_DAYS.map((day) => {
                  const selected = plannerConfig.preferredDays.includes(day);
                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => toggleDay(day)}
                      aria-pressed={selected}
                      className={`px-3 py-2 text-xs font-medium rounded-lg border transition-colors whitespace-nowrap ${
                        selected
                          ? 'bg-indigo-600 text-white border-indigo-600'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onRegenerate}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors whitespace-nowrap shrink-0"
          >
            <RefreshCw className="w-4 h-4" />
            Regenerate Adaptive Schedule
          </button>
        </div>

        {/* Allocation Summary Strip */}
        <div className="mt-5 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-600">
          <div className="flex flex-wrap items-center gap-4">
            <span>
              Total Planned:{' '}
              <strong className="font-mono tabular-nums text-slate-900">
                {(totalMinutes / 60).toFixed(1)}h ({totalMinutes}m)
              </strong>
            </span>
            <span aria-hidden="true" className="text-slate-300">
              |
            </span>
            <span>
              Weak Focus:{' '}
              <strong className="font-mono tabular-nums text-red-700">
                {weakMinutes}m
              </strong>
            </span>
            <span>
              Developing:{' '}
              <strong className="font-mono tabular-nums text-amber-700">
                {developingMinutes}m
              </strong>
            </span>
            <span>
              Strong Revision:{' '}
              <strong className="font-mono tabular-nums text-emerald-700">
                {strongMinutes}m
              </strong>
            </span>
          </div>

          <div className="font-mono tabular-nums">
            Progress:{' '}
            <strong className="text-slate-900">
              {completedMinutes}m / {totalMinutes}m completed
            </strong>
          </div>
        </div>
      </section>

      {/* 7-Day Schedule Board */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-7 gap-4 items-start">
        {ALL_DAYS.map((day) => {
          const daySessions = schedule.filter((s) => s.day === day);
          const dayTotal = daySessions.reduce(
            (sum, s) => sum + s.durationMinutes,
            0
          );
          const isPreferred = plannerConfig.preferredDays.includes(day);

          return (
            <div
              key={day}
              className={`border rounded-xl overflow-hidden flex flex-col ${
                isPreferred
                  ? 'bg-white border-slate-200'
                  : 'bg-slate-50/60 border-slate-200/80'
              }`}
            >
              <div className="px-3.5 py-3 border-b border-slate-200 bg-slate-50 flex items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">
                    {DAY_FULL_NAMES[day]}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    {isPreferred ? 'Study Day' : 'Rest Day'}
                  </p>
                </div>
                <span className="text-xs font-mono tabular-nums font-medium text-slate-700">
                  {dayTotal}m
                </span>
              </div>

              <div className="p-3 space-y-3 min-h-[160px]">
                {daySessions.length === 0 ? (
                  <div className="h-32 flex items-center justify-center text-center px-2">
                    <p className="text-xs text-slate-400">
                      {isPreferred
                        ? 'No sessions assigned'
                        : 'Rest / off day'}
                    </p>
                  </div>
                ) : (
                  daySessions.map((session) => (
                    <div
                      key={session.id}
                      className={`p-3 rounded-lg border transition-colors ${
                        session.completed
                          ? 'bg-slate-50 border-slate-200 opacity-75'
                          : 'bg-white border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <button
                          type="button"
                          onClick={() => onToggleSessionComplete(session.id)}
                          aria-label={`Mark ${session.topicName} on ${day} as ${
                            session.completed ? 'incomplete' : 'completed'
                          }`}
                          className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors ${
                            session.completed
                              ? 'bg-emerald-600 border-emerald-600 text-white'
                              : 'bg-white border-slate-300 hover:border-indigo-500'
                          }`}
                        >
                          {session.completed && <Check className="w-3 h-3" />}
                        </button>

                        <div className="min-w-0 flex-1">
                          <p
                            className={`text-xs font-semibold leading-snug ${
                              session.completed
                                ? 'line-through text-slate-400'
                                : 'text-slate-900'
                            }`}
                          >
                            {session.topicName}
                          </p>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            {session.sessionType}
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => onDeleteSession(session.id)}
                          aria-label={`Remove ${session.topicName} session`}
                          className="p-1 text-slate-400 hover:text-red-600 rounded transition-colors shrink-0"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>

                      <div className="mt-2.5 flex items-center justify-between gap-2">
                        <TierBadge tier={session.tier} />
                        <span className="inline-flex items-center gap-1 text-xs font-mono tabular-nums font-medium text-slate-700">
                          <Clock className="w-3 h-3 text-slate-400" />
                          {session.durationMinutes}m
                        </span>
                      </div>

                      {/* Interactive editing controls: duration & move day */}
                      <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between gap-1.5">
                        <div className="inline-flex items-center border border-slate-200 rounded-md overflow-hidden">
                          <button
                            type="button"
                            onClick={() => onAdjustDuration(session.id, -5)}
                            aria-label="Decrease session duration by 5 minutes"
                            className="p-1 text-slate-600 hover:bg-slate-100 transition-colors"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="px-1.5 text-[11px] font-mono tabular-nums text-slate-700">
                            ±5m
                          </span>
                          <button
                            type="button"
                            onClick={() => onAdjustDuration(session.id, 5)}
                            aria-label="Increase session duration by 5 minutes"
                            className="p-1 text-slate-600 hover:bg-slate-100 transition-colors"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <select
                          aria-label={`Move ${session.topicName} session to another day`}
                          value={session.day}
                          onChange={(e) =>
                            onMoveSessionDay(
                              session.id,
                              e.target.value as DayOfWeek
                            )
                          }
                          className="px-1.5 py-0.5 text-[11px] bg-slate-50 border border-slate-200 rounded-md text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        >
                          {ALL_DAYS.map((d) => (
                            <option key={d} value={d}>
                              {d}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
