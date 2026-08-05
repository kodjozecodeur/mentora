import type { CompetencyMastery, DiagnosticConfidence } from '@/types/diagnostic';
import type {
  RevisionPlan,
  RevisionPlanInput,
  RevisionSession,
  RevisionUnit,
} from '@/types/revision';
import { getRevisionPriorityReason, classifyRevisionPriority } from './priority';

export const REVISION_PLAN_ALGORITHM_VERSION = 'revision-plan.v1';
export const DEFAULT_REVISION_CONTENT_VERSION = 'local-content.v1';

const DAILY_MINUTES = 30;

function getConfidence(mastery: CompetencyMastery): DiagnosticConfidence {
  // The current repository does not emit confidence yet. Low is deliberately
  // conservative: it permits a verification session without claiming precision.
  return mastery.confidence ?? 'low';
}

function getTargetMastery(masteryPercent: number): number {
  return Math.min(90, Math.max(70, Math.round(masteryPercent) + 20));
}

function compareMastery(left: CompetencyMastery, right: CompetencyMastery): number {
  return (
    left.masteryPercent - right.masteryPercent ||
    left.competencyId.localeCompare(right.competencyId)
  );
}

function getCandidates(result: RevisionPlanInput['diagnosticResult']): CompetencyMastery[] {
  return result.competencyMastery
    .filter((mastery) => mastery.readinessLevel !== 'mastered' || getConfidence(mastery) === 'low')
    .sort(compareMastery);
}

function findUnit(units: RevisionUnit[], competencyId: string): RevisionUnit {
  const matches = units.filter((unit) => unit.competencyId === competencyId);
  if (matches.length === 0) {
    throw new Error(`Aucune unité de révision trouvée pour la compétence « ${competencyId} »`);
  }
  if (matches.length > 1) {
    throw new Error(`Plusieurs unités de révision trouvées pour la compétence « ${competencyId} »`);
  }
  return matches[0];
}

function createSession(
  diagnosticId: string,
  mastery: CompetencyMastery,
  unit: RevisionUnit,
  order: number,
  dayNumber: number,
): RevisionSession {
  const confidence = getConfidence(mastery);
  const priorityLevel = classifyRevisionPriority(mastery.masteryPercent);

  return {
    id: `revision-session:${diagnosticId}:${order}`,
    dayNumber,
    order,
    competencyId: mastery.competencyId,
    competencyLabel: mastery.competencyLabel,
    priorityLevel,
    priorityReason: getRevisionPriorityReason(mastery.masteryPercent, priorityLevel, confidence),
    estimatedMinutes: unit.estimatedMinutes,
    masteryBefore: mastery.masteryPercent,
    targetMastery: getTargetMastery(mastery.masteryPercent),
    confidence,
    revisionUnitId: unit.id,
    exitCriteria: unit.exitCriteria.map((criterion) => ({ ...criterion })),
    status: 'not-started',
    validationAttempts: [],
  };
}

/**
 * Generates a plan snapshot from a diagnostic result and a validated content catalog.
 * The function is deterministic when generatedAt is supplied by the caller.
 */
export function generateRevisionPlan(input: RevisionPlanInput): RevisionPlan {
  if (!input.diagnosticId.trim()) {
    throw new Error('Le diagnosticId est obligatoire pour générer un plan de révision');
  }

  const algorithmVersion = input.algorithmVersion ?? REVISION_PLAN_ALGORITHM_VERSION;
  const contentVersion =
    input.contentVersion ??
    input.revisionUnits[0]?.contentVersion ??
    DEFAULT_REVISION_CONTENT_VERSION;
  const candidates = getCandidates(input.diagnosticResult);

  let minutesBefore = 0;
  let currentDay = 1;
  let minutesInCurrentDay = 0;
  const sessions = candidates.map((mastery, index) => {
    const unit = findUnit(input.revisionUnits, mastery.competencyId);
    if (minutesInCurrentDay > 0 && minutesInCurrentDay + unit.estimatedMinutes > DAILY_MINUTES) {
      currentDay += 1;
      minutesInCurrentDay = 0;
    }

    const session = createSession(input.diagnosticId, mastery, unit, index + 1, currentDay);
    minutesBefore += session.estimatedMinutes;
    minutesInCurrentDay += session.estimatedMinutes;
    return session;
  });

  return {
    id: `revision-plan:${input.diagnosticId}:${algorithmVersion}:${contentVersion}`,
    diagnosticId: input.diagnosticId,
    ...(input.studentName ? { studentName: input.studentName } : {}),
    generatedAt: input.generatedAt ?? new Date().toISOString(),
    algorithmVersion,
    contentVersion,
    estimatedTotalMinutes: minutesBefore,
    estimatedDays: sessions.length === 0 ? 0 : sessions[sessions.length - 1].dayNumber,
    sessions,
  };
}
