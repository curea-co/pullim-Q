'use client';

import { GuardedLink as Link } from './leave-guard';
import { usePathname } from 'next/navigation';
import { studentBottomTabs } from './nav-config';
import { cn } from '@/lib/utils';

// 탭 개수 변동 시 grid-cols 자동 추종 — nav-config 와 결합 끊김 방지.
// Tailwind JIT 가 정적으로 클래스를 발견할 수 있도록 lookup 형태로.
const GRID_COLS_BY_LENGTH: Record<number, string> = {
  3: 'grid-cols-3',
  4: 'grid-cols-4',
  5: 'grid-cols-5',
};

export function BottomNav() {
  const pathname = usePathname();
  const gridCols = GRID_COLS_BY_LENGTH[studentBottomTabs.length] ?? 'grid-cols-4';

  return (
    <nav
      aria-label="풀림 Q 메인 네비게이션"
      className="bg-background/95 sticky bottom-0 z-30 border-t backdrop-blur-md md:hidden"
    >
      <ul className={cn('grid', gridCols)}>
        {studentBottomTabs.map(item => {
          const Icon = item.icon;
          const active = item.matchPrefix.some(
            p => pathname === p || pathname.startsWith(p + '/'),
          );
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'flex min-h-11 flex-col items-center justify-center gap-1 py-2.5 text-[11px] font-medium transition-colors',
                  active
                    ? 'text-pullim-blue-600'
                    : 'text-pullim-slate-500 hover:text-pullim-slate-800',
                )}
              >
                <Icon className={cn('h-5 w-5', active && 'stroke-[2.4]')} />
                <span>{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
