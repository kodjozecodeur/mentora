import type { ReadinessLevel } from '@/types/diagnostic';

export function getGreeting(firstName?: string): string {
  const trimmed = firstName?.trim();
  return trimmed ? `Bravo ${trimmed} !` : 'Bravo !';
}

export function getReadinessMessage(score: number): string {
  if (score < 40) return 'Tu as encore plusieurs notions importantes à renforcer.';
  if (score < 70) {
    return 'Tu progresses bien, mais certaines notions doivent encore être consolidées.';
  }
  return 'Tu maîtrises déjà une bonne partie des compétences évaluées.';
}

export function getWeaknessBadgeLabel(level: ReadinessLevel): string {
  return level === 'priority' ? 'Prioritaire' : 'En progression';
}
