import { ArrowRight, Bot, BookOpen, ClipboardCheck, Flame, Sigma, SquarePen } from 'lucide-react';
import { AppLogo } from '@/components/ui/AppLogo';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { SpeechBubble } from '@/components/ui/SpeechBubble';
import type { DiagnosticResult } from '@/types/diagnostic';
import type { RevisionSession, RevisionUnit } from '@/types/revision';
import { getRevisionProgress } from './appShellData';

interface HomeScreenProps {
  firstName: string;
  diagnosticResult: DiagnosticResult;
  revisionPlan: {
    sessions: RevisionSession[];
  };
  nextSession: RevisionSession | null;
  nextUnit: RevisionUnit | null;
  subjectLabel: string;
  onOpenRevision: () => void;
  onRestartDiagnostic: () => void;
}

/** Demo-only, no mastery model behind this yet — see Home Screen implementation prompt. */
const MASTERY_CHIPS = [
  { label: 'Fractions', tone: 'done' as const },
  { label: 'Équations', tone: 'in-progress' as const },
  { label: 'Géométrie', tone: 'priority' as const },
];

/** Demo-only static cards — no recommendation engine wiring yet. */
const RECOMMENDATION_CARDS = [
  {
    title: 'Revoir la leçon',
    subtitle: 'Consolider les bases théoriques.',
    icon: BookOpen,
    iconClassName: 'bg-border text-muted',
  },
  {
    title: 'Faire un exercice',
    subtitle: 'Mettre en pratique les concepts.',
    icon: SquarePen,
    iconClassName: 'bg-selected-surface text-highlight',
  },
  {
    title: 'Vérifier ma compréhension',
    subtitle: 'Test rapide de 5 questions.',
    icon: ClipboardCheck,
    iconClassName: 'bg-red-100 text-red-600',
  },
  {
    title: 'Demander une explication à Mentora AI',
    subtitle: "Besoin d'aide sur un point précis ?",
    icon: Bot,
    iconClassName: 'bg-primary text-primary-foreground',
    outlined: true,
  },
];

/** Demo-only static visualization — no streak/analytics service yet. */
const WEEKLY_STREAK = [
  { day: 'L', heightPercent: 30, active: false },
  { day: 'M', heightPercent: 50, active: false },
  { day: 'M', heightPercent: 20, active: false },
  { day: 'J', heightPercent: 80, active: false },
  { day: 'V', heightPercent: 60, active: true },
  { day: 'S', heightPercent: 0, active: false },
  { day: 'D', heightPercent: 0, active: false },
];

