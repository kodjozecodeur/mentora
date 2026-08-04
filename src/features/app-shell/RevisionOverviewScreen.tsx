import { ArrowRight, Download, Timer } from 'lucide-react';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { SecondaryButton } from '@/components/ui/SecondaryButton';
import type { RevisionPlan } from '@/types/revision';
import { getNextRevisionSession, getRevisionProgress } from './appShellData';

interface RevisionOverviewScreenProps {
  plan: RevisionPlan;
  onContinue: () => void;
  onDownloadStudyPack: () => void;
}

export function RevisionOverviewScreen({
  plan,
  onContinue,
  onDownloadStudyPack,
}: RevisionOverviewScreenProps) {
  const nextSession = getNextRevisionSession(plan);
  const progress = getRevisionProgress(plan);

  return (
    <div className="flex flex-col gap-5 pb-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-foreground text-2xl font-bold">Ma révision</h1>
        <p className="text-muted text-base font-medium">
          Continue ton programme personnalisé à ton rythme.
        </p>
      </header>

      <section className="border-highlight bg-highlight/10 flex flex-col gap-4 rounded-3xl border-2 p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-col gap-1">
            <h2 className="text-foreground text-lg font-bold">Continuer ma révision</h2>
            <p className="text-foreground text-sm font-medium">
              {nextSession
                ? `Prochaine compétence : ${nextSession.competencyLabel}`
                : 'Ton plan actuel est terminé.'}
            </p>
          </div>
          <Timer className="text-highlight size-6 shrink-0" aria-hidden="true" />
        </div>
        <p className="text-muted text-sm font-semibold">
          {progress.completedSessions}/{progress.totalSessions} sessions terminées ·{' '}
          {progress.remainingMinutes} min restantes
        </p>
        <PrimaryButton onClick={onContinue} disabled={!nextSession}>
          <span className="inline-flex items-center justify-center gap-2">
            Continuer ma révision
            <ArrowRight className="size-5" aria-hidden="true" />
          </span>
        </PrimaryButton>
      </section>

      <section className="bg-surface border-border flex flex-col gap-3 rounded-3xl border-2 p-5">
        <h2 className="text-foreground text-lg font-bold">Ton Study Pack</h2>
        <p className="text-muted text-sm font-medium">
          Retrouve tes contenus de révision dans un format à télécharger.
        </p>
        <SecondaryButton onClick={onDownloadStudyPack}>
          <span className="inline-flex items-center justify-center gap-2">
            <Download className="size-5" aria-hidden="true" />
            Télécharger mon Study Pack
          </span>
        </SecondaryButton>
      </section>
    </div>
  );
}
