'use client';

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Check } from 'lucide-react';
import { AppLogo } from '@/components/ui/AppLogo';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { cn } from '@/lib/utils';
import type { DiagnosticResult } from '@/types/diagnostic';

const ANALYSIS_STEPS = [
  'Calcul de ton niveau de préparation…',
  'Analyse de tes compétences…',
  'Identification de tes points forts…',
  'Préparation de tes priorités de révision…',
];

const STEP_INTERVAL = 500;
const READY_DELAY = 700;
const REDIRECT_DELAY = 900;

interface DiagnosticAnalysisScreenProps {
  /** Not read here: proves the result is already computed and saved before this screen opens. */
  result: DiagnosticResult;
  onComplete: () => void;
}

export function DiagnosticAnalysisScreen({ onComplete }: DiagnosticAnalysisScreenProps) {
  const [visibleSteps, setVisibleSteps] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const hasCompleted = useRef(false);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];

    ANALYSIS_STEPS.forEach((_, index) => {
      timers.push(
        setTimeout(() => {
          setVisibleSteps(index + 1);
        }, STEP_INTERVAL * index),
      );
    });

    const lastStepAt = STEP_INTERVAL * (ANALYSIS_STEPS.length - 1);

    timers.push(
      setTimeout(() => {
        setIsReady(true);
      }, lastStepAt + READY_DELAY),
    );

    timers.push(
      setTimeout(() => {
        if (hasCompleted.current) return;

        hasCompleted.current = true;
        onComplete();
      }, lastStepAt + READY_DELAY + REDIRECT_DELAY),
    );

    return () => {
      timers.forEach(clearTimeout);
    };
  }, [onComplete]);

  return (
    <ScreenContainer className="diagnostic-question-reveal">
      <div className="flex flex-1 flex-col items-center justify-center gap-6 py-8 text-center">
        <AppLogo size="sm" />

        <div className="flex flex-col gap-2">
          <h1 className="text-foreground text-2xl font-bold">Nous analysons tes réponses…</h1>
          <p className="text-muted text-base font-medium">
            Mentora prépare ton bilan personnalisé.
          </p>
        </div>

        <ul className="flex w-full flex-col gap-3" role="status" aria-live="polite">
          {ANALYSIS_STEPS.map((label, index) => {
            const isVisible = index < visibleSteps;
            const isDone = index < visibleSteps - 1 || isReady;

            return (
              <motion.li
                key={label}
                initial={shouldReduceMotion ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 8 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                className={cn(
                  'flex items-center gap-3 rounded-2xl border-2 px-4 py-3 text-left text-sm font-semibold transition-colors',
                  isDone
                    ? 'border-highlight bg-highlight/10 text-highlight'
                    : 'border-border bg-surface text-muted',
                )}
              >
                <span
                  className={cn(
                    'flex size-5 shrink-0 items-center justify-center rounded-full transition-colors',
                    isDone ? 'bg-highlight' : 'bg-border',
                  )}
                  aria-hidden="true"
                >
                  {isDone && <Check className="text-highlight-foreground size-3.5" strokeWidth={3} />}
                </span>
                {label}
              </motion.li>
            );
          })}
        </ul>

        <div className="min-h-8">
          <AnimatePresence>
            {isReady && (
              <motion.p
                initial={shouldReduceMotion ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className="text-highlight text-lg font-bold"
              >
                Ton bilan est prêt !
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </div>
    </ScreenContainer>
  );
}
