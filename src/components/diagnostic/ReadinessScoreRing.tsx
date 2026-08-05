import { getReadinessLevelLabel } from '@/features/diagnostic/resultCopy';

interface ReadinessScoreRingProps {
  score: number;
}

const SIZE = 176;
const STROKE_WIDTH = 14;
const RADIUS = (SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function ReadinessScoreRing({ score }: ReadinessScoreRingProps) {
  const clampedScore = Math.min(100, Math.max(0, score));
  const dashOffset = CIRCUMFERENCE * (1 - clampedScore / 100);

  return (
    <div
      role="img"
      aria-label={`Niveau de préparation : ${clampedScore}%`}
      className="relative shrink-0"
      style={{ width: SIZE, height: SIZE }}
    >
      <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} className="-rotate-90">
        <circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          fill="none"
          stroke="var(--border)"
          strokeWidth={STROKE_WIDTH}
        />
        <circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          fill="none"
          stroke="var(--primary)"
          strokeWidth={STROKE_WIDTH}
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={dashOffset}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-foreground text-4xl font-extrabold">{clampedScore}%</span>
        <span className="text-foreground text-base font-semibold">
          {getReadinessLevelLabel(clampedScore)}
        </span>
      </div>
    </div>
  );
}
