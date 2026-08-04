import type { DiagnosticResult } from '@/types/diagnostic';
import type { RevisionPlan } from '@/types/revision';
import type { RevisionNote } from '@/services/revision-notes/types';
import type {
  BuildStudyPackInput,
  StudyPack,
  StudyPackCorrectionsSection,
  StudyPackCoverSection,
  StudyPackDiagnosticSummarySection,
  StudyPackRevisionPlanSection,
  StudyPackSection,
} from '@/types/study-pack';

export const STUDY_PACK_ALGORITHM_VERSION = 'study-pack.v1';

export function buildStudyPack(input: BuildStudyPackInput): StudyPack {
  const generatedAt = input.generatedAt ?? new Date().toISOString();
  const algorithmVersion = input.algorithmVersion ?? STUDY_PACK_ALGORITHM_VERSION;
  const notes = selectNotesForPlan(input.revisionPlan, input.allRevisionNotes);

  const sections: StudyPackSection[] = [
    buildCoverSection(input, generatedAt),
    buildDiagnosticSummarySection(input),
    buildRevisionPlanSection(input),
    { kind: 'revision-notes', notes },
    buildCorrectionsSection(notes),
  ];

  const studyPack: StudyPack = {
    id: `study-pack:${input.revisionPlan.diagnosticId}:${algorithmVersion}:${input.revisionPlan.contentVersion}`,
    snapshot: {
      algorithmVersion,
      contentVersion: input.revisionPlan.contentVersion,
      diagnosticId: input.revisionPlan.diagnosticId,
      revisionPlanId: input.revisionPlan.id,
      generatedAt,
    },
    sections,
  };

  return deepFreeze(studyPack);
}

function selectNotesForPlan(plan: RevisionPlan, catalog: RevisionNote[]): RevisionNote[] {
  const byCompetencyId = new Map(catalog.map((note) => [note.competencyId, note]));
  const seen = new Set<string>();
  const notes: RevisionNote[] = [];

  for (const session of plan.sessions) {
    if (seen.has(session.competencyId)) continue;
    const note = byCompetencyId.get(session.competencyId);
    if (!note) {
      throw new Error(
        `Aucune fiche de révision trouvée pour la compétence « ${session.competencyId} »`,
      );
    }
    seen.add(session.competencyId);
    notes.push(structuredClone(note));
  }

  return notes;
}

function buildCoverSection(input: BuildStudyPackInput, generatedAt: string): StudyPackCoverSection {
  const trimmedName = input.studentName?.trim();
  return {
    kind: 'cover',
    studentName: trimmedName ? trimmedName : null,
    date: generatedAt,
    subjectLabel: input.subjectLabel,
    examLabel: input.examLabel,
    readinessScore: input.diagnosticResult.readinessScore,
    diagnosticSummary: formatDiagnosticSummary(input.diagnosticResult),
  };
}

function formatDiagnosticSummary(result: DiagnosticResult): string {
  const strengthsCount = result.strengths.length;
  const weaknessesCount = result.weaknesses.length;
  const topPriority = result.revisionPriorities[0] ?? null;

  const strengthsPart = `${strengthsCount} point${strengthsCount === 1 ? '' : 's'} fort${strengthsCount === 1 ? '' : 's'}`;
  const weaknessesPart = `${weaknessesCount} compétence${weaknessesCount === 1 ? '' : 's'} à renforcer`;
  const priorityPart = topPriority ? `, priorité : ${topPriority.competencyLabel}` : '';

  return `${strengthsPart}, ${weaknessesPart}${priorityPart}`;
}

function buildDiagnosticSummarySection(
  input: BuildStudyPackInput,
): StudyPackDiagnosticSummarySection {
  return {
    kind: 'diagnostic-summary',
    strengths: input.diagnosticResult.strengths.map((mastery) => ({ ...mastery })),
    weaknesses: input.diagnosticResult.weaknesses.map((mastery) => ({ ...mastery })),
    topPriority: input.diagnosticResult.revisionPriorities[0]
      ? { ...input.diagnosticResult.revisionPriorities[0] }
      : null,
    estimatedDays: input.revisionPlan.estimatedDays,
    estimatedTotalMinutes: input.revisionPlan.estimatedTotalMinutes,
  };
}

function buildRevisionPlanSection(input: BuildStudyPackInput): StudyPackRevisionPlanSection {
  const unitsById = new Map(input.revisionUnits.map((unit) => [unit.id, unit]));

  const items = input.revisionPlan.sessions.map((session) => {
    const unit = unitsById.get(session.revisionUnitId);
    if (!unit) {
      throw new Error(`Aucune unité de révision trouvée pour la session « ${session.id} »`);
    }
    return {
      dayNumber: session.dayNumber,
      competencyLabel: session.competencyLabel,
      objective: unit.objective,
      estimatedMinutes: session.estimatedMinutes,
      successCriterion:
        session.exitCriteria[0]?.description ?? 'Terminer les activités de la session.',
    };
  });

  return { kind: 'revision-plan', items };
}

function buildCorrectionsSection(notes: RevisionNote[]): StudyPackCorrectionsSection {
  const entries = notes.map((note) => ({
    competencyLabel: note.title,
    exercises: note.miniExercises.map((exercise) => ({
      order: exercise.order,
      statement: exercise.statement,
      answer: exercise.answer,
      correction: exercise.correction,
    })),
  }));

  return { kind: 'corrections', entries };
}

function deepFreeze<T>(value: T): T {
  if (value !== null && typeof value === 'object' && !Object.isFrozen(value)) {
    for (const key of Object.getOwnPropertyNames(value)) {
      deepFreeze((value as Record<string, unknown>)[key]);
    }
    Object.freeze(value);
  }
  return value;
}
