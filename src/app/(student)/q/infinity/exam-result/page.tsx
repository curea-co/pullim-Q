import Link from 'next/link';
import { Award, TrendingUp, AlertTriangle, Eye, Target, ArrowRight } from 'lucide-react';
import { lastExamResult } from '@/lib/mock';
import { PageHeader } from '@/components/shell/page-header';
import { cn } from '@/lib/utils';

export default function ExamResultPage() {
  const r = lastExamResult;
  const accuracyPct = Math.round((r.correct / r.problemCount) * 100);
  const thetaDelta = r.thetaAfter - r.thetaBefore;

  return (
    <div className="space-y-4">
      <PageHeader
        eyebrow={{ icon: Award, text: '시험 결과' }}
        title={r.examTitle}
        description={`제출 ${new Date(r.submittedAt).toLocaleString('ko-KR')} · 응시 ${r.totalMinutes}분 / ${r.duration}분 · AI 감독관 이벤트 ${r.proctorEvents}건`}
      />

      {/* 점수 hero */}
      <section className="from-pullim-warn to-pullim-warn/80 grid grid-cols-1 gap-3 rounded-2xl bg-gradient-to-br p-5 text-white shadow-lg shadow-amber-500/20 lg:grid-cols-4">
        <div className="lg:col-span-2">
          <div className="text-white/80 text-[10px] font-bold tracking-wider uppercase">원점수</div>
          <div className="font-mono text-5xl font-bold tracking-tight">
            {r.rawScore}
            <span className="text-2xl text-white/70">/ 100</span>
          </div>
          <div className="mt-1 text-sm font-semibold">예상 등급 <strong className="font-mono">{r.estimatedGrade}등급</strong></div>
        </div>

        <ResultStat label="정답"       value={`${r.correct}/${r.problemCount}`} sub={`${accuracyPct}%`} />
        <ResultStat label="실력 점수 변동"     value={`${thetaDelta >= 0 ? '+' : ''}${thetaDelta.toFixed(2)}`}
                    sub={`${r.thetaBefore.toFixed(2)} → ${r.thetaAfter.toFixed(2)}`}
                    Icon={TrendingUp} />
      </section>

      {/* 결과 분포 — 정답/오답/미응답 */}
      <section className="bg-card rounded-2xl border p-4">
        <h2 className="text-pullim-slate-900 mb-3 text-base font-bold">문항별 분포</h2>
        <div className="grid grid-cols-3 gap-3">
          <DistCard count={r.correct}    total={r.problemCount} label="정답"    tone="success" />
          <DistCard count={r.wrong}      total={r.problemCount} label="오답"    tone="danger" />
          <DistCard count={r.unanswered} total={r.problemCount} label="미응답"  tone="muted" />
        </div>
      </section>

      {/* 오답 클러스터 — 패턴별 묶음 */}
      <section className="bg-card rounded-2xl border p-4">
        <header className="mb-3 flex items-center gap-2">
          <span className="bg-pullim-danger flex h-7 w-7 items-center justify-center rounded-lg text-white">
            <AlertTriangle className="h-3.5 w-3.5" />
          </span>
          <div>
            <h2 className="text-pullim-slate-900 text-base font-bold">오답 클러스터</h2>
            <p className="text-pullim-slate-500 text-[11px]">AI가 패턴별로 묶었어요. 풀림 복습(정복)으로 일괄 보낼 수 있어요.</p>
          </div>
        </header>

        <ul className="space-y-2.5">
          {r.errorClusters.map((c, i) => (
            <li key={i} className="bg-pullim-danger/5 border-pullim-danger/20 rounded-xl border p-3">
              <header className="mb-2 flex items-center gap-2">
                <span className="bg-pullim-danger text-white inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold">
                  {c.count}개
                </span>
                <span className="text-pullim-slate-900 text-sm font-bold">{c.pattern}</span>
              </header>
              <ul className="flex flex-wrap gap-1.5">
                {c.skus.map(sku => (
                  <Link
                    key={sku}
                    href={`/q/infinity/explain/${sku}`}
                    className="bg-white border-pullim-slate-200 hover:border-pullim-danger inline-flex items-center gap-1 rounded-full border px-2.5 py-1 font-mono text-[10px] font-bold transition-colors"
                  >
                    <Eye className="h-2.5 w-2.5" />
                    {sku}
                  </Link>
                ))}
              </ul>
            </li>
          ))}
        </ul>

        <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
          <Link
            href="/q/review"
            className="bg-pullim-danger hover:bg-pullim-danger/90 flex items-center justify-between rounded-xl px-3 py-2 text-sm font-bold text-white"
          >
            <span className="inline-flex items-center gap-1.5">
              <Target className="h-3.5 w-3.5" />
              풀림 복습(정복) 일괄 등록
            </span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </section>

      {/* 다음 추천 */}
      <section className="bg-pullim-blue-50 border-pullim-blue-100 rounded-2xl border p-4">
        <h2 className="text-pullim-blue-700 mb-3 text-base font-bold tracking-tight">다음 추천</h2>
        <div className="grid grid-cols-1 gap-2 lg:grid-cols-2">
          <RecCard
            title="오답 12-섹션 해설"
            desc="틀린 문제부터 풀림 해설로"
            href={`/q/infinity/explain/${r.errorClusters[0].skus[0]}`}
          />
          <RecCard
            title="비슷한 시험 한 번 더"
            desc="AI 맞춤 — 약점 반영"
            href="/q/infinity/solve"
          />
        </div>
      </section>

      {/* 플라이휠 */}
      <aside className="bg-pullim-slate-900 text-pullim-slate-200 rounded-xl p-3.5 text-xs leading-relaxed">
        <strong className="text-pullim-lemon">데이터 플라이휠</strong>
        <span className="text-pullim-slate-400"> · </span>
        시험 결과는 실력 점수를 갱신하고, 오답 클러스터는 풀림 복습으로 자동 환류돼요.
      </aside>
    </div>
  );
}

