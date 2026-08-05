import type { CompetencyMastery } from '@/types/diagnostic';

/** Spec §13: first recommendation must always be the weakest competency. */
export function rankRevisionPriorities(mastery: CompetencyMastery[]): CompetencyMastery[] {
  return mastery
    .filter((m) => m.readinessLevel !== 'mastered')
    .sort(
      (a, b) => a.masteryPercent - b.masteryPercent || a.competencyId.localeCompare(b.competencyId),
    );
}
