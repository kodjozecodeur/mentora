import type { RevisionPlan } from '@/types/revision';
import { parseRevisionNote } from './parser';
import { RevisionNoteRepositoryError } from './errors';
import type {
  RevisionNote,
  RevisionNoteRepository,
  RevisionNoteRepositoryOptions,
  RevisionPack,
} from './types';

export function createRevisionNoteRepository(
  options: RevisionNoteRepositoryOptions,
): RevisionNoteRepository {
  const notes = options.sourceAdapter
    .getSources()
    .map((source) => parseRevisionNote(source.content, source.sourceId));
  validatePack(notes, options);

  const notesById = new Map<string, RevisionNote>();
  const notesByCompetencyId = new Map<string, RevisionNote>();
  for (const note of notes) {
    if (notesById.has(note.id)) {
      throw new RevisionNoteRepositoryError(
        'duplicate-id',
        `Identifiant de fiche dupliqué « ${note.id} »`,
      );
    }
    if (notesByCompetencyId.has(note.competencyId)) {
      throw new RevisionNoteRepositoryError(
        'duplicate-competency-id',
        `Compétence de fiche dupliquée « ${note.competencyId} »`,
      );
    }
    notesById.set(note.id, note);
    notesByCompetencyId.set(note.competencyId, note);
  }

  const sortedNotes = [...notes].sort(compareNotes);

  function getRevisionNote(idOrCompetencyId: string): RevisionNote | null {
    const note = notesById.get(idOrCompetencyId) ?? notesByCompetencyId.get(idOrCompetencyId);
    return note ? cloneRevisionNote(note) : null;
  }

  function getRevisionNotes(): RevisionNote[] {
    return sortedNotes.map(cloneRevisionNote);
  }

  function getRevisionPack(): RevisionPack {
    return {
      ...options.pack,
      notes: getRevisionNotes(),
    };
  }

  function getNotesForRevisionPlan(plan: Pick<RevisionPlan, 'sessions'>): RevisionNote[] {
    const seen = new Set<string>();
    const result: RevisionNote[] = [];

    for (const session of plan.sessions) {
      if (seen.has(session.competencyId)) continue;
      const note = notesByCompetencyId.get(session.competencyId);
      if (!note) {
        throw new RevisionNoteRepositoryError(
          'missing-plan-note',
          `Aucune fiche de révision trouvée pour la compétence « ${session.competencyId} »`,
        );
      }
      seen.add(session.competencyId);
      result.push(cloneRevisionNote(note));
    }

    return result;
  }

  return { getRevisionNote, getRevisionNotes, getRevisionPack, getNotesForRevisionPlan };
}

function validatePack(notes: RevisionNote[], options: RevisionNoteRepositoryOptions): void {
  if (!options.pack.id.trim()) {
    throw new RevisionNoteRepositoryError('missing-pack-id', 'Identifiant de pack obligatoire');
  }
  if (notes.length === 0) {
    throw new RevisionNoteRepositoryError(
      'empty-pack',
      'Le pack de révision ne contient aucune fiche',
    );
  }

  for (const note of notes) {
    if (note.subject !== options.pack.subject) {
      throw new RevisionNoteRepositoryError(
        'subject-mismatch',
        `Sujet incompatible dans la fiche « ${note.id} »`,
      );
    }
    if (note.exam !== options.pack.exam) {
      throw new RevisionNoteRepositoryError(
        'exam-mismatch',
        `Examen incompatible dans la fiche « ${note.id} »`,
      );
    }
    if (note.curriculumVersion !== options.pack.curriculumVersion) {
      throw new RevisionNoteRepositoryError(
        'curriculum-version-mismatch',
        `Version de programme incompatible dans la fiche « ${note.id} »`,
      );
    }
    if (note.contentVersion !== options.pack.contentVersion) {
      throw new RevisionNoteRepositoryError(
        'content-version-mismatch',
        `Version de contenu incompatible dans la fiche « ${note.id} »`,
      );
    }
  }
}

function compareNotes(left: RevisionNote, right: RevisionNote): number {
  if (left.competencyId < right.competencyId) return -1;
  if (left.competencyId > right.competencyId) return 1;
  return 0;
}

function cloneRevisionNote(note: RevisionNote): RevisionNote {
  return {
    ...note,
    sections: note.sections.map((section) => ({ ...section })),
    workedExample: {
      ...note.workedExample,
      steps: [...note.workedExample.steps],
    },
    commonMistakes: note.commonMistakes.map((mistake) => ({ ...mistake })),
    keyTakeaways: [...note.keyTakeaways],
    miniExercises: note.miniExercises.map((exercise) => ({ ...exercise })),
  };
}