function ResultStat({
  label, value, sub, Icon,
}: {
  label: string; value: string; sub: string;
  Icon?: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="bg-white/10 rounded-xl p-3">
      <div className="text-white/70 inline-flex items-center gap-1 text-[10px] font-bold tracking-wider uppercase">
        {Icon && <Icon className="h-3 w-3" />}
        {label}
      </div>
      <div className="font-mono text-2xl font-bold mt-0.5">{value}</div>
      <div className="text-white/70 text-[10px]">{sub}</div>
    </div>
  );
}

function DistCard({
  count, total, label, tone,
}: {
  count: number; total: number; label: string;
  tone: 'success' | 'danger' | 'muted';
}) {
  const pct = Math.round((count / total) * 100);
  const toneCls = {
    success: 'bg-pullim-success-bg text-pullim-success',
    danger:  'bg-pullim-danger-bg text-pullim-danger',
    muted:   'bg-pullim-slate-100 text-pullim-slate-700',
  }[tone];
  return (
    <div className={cn('rounded-xl p-3 text-center', toneCls)}>
      <div className="text-[10px] font-bold tracking-wider uppercase">{label}</div>
      <div className="font-mono text-2xl font-bold mt-0.5">{count}</div>
      <div className="text-[10px] font-mono opacity-80">{pct}%</div>
    </div>
  );
}

function RecCard({ title, desc, href }: { title: string; desc: string; href: string }) {
  return (
    <Link
      href={href}
      className="bg-white hover:border-pullim-blue-300 hover:shadow-pullim-md group flex items-center gap-2 rounded-xl border border-pullim-blue-200 p-3 transition-all"
    >
      <div className="flex-1">
        <div className="text-pullim-slate-900 text-sm font-bold">{title}</div>
        <div className="text-pullim-slate-500 text-[11px]">{desc}</div>
      </div>
      <ArrowRight className="text-pullim-blue-500 group-hover:translate-x-0.5 h-3.5 w-3.5 transition-transform" />
    </Link>
  );
}
