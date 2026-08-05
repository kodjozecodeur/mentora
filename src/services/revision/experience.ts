import type { DiagnosticResult } from '@/types/diagnostic';
import type { RevisionPlan, RevisionSession, RevisionUnit } from '@/types/revision';
import type { RevisionNote, RevisionNoteRepository } from '@/services/revision-notes/types';
import { REVISION_UNITS } from '@/data/revision-units';
import { generateRevisionPlan } from './generator';

export const CURRENT_REVISION_PACK_VERSION = '1.0.0';

/**
 * Drops competency-mastery entries the current content catalog no longer covers (e.g. a
 * diagnostic result persisted in localStorage before the chapter scope was narrowed) so a
 * stale client never crashes plan generation — it just gets a plan scoped to what's still
 * available, instead of an unhandled throw from `generateRevisionPlan`.
 */
function scopeToAvailableUnits(result: DiagnosticResult): DiagnosticResult {
  const availableCompetencyIds = new Set(REVISION_UNITS.map((unit) => unit.competencyId));
  return {
    ...result,
    competencyMastery: result.competencyMastery.filter((mastery) =>
      availableCompetencyIds.has(mastery.competencyId),
    ),
  };
}

export function createPlanForDiagnostic(
  result: DiagnosticResult,
  studentName?: string,
): RevisionPlan {
  return generateRevisionPlan({
    diagnosticId: `diagnostic:${result.completedAt}`,
    diagnosticResult: scopeToAvailableUnits(result),
    revisionUnits: REVISION_UNITS,
    studentName,
    contentVersion: CURRENT_REVISION_PACK_VERSION,
  });
}

export type RevisionSessionContent = {
  session: RevisionSession;
  unit: RevisionUnit;
  note: RevisionNote;
};

export function resolveRevisionSessionContent(
  plan: Pick<RevisionPlan, 'sessions'>,
  revisionUnitId: string,
  notesRepository: Pick<RevisionNoteRepository, 'getRevisionNote'>,
  units: readonly RevisionUnit[] = REVISION_UNITS,
): RevisionSessionContent | null {
  const session = plan.sessions.find((candidate) => candidate.revisionUnitId === revisionUnitId);
  if (!session) return null;

  const unit = units.find((candidate) => candidate.id === session.revisionUnitId);
  if (!unit) return null;

  const note = notesRepository.getRevisionNote(unit.competencyId);
  if (!note) return null;

  return { session, unit, note };
}
