import type { ReactNode } from 'react';

interface SpeechBubbleProps {
  children: ReactNode;
}

export function SpeechBubble({ children }: SpeechBubbleProps) {
  return (
    <div className="relative min-w-0 flex-1">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/assets/bulbe-conversation.svg"
        alt=""
        aria-hidden="true"
        className="block h-auto w-full"
      />
      <div className="text-foreground absolute inset-0 flex items-center px-5 py-4 text-lg font-bold">
        {children}
      </div>
    </div>
  );
}
