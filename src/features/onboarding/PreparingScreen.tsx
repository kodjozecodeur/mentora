'use client';

import { useEffect, useRef, useState } from 'react';
import { AppLogo } from '@/components/ui/AppLogo';
import { ProgressIndicator } from '@/components/ui/ProgressIndicator';
import { ScreenContainer } from '@/components/ui/ScreenContainer';

const PREPARATION_MESSAGES = [
  'Nous préparons ton parcours…',
  'Sélection des compétences à vérifier…',
  'Préparation de tes exercices…',
  'Ton accompagnement personnalisé arrive.',
];

const MESSAGE_INTERVAL = 1000;
const MESSAGE_FADE_DURATION = 220;
const PREPARATION_DURATION = 3500;

function SkeletonQuestionCard() {
  return (
    <div className="skeleton-shimmer border-border bg-surface relative overflow-hidden rounded-3xl border-2 p-4">
      <div className="relative z-10 flex flex-col gap-3" aria-hidden="true">
        <span className="bg-border h-4 w-3/4 rounded-full" />
        <span className="bg-border h-3 w-full rounded-full" />
        <span className="bg-border h-3 w-2/3 rounded-full" />
        <div className="grid grid-cols-2 gap-2 pt-1">
          {Array.from({ length: 4 }, (_, index) => (
            <span key={index} className="bg-border h-8 rounded-2xl" />
          ))}
        </div>
      </div>
    </div>
  );
}

interface PreparingScreenProps {
  onComplete: () => void;
}

export function PreparingScreen({ onComplete }: PreparingScreenProps) {
  const [messageIndex, setMessageIndex] = useState(0);
  const [isMessageVisible, setIsMessageVisible] = useState(true);
  const hasCompleted = useRef(false);

  useEffect(() => {
    let messageSwapTimer: ReturnType<typeof setTimeout> | undefined;

    const messageTimer = setInterval(() => {
      setIsMessageVisible(false);
      messageSwapTimer = setTimeout(() => {
        setMessageIndex((currentIndex) => (currentIndex + 1) % PREPARATION_MESSAGES.length);
        setIsMessageVisible(true);
      }, MESSAGE_FADE_DURATION);
    }, MESSAGE_INTERVAL);

    const completionTimer = setTimeout(() => {
      if (hasCompleted.current) return;

      hasCompleted.current = true;
      onComplete();
    }, PREPARATION_DURATION);

    return () => {
      clearInterval(messageTimer);
      clearTimeout(messageSwapTimer);
      clearTimeout(completionTimer);
    };
  }, [onComplete]);

  return (
    <ScreenContainer>
      <ProgressIndicator step={3} totalSteps={4} />

      <div className="flex flex-1 flex-col items-center justify-center gap-5 py-8 text-center">
        <AppLogo size="sm" />

        <div className="flex items-center gap-2" aria-hidden="true">
          <span className="preparation-dot bg-highlight" />
          <span className="preparation-dot bg-primary" />
          <span className="preparation-dot bg-highlight" />
        </div>

        <div className="flex flex-col gap-2" role="status" aria-live="polite">
          <h1 className="text-foreground text-2xl font-bold">Nous préparons ton parcours…</h1>
          <p className="text-muted text-base font-medium">Veuillez patienter quelques instants.</p>
          <p
            className={`text-highlight min-h-6 text-sm font-bold transition-opacity duration-300 ease-in-out motion-reduce:transition-none ${isMessageVisible ? 'opacity-100' : 'opacity-0'}`}
          >
            {PREPARATION_MESSAGES[messageIndex]}
          </p>
        </div>

        <div className="flex w-full flex-col gap-3" aria-hidden="true">
          <SkeletonQuestionCard />
          <SkeletonQuestionCard />
        </div>
      </div>
    </ScreenContainer>
  );
}
