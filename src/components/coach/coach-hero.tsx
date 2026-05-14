import Link from 'next/link';
import { Sparkles, ArrowRight } from 'lucide-react';
import { integratedToday } from '@/lib/mock';

export function CoachHero() {
  const msg = integratedToday;

  return (
    <section className="bg-pullim-blue-50 border-pullim-blue-100 relative overflow-hidden rounded-2xl border p-5 xl:p-6">
      <div className="relative">
        <div className="text-pullim-blue-700 flex items-center gap-1 text-[10px] font-bold tracking-wider uppercase">
          <Sparkles className="h-3 w-3" />
          오늘 코치가 본 것
        </div>

        <h2 className="text-pullim-slate-900 mt-1.5 text-xl font-bold tracking-tight xl:text-2xl">
          {msg.headline}
        </h2>

        <p className="text-pullim-slate-700 mt-2 text-sm leading-relaxed xl:text-[15px]">
          {msg.body}
        </p>

        <div className="border-pullim-blue-100 mt-4 flex items-center justify-end border-t pt-3">
          <Link
            href={msg.cta.href}
            className="bg-pullim-blue-600 inline-flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:scale-[1.02] transition-transform"
          >
            {msg.cta.label}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
