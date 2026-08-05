import type { CompetencyMastery, ReadinessLevel } from '@/types/diagnostic';

export function getGreeting(firstName?: string, score = 100): string {
  const trimmed = firstName?.trim();
  if (score < 40) return trimmed ? `Courage ${trimmed} !` : 'Courage !';
  if (score < 70) {
    return trimmed ? `Tu es en progression, ${trimmed} !` : 'Tu es en progression !';
  }
  return trimmed ? `Bravo ${trimmed} !` : 'Bravo !';
}

export function getReadinessMessage(score: number): string {
  if (score < 40) return 'Tu as encore plusieurs notions importantes à renforcer.';
  if (score < 70) {
    return 'Tu progresses bien, mais certaines notions doivent encore être consolidées.';
  }
  return 'Tu maîtrises déjà une bonne partie des compétences évaluées.';
}

export function getReadinessLevelLabel(score: number): string {
  if (score < 40) return 'À renforcer';
  if (score < 70) return 'En progression';
  return 'Optimal';
}

export function getWeaknessBadgeLabel(level: ReadinessLevel): string {
  return level === 'priority' ? 'Prioritaire' : 'En progression';
}

export const PROGRESSION_GLOBALE_LABEL = 'Progression globale';

export function getMasteryStatusLabel(level: ReadinessLevel): string {
  if (level === 'mastered') return 'Maîtrisé';
  if (level === 'in-progress') return 'En apprentissage';
  return 'À renforcer';
}

function byMasteryPercent(order: 'asc' | 'desc') {
  return (a: CompetencyMastery, b: CompetencyMastery) =>
    order === 'asc'
      ? a.masteryPercent - b.masteryPercent || a.competencyId.localeCompare(b.competencyId)
      : b.masteryPercent - a.masteryPercent || a.competencyId.localeCompare(b.competencyId);
}

export function partitionByReadinessLevel(mastery: CompetencyMastery[]): {
  mastered: CompetencyMastery[];
  inProgress: CompetencyMastery[];
  priority: CompetencyMastery[];
} {
  return {
    mastered: mastery.filter((m) => m.readinessLevel === 'mastered').sort(byMasteryPercent('desc')),
    inProgress: mastery
      .filter((m) => m.readinessLevel === 'in-progress')
      .sort(byMasteryPercent('asc')),
    priority: mastery.filter((m) => m.readinessLevel === 'priority').sort(byMasteryPercent('asc')),
  };
}

/** Spec: Results branches to the Personalized Revision Plan unless every competency is mastered. */
export type ResultsBranch = 'revision-plan' | 'learning-journey';

export function resolveResultsBranch(mastery: CompetencyMastery[]): ResultsBranch {
  const { inProgress, priority } = partitionByReadinessLevel(mastery);
  return inProgress.length > 0 || priority.length > 0 ? 'revision-plan' : 'learning-journey';
}

export function getResultsContinueLabel(branch: ResultsBranch): string {
  return branch === 'revision-plan' ? 'Créer mon plan de révision' : 'Accéder à mon parcours';
}
