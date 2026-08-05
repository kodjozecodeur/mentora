import { AppLogo } from '@/components/ui/AppLogo';
import { BottomCTA } from '@/components/ui/BottomCTA';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { ProgressIndicator } from '@/components/ui/ProgressIndicator';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { SelectionCard } from '@/components/ui/SelectionCard';
import { SpeechBubble } from '@/components/ui/SpeechBubble';
import chapters from '@/data/chapters.json';
import type { ChapterOption } from '@/types/onboarding';
import { isMvpChapterAvailable, MVP_UNAVAILABLE_CHAPTER_MESSAGE } from './chapterAvailability';

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
  const hasUnavailableChapter =
    selectedChapterId !== null && !isMvpChapterAvailable(selectedChapterId);

  return (
    <ScreenContainer>
      <ProgressIndicator step={4} totalSteps={5} />

      <div className="flex items-start gap-3 py-8">
        <AppLogo size="sm" />
        <SpeechBubble>
          Excellent. Quel chapitre souhaites-tu travailler aujourd&apos;hui ?
        </SpeechBubble>
      </div>

      <div className="flex flex-col gap-4">
        {(chapters as ChapterOption[]).map((chapter) => (
          <SelectionCard
            key={chapter.id}
            label={isMvpChapterAvailable(chapter.id) ? chapter.label : `${chapter.label} · Bientôt`}
            selected={selectedChapterId === chapter.id}
            showIcon
            onClick={() => onSelectChapter(chapter.id)}
          />
        ))}
      </div>

      {hasUnavailableChapter && (
        <p
          role="alert"
          className="border-highlight bg-highlight/10 text-foreground mt-4 rounded-2xl border-2 px-4 py-3 text-sm font-semibold"
        >
          {MVP_UNAVAILABLE_CHAPTER_MESSAGE}
        </p>
      )}

      <BottomCTA>
        <PrimaryButton disabled={!selectedChapterId || hasUnavailableChapter} onClick={onContinue}>
          Continuer
        </PrimaryButton>
      </BottomCTA>
    </ScreenContainer>
  );
}
