import { createRevisionNoteRepository } from './repository';
import type {
  RevisionNoteRepository,
  RevisionNoteRepositoryOptions,
  RevisionNotesEngine,
} from './types';

/** Public seam for the local canonical revision knowledge base. */
export function createRevisionNotesEngine(
  options: RevisionNoteRepositoryOptions,
): RevisionNotesEngine {
  const repository: RevisionNoteRepository = createRevisionNoteRepository(options);
  return {
    getRevisionNote: repository.getRevisionNote,
    getRevisionNotes: repository.getRevisionNotes,
    getRevisionPack: repository.getRevisionPack,
    getNotesForRevisionPlan: repository.getNotesForRevisionPlan,
  };
}
