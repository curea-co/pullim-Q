import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { todayActivities } from '@/lib/mock';
import { cn } from '@/lib/utils';

export function ActivityTimeline() {
  const sorted = [...todayActivities].sort((a, b) => b.timestamp.localeCompare(a.timestamp));

  return (
    <section className="bg-card flex h-full flex-col overflow-hidden rounded-2xl border">
      <header className="border-b p-3.5">
        <p className="text-pullim-blue-600 text-[10px] font-bold tracking-wider uppercase">
          오늘 코치가 본 것
        </p>
        <h2 className="text-pullim-slate-900 text-base font-bold">
          {todayActivities.length}건 · 미확인 {todayActivities.filter(a => !a.acknowledged).length}건
        </h2>
      </header>

      <ul className="flex-1 overflow-y-auto p-3 space-y-2">
        {sorted.map(activity => (
          <li
            key={activity.id}
            className={cn(
              'group rounded-lg border p-2.5 transition-colors',
              activity.acknowledged
                ? 'border-pullim-slate-100 bg-pullim-slate-50/40'
                : 'border-pullim-blue-200 bg-pullim-blue-50/40',
            )}
          >
            <header className="mb-1 flex items-center gap-1.5 text-[10px]">
              <span className="text-pullim-slate-500 font-mono">{activity.timestamp}</span>
              {!activity.acknowledged && (
                <span className="bg-pullim-blue-600 ml-auto inline-block h-1.5 w-1.5 rounded-full" />
              )}
            </header>
            <p className="text-pullim-slate-700 text-[11px] leading-relaxed">
              {activity.message}
            </p>
            {activity.cta && (
              <Link
                href={activity.cta.href}
                className={cn(
                  'mt-1.5 inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-bold transition-colors',
                  activity.acknowledged
                    ? 'text-pullim-slate-600 hover:bg-pullim-slate-100 hover:text-pullim-blue-700'
                    : 'bg-pullim-blue-600 text-white hover:bg-pullim-blue-700',
                )}
              >
                {activity.cta.label}
                <ArrowRight className="h-2.5 w-2.5" />
              </Link>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
