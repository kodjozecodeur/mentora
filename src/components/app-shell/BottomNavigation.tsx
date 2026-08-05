import type { AppTab } from '@/features/app-shell/types';
import { cn } from '@/lib/utils';
import { BOTTOM_NAVIGATION_TABS } from './bottomNavigationTabs';

interface BottomNavigationProps {
  activeTab: AppTab;
  onChange: (tab: AppTab) => void;
}

export function BottomNavigation({ activeTab, onChange }: BottomNavigationProps) {
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-50">
      <nav
        aria-label="Navigation principale"
        className="bg-surface/95 border-border pointer-events-auto mx-auto grid w-full max-w-[430px] grid-cols-3 border-t px-2 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] shadow-[0_-8px_24px_rgba(36,21,42,0.08)] backdrop-blur"
      >
        {BOTTOM_NAVIGATION_TABS.map(({ id, label, icon: Icon }) => {
          const isActive = activeTab === id;

          return (
            <button
              key={id}
              type="button"
              aria-current={isActive ? 'page' : undefined}
              aria-label={label}
              onClick={() => onChange(id)}
              className={cn(
                'focus-visible:ring-highlight/40 flex min-h-14 flex-col items-center justify-center gap-1 rounded-2xl px-2 text-xs font-bold transition-colors focus-visible:ring-4 focus-visible:outline-none',
                isActive
                  ? 'text-highlight'
                  : 'text-muted hover:bg-background hover:text-foreground',
              )}
            >
              <Icon className="size-5" strokeWidth={isActive ? 2.5 : 2} aria-hidden="true" />
              <span>{label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
