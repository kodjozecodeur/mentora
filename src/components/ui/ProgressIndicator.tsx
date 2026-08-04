interface ProgressIndicatorProps {
  step: number;
  totalSteps: number;
}

export function ProgressIndicator({ step, totalSteps }: ProgressIndicatorProps) {
  const percent = Math.round((step / totalSteps) * 100);

  return (
    <div
      role="progressbar"
      aria-valuenow={percent}
      aria-valuemin={0}
      aria-valuemax={100}
      className="bg-border h-5 w-full overflow-hidden rounded-full"
    >
      <div
        className="progress-fill bg-primary relative h-full overflow-hidden rounded-full transition-[width] duration-500 ease-out motion-reduce:transition-none"
        style={{ width: `${percent}%` }}
      />
    </div>
  );
}
