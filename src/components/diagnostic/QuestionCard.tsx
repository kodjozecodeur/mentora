import { MathContent } from './MathContent';
import type { DiagnosticContentFormat } from '@/types/diagnostic';

interface QuestionCardProps {
  question: {
    competencyLabel: string;
    instruction: string;
    content: string;
    contentFormat: DiagnosticContentFormat;
  };
}

export function QuestionCard({ question }: QuestionCardProps) {
  return (
    <section className="border-border bg-surface flex max-h-[40dvh] flex-col gap-3 overflow-hidden rounded-3xl border-2 px-4 py-3 shadow-[0_8px_0_rgba(36,21,42,0.08)] sm:gap-6 sm:px-5 sm:py-7">
      <div className="flex flex-col items-center gap-2 text-center">
        <p className="text-muted text-sm font-bold">{question.competencyLabel}</p>
        <h1 className="text-foreground text-2xl font-bold">{question.instruction}</h1>
      </div>

      <div className="bg-highlight text-highlight-foreground flex max-h-[170px] min-h-[120px] shrink items-center justify-center overflow-y-auto px-4 py-3 text-center text-3xl font-bold sm:px-8 sm:py-8">
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
