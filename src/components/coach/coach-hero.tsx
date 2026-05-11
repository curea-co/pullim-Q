import Link from 'next/link';
import { Sparkles, ArrowRight } from 'lucide-react';
import { integratedToday } from '@/lib/mock';

export function CoachHero() {
  const msg = integratedToday;

  return (
    <section className="from-pullim-blue-600 to-pullim-blue-700 relative overflow-hidden rounded-2xl bg-gradient-to-br p-5 text-white shadow-xl xl:p-6">
      <div
        aria-hidden
        className="absolute -top-20 -right-20 h-56 w-56 rounded-full opacity-30 blur-3xl"
        style={{ background: 'radial-gradient(circle, var(--color-pullim-lemon), transparent 70%)' }}
      />

      <div className="relative">
        <div className="text-pullim-lemon flex items-center gap-1 text-[10px] font-bold tracking-wider uppercase">
          <Sparkles className="h-3 w-3" />
          오늘 코치가 본 것
        </div>

        <h2 className="mt-1.5 text-xl font-bold tracking-tight xl:text-2xl">
          {msg.headline}
        </h2>

        <p className="text-pullim-blue-100 mt-2 text-sm leading-relaxed xl:text-[15px]">
          {msg.body}
        </p>

        <div className="border-pullim-blue-500/40 mt-4 flex items-center justify-end border-t pt-3">
          <Link
            href={msg.cta.href}
            className="text-pullim-blue-700 inline-flex items-center gap-1.5 rounded-xl bg-white px-4 py-2.5 text-sm font-bold shadow-sm hover:scale-[1.02] transition-transform"
          >
            {msg.cta.label}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
