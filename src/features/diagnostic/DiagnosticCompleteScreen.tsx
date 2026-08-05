import {
  CheckCircle2,
  GraduationCap,
  Menu,
  MinusCircle,
  Sigma,
  Trophy,
  XCircle,
} from 'lucide-react';
import type { ComponentType } from 'react';
import { BottomCTA } from '@/components/ui/BottomCTA';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { ProgressIndicator } from '@/components/ui/ProgressIndicator';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { cn } from '@/lib/utils';
import type { CompetencyMastery, DiagnosticResult } from '@/types/diagnostic';
import {
  getMasteryStatusLabel,
  getReadinessMessage,
  getResultsContinueLabel,
  resolveResultsBranch,
} from './resultCopy';

interface DiagnosticCompleteScreenProps {
  result: DiagnosticResult;
  chapterLabel: string;
  firstName?: string;
  onContinue: () => void;
}

const STATUS_STYLES: Record<
  string,
  { icon: ComponentType<{ className?: string }>; colorClass: string }
> = {
  Maîtrisé: { icon: CheckCircle2, colorClass: 'text-emerald-600' },
  'À renforcer': { icon: MinusCircle, colorClass: 'text-amber-600' },
  'En apprentissage': { icon: XCircle, colorClass: 'text-red-600' },
};

export function DiagnosticCompleteScreen({
  result,
  chapterLabel,
  firstName,
  onContinue,
}: DiagnosticCompleteScreenProps) {
  const studentName = firstName?.trim() || 'élève';
  const avatarInitial = studentName.charAt(0).toUpperCase();
  const branch = resolveResultsBranch(result.competencyMastery);

  return (
    <ScreenContainer className="diagnostic-question-reveal">
      <header
        className="flex items-center justify-between gap-3 pb-5"
        style={{ paddingTop: 'env(safe-area-inset-top)' }}
      >
        <Menu className="text-primary-border size-6 shrink-0" aria-hidden="true" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/assets/icons/icon-mentora.svg" alt="Mentora" className="h-10 w-auto" />
        <div
          className="border-border bg-surface text-foreground flex size-11 shrink-0 items-center justify-center rounded-full border text-sm font-bold"
          aria-label={`Profil de ${studentName}`}
        >
          {avatarInitial}
        </div>
      </header>

      <div className="flex flex-col items-center gap-2 pb-6 text-center">
        <div className="border-primary bg-speech-bubble mx-auto inline-flex items-center gap-2 rounded-full border px-4 py-2">
          <Trophy className="text-primary-border size-4" aria-hidden="true" />
          <span className="text-primary-border text-xs font-bold tracking-wide uppercase">
            Diagnostic terminé
          </span>
        </div>
        <p className="text-muted text-xs font-bold tracking-wide uppercase">{chapterLabel}</p>
        <h1 className="text-foreground pt-2 text-3xl font-bold">Bilan de compétences</h1>
        <p className="text-muted text-base font-medium">
          Voici ce que tu maîtrises déjà et les notions que nous allons travailler ensemble.
        </p>
      </div>

      <section className="bg-surface border-border mb-6 flex flex-col gap-4 rounded-3xl border-2 px-5 py-5 shadow-[0_4px_0_var(--border)]">
        <div className="flex items-end justify-between">
          <div className="flex flex-col">
            <span className="text-muted text-xs font-bold tracking-wide uppercase">
              Score global
            </span>
            <span className="text-primary-border text-4xl font-extrabold">
              {result.readinessScore}%
            </span>
          </div>
          <div className="border-primary bg-speech-bubble flex size-12 shrink-0 items-center justify-center rounded-full border-2">
            <GraduationCap className="text-primary-border size-6" aria-hidden="true" />
          </div>
        </div>
        <ProgressIndicator step={result.readinessScore} totalSteps={100} />
        <p className="text-muted text-sm font-medium">
          {getReadinessMessage(result.readinessScore)}
        </p>
      </section>

      <section className="mb-6 flex flex-col gap-3">
        <h2 className="text-foreground text-lg font-bold">Par compétence</h2>
        <ul className="flex flex-col gap-3">
          {result.competencyMastery.map((competency) => (
            <CompetencyCard key={competency.competencyId} competency={competency} />
          ))}
        </ul>
      </section>

      <section className="border-border mb-6 flex flex-wrap justify-center gap-4 rounded-2xl border px-4 py-4">
        {Object.entries(STATUS_STYLES).map(([label, { icon: Icon, colorClass }]) => (
          <div key={label} className="flex items-center gap-2">
            <Icon className={cn('size-5', colorClass)} aria-hidden="true" />
            <span className="text-muted text-xs font-semibold">{label}</span>
          </div>
        ))}
      </section>

      <BottomCTA>
        <PrimaryButton onClick={onContinue}>{getResultsContinueLabel(branch)}</PrimaryButton>
      </BottomCTA>
    </ScreenContainer>
  );
}

interface CompetencyCardProps {
  competency: CompetencyMastery;
}

function CompetencyCard({ competency }: CompetencyCardProps) {
  const statusLabel = getMasteryStatusLabel(competency.readinessLevel);
  const { icon: StatusIcon, colorClass } = STATUS_STYLES[statusLabel];

  return (
    <li className="bg-surface border-border rounded-2xl border-2 px-5 py-4 shadow-[0_4px_0_var(--border)]">
      <div className="flex items-center gap-3">
        <span className="border-primary/50 bg-speech-bubble flex size-10 shrink-0 items-center justify-center rounded-xl border">
          <Sigma className="text-primary-border size-5" aria-hidden="true" />
        </span>
        <span className="text-foreground flex-1 text-base font-bold">
          {competency.competencyLabel}
        </span>
        <span className="text-muted shrink-0 text-sm font-semibold">
          {competency.masteryPercent}%
        </span>
      </div>
      <div className="mt-3 flex items-center gap-2">
        <StatusIcon className={cn('size-[18px] shrink-0', colorClass)} aria-hidden="true" />
        <span className={cn('text-sm font-semibold', colorClass)}>{statusLabel}</span>
      </div>
    </li>
  );
}
