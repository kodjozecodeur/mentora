import type { DiagnosticResult, ReadinessLevel } from '@/types/diagnostic';

export interface DiagnosticComparisonRow {
  competencyId: string;
  competencyLabel: string;
  masteryBefore: number;
  masteryAfter: number;
  delta: number;
}

export interface DiagnosticComparison {
  rows: DiagnosticComparisonRow[];
  readinessScoreBefore: number;
  readinessScoreAfter: number;
  readinessScoreDelta: number;
  readinessLevelBefore: ReadinessLevel;
  readinessLevelAfter: ReadinessLevel;
}

/** Spec §11: joins the initial and final DiagnosticResult on competencyId, read-only, no persisted type. */
export function buildDiagnosticComparison(
  initial: DiagnosticResult,
  final: DiagnosticResult,
): DiagnosticComparison {
  const masteryAfterByCompetency = new Map(
    final.competencyMastery.map((mastery) => [mastery.competencyId, mastery]),
  );

  const rows: DiagnosticComparisonRow[] = initial.competencyMastery.flatMap((before) => {
    const after = masteryAfterByCompetency.get(before.competencyId);
    if (!after) return [];
    return [
      {
        competencyId: before.competencyId,
        competencyLabel: before.competencyLabel,
        masteryBefore: before.masteryPercent,
        masteryAfter: after.masteryPercent,
        delta: after.masteryPercent - before.masteryPercent,
      },
    ];
  });

  return {
    rows,
    readinessScoreBefore: initial.readinessScore,
    readinessScoreAfter: final.readinessScore,
    readinessScoreDelta: final.readinessScore - initial.readinessScore,
    readinessLevelBefore: initial.readinessLevel,
    readinessLevelAfter: final.readinessLevel,
  };
}
