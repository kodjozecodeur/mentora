import { BookOpenText, House, UserRound, type LucideIcon } from 'lucide-react';
import type { AppTab } from '@/features/app-shell/types';

export const BOTTOM_NAVIGATION_TABS: Array<{ id: AppTab; label: string; icon: LucideIcon }> = [
  { id: 'home', label: 'Accueil', icon: House },
  { id: 'revision', label: 'Mon parcours', icon: BookOpenText },
  { id: 'profile', label: 'Profil', icon: UserRound },
];
