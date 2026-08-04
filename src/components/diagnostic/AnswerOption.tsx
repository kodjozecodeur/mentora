import { cn } from '@/lib/utils';
import type { DiagnosticQuestionOption } from '@/types/diagnostic';
import { MathContent } from './MathContent';

interface AnswerOptionProps {
  option: DiagnosticQuestionOption;
  selected: boolean;
  onSelect: () => void;
}

export function AnswerOption({ option, selected, onSelect }: AnswerOptionProps) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onSelect}
      className={cn(
        'focus-visible:ring-primary/40 relative flex min-h-32 items-center justify-center rounded-3xl border-2 px-4 py-6 text-center transition-[background-color,border-color,box-shadow,transform] duration-300 ease-out focus-visible:ring-4 focus-visible:outline-none motion-reduce:transition-none',
        selected
          ? 'border-primary bg-highlight/15 text-highlight shadow-[inset_0_-4px_0_var(--primary)]'
          : 'bg-highlight/10 text-highlight hover:border-primary/50 border-transparent',
      )}
    >
      <MathContent
        content={option.content}
        contentFormat={option.contentFormat}
        className="text-2xl font-bold"
      />
      <span
        aria-hidden="true"
        className={cn(
          'absolute top-3 right-3 flex size-7 items-center justify-center rounded-full border-2 transition-colors motion-reduce:transition-none',
          selected ? 'border-primary bg-primary' : 'border-highlight/40 bg-background/60',
        )}
      >
        <span
          className={cn(
            'size-2 rounded-full transition-colors motion-reduce:transition-none',
            selected ? 'bg-background' : 'bg-transparent',
          )}
        />
      </span>
    </button>
  );
}
