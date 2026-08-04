import { ProgressIndicator } from '@/components/ui/ProgressIndicator';

interface DiagnosticProgressProps {
  currentQuestion: number;
  totalQuestions: number;
  label?: string;
}

export function DiagnosticProgress({
  currentQuestion,
  totalQuestions,
  label = 'Diagnostic',
}: DiagnosticProgressProps) {
  return (
    <div className="flex flex-col gap-2">
      <div className="text-muted flex items-center justify-between text-sm font-bold">
        <span>{label}</span>
        <span>
          Question {currentQuestion} sur {totalQuestions}
        </span>
      </div>
      <ProgressIndicator step={currentQuestion} totalSteps={totalQuestions} />
    </div>
  );
}
