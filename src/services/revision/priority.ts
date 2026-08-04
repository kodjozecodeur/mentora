import type { DiagnosticConfidence } from '@/types/diagnostic';
import type { RevisionPriorityLevel } from '@/types/revision';

function clampMastery(masteryPercent: number): number {
  return Math.min(100, Math.max(0, masteryPercent));
}

/**
 * Sprint 4A policy:
 * - 0-39%: restart the foundations;
 * - 40-59%: consolidate the method;
 * - 60-69%: automate and verify;
 * - 70-100%: low priority, used only for low-confidence verification.
 */
export function classifyRevisionPriority(masteryPercent: number): RevisionPriorityLevel {
  const mastery = clampMastery(masteryPercent);
  if (mastery < 40) return 'critical';
  if (mastery < 60) return 'high';
  if (mastery < 70) return 'medium';
  return 'low';
}

export function getRevisionPriorityReason(
  masteryPercent: number,
  priorityLevel: RevisionPriorityLevel,
  confidence: DiagnosticConfidence,
): string {
  const mastery = Math.round(clampMastery(masteryPercent));

  if (priorityLevel === 'critical') {
    return `Maîtrise estimée à ${mastery} % avec une confiance ${confidenceLabel(confidence)} : reprendre les bases avant la pratique autonome.`;
  }

  if (priorityLevel === 'high') {
    return `Maîtrise estimée à ${mastery} % avec une confiance ${confidenceLabel(confidence)} : consolider la méthode avant de passer à des exercices plus complexes.`;
  }

  if (priorityLevel === 'medium') {
    return `Maîtrise estimée à ${mastery} % avec une confiance ${confidenceLabel(confidence)} : automatiser la méthode et vérifier la régularité.`;
  }

  return `Maîtrise estimée à ${mastery} %, mais avec une confiance faible : une vérification est recommandée.`;
}

function confidenceLabel(confidence: DiagnosticConfidence): string {
  if (confidence === 'high') return 'élevée';
  if (confidence === 'medium') return 'moyenne';
  return 'faible';
}
