'use client';

import { GuardedLink as Link } from './leave-guard';
import { ChevronRight } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { buildBreadcrumb } from './nav-config';

export function Breadcrumb() {
  const pathname = usePathname();
  const trail = buildBreadcrumb(pathname, 'student');

  if (trail.length <= 1) return null;

  return (
    <nav aria-label="현재 위치" className="text-pullim-slate-500 flex flex-wrap items-center gap-1 text-xs">
      {trail.map((node, i) => {
        const isLast = i === trail.length - 1;
        return (
          <span key={`${node.label}-${i}`} className="inline-flex items-center gap-1">
            {i > 0 && <ChevronRight className="text-pullim-slate-300 h-3 w-3" />}
            {node.href && !isLast ? (
              <Link href={node.href} className="hover:text-pullim-blue-600 hover:underline">
                {node.label}
              </Link>
            ) : (
              <span className={isLast ? 'text-pullim-slate-900 font-semibold' : ''}>
                {node.label}
              </span>
            )}
          </span>
        );
      })}
    </nav>
  );
}
