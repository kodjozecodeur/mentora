import { cn } from '@/lib/utils';
import type { DiagnosticQuestionOption } from '@/types/diagnostic';
import { MathContent } from './MathContent';

const OPTION_LETTERS = ['A', 'B', 'C', 'D'] as const;

interface AnswerOptionProps {
  option: DiagnosticQuestionOption;
  index: number;
  selected: boolean;
  onSelect: () => void;
}

export function AnswerOption({ option, index, selected, onSelect }: AnswerOptionProps) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onSelect}
      className={cn(
        'focus-visible:ring-primary/40 flex w-full items-center gap-4 rounded-3xl border-2 px-5 py-4 text-left transition-all focus-visible:ring-4 focus-visible:outline-none motion-reduce:transition-none',
        selected
          ? 'border-highlight bg-selected-surface translate-y-1'
          : 'bg-surface border-transparent shadow-[0_4px_0_var(--border)]',
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          'flex size-10 shrink-0 items-center justify-center rounded-full border-2 text-sm font-bold transition-colors motion-reduce:transition-none',
          selected
            ? 'border-highlight bg-highlight text-highlight-foreground'
            : 'border-border bg-background text-muted',
        )}
      >
        {OPTION_LETTERS[index]}
      </span>
      <span className="text-foreground flex-1 text-center text-base font-bold">
        <MathContent content={option.content} contentFormat={option.contentFormat} />
      </span>
    </button>
  );
}
