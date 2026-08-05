import { MathContent } from './MathContent';
import type { DiagnosticContentFormat } from '@/types/diagnostic';

interface QuestionCardProps {
  question: {
    instruction: string;
    content: string;
    contentFormat: DiagnosticContentFormat;
  };
}

export function QuestionCard({ question }: QuestionCardProps) {
  return (
    <section className="border-border bg-surface flex max-h-[40dvh] flex-col items-center justify-center gap-3 overflow-hidden rounded-3xl border-2 px-4 py-8 text-center shadow-sm sm:gap-4 sm:px-8 sm:py-10">
      <h1 className="text-foreground text-lg font-bold sm:text-xl">{question.instruction}</h1>

      <div className="text-primary-border max-h-42.5 min-h-20 w-full shrink overflow-y-auto text-2xl font-bold sm:text-3xl">
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
