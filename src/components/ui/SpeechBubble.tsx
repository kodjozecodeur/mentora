import type { ReactNode } from 'react';

interface SpeechBubbleProps {
  children: ReactNode;
}

export function SpeechBubble({ children }: SpeechBubbleProps) {
  return (
    <div className="bg-speech-bubble border-primary relative min-w-0 flex-1 rounded-2xl border-2 px-5 py-4">
      <span
        aria-hidden="true"
        className="border-r-primary absolute top-1/2 -left-[10px] h-0 w-0 -translate-y-1/2 border-y-[10px] border-r-[10px] border-y-transparent"
      />
      <span
        aria-hidden="true"
        className="border-r-speech-bubble absolute top-1/2 -left-2 h-0 w-0 -translate-y-1/2 border-y-[9px] border-r-[9px] border-y-transparent"
      />
      <div className="text-foreground text-lg font-bold">{children}</div>
    </div>
  );
}
