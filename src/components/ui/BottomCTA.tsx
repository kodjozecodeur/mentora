import type { ReactNode } from 'react';

interface BottomCTAProps {
  children: ReactNode;
}

export function BottomCTA({ children }: BottomCTAProps) {
  return <div className="mt-auto pt-6 pb-[max(1.5rem,env(safe-area-inset-bottom))]">{children}</div>;
}
