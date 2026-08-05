import type { DiagnosticQuestion } from '@/types/diagnostic';

/** Scopes the diagnostic question bank to a single chapter (spec: Chapter Diagnostic assesses one chapter, not the whole exam). */
export function selectChapterQuestions(
  questions: DiagnosticQuestion[],
  chapterId: string | null,
): DiagnosticQuestion[] {
  if (!chapterId) return [];
  return questions.filter((question) => question.chapterId === chapterId);
}
