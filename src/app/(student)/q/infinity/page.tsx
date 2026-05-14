import Link from 'next/link';
import {
  Infinity, ArrowRight, Pencil, Award,
  Sparkles, BookmarkCheck, Check, X, Star,
} from 'lucide-react';
import {
  todaySession, solveHistory, explainLibrary, lastExamResult, subjectLabels,
} from '@/lib/mock';
import { PageHeader } from '@/components/shell/page-header';
import { SectionHeading } from '@/components/shell/section-heading';
import { cn } from '@/lib/utils';

export default function InfinityHomePage() {
  const recent = solveHistory.slice(0, 5);
  const signaturePicks = explainLibrary.filter(e => e.isSignature).slice(0, 3);

  return (
    <div className="space-y-section">
      <PageHeader
        eyebrow={{ icon: Infinity, text: '풀림 무한풀기' }}
        title="내 실력에 맞는 문제가 끊임없이 나와요"
        description={`오늘 ${todaySession.problemsSolved}/${todaySession.totalToday}문항 · 정답률 ${todaySession.accuracyToday}% · 실력 +${todaySession.estimatedThetaGain.toFixed(2)}`}
      />

      <section>
        <SectionHeading
          title="풀이 시작하기"
          description="자유 풀이로 바로 시작하거나, 세션을 직접 골라보세요."
        />
        <Link
          href="/q/infinity/solve"
          className="bg-pullim-blue-50 hover:bg-pullim-blue-100 border-pullim-blue-200 flex items-center gap-3 rounded-xl border-2 border-dashed p-4 transition-colors"
        >
          <span className="bg-pullim-blue-100 text-pullim-blue-700 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl">
            <Pencil className="h-4 w-4" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="text-pullim-blue-900 text-sm font-bold">
              자유 풀이 시작하기
            </div>
            <div className="text-pullim-slate-600 text-[11px]">
              과목·단원을 직접 골라 풀 수 있어요.
            </div>
          </div>
          <ArrowRight className="text-pullim-blue-500 h-4 w-4 shrink-0" />
        </Link>
      </section>

      <section>
        <SectionHeading
          title="최근 풀이와 깊이 있는 해설"
          description="지난 24시간 기록과 풀림 해설 추천"
        />
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <article className="bg-card rounded-2xl border">
            <header className="flex items-end justify-between border-b p-4">
              <h3 className="text-pullim-slate-900 text-sm font-bold tracking-tight">
                최근 풀이 — 지난 24시간
              </h3>
              <Link href="/q/infinity/history" className="text-pullim-slate-600 hover:text-pullim-blue-600 text-xs font-bold inline-flex items-center gap-0.5 hover:underline underline-offset-3">
                전체 이력 <ArrowRight className="h-3 w-3" />
              </Link>
            </header>
            <ul className="divide-pullim-slate-100 divide-y">
              {recent.map(h => (
                <li key={h.id} className="flex items-center gap-3 px-4 py-2">
                  <span className={cn(
                    'flex h-6 w-6 shrink-0 items-center justify-center rounded-full',
                    h.result === 'correct' ? 'bg-pullim-success-bg text-pullim-success' : 'bg-pullim-danger-bg text-pullim-danger',
                  )}>
                    {h.result === 'correct' ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="text-pullim-slate-900 truncate text-xs font-semibold">{h.unit}</div>
                    <div className="text-pullim-slate-400 font-mono text-[10px]">{h.sku}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-pullim-slate-700 text-[11px] font-semibold">{h.attemptedAgo}</div>
                    {h.isBookmarked && <BookmarkCheck className="text-pullim-blue-500 ml-auto mt-0.5 h-3 w-3" />}
                  </div>
                </li>
              ))}
            </ul>
          </article>

          <article className="bg-card rounded-2xl border">
            <header className="flex items-end justify-between border-b p-4">
              <h3 className="text-pullim-slate-900 inline-flex items-center gap-1 text-sm font-bold tracking-tight">
                <Sparkles className="text-pullim-warn h-3.5 w-3.5" />
                풀림 해설 — 추천 12-섹션
              </h3>
              <Link href="/q/infinity/explain" className="text-pullim-slate-600 hover:text-pullim-blue-600 text-xs font-bold inline-flex items-center gap-0.5 hover:underline underline-offset-3">
                전체 보기 <ArrowRight className="h-3 w-3" />
              </Link>
            </header>
            <ul className="divide-pullim-slate-100 divide-y">
              {signaturePicks.map(e => (
                <li key={e.sku}>
                  <Link href={`/q/infinity/explain/${e.sku}`} className="hover:bg-pullim-slate-50 flex items-center gap-2 px-4 py-2 transition-colors">
                    <span className="bg-pullim-warn flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-white">
                      <Star className="h-3 w-3 fill-current" aria-hidden />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="text-pullim-slate-900 truncate text-xs font-semibold">{e.summary}</div>
                      <div className="text-pullim-slate-400 inline-flex items-center gap-1 text-[10px]">
                        <span>{subjectLabels[e.subject]}</span>
                        <span aria-hidden>·</span>
                        <Star className="text-pullim-warn h-2.5 w-2.5 fill-current" aria-hidden />
                        <span>{e.rating}</span>
                        <span aria-hidden>·</span>
                        <span>{e.views.toLocaleString()}회</span>
                      </div>
                    </div>
                    <ArrowRight className="text-pullim-slate-300 h-3 w-3 shrink-0" />
                  </Link>
                </li>
              ))}
            </ul>
          </article>
        </div>
      </section>

      <section className="bg-pullim-warn/5 border-pullim-warn/30 flex items-center gap-4 rounded-2xl border p-4">
        <span className="bg-pullim-warn flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-white">
          <Award className="h-5 w-5" />
        </span>
        <div className="flex-1">
          <div className="text-pullim-warn text-[10px] font-bold tracking-wider uppercase">
            최근 시험 결과
          </div>
          <div className="text-pullim-slate-900 text-sm font-bold">
            {lastExamResult.examTitle} — <span className="font-mono">{lastExamResult.rawScore}점</span> · 예상 {lastExamResult.estimatedGrade}등급
          </div>
          <div className="text-pullim-slate-500 text-[11px]">
            실력 {lastExamResult.thetaBefore.toFixed(2)} → {lastExamResult.thetaAfter.toFixed(2)}
            <span className="text-pullim-success font-bold ml-1">(+{(lastExamResult.thetaAfter - lastExamResult.thetaBefore).toFixed(2)})</span>
          </div>
        </div>
        <Link
          href="/q/infinity/exam-result"
          className="border-pullim-warn/40 text-pullim-warn hover:bg-pullim-warn/10 shrink-0 inline-flex items-center gap-1.5 rounded-lg border px-4 py-2.5 text-sm font-semibold transition-colors"
        >
          상세 분석
          <ArrowRight className="h-4 w-4" />
        </Link>
      </section>
    </div>
  );
}
