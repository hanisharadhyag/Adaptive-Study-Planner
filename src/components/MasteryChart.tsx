import { useState } from 'react';
import { Topic } from '../types/study';
import { formatMasteryPct, getMasteryTier } from '../utils/bkt';
import { TierBadge } from './TierBadge';

interface MasteryChartProps {
  topics: Topic[];
  onSelectTopicQuiz: (topicId: string) => void;
}

export function MasteryChart({ topics, onSelectTopicQuiz }: MasteryChartProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  if (topics.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center px-4">
        <p className="text-sm font-medium text-slate-700">No active topics selected</p>
        <p className="text-xs text-slate-500 mt-1">
          Enable a subject or check topics in Subjects & Topics to visualize mastery probabilities.
        </p>
      </div>
    );
  }

  const hoveredTopic = topics.find((t) => t.id === hoveredId) ?? topics[0];

  const barColorClass = (mastery: number) => {
    const tier = getMasteryTier(mastery);
    if (tier === 'weak') return 'fill-red-500 hover:fill-red-600';
    if (tier === 'developing') return 'fill-amber-500 hover:fill-amber-600';
    return 'fill-emerald-500 hover:fill-emerald-600';
  };

  // SVG coordinate space
  const chartWidth = 640;
  const chartHeight = 250;
  const padLeft = 42;
  const padRight = 18;
  const padTop = 20;
  const padBottom = 46;
  const innerWidth = chartWidth - padLeft - padRight;
  const innerHeight = chartHeight - padTop - padBottom;

  const yForPct = (pct: number) => padTop + innerHeight * (1 - pct / 100);
  const slotWidth = innerWidth / topics.length;
  const barWidth = Math.min(46, Math.max(20, slotWidth * 0.56));

  return (
    <div className="flex flex-col h-full">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-4 text-xs text-slate-500">
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-red-500 inline-block" aria-hidden="true" />
            Weak (&lt;40%)
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-amber-500 inline-block" aria-hidden="true" />
            Developing (40–69%)
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500 inline-block" aria-hidden="true" />
            Strong (≥70%)
          </span>
        </div>

        {hoveredTopic && (
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <span className="font-medium text-slate-900">{hoveredTopic.name}</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono tabular-nums font-semibold text-slate-900">
              P(L) {formatMasteryPct(hoveredTopic.mastery)}
            </span>
            <TierBadge tier={getMasteryTier(hoveredTopic.mastery)} />
          </div>
        )}
      </div>

      <div className="w-full overflow-x-auto">
        <svg
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          className="w-full h-auto min-w-[460px]"
          role="img"
          aria-label="Topic-wise Bayesian Knowledge Tracing mastery comparison bar chart"
        >
          {/* Horizontal grid lines */}
          {[0, 20, 40, 60, 70, 80, 100].map((tick) => {
            const y = yForPct(tick);
            const isThreshold = tick === 40 || tick === 70;
            return (
              <g key={tick}>
                <line
                  x1={padLeft}
                  y1={y}
                  x2={chartWidth - padRight}
                  y2={y}
                  stroke={
                    tick === 40
                      ? '#f87171'
                      : tick === 70
                        ? '#34d399'
                        : '#e2e8f0'
                  }
                  strokeWidth={isThreshold ? 1.25 : 1}
                  strokeDasharray={isThreshold ? '4 4' : undefined}
                />
                <text
                  x={padLeft - 8}
                  y={y + 4}
                  textAnchor="end"
                  className="fill-slate-400 text-[10px] font-mono tabular-nums"
                >
                  {tick}%
                </text>
              </g>
            );
          })}

          {/* Threshold annotations */}
          <text
            x={chartWidth - padRight}
            y={yForPct(70) - 5}
            textAnchor="end"
            className="fill-emerald-600 text-[10px] font-medium"
          >
            Strong ≥70%
          </text>
          <text
            x={chartWidth - padRight}
            y={yForPct(40) - 5}
            textAnchor="end"
            className="fill-red-600 text-[10px] font-medium"
          >
            Weak &lt;40%
          </text>

          {/* Bars */}
          {topics.map((topic, i) => {
            const pct = Math.round(topic.mastery * 100);
            const xCenter = padLeft + slotWidth * i + slotWidth / 2;
            const barX = xCenter - barWidth / 2;
            const barY = yForPct(pct);
            const barH = Math.max(4, yForPct(0) - barY);
            const isHovered = hoveredTopic?.id === topic.id;
            const shortLabel =
              topic.name.length > 12 ? `${topic.name.slice(0, 11)}…` : topic.name;

            return (
              <g
                key={topic.id}
                className="cursor-pointer group"
                onMouseEnter={() => setHoveredId(topic.id)}
                onFocus={() => setHoveredId(topic.id)}
                onClick={() => onSelectTopicQuiz(topic.id)}
                tabIndex={0}
                role="button"
                aria-label={`${topic.name}: ${pct}% mastery. Click to take quiz.`}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onSelectTopicQuiz(topic.id);
                  }
                }}
              >
                {/* Hover column highlight */}
                {isHovered && (
                  <rect
                    x={xCenter - slotWidth / 2 + 4}
                    y={padTop}
                    width={slotWidth - 8}
                    height={innerHeight}
                    rx={6}
                    className="fill-slate-100/80"
                  />
                )}

                <rect
                  x={barX}
                  y={barY}
                  width={barWidth}
                  height={barH}
                  rx={5}
                  className={`transition-opacity duration-150 ${barColorClass(topic.mastery)}`}
                />

                {/* Percentage readout above bar */}
                <text
                  x={xCenter}
                  y={barY - 6}
                  textAnchor="middle"
                  className="fill-slate-700 text-[11px] font-mono tabular-nums font-semibold"
                >
                  {pct}%
                </text>

                {/* X-axis label */}
                <text
                  x={xCenter}
                  y={chartHeight - 20}
                  textAnchor="middle"
                  className={`text-[11px] font-medium ${
                    isHovered ? 'fill-indigo-600' : 'fill-slate-600'
                  }`}
                >
                  {shortLabel}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
      <p className="text-xs text-slate-400 mt-1">
        Click any topic bar to launch a diagnostic MCQ quiz and update its BKT mastery estimate.
      </p>
    </div>
  );
}
