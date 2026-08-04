export type RevisionNoteParseErrorCode =
  | 'invalid-frontmatter'
  | 'duplicate-frontmatter-key'
  | 'missing-frontmatter-field'
  | 'invalid-frontmatter-value'
  | 'invalid-section'
  | 'duplicate-section'
  | 'missing-section'
  | 'invalid-section-content';

export class RevisionNoteParseError extends Error {
  readonly name = 'RevisionNoteParseError';

  constructor(
    readonly code: RevisionNoteParseErrorCode,
    readonly sourceId: string,
    message: string,
  ) {
    super(`RevisionNote ${sourceId}: ${message}`);
  }
}

export type RevisionNoteRepositoryErrorCode =
  | 'missing-pack-id'
  | 'empty-pack'
  | 'duplicate-id'
  | 'duplicate-competency-id'
  | 'subject-mismatch'
  | 'exam-mismatch'
  | 'curriculum-version-mismatch'
  | 'content-version-mismatch'
  | 'missing-plan-note';

export class RevisionNoteRepositoryError extends Error {
  readonly name = 'RevisionNoteRepositoryError';

  constructor(
    readonly code: RevisionNoteRepositoryErrorCode,
    message: string,
  ) {
    super(`RevisionNoteRepository: ${message}`);
  }
}
