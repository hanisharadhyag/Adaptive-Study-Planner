import { AlertTriangle, CheckCircle2, Clock } from 'lucide-react';
import { MasteryTier } from '../types/study';
import { getMasteryTierLabel } from '../utils/bkt';

interface TierBadgeProps {
  tier: MasteryTier;
  size?: 'sm' | 'md';
}

export function TierBadge({ tier, size = 'sm' }: TierBadgeProps) {
  const label = getMasteryTierLabel(tier);

  const styles: Record<MasteryTier, string> = {
    weak: 'bg-red-50 text-red-700 border-red-200',
    developing: 'bg-amber-50 text-amber-700 border-amber-200',
    strong: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  };

  const Icon =
    tier === 'weak' ? AlertTriangle : tier === 'developing' ? Clock : CheckCircle2;

  const sizeClasses =
    size === 'sm' ? 'px-2 py-0.5 text-xs gap-1' : 'px-2.5 py-1 text-xs gap-1.5';

  return (
    <span
      className={`inline-flex items-center font-medium border rounded-md whitespace-nowrap shrink-0 ${styles[tier]} ${sizeClasses}`}
    >
      <Icon className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
      <span>{label}</span>
    </span>
  );
}
