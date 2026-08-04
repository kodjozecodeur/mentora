import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface ScreenContainerProps {
  children: ReactNode;
  className?: string;
}

export function ScreenContainer({ children, className }: ScreenContainerProps) {
  return (
    <div className={cn('bg-background flex min-h-dvh justify-center', className)}>
      <div className="flex w-full max-w-[430px] flex-col px-4 pt-6">{children}</div>
    </div>
  );
}
