import type { DiagnosticConfidence, DiagnosticResult } from './diagnostic';

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
  status: 'not-started' | 'in-progress' | 'completed';
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
