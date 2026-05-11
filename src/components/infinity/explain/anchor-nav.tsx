'use client';

import { sectionAnchors } from './sections';
import { cn } from '@/lib/utils';
import { Star } from 'lucide-react';

/**
 * 12-섹션 anchor 네비게이션 — sticky 사이드바.
 */
export function AnchorNav() {
  return (
    <nav aria-label="섹션 네비게이션" className="space-y-1 text-xs">
      {sectionAnchors.map((s, i) => {
        const Icon = s.Icon;
        return (
          <a
            key={s.id}
            href={`#${s.id}`}
            className={cn(
              'group flex items-center gap-2 rounded-lg px-2.5 py-1.5 font-medium transition-colors',
              s.signature
                ? 'bg-pullim-warn/10 text-pullim-warn hover:bg-pullim-warn/15'
                : 'text-pullim-slate-600 hover:bg-pullim-slate-100 hover:text-pullim-slate-900',
            )}
          >
            <span className={cn(
              'flex h-5 w-5 shrink-0 items-center justify-center rounded font-mono text-[10px] font-bold',
              s.signature
                ? 'bg-pullim-warn text-white'
                : 'bg-pullim-slate-100 text-pullim-slate-600 group-hover:bg-pullim-blue-100 group-hover:text-pullim-blue-700',
            )}>
              {i + 1}
            </span>
            <Icon className="h-3.5 w-3.5 shrink-0" />
            <span className="flex-1 truncate">{s.label}</span>
            {s.signature && <Star className="text-pullim-warn h-2.5 w-2.5 fill-current shrink-0" />}
          </a>
        );
      })}
    </nav>
  );
}
