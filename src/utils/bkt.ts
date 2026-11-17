import { BktParams, MasteryTier } from '../types/study';

export const DEFAULT_BKT_PARAMS: BktParams = {
  pL0: 0.20,
  pT: 0.15,
  pG: 0.25,
  pS: 0.10,
};

/**
 * Computes posterior mastery P(L_next) after observing a single MCQ response.
 * Exact Bayesian Knowledge Tracing update:
 * - If correct:   P(L|obs) = (P(L)*(1 - P(S))) / (P(L)*(1 - P(S)) + (1 - P(L))*P(G))
 * - If incorrect: P(L|obs) = (P(L)*P(S)) / (P(L)*P(S) + (1 - P(L))*(1 - P(G)))
 * - Next mastery: P(L_next) = P(L|obs) + (1 - P(L|obs))*P(T)
 */
export function updateBktMastery(
  currentMastery: number,
  isCorrect: boolean,
  params: BktParams = DEFAULT_BKT_PARAMS
): number {
  const pL = Math.min(0.999, Math.max(0.001, currentMastery));
  const { pT, pG, pS } = params;

  let pLObs: number;
  if (isCorrect) {
    const numerator = pL * (1 - pS);
    const denominator = numerator + (1 - pL) * pG;
    pLObs = denominator > 0 ? numerator / denominator : pL;
  } else {
    const numerator = pL * pS;
    const denominator = numerator + (1 - pL) * (1 - pG);
    pLObs = denominator > 0 ? numerator / denominator : pL;
  }

  const pLNext = pLObs + (1 - pLObs) * pT;
  return Math.min(0.99, Math.max(0.01, pLNext));
}

/**
 * Classifies mastery probability into Weak (<40%), Developing (40%-69%), or Strong (>=70%).
 */
export function getMasteryTier(mastery: number): MasteryTier {
  const pct = Math.round(mastery * 100);
  if (pct < 40) return 'weak';
  if (pct < 70) return 'developing';
  return 'strong';
}

export function getMasteryTierLabel(tier: MasteryTier): string {
  switch (tier) {
    case 'weak':
      return 'Weak';
    case 'developing':
      return 'Developing';
    case 'strong':
      return 'Strong';
  }
}

export function formatMasteryPct(mastery: number): string {
  return `${Math.round(mastery * 100)}%`;
}
