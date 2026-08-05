import type { ButtonHTMLAttributes } from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SelectionCardProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  sublabel?: string;
  selected: boolean;
  showIcon?: boolean;
}

export function SelectionCard({
  label,
  sublabel,
  selected,
  showIcon = false,
  className,
  disabled,
  ...props
}: SelectionCardProps) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      disabled={disabled}
      className={cn(
        'flex w-full items-center gap-4 rounded-3xl border-2 px-5 py-4 text-left transition-all',
        disabled
          ? 'bg-surface border-transparent text-foreground/40 cursor-not-allowed'
          : selected
            ? 'border-highlight bg-selected-surface text-foreground translate-y-1'
            : 'bg-surface text-foreground border-transparent shadow-[0_4px_0_var(--border)] cursor-pointer',
        className,
      )}
      {...props}
    >
      {showIcon && (
        <span
          className={cn(
            'flex size-10 shrink-0 items-center justify-center rounded-full transition-colors',
            selected ? 'border-primary bg-background border-2' : 'bg-border',
            disabled && 'opacity-40',
          )}
          aria-hidden="true"
        >
          {selected && <Check className="text-primary size-6" strokeWidth={3} />}
        </span>
      )}
      <span className="flex flex-col">
        <span className="text-base font-bold">{label}</span>
        {sublabel && <span className="text-muted text-sm font-medium">{sublabel}</span>}
      </span>
    </button>
  );
}
