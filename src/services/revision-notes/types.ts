import type { RevisionPlan } from '@/types/revision';

export type RevisionNoteDifficulty = 'beginner' | 'intermediate' | 'advanced';

export type RevisionSection = {
  id: string;
  title: string;
  order: number;
  content: string;
};

export type WorkedExample = {
  title: string;
  problem: string;
  steps: string[];
  conclusion: string;
};

export type CommonMistake = {
  title: string;
  error: string;
  whyItHappens: string;
  howToAvoid: string;
};

export type MiniExercise = {
  id: string;
  order: number;
  statement: string;
  answer: string;
  correction: string;
};

export type RevisionNote = {
  id: string;
  competencyId: string;
  title: string;
  subject: string;
  exam: string;
  curriculumVersion: string;
  contentVersion: string;
  teacherValidated: boolean;
  estimatedReadingMinutes: number;
  difficulty: RevisionNoteDifficulty;
  updatedAt: string;
  sections: RevisionSection[];
  workedExample: WorkedExample;
  commonMistakes: CommonMistake[];
  keyTakeaways: string[];
  miniExercises: MiniExercise[];
};

export type RevisionNoteSource = {
  sourceId: string;
  content: string;
};

export type RevisionNoteSourceAdapter = {
  getSources: () => readonly RevisionNoteSource[];
};

export type RevisionPackDescriptor = {
  id: string;
  subject: string;
  exam: string;
  curriculumVersion: string;
  contentVersion: string;
};

export type RevisionPack = RevisionPackDescriptor & {
  notes: RevisionNote[];
};

export type RevisionNoteRepository = {
  getRevisionNote: (idOrCompetencyId: string) => RevisionNote | null;
  getRevisionNotes: () => RevisionNote[];
  getRevisionPack: () => RevisionPack;
  getNotesForRevisionPlan: (plan: Pick<RevisionPlan, 'sessions'>) => RevisionNote[];
};

export type RevisionNoteRepositoryOptions = {
  sourceAdapter: RevisionNoteSourceAdapter;
  pack: RevisionPackDescriptor;
};

export type RevisionNotesEngine = RevisionNoteRepository;
