import { AppLogo } from '@/components/ui/AppLogo';
import { BottomCTA } from '@/components/ui/BottomCTA';
import { PrimaryButton } from '@/components/ui/PrimaryButton';

interface SplashScreenProps {
  onContinue: () => void;
}

export function SplashScreen({ onContinue }: SplashScreenProps) {
  return (
    <div className="relative flex min-h-dvh justify-center">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/assets/splash-image.jpg"
        alt=""
        aria-hidden="true"
        className="absolute inset-0 size-full object-cover"
      />
      <div className="from-foreground/80 via-foreground/30 absolute inset-0 bg-gradient-to-t to-transparent" />

      <div className="relative flex w-full max-w-[430px] flex-1 flex-col px-4 pt-6">
        <AppLogo size="sm" />

        <div className="flex flex-1 flex-col items-center justify-end gap-8 py-12 text-center">
          <h1 className="text-2xl font-bold text-white">Révise avec ton répétiteur</h1>
        </div>

        <BottomCTA>
          <PrimaryButton onClick={onContinue}>Commencer</PrimaryButton>
        </BottomCTA>
      </div>
    </div>
  );
}
