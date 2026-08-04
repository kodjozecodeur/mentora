import { MathContent } from './MathContent';
import type { DiagnosticQuestion } from '@/types/diagnostic';

interface QuestionCardProps {
  question: DiagnosticQuestion;
}

export function QuestionCard({ question }: QuestionCardProps) {
  return (
    <section className="border-border bg-surface flex flex-col gap-6 rounded-3xl border-2 px-5 py-7 shadow-[0_8px_0_rgba(36,21,42,0.08)]">
      <div className="flex flex-col items-center gap-2 text-center">
        <p className="text-muted text-sm font-bold">{question.competencyLabel}</p>
        <h1 className="text-foreground text-2xl font-bold">{question.instruction}</h1>
      </div>

      <div className="bg-highlight text-highlight-foreground flex min-h-36 items-center justify-center px-8 py-8 text-center text-3xl font-bold">
        <MathContent
          content={question.content}
          contentFormat={question.contentFormat}
          displayMode
          className="max-w-full"
        />
      </div>
    </section>
  );
}
