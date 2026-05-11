'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Lock } from 'lucide-react';
import {
  findActiveSection, studentHomeItem,
  type NavItem, type NavSubItem,
} from './nav-config';
import { cn } from '@/lib/utils';

type Props = {
  onNavigate?: () => void;
  className?: string;
  compact?: boolean;
};

/**
 * 풀림 Q 사이드바 — 단일 도메인.
 * 홈(/q) + Q sub-children 인덴트.
 *
 * Compact (≥768 <1024): 아이콘 전용.
 * Comfortable (≥1024): 풀 라벨.
 */
export function AppSidebar({ onNavigate, className, compact }: Props) {
  const pathname = usePathname();
  const activeSection = findActiveSection(pathname, 'student');
  const isActive = activeSection?.href === studentHomeItem.href;
  const activeSubHref = isActive ? findActiveSubHref(pathname, studentHomeItem.children) : undefined;

  return (
    <nav
      aria-label="풀림 Q 메뉴"
      className={cn('flex flex-col overflow-y-auto py-3', compact ? 'px-1.5' : 'px-2', className)}
    >
      <ul className="space-y-0.5">
        <li>
          <NavRow
            item={studentHomeItem}
            pathname={pathname}
            onNavigate={onNavigate}
            compact={compact}
          />
          {isActive && studentHomeItem.children && (
            <ul
              className={cn(
                'mt-0.5 space-y-0.5',
                compact ? 'ml-0' : 'ml-3 border-l border-pullim-slate-200 pl-2',
              )}
            >
              {studentHomeItem.children.map(sub => (
                <SubNavRow
                  key={sub.href}
                  sub={sub}
                  isActive={sub.href === activeSubHref}
                  onNavigate={onNavigate}
                  compact={compact}
                />
              ))}
            </ul>
          )}
        </li>
      </ul>
    </nav>
  );
}

function NavRow({
  item, pathname, onNavigate, compact,
}: {
  item: NavItem;
  pathname: string;
  onNavigate?: () => void;
  compact?: boolean;
}) {
  const Icon = item.icon;
  const active =
    pathname === item.href ||
    (item.href !== '/' && pathname.startsWith(item.href + '/'));

  return (
    <Link
      href={item.locked ? '#' : item.href}
      onClick={item.locked ? e => e.preventDefault() : onNavigate}
      aria-current={active ? 'page' : undefined}
      aria-disabled={item.locked || undefined}
      title={compact ? item.label : item.description}
      className={cn(
        'group flex items-center gap-2 rounded-lg text-sm font-medium transition-colors',
        compact ? 'h-11 w-full justify-center' : 'min-h-11 px-2 py-2',
        active
          ? 'bg-pullim-blue-50 text-pullim-blue-700'
          : item.locked
          ? 'text-pullim-slate-400 hover:bg-pullim-slate-50 cursor-not-allowed'
          : 'text-pullim-slate-700 hover:bg-pullim-slate-100 hover:text-pullim-slate-900',
      )}
    >
      <Icon className={cn('h-4 w-4 shrink-0', active && 'stroke-[2.4]')} />
      {!compact && (
        <>
          <span className="flex-1 truncate">{item.label}</span>
          {item.locked && <Lock className="text-pullim-slate-300 h-3 w-3" />}
        </>
      )}
    </Link>
  );
}

function findActiveSubHref(pathname: string, children: NavSubItem[] | undefined): string | undefined {
  if (!children) return undefined;
  let best: string | undefined;
  for (const sub of children) {
    if (pathname === sub.href || pathname.startsWith(sub.href + '/')) {
      if (!best || sub.href.length > best.length) {
        best = sub.href;
      }
    }
  }
  return best;
}

function SubNavRow({
  sub, isActive, onNavigate, compact,
}: {
  sub: NavSubItem;
  isActive: boolean;
  onNavigate?: () => void;
  compact?: boolean;
}) {
  const Icon = sub.icon;

  return (
    <li>
      <Link
        href={sub.locked ? '#' : sub.href}
        onClick={sub.locked ? e => e.preventDefault() : onNavigate}
        aria-current={isActive ? 'page' : undefined}
        aria-disabled={sub.locked || undefined}
        title={compact ? sub.label : sub.description}
        className={cn(
          'group flex items-center gap-2 rounded-lg text-xs font-medium transition-colors',
          compact ? 'h-10 w-full justify-center' : 'min-h-10 px-2 py-2',
          isActive
            ? 'bg-pullim-blue-600 text-white shadow-pullim-sm'
            : sub.locked
            ? 'text-pullim-slate-400 hover:bg-pullim-slate-50 cursor-not-allowed'
            : 'text-pullim-slate-600 hover:bg-pullim-slate-100 hover:text-pullim-slate-900',
        )}
      >
        {Icon && <Icon className={cn('h-3.5 w-3.5 shrink-0', isActive && 'stroke-[2.4]')} />}
        {!compact && (
          <>
            <span className="flex-1 truncate">{sub.label}</span>
            {sub.locked && <Lock className={cn('h-3 w-3', isActive ? 'text-white/70' : 'text-pullim-slate-300')} />}
          </>
        )}
      </Link>
    </li>
  );
}
