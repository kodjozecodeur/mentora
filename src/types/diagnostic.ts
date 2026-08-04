export type DiagnosticContentFormat = 'text' | 'latex';

export interface DiagnosticQuestionOption {
  id: string;
  content: string;
  contentFormat: DiagnosticContentFormat;
}

export interface DiagnosticQuestion {
  id: string;
  competencyId: string;
  competencyLabel: string;
  instruction: string;
  content: string;
  contentFormat: DiagnosticContentFormat;
  type: 'single-choice';
  options: DiagnosticQuestionOption[];
  correctOptionId: string;
  points: number;
  difficulty: 'easy' | 'medium' | 'hard';
  explanation: string;
  revisionExample: string;
}

export interface DiagnosticResponse {
  questionId: string;
  competencyId: string;
  optionId: string;
  isCorrect: boolean;
  points: number;
}

/** Spec §12: 0-39% Priority, 40-69% In Progress, 70-100% Mastered. */
export type ReadinessLevel = 'priority' | 'in-progress' | 'mastered';

export interface CompetencyMastery {
  competencyId: string;
  competencyLabel: string;
  pointsEarned: number;
  pointsPossible: number;
  masteryPercent: number;
  readinessLevel: ReadinessLevel;
}

export interface RevisionRecommendation {
  competencyId: string;
  competencyLabel: string;
  masteryPercent: number;
  readinessLevel: ReadinessLevel;
  explanation: string;
  revisionExample: string;
}

export interface DiagnosticResult {
  responses: DiagnosticResponse[];
  competencyMastery: CompetencyMastery[];
  readinessScore: number;
  readinessLevel: ReadinessLevel;
  strengths: CompetencyMastery[];
  weaknesses: CompetencyMastery[];
  revisionPriorities: RevisionRecommendation[];
  totalEarnedPoints: number;
  totalMaxPoints: number;
  completedAt: string;
}

export interface DiagnosticSessionState {
  questionIndex: number;
  responses: Record<string, DiagnosticResponse>;
  result: DiagnosticResult | null;
}
