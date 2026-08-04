import type { DiagnosticQuestion } from '@/types/diagnostic';
import type {
  RevisionSession,
  ValidationAttempt,
  ValidationQuestion,
  ValidationResponse,
} from '@/types/revision';

/** Matches the existing "mastered" boundary in scoring.ts and the mastery floor in generator.ts. */
export const VALIDATION_PASS_THRESHOLD = 70;

/**
 * A targeted validation quiz is scoped to exactly one competency. The diagnostic question bank
 * already carries single-choice questions tagged per competency, so it doubles as the validation
 * question bank rather than requiring a separate authored content set.
 */
export function getValidationQuestions(
  competencyId: string,
  diagnosticQuestions: readonly DiagnosticQuestion[],
): ValidationQuestion[] {
  return diagnosticQuestions
    .filter((question) => question.competencyId === competencyId)
    .map((question) => ({
      id: question.id,
      competencyId: question.competencyId,
      competencyLabel: question.competencyLabel,
      instruction: question.instruction,
      content: question.content,
      contentFormat: question.contentFormat,
      options: question.options,
      correctOptionId: question.correctOptionId,
      correction: question.explanation,
    }));
}

export function scoreValidationResponses(responses: ValidationResponse[]): {
  scorePercent: number;
  passed: boolean;
} {
  if (responses.length === 0) return { scorePercent: 0, passed: false };

  const correctCount = responses.filter((response) => response.isCorrect).length;
  const scorePercent = Math.round((correctCount / responses.length) * 100);
  return { scorePercent, passed: scorePercent >= VALIDATION_PASS_THRESHOLD };
}

export function createValidationAttempt(
  session: Pick<RevisionSession, 'id' | 'competencyId' | 'revisionUnitId' | 'validationAttempts'>,
  responses: ValidationResponse[],
  now: { startedAt: string; completedAt: string },
): ValidationAttempt {
  const { scorePercent, passed } = scoreValidationResponses(responses);

  return {
    id: `validation-attempt:${session.id}:${session.validationAttempts.length + 1}`,
    competencyId: session.competencyId,
    revisionUnitId: session.revisionUnitId,
    attemptNumber: session.validationAttempts.length + 1,
    responses,
    scorePercent,
    passed,
    startedAt: now.startedAt,
    completedAt: now.completedAt,
  };
}
