import type { ButtonHTMLAttributes } from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SelectionCardProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  selected: boolean;
  showIcon?: boolean;
}

export function SelectionCard({
  label,
  selected,
  showIcon = false,
  className,
  ...props
}: SelectionCardProps) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      className={cn(
        'flex w-full items-center gap-4 rounded-3xl border-2 px-5 py-4 text-left text-base font-bold transition-colors',
        selected
          ? 'border-highlight bg-highlight/10 text-foreground'
          : 'bg-surface text-foreground border-transparent',
        className,
      )}
      {...props}
    >
      {showIcon && (
        <span
          className={cn(
            'flex size-10 shrink-0 items-center justify-center rounded-full transition-colors',
            selected ? 'border-primary bg-background border-2' : 'bg-border',
          )}
          aria-hidden="true"
        >
          {selected && <Check className="text-primary size-6" strokeWidth={3} />}
        </span>
      )}
      <span>{label}</span>
    </button>
  );
}
