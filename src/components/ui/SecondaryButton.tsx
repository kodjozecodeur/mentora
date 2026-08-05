import type { ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

type SecondaryButtonProps = ButtonHTMLAttributes<HTMLButtonElement>;

export function SecondaryButton({ className, ...props }: SecondaryButtonProps) {
  return (
    <button
      type="button"
      className={cn(
        'border-highlight text-highlight w-full rounded-full border-2 px-6 py-4 text-lg font-bold transition-colors',
        className,
      )}
      {...props}
    />
  );
}
