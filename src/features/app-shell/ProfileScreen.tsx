import { BookOpen, GraduationCap, UserRound } from 'lucide-react';
import type { ReactNode } from 'react';

interface ProfileScreenProps {
  firstName: string;
  examLabel: string;
  subjectLabel: string;
}

const APP_VERSION = '0.1.0';

export function ProfileScreen({ firstName, examLabel, subjectLabel }: ProfileScreenProps) {
  return (
    <div className="flex flex-col gap-5 pb-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-foreground text-2xl font-bold">Mon profil</h1>
        <p className="text-muted text-base font-medium">Tes informations pour ce parcours.</p>
      </header>

      <section className="bg-surface border-border flex flex-col gap-1 rounded-3xl border-2 p-5">
        <ProfileRow
          icon={<UserRound className="size-5" aria-hidden="true" />}
          label="Prénom"
          value={firstName}
        />
        <ProfileRow
          icon={<GraduationCap className="size-5" aria-hidden="true" />}
          label="Examen"
          value={examLabel}
        />
        <ProfileRow
          icon={<BookOpen className="size-5" aria-hidden="true" />}
          label="Matière"
          value={subjectLabel}
        />
      </section>

      <section className="bg-surface border-border flex items-center justify-between gap-3 rounded-3xl border-2 p-5">
        <span className="text-muted text-sm font-semibold">Version de l&apos;application</span>
        <span className="text-foreground text-sm font-bold">{APP_VERSION}</span>
      </section>

      <p className="text-muted text-center text-sm font-medium">
        Aucun compte ni synchronisation n&apos;est nécessaire pour le moment.
      </p>
    </div>
  );
}

function ProfileRow({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="border-border flex items-center gap-3 border-b py-3 last:border-b-0">
      <span className="text-highlight" aria-hidden="true">
        {icon}
      </span>
      <span className="text-muted text-sm font-semibold">{label}</span>
      <span className="text-foreground ml-auto text-right text-sm font-bold">{value}</span>
    </div>
  );
}
