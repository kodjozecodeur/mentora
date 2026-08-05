import { AppLogo } from '@/components/ui/AppLogo';
import { BottomCTA } from '@/components/ui/BottomCTA';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { ProgressIndicator } from '@/components/ui/ProgressIndicator';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { SelectionCard } from '@/components/ui/SelectionCard';
import { SpeechBubble } from '@/components/ui/SpeechBubble';
import chapters from '@/data/chapters.json';
import type { ChapterOption } from '@/types/onboarding';
import { isMvpChapterAvailable } from './chapterAvailability';

interface ChapterSelectionScreenProps {
  selectedChapterId: string | null;
  onSelectChapter: (chapterId: string) => void;
  onContinue: () => void;
}

export function ChapterSelectionScreen({
  selectedChapterId,
  onSelectChapter,
  onContinue,
}: ChapterSelectionScreenProps) {
  return (
    <ScreenContainer>
      <ProgressIndicator step={4} totalSteps={5} />

      <div className="flex items-start gap-3 py-8">
        <AppLogo size="sm" />
        <SpeechBubble>
          <p>Quel chapitre souhaites-tu travailler aujourd&apos;hui ?</p>
          <p className="text-muted text-sm font-medium">
            Choisis le chapitre à partir duquel je vais construire ton parcours.
          </p>
        </SpeechBubble>
      </div>

      <div className="flex flex-col gap-4">
        {(chapters as ChapterOption[]).map((chapter) => (
          <SelectionCard
            key={chapter.id}
            label={chapter.label}
            selected={selectedChapterId === chapter.id}
            showIcon
            disabled={!isMvpChapterAvailable(chapter.id)}
            onClick={() => onSelectChapter(chapter.id)}
          />
        ))}
      </div>

      <BottomCTA>
        <PrimaryButton disabled={!selectedChapterId} onClick={onContinue}>
          Continuer
        </PrimaryButton>
      </BottomCTA>
    </ScreenContainer>
  );
}
