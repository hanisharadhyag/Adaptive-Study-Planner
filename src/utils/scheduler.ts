import {
  DayOfWeek,
  MasteryTier,
  PlannerConfig,
  StudySession,
  Subject,
  Topic,
} from '../types/study';
import { getMasteryTier } from './bkt';

export const ALL_DAYS: DayOfWeek[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export const DAY_FULL_NAMES: Record<DayOfWeek, string> = {
  Mon: 'Monday',
  Tue: 'Tuesday',
  Wed: 'Wednesday',
  Thu: 'Thursday',
  Fri: 'Friday',
  Sat: 'Saturday',
  Sun: 'Sunday',
};

function getSessionTypeForTier(tier: MasteryTier): StudySession['sessionType'] {
  if (tier === 'weak') return 'Concept Review + Practice';
  if (tier === 'developing') return 'Guided Problem Solving';
  return 'Quick Revision';
}

function getBaseBlockMinutes(tier: MasteryTier): number {
  if (tier === 'weak') return 60;
  if (tier === 'developing') return 45;
  return 25;
}

/**
 * Generates an adaptive weekly study schedule distributing available weekly minutes
 * inversely proportional to topic mastery across the student's preferred study days.
 */
export function generateAdaptiveSchedule(
  subjects: Subject[],
  topics: Topic[],
  config: PlannerConfig
): StudySession[] {
  const activeSubjectMap = new Map<string, Subject>();
  for (const s of subjects) {
    if (s.enabled) activeSubjectMap.set(s.id, s);
  }

  const activeTopics = topics.filter(
    (t) => t.enabled && activeSubjectMap.has(t.subjectId)
  );

  const days: DayOfWeek[] =
    config.preferredDays.length > 0
      ? config.preferredDays
      : ['Mon', 'Wed', 'Fri'];
  if (activeTopics.length === 0 || config.weeklyHours <= 0) {
    return [];
  }

  const totalAvailableMinutes = Math.max(30, Math.round(config.weeklyHours * 60));

  // Inverse mastery weight: weaker topics receive disproportionately higher allocation
  const weights = activeTopics.map((topic) => {
    const tier = getMasteryTier(topic.mastery);
    const tierMultiplier = tier === 'weak' ? 1.45 : tier === 'developing' ? 1.0 : 0.55;
    const inverseScore = Math.max(0.15, 1.05 - topic.mastery);
    return {
      topic,
      tier,
      weight: inverseScore * tierMultiplier,
    };
  });

  const totalWeight = weights.reduce((sum, item) => sum + item.weight, 0);

  // Build candidate blocks per topic
  interface RawBlock {
    topic: Topic;
    subjectName: string;
    tier: MasteryTier;
    durationMinutes: number;
    priority: number;
  }

  const blocks: RawBlock[] = [];

  for (const item of weights) {
    const subjectName = activeSubjectMap.get(item.topic.subjectId)?.name ?? 'General';
    const rawTarget = (item.weight / totalWeight) * totalAvailableMinutes;
    // Snap to 5-minute increments, minimum 20 minutes
    let remaining = Math.max(20, Math.round(rawTarget / 5) * 5);
    const preferredBlockSize = getBaseBlockMinutes(item.tier);

    while (remaining > 0) {
      let blockDuration: number;
      if (remaining <= preferredBlockSize + 15) {
        blockDuration = remaining;
      } else {
        blockDuration = preferredBlockSize;
      }
      blockDuration = Math.max(20, Math.min(75, Math.round(blockDuration / 5) * 5));
      blocks.push({
        topic: item.topic,
        subjectName,
        tier: item.tier,
        durationMinutes: blockDuration,
        priority: 1 - item.topic.mastery,
      });
      remaining -= blockDuration;
      if (remaining > 0 && remaining < 20) {
        // Merge tiny remainder into the previous block rather than creating a 5-15m sliver
        blocks[blocks.length - 1].durationMinutes += remaining;
        remaining = 0;
      }
    }
  }

  // Sort blocks so highest-priority (weakest) sessions are spread evenly first
  blocks.sort((a, b) => b.priority - a.priority);

  // Greedy load-balancing across selected days so daily workload stays even
  // and the same topic isn't stacked twice on the same day when avoidable
  const dayLoads = new Map<DayOfWeek, number>();
  const dayTopics = new Map<DayOfWeek, Set<string>>();
  for (const d of days) {
    dayLoads.set(d, 0);
    dayTopics.set(d, new Set());
  }

  const sessions: StudySession[] = [];

  blocks.forEach((block, idx) => {
    // Prefer days that do not already have this topic, then pick the lightest-loaded day
    const sortedDays = [...days].sort((dayA, dayB) => {
      const hasTopicA = dayTopics.get(dayA)!.has(block.topic.id) ? 1 : 0;
      const hasTopicB = dayTopics.get(dayB)!.has(block.topic.id) ? 1 : 0;
      if (hasTopicA !== hasTopicB) return hasTopicA - hasTopicB;
      const loadA = dayLoads.get(dayA)!;
      const loadB = dayLoads.get(dayB)!;
      if (loadA !== loadB) return loadA - loadB;
      return ALL_DAYS.indexOf(dayA) - ALL_DAYS.indexOf(dayB);
    });

    const chosenDay = sortedDays[0];
    dayLoads.set(chosenDay, dayLoads.get(chosenDay)! + block.durationMinutes);
    dayTopics.get(chosenDay)!.add(block.topic.id);

    sessions.push({
      id: `sess-${block.topic.id}-${chosenDay}-${idx}`,
      day: chosenDay,
      topicId: block.topic.id,
      topicName: block.topic.name,
      subjectName: block.subjectName,
      tier: block.tier,
      masteryAtGeneration: block.topic.mastery,
      sessionType: getSessionTypeForTier(block.tier),
      durationMinutes: block.durationMinutes,
      completed: false,
    });
  });

  // Sort sessions cleanly by day order, then descending block duration
  sessions.sort((a, b) => {
    const dayDiff = ALL_DAYS.indexOf(a.day) - ALL_DAYS.indexOf(b.day);
    if (dayDiff !== 0) return dayDiff;
    return b.durationMinutes - a.durationMinutes;
  });

  return sessions;
}

export function getTodayWeekday(): DayOfWeek {
  const jsDay = new Date().getDay(); // 0 = Sun, 1 = Mon...
  const map: Record<number, DayOfWeek> = {
    0: 'Sun',
    1: 'Mon',
    2: 'Tue',
    3: 'Wed',
    4: 'Thu',
    5: 'Fri',
    6: 'Sat',
  };
  return map[jsDay] ?? 'Mon';
}
