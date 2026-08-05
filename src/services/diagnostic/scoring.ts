import type {
  CompetencyMastery,
  DiagnosticQuestion,
  DiagnosticResponse,
  ReadinessLevel,
} from '@/types/diagnostic';

/** Spec §12: 0-39% Priority, 40-69% In Progress, 70-100% Mastered. */
export function classifyReadinessLevel(masteryPercent: number): ReadinessLevel {
  if (masteryPercent >= 70) return 'mastered';
  if (masteryPercent >= 40) return 'in-progress';
  return 'priority';
}

export function computeReadinessScore(mastery: CompetencyMastery[]): number {
  const pointsPossible = mastery.reduce((sum, m) => sum + m.pointsPossible, 0);
  if (pointsPossible === 0) return 0;

  const pointsEarned = mastery.reduce((sum, m) => sum + m.pointsEarned, 0);
  return Math.round((pointsEarned / pointsPossible) * 100);
}

export function computeCompetencyMastery(
  questions: DiagnosticQuestion[],
  responses: DiagnosticResponse[],
): CompetencyMastery[] {
  const responsesByQuestionId = new Map(responses.map((r) => [r.questionId, r]));
  const order: string[] = [];
  const byCompetency = new Map<
    string,
    { competencyLabel: string; pointsEarned: number; pointsPossible: number }
  >();

  for (const question of questions) {
    if (!byCompetency.has(question.competencyId)) {
      byCompetency.set(question.competencyId, {
        competencyLabel: question.competencyLabel,
        pointsEarned: 0,
        pointsPossible: 0,
      });
      order.push(question.competencyId);
    }

    const entry = byCompetency.get(question.competencyId)!;
    entry.pointsPossible += question.points;
    entry.pointsEarned += responsesByQuestionId.get(question.id)?.points ?? 0;
  }

  return order.map((competencyId) => {
    const entry = byCompetency.get(competencyId)!;
    const masteryPercent =
      entry.pointsPossible === 0
        ? 0
        : Math.round((entry.pointsEarned / entry.pointsPossible) * 100);

    return {
      competencyId,
      competencyLabel: entry.competencyLabel,
      pointsEarned: entry.pointsEarned,
      pointsPossible: entry.pointsPossible,
      masteryPercent,
      readinessLevel: classifyReadinessLevel(masteryPercent),
    };
  });
}
