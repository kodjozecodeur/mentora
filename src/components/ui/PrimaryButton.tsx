import type { ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

type PrimaryButtonProps = ButtonHTMLAttributes<HTMLButtonElement>;

export function PrimaryButton({ className, disabled, ...props }: PrimaryButtonProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      className={cn(
        'w-full rounded-full px-6 py-4 text-lg font-bold transition-colors',
        disabled
          ? 'bg-primary/40 text-primary-foreground/40 cursor-not-allowed'
          : 'bg-primary text-primary-foreground cursor-pointer shadow-[0_4px_0_var(--foreground)]',
        className,
      )}
      {...props}
    />
  );
}
