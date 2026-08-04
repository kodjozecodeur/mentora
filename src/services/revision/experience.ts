import type { DiagnosticResult } from '@/types/diagnostic';
import type { RevisionPlan, RevisionSession, RevisionUnit } from '@/types/revision';
import type { RevisionNote, RevisionNoteRepository } from '@/services/revision-notes/types';
import { REVISION_UNITS } from '@/data/revision-units';
import { generateRevisionPlan } from './generator';

export const CURRENT_REVISION_PACK_VERSION = '1.0.0';

export function createPlanForDiagnostic(
  result: DiagnosticResult,
  studentName?: string,
): RevisionPlan {
  return generateRevisionPlan({
    diagnosticId: `diagnostic:${result.completedAt}`,
    diagnosticResult: result,
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
