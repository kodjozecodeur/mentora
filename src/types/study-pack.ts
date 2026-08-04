import type { CompetencyMastery, DiagnosticResult, RevisionRecommendation } from './diagnostic';
import type { RevisionPlan, RevisionUnit } from './revision';
import type { RevisionNote } from '@/services/revision-notes/types';

export type StudyPackSnapshot = {
  algorithmVersion: string;
  contentVersion: string;
  diagnosticId: string;
  revisionPlanId: string;
  generatedAt: string;
};

export type StudyPackCoverSection = {
  kind: 'cover';
  studentName: string | null;
  date: string;
  subjectLabel: string;
  examLabel: string;
  readinessScore: number;
  diagnosticSummary: string;
};

export type StudyPackDiagnosticSummarySection = {
  kind: 'diagnostic-summary';
  strengths: CompetencyMastery[];
  weaknesses: CompetencyMastery[];
  topPriority: RevisionRecommendation | null;
  estimatedDays: number;
  estimatedTotalMinutes: number;
};

export type StudyPackRevisionPlanItem = {
  dayNumber: number;
  competencyLabel: string;
  objective: string;
  estimatedMinutes: number;
  successCriterion: string;
};

export type StudyPackRevisionPlanSection = {
  kind: 'revision-plan';
  items: StudyPackRevisionPlanItem[];
};

export type StudyPackRevisionNotesSection = {
  kind: 'revision-notes';
  notes: RevisionNote[];
};

export type StudyPackCorrectionExercise = {
  order: number;
  statement: string;
  answer: string;
  correction: string;
};

export type StudyPackCorrectionEntry = {
  competencyLabel: string;
  exercises: StudyPackCorrectionExercise[];
};

export type StudyPackCorrectionsSection = {
  kind: 'corrections';
  entries: StudyPackCorrectionEntry[];
};

export type StudyPackSection =
  | StudyPackCoverSection
  | StudyPackDiagnosticSummarySection
  | StudyPackRevisionPlanSection
  | StudyPackRevisionNotesSection
  | StudyPackCorrectionsSection;

export type StudyPack = {
  readonly id: string;
  readonly snapshot: Readonly<StudyPackSnapshot>;
  readonly sections: readonly StudyPackSection[];
};

export type BuildStudyPackInput = {
  diagnosticResult: DiagnosticResult;
  revisionPlan: RevisionPlan;
  revisionUnits: RevisionUnit[];
  allRevisionNotes: RevisionNote[];
  studentName?: string;
  subjectLabel: string;
  examLabel: string;
  generatedAt?: string;
  algorithmVersion?: string;
};

export type DocumentBlock =
  | { kind: 'heading'; level: 1 | 2 | 3; text: string }
  | { kind: 'paragraph'; text: string }
  | { kind: 'list'; ordered: boolean; items: string[] }
  | { kind: 'table'; headers: string[]; rows: string[][] }
  | { kind: 'keyValue'; items: { label: string; value: string }[] }
  | { kind: 'card'; blocks: DocumentBlock[]; avoidBreak?: boolean };

export type DocumentSection = {
  id: string;
  pageBreakBefore?: boolean;
  pageBreakAfter?: boolean;
  blocks: DocumentBlock[];
};

export type DocumentModel = {
  title: string;
  sections: DocumentSection[];
};
