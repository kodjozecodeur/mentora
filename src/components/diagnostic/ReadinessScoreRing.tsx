interface ReadinessScoreRingProps {
  score: number;
}

export function ReadinessScoreRing({ score }: ReadinessScoreRingProps) {
  const scoreDegrees = Math.min(360, Math.max(0, (score / 100) * 360));

  return (
    <div
      role="img"
      aria-label={`Niveau de préparation : ${score}%`}
      className="relative flex size-36 items-center justify-center rounded-full"
      style={{
        background: `conic-gradient(var(--highlight) ${scoreDegrees}deg, var(--border) ${scoreDegrees}deg 360deg)`,
      }}
    >
      <div className="bg-surface absolute inset-3 flex items-center justify-center rounded-full">
        <span className="text-foreground text-4xl font-extrabold">{score}%</span>
      </div>
    </div>
  );
}
