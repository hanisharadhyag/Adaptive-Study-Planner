import React, { useState } from 'react';
import {
  BookOpen,
  Check,
  Plus,
  RotateCcw,
  SlidersHorizontal,
} from 'lucide-react';
import { BktParams, QuizQuestion, Subject, Topic } from '../types/study';
import { DEFAULT_BKT_PARAMS, formatMasteryPct, getMasteryTier } from '../utils/bkt';
import { TierBadge } from './TierBadge';

interface SubjectsManagerViewProps {
  subjects: Subject[];
  topics: Topic[];
  bktParams: BktParams;
  onToggleSubject: (subjectId: string) => void;
  onToggleTopic: (topicId: string) => void;
  onAddSubject: (name: string, code: string) => void;
  onAddTopic: (payload: {
    subjectId: string;
    name: string;
    description: string;
    initialMastery: number;
    customQuestion?: QuizQuestion;
  }) => void;
  onUpdateBktParams: (params: BktParams) => void;
  onStartQuiz: (topicId: string) => void;
}

export function SubjectsManagerView({
  subjects,
  topics,
  bktParams,
  onToggleSubject,
  onToggleTopic,
  onAddSubject,
  onAddTopic,
  onUpdateBktParams,
  onStartQuiz,
}: SubjectsManagerViewProps) {
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(
    subjects[0]?.id ?? ''
  );
  const [topicName, setTopicName] = useState('');
  const [topicDescription, setTopicDescription] = useState('');
  const [initialMasteryPct, setInitialMasteryPct] = useState(
    Math.round(bktParams.pL0 * 100)
  );
  const [includeCustomQ, setIncludeCustomQ] = useState(false);
  const [qPrompt, setQPrompt] = useState('');
  const [qOptA, setQOptA] = useState('');
  const [qOptB, setQOptB] = useState('');
  const [qOptC, setQOptC] = useState('');
  const [qOptD, setQOptD] = useState('');
  const [qCorrect, setQCorrect] = useState<0 | 1 | 2 | 3>(0);

  const [showAddSubject, setShowAddSubject] = useState(false);
  const [newSubjectName, setNewSubjectName] = useState('');
  const [newSubjectCode, setNewSubjectCode] = useState('');
  const [formFeedback, setFormFeedback] = useState<string | null>(null);

  const handleCreateSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubjectName.trim()) return;
    onAddSubject(newSubjectName.trim(), newSubjectCode.trim() || 'CS Elective');
    setNewSubjectName('');
    setNewSubjectCode('');
    setShowAddSubject(false);
  };

  const handleCreateTopic = (e: React.FormEvent) => {
    e.preventDefault();
    if (!topicName.trim() || !selectedSubjectId) {
      setFormFeedback('Enter a topic name and choose a parent subject.');
      return;
    }

    let customQuestion: QuizQuestion | undefined;
    if (includeCustomQ && qPrompt.trim()) {
      customQuestion = {
        id: `custom-q-${Date.now()}`,
        prompt: qPrompt.trim(),
        options: [
          qOptA.trim() || 'Option A',
          qOptB.trim() || 'Option B',
          qOptC.trim() || 'Option C',
          qOptD.trim() || 'Option D',
        ],
        correctIndex: qCorrect,
        explanation: `Correct answer recorded from your custom practice prompt for ${topicName.trim()}.`,
      };
    }

    onAddTopic({
      subjectId: selectedSubjectId,
      name: topicName.trim(),
      description:
        topicDescription.trim() ||
        `Custom study module covering core principles and problem sets for ${topicName.trim()}.`,
      initialMastery: Math.min(0.95, Math.max(0.05, initialMasteryPct / 100)),
      customQuestion,
    });

    setTopicName('');
    setTopicDescription('');
    setInitialMasteryPct(Math.round(bktParams.pL0 * 100));
    setQPrompt('');
    setQOptA('');
    setQOptB('');
    setQOptC('');
    setQOptD('');
    setIncludeCustomQ(false);
    setFormFeedback('Topic added and synced to your BKT tracker and weekly planner.');
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Subjects & Topics Selection */}
        <div className="lg:col-span-8 space-y-5">
          <div className="bg-white border border-slate-200 rounded-xl p-6">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
              <div>
                <h2 className="text-base font-semibold text-slate-900">
                  Active Subjects & Topics
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Toggle subjects or check specific topics to include in BKT tracking and weekly schedule generation
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddSubject((prev) => !prev)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors whitespace-nowrap"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Subject
              </button>
            </div>

            {showAddSubject && (
              <form
                onSubmit={handleCreateSubject}
                className="mb-5 p-4 bg-slate-50 border border-slate-200 rounded-lg flex flex-wrap items-end gap-3"
              >
                <div className="flex-1 min-w-[180px]">
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Subject Name
                  </label>
                  <input
                    type="text"
                    value={newSubjectName}
                    onChange={(e) => setNewSubjectName(e.target.value)}
                    placeholder="e.g., Operating Systems"
                    className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div className="w-36">
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Course Code
                  </label>
                  <input
                    type="text"
                    value={newSubjectCode}
                    onChange={(e) => setNewSubjectCode(e.target.value)}
                    placeholder="CS 401"
                    className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="submit"
                    className="px-4 py-2 text-xs font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors whitespace-nowrap"
                  >
                    Create Subject
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddSubject(false)}
                    className="px-3 py-2 text-xs font-medium text-slate-600 hover:text-slate-900"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            <div className="space-y-6">
              {subjects.map((subject) => {
                const subjectTopics = topics.filter(
                  (t) => t.subjectId === subject.id
                );
                const enabledTopicsCount = subjectTopics.filter(
                  (t) => t.enabled
                ).length;

                return (
                  <div
                    key={subject.id}
                    className="border border-slate-200 rounded-xl overflow-hidden"
                  >
                    <div className="flex items-center justify-between gap-4 px-4 py-3.5 bg-slate-50 border-b border-slate-200">
                      <div className="flex items-center gap-3 min-w-0">
                        <BookOpen
                          className={`w-4 h-4 shrink-0 ${
                            subject.enabled ? 'text-indigo-600' : 'text-slate-400'
                          }`}
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="text-sm font-semibold text-slate-900 truncate">
                              {subject.name}
                            </h3>
                            <span className="text-xs font-mono text-slate-500">
                              {subject.code}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500">
                            {enabledTopicsCount} of {subjectTopics.length} topics tracked
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        role="switch"
                        aria-checked={subject.enabled}
                        onClick={() => onToggleSubject(subject.id)}
                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 ${
                          subject.enabled ? 'bg-indigo-600' : 'bg-slate-300'
                        }`}
                      >
                        <span className="sr-only">Toggle {subject.name}</span>
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-xs transition duration-200 ${
                            subject.enabled ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>

                    <div className="divide-y divide-slate-100 bg-white">
                      {subjectTopics.length === 0 ? (
                        <p className="px-4 py-6 text-xs text-slate-500 text-center">
                          No topics in this subject yet. Use the form on the right to add one.
                        </p>
                      ) : (
                        subjectTopics.map((topic) => {
                          const tier = getMasteryTier(topic.mastery);
                          const isEffectivelyActive = subject.enabled && topic.enabled;

                          return (
                            <div
                              key={topic.id}
                              className={`px-4 py-3 flex flex-wrap items-center justify-between gap-3 transition-colors ${
                                isEffectivelyActive
                                  ? 'bg-white'
                                  : 'bg-slate-50/60 opacity-75'
                              }`}
                            >
                              <div className="flex items-start gap-3 min-w-0 flex-1">
                                <button
                                  type="button"
                                  onClick={() => onToggleTopic(topic.id)}
                                  aria-pressed={topic.enabled}
                                  aria-label={`Include ${topic.name} in BKT tracking`}
                                  className={`mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-colors ${
                                    topic.enabled
                                      ? 'bg-indigo-600 border-indigo-600 text-white'
                                      : 'bg-white border-slate-300 hover:border-indigo-500'
                                  }`}
                                >
                                  {topic.enabled && <Check className="w-3.5 h-3.5" />}
                                </button>
                                <div className="min-w-0">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="text-sm font-medium text-slate-900">
                                      {topic.name}
                                    </span>
                                    <span className="text-xs text-slate-400">·</span>
                                    <span className="text-xs font-mono tabular-nums text-slate-600">
                                      {formatMasteryPct(topic.mastery)}
                                    </span>
                                    <TierBadge tier={tier} />
                                  </div>
                                  <p className="text-xs text-slate-500 mt-0.5 truncate max-w-xl">
                                    {topic.description}
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center gap-3 shrink-0">
                                <span className="text-xs text-slate-400 font-mono tabular-nums">
                                  {topic.questions.length} MCQs
                                </span>
                                <button
                                  type="button"
                                  onClick={() => onStartQuiz(topic.id)}
                                  className="px-2.5 py-1 text-xs font-medium text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-md transition-colors whitespace-nowrap"
                                >
                                  Quiz
                                </button>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: Add Custom Topic + BKT Model Parameters */}
        <div className="lg:col-span-4 space-y-5">
          <section className="bg-white border border-slate-200 rounded-xl p-6">
            <h2 className="text-base font-semibold text-slate-900">
              Add Custom Topic
            </h2>
            <p className="text-xs text-slate-500 mt-0.5 mb-4">
              New topics start with starter diagnostic questions so you can track BKT mastery immediately.
            </p>

            <form onSubmit={handleCreateTopic} className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Subject
                </label>
                <select
                  value={selectedSubjectId}
                  onChange={(e) => setSelectedSubjectId(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Topic Name
                </label>
                <input
                  type="text"
                  value={topicName}
                  onChange={(e) => setTopicName(e.target.value)}
                  placeholder="e.g., Hash Tables"
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Key Concepts (optional)
                </label>
                <input
                  type="text"
                  value={topicDescription}
                  onChange={(e) => setTopicDescription(e.target.value)}
                  placeholder="Collision handling, load factor, open addressing"
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-medium text-slate-700">
                    Initial Prior P(L0)
                  </label>
                  <span className="text-xs font-mono tabular-nums font-semibold text-indigo-600">
                    {initialMasteryPct}%
                  </span>
                </div>
                <input
                  type="range"
                  min={10}
                  max={85}
                  step={1}
                  value={initialMasteryPct}
                  onChange={(e) => setInitialMasteryPct(Number(e.target.value))}
                  className="w-full accent-indigo-600"
                />
              </div>

              <div className="pt-1">
                <label className="inline-flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeCustomQ}
                    onChange={(e) => setIncludeCustomQ(e.target.checked)}
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  Include a custom MCQ question
                </label>
              </div>

              {includeCustomQ && (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2.5">
                  <input
                    type="text"
                    value={qPrompt}
                    onChange={(e) => setQPrompt(e.target.value)}
                    placeholder="Question prompt..."
                    className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-md"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={qOptA}
                      onChange={(e) => setQOptA(e.target.value)}
                      placeholder="Option A"
                      className="px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-md"
                    />
                    <input
                      type="text"
                      value={qOptB}
                      onChange={(e) => setQOptB(e.target.value)}
                      placeholder="Option B"
                      className="px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-md"
                    />
                    <input
                      type="text"
                      value={qOptC}
                      onChange={(e) => setQOptC(e.target.value)}
                      placeholder="Option C"
                      className="px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-md"
                    />
                    <input
                      type="text"
                      value={qOptD}
                      onChange={(e) => setQOptD(e.target.value)}
                      placeholder="Option D"
                      className="px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-md"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-600">Correct Answer:</span>
                    <select
                      value={qCorrect}
                      onChange={(e) =>
                        setQCorrect(Number(e.target.value) as 0 | 1 | 2 | 3)
                      }
                      className="px-2 py-1 text-xs bg-white border border-slate-300 rounded-md"
                    >
                      <option value={0}>Option A</option>
                      <option value={1}>Option B</option>
                      <option value={2}>Option C</option>
                      <option value={3}>Option D</option>
                    </select>
                  </div>
                </div>
              )}

              {formFeedback && (
                <p className="text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
                  {formFeedback}
                </p>
              )}

              <button
                type="submit"
                className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Topic to Curriculum
              </button>
            </form>
          </section>

          {/* BKT Parameters Panel */}
          <section className="bg-white border border-slate-200 rounded-xl p-6">
            <div className="flex items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-indigo-600" />
                <h2 className="text-sm font-semibold text-slate-900">
                  BKT Model Parameters
                </h2>
              </div>
              <button
                type="button"
                onClick={() => onUpdateBktParams({ ...DEFAULT_BKT_PARAMS })}
                className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-900"
              >
                <RotateCcw className="w-3 h-3" />
                Defaults
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-slate-600">Prior P(L0)</span>
                  <span className="font-mono tabular-nums font-medium text-slate-900">
                    {bktParams.pL0.toFixed(2)}
                  </span>
                </div>
                <input
                  type="range"
                  min={0.05}
                  max={0.5}
                  step={0.01}
                  value={bktParams.pL0}
                  onChange={(e) =>
                    onUpdateBktParams({ ...bktParams, pL0: Number(e.target.value) })
                  }
                  className="w-full accent-indigo-600"
                />
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-slate-600">Learn Rate P(T)</span>
                  <span className="font-mono tabular-nums font-medium text-slate-900">
                    {bktParams.pT.toFixed(2)}
                  </span>
                </div>
                <input
                  type="range"
                  min={0.05}
                  max={0.4}
                  step={0.01}
                  value={bktParams.pT}
                  onChange={(e) =>
                    onUpdateBktParams({ ...bktParams, pT: Number(e.target.value) })
                  }
                  className="w-full accent-indigo-600"
                />
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-slate-600">Guess P(G)</span>
                  <span className="font-mono tabular-nums font-medium text-slate-900">
                    {bktParams.pG.toFixed(2)}
                  </span>
                </div>
                <input
                  type="range"
                  min={0.05}
                  max={0.4}
                  step={0.01}
                  value={bktParams.pG}
                  onChange={(e) =>
                    onUpdateBktParams({ ...bktParams, pG: Number(e.target.value) })
                  }
                  className="w-full accent-indigo-600"
                />
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-slate-600">Slip P(S)</span>
                  <span className="font-mono tabular-nums font-medium text-slate-900">
                    {bktParams.pS.toFixed(2)}
                  </span>
                </div>
                <input
                  type="range"
                  min={0.02}
                  max={0.3}
                  step={0.01}
                  value={bktParams.pS}
                  onChange={(e) =>
                    onUpdateBktParams({ ...bktParams, pS: Number(e.target.value) })
                  }
                  className="w-full accent-indigo-600"
                />
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
