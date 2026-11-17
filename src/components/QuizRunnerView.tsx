import { useEffect, useState } from 'react';
import {
  ArrowRight,
  Calendar,
  CheckCircle2,
  ChevronRight,
  RotateCcw,
  TrendingUp,
  XCircle,
} from 'lucide-react';
import { BktParams, MasteryTier, Subject, Topic } from '../types/study';
import {
  formatMasteryPct,
  getMasteryTier,
  getMasteryTierLabel,
  updateBktMastery,
} from '../utils/bkt';
import { TierBadge } from './TierBadge';

interface QuizRunnerViewProps {
  subjects: Subject[];
  topics: Topic[];
  bktParams: BktParams;
  selectedTopicId: string;
  onSelectTopic: (topicId: string) => void;
  onAnswerQuestion: (topicId: string, newMastery: number) => void;
  onCompleteQuiz: (summary: {
    topicId: string;
    correctCount: number;
    totalQuestions: number;
    masteryBefore: number;
    masteryAfter: number;
  }) => void;
  onViewSchedule: () => void;
}

const OPTION_LETTERS = ['A', 'B', 'C', 'D'] as const;

export function QuizRunnerView({
  subjects,
  topics,
  bktParams,
  selectedTopicId,
  onSelectTopic,
  onAnswerQuestion,
  onCompleteQuiz,
  onViewSchedule,
}: QuizRunnerViewProps) {
  const activeSubjectIds = new Set(
    subjects.filter((s) => s.enabled).map((s) => s.id)
  );
  const availableTopics = topics.filter(
    (t) => t.enabled && activeSubjectIds.has(t.subjectId) && t.questions.length > 0
  );

  const currentTopic =
    availableTopics.find((t) => t.id === selectedTopicId) ??
    topics.find((t) => t.id === selectedTopicId) ??
    availableTopics[0] ??
    topics[0];

  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [quizStartMastery, setQuizStartMastery] = useState<number>(
    currentTopic?.mastery ?? 0.2
  );
  const [stepMasteryBefore, setStepMasteryBefore] = useState<number>(
    currentTopic?.mastery ?? 0.2
  );
  const [stepMasteryAfter, setStepMasteryAfter] = useState<number>(
    currentTopic?.mastery ?? 0.2
  );
  const [correctCount, setCorrectCount] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);

  // Reset local runner state whenever the user switches topics
  useEffect(() => {
    if (!currentTopic) return;
    setQuestionIndex(0);
    setSelectedOption(null);
    setSubmitted(false);
    setQuizStartMastery(currentTopic.mastery);
    setStepMasteryBefore(currentTopic.mastery);
    setStepMasteryAfter(currentTopic.mastery);
    setCorrectCount(0);
    setQuizFinished(false);
  }, [currentTopic?.id]);

  if (!currentTopic) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-10 text-center">
        <p className="text-base font-semibold text-slate-900">
          No quizzable topics enabled
        </p>
        <p className="text-sm text-slate-500 mt-1">
          Enable at least one subject and topic in Subjects & Topics Manager to start a quiz.
        </p>
      </div>
    );
  }

  const questions = currentTopic.questions;
  const currentQuestion = questions[questionIndex];
  const totalQuestions = questions.length;

  const handleRestartQuiz = () => {
    setQuestionIndex(0);
    setSelectedOption(null);
    setSubmitted(false);
    setQuizStartMastery(currentTopic.mastery);
    setStepMasteryBefore(currentTopic.mastery);
    setStepMasteryAfter(currentTopic.mastery);
    setCorrectCount(0);
    setQuizFinished(false);
  };

  const handleSubmitAnswer = () => {
    if (selectedOption === null || submitted || !currentQuestion) return;
    const isCorrect = selectedOption === currentQuestion.correctIndex;
    const before = currentTopic.mastery;
    const after = updateBktMastery(before, isCorrect, bktParams);

    setStepMasteryBefore(before);
    setStepMasteryAfter(after);
    if (isCorrect) {
      setCorrectCount((c) => c + 1);
    }
    setSubmitted(true);
    onAnswerQuestion(currentTopic.id, after);
  };

  const handleNext = () => {
    if (questionIndex + 1 < totalQuestions) {
      setQuestionIndex((i) => i + 1);
      setSelectedOption(null);
      setSubmitted(false);
    } else {
      setQuizFinished(true);
      onCompleteQuiz({
        topicId: currentTopic.id,
        correctCount,
        totalQuestions,
        masteryBefore: quizStartMastery,
        masteryAfter: currentTopic.mastery,
      });
    }
  };

  const renderTierChangeNote = (before: number, after: number) => {
    const tBefore: MasteryTier = getMasteryTier(before);
    const tAfter: MasteryTier = getMasteryTier(after);
    if (tBefore !== tAfter) {
      const upgraded =
        (tBefore === 'weak' && (tAfter === 'developing' || tAfter === 'strong')) ||
        (tBefore === 'developing' && tAfter === 'strong');
      return (
        <span
          className={`text-xs font-semibold ${
            upgraded ? 'text-emerald-700' : 'text-amber-700'
          }`}
        >
          Status {upgraded ? 'upgraded' : 'shifted'} from{' '}
          {getMasteryTierLabel(tBefore)} to {getMasteryTierLabel(tAfter)}!
        </span>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Topic Selector Strip */}
      <div className="bg-white border border-slate-200 rounded-xl p-4">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <span className="text-xs font-semibold text-slate-700">
            Select Topic to Practice
          </span>
          <select
            aria-label="Choose quiz topic"
            value={currentTopic.id}
            onChange={(e) => onSelectTopic(e.target.value)}
            className="sm:hidden w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg"
          >
            {topics
              .filter((t) => t.questions.length > 0)
              .map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} ({formatMasteryPct(t.mastery)})
                </option>
              ))}
          </select>
        </div>

        <div className="hidden sm:flex flex-wrap gap-2">
          {topics
            .filter((t) => t.questions.length > 0)
            .map((topic) => {
              const active = topic.id === currentTopic.id;
              const tier = getMasteryTier(topic.mastery);
              const dotClass =
                tier === 'weak'
                  ? 'text-red-600'
                  : tier === 'developing'
                    ? 'text-amber-600'
                    : 'text-emerald-600';

              return (
                <button
                  key={topic.id}
                  type="button"
                  onClick={() => onSelectTopic(topic.id)}
                  className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium border transition-colors whitespace-nowrap shrink-0 ${
                    active
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <span>{topic.name}</span>
                  <span
                    className={`font-mono tabular-nums ${
                      active ? 'text-indigo-100' : dotClass
                    }`}
                  >
                    {formatMasteryPct(topic.mastery)}
                  </span>
                </button>
              );
            })}
        </div>
      </div>

      {/* Main Quiz Stage */}
      <div className="max-w-3xl mx-auto">
        {quizFinished ? (
          <div className="bg-white border border-slate-200 rounded-xl p-8">
            <div className="flex flex-wrap items-start justify-between gap-4 pb-6 border-b border-slate-200">
              <div>
                <p className="text-xs font-medium text-indigo-600">
                  Quiz Complete · Adaptive Schedule Synced
                </p>
                <h2 className="text-2xl font-bold text-slate-900 mt-1">
                  {currentTopic.name} Assessment Summary
                </h2>
              </div>
              <TierBadge tier={getMasteryTier(currentTopic.mastery)} size="md" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-6">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                <p className="text-xs text-slate-500">Quiz Score</p>
                <p className="text-2xl font-bold font-mono tabular-nums text-slate-900 mt-1">
                  {correctCount} / {totalQuestions}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  {Math.round((correctCount / totalQuestions) * 100)}% accuracy
                </p>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl sm:col-span-2">
                <p className="text-xs text-slate-500">BKT Mastery Shift</p>
                <div className="flex items-center gap-3 mt-1 flex-wrap">
                  <span className="text-2xl font-bold font-mono tabular-nums text-slate-500">
                    {formatMasteryPct(quizStartMastery)}
                  </span>
                  <ArrowRight className="w-5 h-5 text-slate-400" />
                  <span className="text-2xl font-bold font-mono tabular-nums text-indigo-600">
                    {formatMasteryPct(currentTopic.mastery)}
                  </span>
                  <span
                    className={`text-xs font-mono tabular-nums font-semibold px-2 py-0.5 rounded-md ${
                      currentTopic.mastery >= quizStartMastery
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-red-50 text-red-700'
                    }`}
                  >
                    {currentTopic.mastery >= quizStartMastery ? '+' : ''}
                    {Math.round((currentTopic.mastery - quizStartMastery) * 100)}%
                  </span>
                </div>
                <div className="mt-2">
                  {renderTierChangeNote(quizStartMastery, currentTopic.mastery) ?? (
                    <span className="text-xs text-slate-600">
                      Current proficiency tier: {getMasteryTierLabel(getMasteryTier(currentTopic.mastery))}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <p className="text-sm text-slate-600 mb-6">
              Your weekly study schedule has been recalculated based on your updated{' '}
              <span className="font-medium text-slate-900">{currentTopic.name}</span>{' '}
              mastery probability.
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={onViewSchedule}
                className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors whitespace-nowrap"
              >
                <Calendar className="w-4 h-4" />
                View Updated Schedule
              </button>
              <button
                type="button"
                onClick={handleRestartQuiz}
                className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors whitespace-nowrap"
              >
                <RotateCcw className="w-4 h-4" />
                Retake Quiz
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8">
            {/* Header & Progress */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
              <div>
                <div className="flex items-center gap-2.5">
                  <h2 className="text-lg font-semibold text-slate-900">
                    {currentTopic.name}
                  </h2>
                  <TierBadge tier={getMasteryTier(currentTopic.mastery)} />
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Question {questionIndex + 1} of {totalQuestions} · Current BKT Mastery:{' '}
                  <span className="font-mono tabular-nums font-semibold text-slate-800">
                    {formatMasteryPct(currentTopic.mastery)}
                  </span>
                </p>
              </div>

              <div className="w-32 h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-600 rounded-full transition-all duration-200"
                  style={{
                    width: `${((questionIndex + (submitted ? 1 : 0)) / totalQuestions) * 100}%`,
                  }}
                />
              </div>
            </div>

            {/* Question Prompt */}
            <h3 className="text-base sm:text-lg font-medium text-slate-900 leading-relaxed mb-6">
              {currentQuestion.prompt}
            </h3>

            {/* 4 Options */}
            <div className="space-y-3">
              {currentQuestion.options.map((optionText, idx) => {
                const isSelected = selectedOption === idx;
                const isCorrectOption = idx === currentQuestion.correctIndex;

                let containerStyle =
                  'border-slate-200 bg-white hover:border-indigo-300 hover:bg-slate-50';
                let letterStyle = 'bg-slate-100 text-slate-700 border-slate-200';

                if (submitted) {
                  if (isCorrectOption) {
                    containerStyle = 'border-emerald-500 bg-emerald-50/70';
                    letterStyle = 'bg-emerald-600 text-white border-emerald-600';
                  } else if (isSelected && !isCorrectOption) {
                    containerStyle = 'border-red-400 bg-red-50/70';
                    letterStyle = 'bg-red-600 text-white border-red-600';
                  } else {
                    containerStyle = 'border-slate-200 bg-slate-50/50 opacity-70';
                  }
                } else if (isSelected) {
                  containerStyle = 'border-indigo-600 bg-indigo-50/60 ring-1 ring-indigo-600';
                  letterStyle = 'bg-indigo-600 text-white border-indigo-600';
                }

                return (
                  <button
                    key={idx}
                    type="button"
                    disabled={submitted}
                    onClick={() => setSelectedOption(idx)}
                    className={`w-full text-left p-4 rounded-xl border transition-colors flex items-center justify-between gap-4 ${containerStyle}`}
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <span
                        className={`w-7 h-7 rounded-lg border text-xs font-mono font-semibold flex items-center justify-center shrink-0 ${letterStyle}`}
                      >
                        {OPTION_LETTERS[idx]}
                      </span>
                      <span className="text-sm text-slate-800">{optionText}</span>
                    </div>

                    {submitted && isCorrectOption && (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    )}
                    {submitted && isSelected && !isCorrectOption && (
                      <XCircle className="w-5 h-5 text-red-600 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Feedback & Live BKT Shift Readout */}
            {submitted && (
              <div className="mt-6 space-y-4">
                <div
                  className={`p-4 rounded-xl border ${
                    selectedOption === currentQuestion.correctIndex
                      ? 'bg-emerald-50/70 border-emerald-200'
                      : 'bg-red-50/70 border-red-200'
                  }`}
                >
                  <p
                    className={`text-sm font-semibold ${
                      selectedOption === currentQuestion.correctIndex
                        ? 'text-emerald-800'
                        : 'text-red-800'
                    }`}
                  >
                    {selectedOption === currentQuestion.correctIndex
                      ? 'Correct!'
                      : `Incorrect — Correct option is ${OPTION_LETTERS[currentQuestion.correctIndex]}`}
                  </p>
                  <p className="text-xs text-slate-700 mt-1 leading-relaxed">
                    {currentQuestion.explanation}
                  </p>
                </div>

                {/* Live BKT Mastery Shift */}
                <div className="p-4 rounded-xl border border-indigo-200 bg-indigo-50/60 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <TrendingUp className="w-4 h-4 text-indigo-600 shrink-0" />
                    <div className="text-xs sm:text-sm text-slate-800">
                      <span className="font-semibold">{currentTopic.name} Mastery:</span>{' '}
                      <span className="font-mono tabular-nums text-slate-600">
                        {formatMasteryPct(stepMasteryBefore)}
                      </span>{' '}
                      <span aria-hidden="true">→</span>{' '}
                      <span className="font-mono tabular-nums font-bold text-indigo-700">
                        {formatMasteryPct(stepMasteryAfter)}
                      </span>
                    </div>
                  </div>
                  <div>{renderTierChangeNote(stepMasteryBefore, stepMasteryAfter)}</div>
                </div>
              </div>
            )}

            {/* Action Footer */}
            <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={handleRestartQuiz}
                className="text-xs font-medium text-slate-500 hover:text-slate-800 transition-colors"
              >
                Reset Quiz
              </button>

              {!submitted ? (
                <button
                  type="button"
                  disabled={selectedOption === null}
                  onClick={handleSubmitAnswer}
                  className="px-5 py-2.5 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
                >
                  Submit Answer
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleNext}
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors whitespace-nowrap"
                >
                  {questionIndex + 1 < totalQuestions ? 'Next Question' : 'Finish Quiz'}
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
