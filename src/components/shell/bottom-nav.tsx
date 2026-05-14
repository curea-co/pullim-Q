'use client';

import { GuardedLink as Link } from './leave-guard';
import { usePathname } from 'next/navigation';
import { studentBottomTabs } from './nav-config';
import { cn } from '@/lib/utils';

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="풀림 Q 메인 네비게이션"
      className="bg-background/95 sticky bottom-0 z-30 border-t backdrop-blur-md md:hidden"
    >
      <ul className="grid grid-cols-5">
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
                  'flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition-colors',
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
