import { useState } from 'react';
import { ArrowRight, Search, UserCheck } from 'lucide-react';
import { QuizAttempt, StudentProfile } from '../types/study';
import { formatMasteryPct } from '../utils/bkt';
import { TierBadge } from './TierBadge';

interface AttemptHistoryViewProps {
  attempts: QuizAttempt[];
  student: StudentProfile;
  onOpenAuthModal: () => void;
  onStartQuiz: (topicId: string) => void;
}

export function AttemptHistoryView({
  attempts,
  student,
  onOpenAuthModal,
  onStartQuiz,
}: AttemptHistoryViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [topicFilter, setTopicFilter] = useState('all');

  const uniqueTopics = Array.from(new Set(attempts.map((a) => a.topicName)));

  const filteredAttempts = attempts.filter((attempt) => {
    const matchesTopic =
      topicFilter === 'all' || attempt.topicName === topicFilter;
    const matchesQuery =
      !searchQuery.trim() ||
      attempt.topicName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      attempt.subjectName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTopic && matchesQuery;
  });

  const formatTimestamp = (iso: string) => {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6">
      {/* Student Profile & Auth Demo Banner */}
      <section className="bg-white border border-slate-200 rounded-xl p-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4 min-w-0">
          <img
            src={student.avatarUrl}
            alt={student.name}
            referrerPolicy="no-referrer"
            className="w-12 h-12 rounded-full object-cover border border-slate-200 shrink-0"
          />
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base font-semibold text-slate-900">
                {student.name}
              </h2>
              <span className="text-xs text-slate-400">·</span>
              <span className="text-xs text-slate-600">
                {student.major} · {student.year}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {student.isSignedIn
                ? `Signed in as ${student.email}`
                : 'Guest preview mode (local persistence active)'}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onOpenAuthModal}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors whitespace-nowrap shrink-0"
        >
          <UserCheck className="w-4 h-4" />
          {student.isSignedIn ? 'Switch / Auth Demo' : 'Sign In / Register'}
        </button>
      </section>

      {/* Attempt Log Table */}
      <section className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="p-6 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-semibold text-slate-900">
              Quiz Attempt History
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Chronological record of scores and Bayesian Knowledge Tracing probability updates
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search topic..."
                className="pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <select
              aria-label="Filter attempts by topic"
              value={topicFilter}
              onChange={(e) => setTopicFilter(e.target.value)}
              className="px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Topics</option>
              {uniqueTopics.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {filteredAttempts.length === 0 ? (
          <div className="p-10 text-center">
            <p className="text-sm font-medium text-slate-700">
              No matching quiz attempts recorded
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Complete a topic quiz to log your score and BKT mastery shift.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-medium text-slate-500">
                  <th className="py-3 px-6 whitespace-nowrap">Date / Time</th>
                  <th className="py-3 px-4 whitespace-nowrap">Topic</th>
                  <th className="py-3 px-4 whitespace-nowrap text-right">Score</th>
                  <th className="py-3 px-4 whitespace-nowrap">
                    BKT Probability (Before → After)
                  </th>
                  <th className="py-3 px-4 whitespace-nowrap">Tier After</th>
                  <th className="py-3 px-6 whitespace-nowrap text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredAttempts.map((attempt) => {
                  const delta = Math.round(
                    (attempt.masteryAfter - attempt.masteryBefore) * 100
                  );

                  return (
                    <tr
                      key={attempt.id}
                      className="hover:bg-slate-50/70 transition-colors"
                    >
                      <td className="py-3.5 px-6 text-xs font-mono tabular-nums text-slate-500 whitespace-nowrap">
                        {formatTimestamp(attempt.timestamp)}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <p className="font-medium text-slate-900">
                          {attempt.topicName}
                        </p>
                        <p className="text-xs text-slate-500">
                          {attempt.subjectName}
                        </p>
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono tabular-nums whitespace-nowrap">
                        <span className="font-semibold text-slate-900">
                          {attempt.correctCount}/{attempt.totalQuestions}
                        </span>
                        <span className="text-xs text-slate-500 ml-1.5">
                          ({Math.round((attempt.correctCount / attempt.totalQuestions) * 100)}%)
                        </span>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="inline-flex items-center gap-2 font-mono tabular-nums text-xs">
                          <span className="text-slate-500">
                            {formatMasteryPct(attempt.masteryBefore)}
                          </span>
                          <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                          <span className="font-semibold text-slate-900">
                            {formatMasteryPct(attempt.masteryAfter)}
                          </span>
                          <span
                            className={`font-semibold ${
                              delta >= 0 ? 'text-emerald-700' : 'text-red-700'
                            }`}
                          >
                            ({delta >= 0 ? '+' : ''}
                            {delta}%)
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <TierBadge tier={attempt.tierAfter} />
                      </td>
                      <td className="py-3.5 px-6 text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => onStartQuiz(attempt.topicId)}
                          className="text-xs font-medium text-indigo-600 hover:text-indigo-700"
                        >
                          Retake
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
