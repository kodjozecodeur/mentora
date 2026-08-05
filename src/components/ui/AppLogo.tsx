const SIZES = {
  sm: 72,
  lg: 150,
} as const;

interface AppLogoProps {
  size?: keyof typeof SIZES;
  className?: string;
}

export function AppLogo({ size = 'lg', className }: AppLogoProps) {
  const px = SIZES[size];

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src="/logo/mentora-icon.svg" alt="Mentora" width={px} height={px} className={className} />
  );
}