export function HomeScreen({
  firstName,
  revisionPlan,
  nextSession,
  subjectLabel,
  onOpenRevision,
  onRestartDiagnostic,
}: HomeScreenProps) {
  const progress = getRevisionProgress(revisionPlan);
  const progressPercent = Math.min(100, Math.max(0, progress.completionPercent));
  const isPlanComplete = progress.totalSessions > 0 && progress.completionPercent === 100;
  const revisionCtaLabel = isPlanComplete ? 'Refaire un diagnostic' : 'Continuer';

  return (
    <div className="flex flex-col gap-5 pb-6">
      <div className="flex items-start gap-3">
        <AppLogo size="sm" />
        <SpeechBubble>
          Tu progresses chaque jour, {firstName} ! Prêt pour de nouvelles découvertes ?
        </SpeechBubble>
      </div>

      <section aria-labelledby="continue-learning-title" className="flex flex-col gap-3">
        <h2 id="continue-learning-title" className="text-foreground text-lg font-bold">
          Continuer mon apprentissage
        </h2>

        <div className="bg-surface border-border flex flex-col gap-4 rounded-3xl border-2 p-4 shadow-[0_4px_0_var(--border)]">
          <div className="flex items-center gap-3">
            <div className="bg-border text-highlight flex size-12 shrink-0 items-center justify-center rounded-xl">
              <Sigma className="size-7" aria-hidden="true" />
            </div>
            <div className="flex min-w-0 flex-col">
              <span className="text-muted text-xs font-semibold tracking-wider uppercase">
                {subjectLabel}
              </span>
              <span className="text-foreground min-w-0 truncate text-base font-bold">
                {nextSession?.competencyLabel ?? 'Parcours terminé'}
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between gap-2 text-xs font-semibold">
              <span className="text-muted">Progression</span>
              <span className="text-foreground">{progressPercent}%</span>
            </div>
            <div
              role="progressbar"
              aria-valuenow={progressPercent}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`Progression en ${subjectLabel}`}
              className="bg-border h-3 w-full overflow-hidden rounded-full"
            >
              <div
                className="bg-primary h-full rounded-full transition-[width] duration-500 ease-out motion-reduce:transition-none"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          <PrimaryButton
            onClick={isPlanComplete ? onRestartDiagnostic : onOpenRevision}
            className="flex items-center justify-center gap-2 py-3 text-base"
          >
            {revisionCtaLabel}
            <ArrowRight className="size-5" aria-hidden="true" />
          </PrimaryButton>
        </div>
      </section>

      <section aria-labelledby="mastery-title" className="flex flex-col gap-3">
        <h2 id="mastery-title" className="text-foreground text-lg font-bold">
          Ce que je maîtrise
        </h2>
        <div className="flex flex-wrap gap-2">
          {MASTERY_CHIPS.map((chip) => (
            <div
              key={chip.label}
              className="bg-surface border-border flex items-center gap-2 rounded-full border-2 px-4 py-2 shadow-sm"
            >
              <span
                aria-hidden="true"
                className={`size-3 shrink-0 rounded-full ${
                  chip.tone === 'done'
                    ? 'bg-emerald-500'
                    : chip.tone === 'in-progress'
                      ? 'bg-yellow-400'
                      : 'bg-red-500'
                }`}
              />
              <span className="text-foreground text-sm font-medium">{chip.label}</span>
            </div>
          ))}
        </div>
      </section>

      <section aria-labelledby="recommendations-title" className="flex flex-col gap-3">
        <h2 id="recommendations-title" className="text-foreground text-lg font-bold">
          Recommandé pour moi
        </h2>
        <div className="grid grid-cols-1 gap-3">
          {RECOMMENDATION_CARDS.map((card) => (
            <div
              key={card.title}
              className={`bg-surface flex items-start gap-3 rounded-3xl border-2 p-4 ${
                card.outlined ? 'border-primary' : 'border-border'
              }`}
            >
              <div
                className={`flex size-10 shrink-0 items-center justify-center rounded-full ${card.iconClassName}`}
              >
                <card.icon className="size-5" aria-hidden="true" />
              </div>
              <div className="flex min-w-0 flex-col">
                <span className="text-foreground text-base font-bold">{card.title}</span>
                <span className="text-muted text-sm font-medium">{card.subtitle}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section
        aria-labelledby="streak-title"
        className="border-border flex flex-col gap-4 rounded-3xl border p-4"
      >
        <div className="flex items-center gap-2">
          <Flame className="size-7 shrink-0 fill-orange-500 text-orange-500" aria-hidden="true" />
          <div className="flex flex-col">
            <h2 id="streak-title" className="text-foreground text-base font-bold">
              5 jours d&apos;affilée !
            </h2>
            <p className="text-muted text-xs font-semibold">Continue comme ça !</p>
          </div>
        </div>

        <div className="flex h-24 items-end justify-between gap-2 px-1">
          {WEEKLY_STREAK.map((entry, index) => (
            <div key={index} className="flex w-full flex-col items-center gap-2">
              <div
                className={`w-full rounded-t-sm ${entry.active ? 'bg-primary' : 'bg-border'}`}
                style={{ height: `${entry.heightPercent}%` }}
              />
              <span
                className={`text-xs ${entry.active ? 'text-foreground font-bold' : 'text-muted font-medium'}`}
              >
                {entry.day}
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
