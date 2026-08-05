import type { ReactNode } from 'react';

interface AppViewportProps {
  children: ReactNode;
}

export function AppViewport({ children }: AppViewportProps) {
  return (
    <div className="min-h-dvh w-full bg-[#ececec] sm:flex sm:items-center sm:justify-center">
      <div className="bg-background w-full shadow-none sm:w-[390px] sm:rounded-[2rem] sm:shadow-[0_20px_45px_-20px_rgba(0,0,0,0.35)]">
        {children}
      </div>
    </div>
  );
}
