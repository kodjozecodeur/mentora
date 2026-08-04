import type {
  DiagnosticConfidence,
  DiagnosticContentFormat,
  DiagnosticQuestionOption,
  DiagnosticResult,
} from './diagnostic';

export type RevisionPriorityLevel = 'critical' | 'high' | 'medium' | 'low';

export type RevisionActivityType =
  | 'read-note'
  | 'worked-example'
  | 'guided-practice'
  | 'independent-practice'
  | 'mini-assessment'
  | 'self-explanation';

export type ExitCriterionType =
  'consecutive-success' | 'minimum-score' | 'transfer-exercise' | 'self-explanation';

export type ExitCriterion = {
  type: ExitCriterionType;
  target: number | string;
  description: string;
};

export type RevisionActivity = {
  id: string;
  type: RevisionActivityType;
  label: string;
  estimatedMinutes: number;
  required: boolean;
};

export type RevisionUnit = {
  id: string;
  competencyId: string;
  competencyLabel: string;
  objective: string;
  prerequisites: string[];
  estimatedMinutes: number;
  activities: RevisionActivity[];
  exitCriteria: ExitCriterion[];
  contentVersion: string;
};

export type RevisionSession = {
  id: string;
  dayNumber: number;
  order: number;
  competencyId: string;
  competencyLabel: string;
  priorityLevel: RevisionPriorityLevel;
  priorityReason: string;
  estimatedMinutes: number;
  masteryBefore: number;
  targetMastery: number;
  confidence: DiagnosticConfidence;
  revisionUnitId: string;
  exitCriteria: ExitCriterion[];
  /** 'completed' means the latest validation attempt passed (>= 70%), not just that the lesson was read. */
  status: 'not-started' | 'in-progress' | 'completed';
  /** Append-only history of targeted-validation attempts for this competency. */
  validationAttempts: ValidationAttempt[];
};

/** A single-choice question scoped to exactly one competency, used by the targeted validation loop. */
export type ValidationQuestion = {
  id: string;
  competencyId: string;
  competencyLabel: string;
  instruction: string;
  content: string;
  contentFormat: DiagnosticContentFormat;
  options: DiagnosticQuestionOption[];
  correctOptionId: string;
  /** Powers the inline "Voir le corrigé" reveal on the validation result screen. */
  correction: string;
};

export type ValidationResponse = {
  questionId: string;
  optionId: string;
  isCorrect: boolean;
};

export type ValidationAttempt = {
  id: string;
  competencyId: string;
  revisionUnitId: string;
  attemptNumber: number;
  responses: ValidationResponse[];
  scorePercent: number;
  passed: boolean;
  startedAt: string;
  completedAt: string;
};

export type RevisionPlan = {
  id: string;
  diagnosticId: string;
  studentName?: string;
  generatedAt: string;
  algorithmVersion: string;
  contentVersion: string;
  estimatedTotalMinutes: number;
  estimatedDays: number;
  sessions: RevisionSession[];
};

export type RevisionPlanInput = {
  diagnosticId: string;
  diagnosticResult: DiagnosticResult;
  revisionUnits: RevisionUnit[];
  studentName?: string;
  generatedAt?: string;
  algorithmVersion?: string;
  contentVersion?: string;
};
