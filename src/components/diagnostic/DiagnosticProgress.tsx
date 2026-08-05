import { X } from 'lucide-react';
import { ProgressIndicator } from '@/components/ui/ProgressIndicator';

interface DiagnosticProgressProps {
  currentQuestion: number;
  totalQuestions: number;
  onClose?: () => void;
}

export function DiagnosticProgress({
  currentQuestion,
  totalQuestions,
  onClose,
}: DiagnosticProgressProps) {
  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        aria-label="Fermer"
        onClick={onClose}
        className="text-muted hover:bg-border/60 shrink-0 rounded-full p-2 transition-colors"
      >
        <X className="size-5" aria-hidden="true" />
      </button>

      <div className="flex-1">
        <p className="text-muted mb-1 text-xs font-bold">
          Question {currentQuestion}/{totalQuestions}
        </p>
        <ProgressIndicator step={currentQuestion} totalSteps={totalQuestions} />
      </div>

      <button
        type="button"
        aria-hidden="true"
        tabIndex={-1}
        className="invisible shrink-0 rounded-full p-2"
      >
        <X className="size-5" />
      </button>
    </div>
  );
}
