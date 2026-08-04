import type { InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string | null;
}

export function TextField({ error, className, ...props }: TextFieldProps) {
  return (
    <div className="w-full">
      <input
        aria-invalid={!!error}
        className={cn(
          'w-full rounded-2xl bg-surface px-5 py-4 text-lg text-foreground placeholder:text-muted focus:outline-none',
          className,
        )}
        {...props}
      />
      {error && (
        <p role="alert" className="mt-2 px-1 text-sm font-medium text-red-500">
          {error}
        </p>
      )}
    </div>
  );
}
