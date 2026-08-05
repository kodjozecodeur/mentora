import type {
  DiagnosticPhase,
  DiagnosticQuestion,
  DiagnosticResponse,
  DiagnosticResult,
  RevisionRecommendation,
} from '@/types/diagnostic';
import { computeCompetencyMastery, computeReadinessScore, classifyReadinessLevel } from './scoring';
import { rankRevisionPriorities } from './recommendations';

function findRevisionSource(
  questions: DiagnosticQuestion[],
  responses: DiagnosticResponse[],
  competencyId: string,
): DiagnosticQuestion {
  const responsesByQuestionId = new Map(responses.map((r) => [r.questionId, r]));
  const competencyQuestions = questions.filter((q) => q.competencyId === competencyId);

  const missed = competencyQuestions.find((q) => !responsesByQuestionId.get(q.id)?.isCorrect);
  return missed ?? competencyQuestions[0];
}

export function runDiagnosticEngine(
  questions: DiagnosticQuestion[],
  responses: DiagnosticResponse[],
  phase: DiagnosticPhase = 'initial',
): DiagnosticResult {
  const competencyMastery = computeCompetencyMastery(questions, responses);
  const readinessScore = computeReadinessScore(competencyMastery);
  const readinessLevel = classifyReadinessLevel(readinessScore);

  const strengths = competencyMastery.filter((m) => m.readinessLevel === 'mastered');
  const weaknesses = rankRevisionPriorities(competencyMastery);

  const revisionPriorities: RevisionRecommendation[] = weaknesses.map((mastery) => {
    const source = findRevisionSource(questions, responses, mastery.competencyId);
    return {
      competencyId: mastery.competencyId,
      competencyLabel: mastery.competencyLabel,
      masteryPercent: mastery.masteryPercent,
      readinessLevel: mastery.readinessLevel,
      explanation: source.explanation,
      revisionExample: source.revisionExample,
    };
  });

  const totalEarnedPoints = competencyMastery.reduce((sum, m) => sum + m.pointsEarned, 0);
  const totalMaxPoints = competencyMastery.reduce((sum, m) => sum + m.pointsPossible, 0);

  return {
    responses,
    competencyMastery,
    readinessScore,
    readinessLevel,
    strengths,
    weaknesses,
    revisionPriorities,
    totalEarnedPoints,
    totalMaxPoints,
    completedAt: new Date().toISOString(),
    phase,
  };
}
