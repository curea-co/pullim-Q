import { Target, Lightbulb } from 'lucide-react';
import { errorPatterns, subjectLabels } from '@/lib/mock';
import { Progress } from '@/components/ui/progress';
import { ConquerIntroDialog } from './conquer-intro-dialog';

/**
 * 에러 패턴 TOP — Q 7.4.
 * "틀린 문제"가 아니라 "틀리는 패턴"을 보여주는 시그니처.
 *
 * Layer 1 §14.1: 한 화면 단일 톤 — 라이트 베이스로 통일.
 */
export function ErrorPatternList() {
  const sorted = [...errorPatterns].sort((a, b) => b.frequency - a.frequency);

  return (
    <section className="bg-card rounded-xl border p-4">
      <header className="mb-3 flex items-center gap-2">
        <span className="bg-pullim-blue-50 text-pullim-blue-600 flex h-7 w-7 items-center justify-center rounded-lg">
          <Target className="h-3.5 w-3.5" />
        </span>
        <div className="flex-1">
          <p className="text-pullim-blue-600 text-[10px] font-bold tracking-wider uppercase">
            AI 패턴 분석 · Tier 3
          </p>
          <h2 className="text-pullim-slate-900 text-base font-bold">내가 자주 틀리는 패턴</h2>
        </div>
        <span className="text-pullim-slate-500 text-[10px] font-mono">
          최근 30일
        </span>
      </header>

      <ul className="space-y-2">
        {sorted.map(p => {
          const conquerPct = Math.round((p.conquered / p.totalQuestions) * 100);
          return (
            <li key={p.id}>
              <article className="bg-pullim-slate-50 ring-pullim-slate-200 rounded-xl p-3 ring-1">
                <header className="mb-1 flex items-center gap-2">
                  <span className="bg-pullim-blue-100 text-pullim-blue-700 rounded-full px-1.5 py-0.5 text-[9px] font-bold tracking-wider uppercase">
                    {subjectLabels[p.subject]}
                  </span>
                  <span className="text-pullim-slate-500 font-mono text-[9px]">
                    {p.code}
                  </span>
                  <span className="text-pullim-danger ml-auto inline-flex items-baseline gap-0.5 font-mono text-xs font-bold">
                    {p.frequency}<span className="text-[10px] opacity-70">회</span>
                  </span>
                </header>

                <h3 className="text-pullim-slate-900 text-sm font-bold leading-snug">{p.name}</h3>
                <p className="text-pullim-slate-600 mt-0.5 line-clamp-2 text-[11px] leading-relaxed inline-flex items-baseline gap-1">
                  <Lightbulb className="text-pullim-warn h-3 w-3 shrink-0 translate-y-0.5" />
                  <span>{p.rootCause}</span>
                </p>

                <div className="mt-2 flex items-center gap-2">
                  <Progress
                    value={conquerPct}
                    className="bg-pullim-slate-200 h-1.5 flex-1"
                  />
                  <span className="text-pullim-slate-500 font-mono text-[10px]">
                    {p.conquered}/{p.totalQuestions} 정복 ({conquerPct}%)
                  </span>
                </div>

                <ConquerIntroDialog pattern={p} />
              </article>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
