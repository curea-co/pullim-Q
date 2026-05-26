import Link from 'next/link';
import {
  ArrowRight, AlertTriangle, Clock, Target, Sparkles, BookOpen,
  Calendar, Check, X, Star, Flame, Trophy, Brain, TrendingUp,
} from 'lucide-react';
import {
  overdueCards, dueItems, prescriptions, lastDiagnosis,
  currentPersona, getDday, solveHistory, explainLibrary, subjectLabels,
  todaySession, thetaTrend, conquestStats, leitnerCards,
  countByBox, personalForgettingProfile,
  type LeitnerCard, type Prescription, type LeitnerBox,
} from '@/lib/mock';
import { cn } from '@/lib/utils';

type NowAction =
  | { kind: 'leitner_overdue'; count: number; samples: LeitnerCard[] }
  | { kind: 'memory_overdue'; count: number }
  | { kind: 'prescription'; rx: Prescription }
  | { kind: 'diagnose_stale'; daysAgo: number }
  | { kind: 'free' };

function pickNowAction(): NowAction {
  const l = overdueCards();
  if (l.length > 0) return { kind: 'leitner_overdue', count: l.length, samples: l.slice(0, 2) };
  const m = dueItems().filter(i => i.nextReviewInHours < 0);
  if (m.length > 0) return { kind: 'memory_overdue', count: m.length };
  const rx = prescriptions.find(p => p.priority === 1);
  if (rx) return { kind: 'prescription', rx };
  if (lastDiagnosis.daysAgo >= lastDiagnosis.nextRecommendedIn) return { kind: 'diagnose_stale', daysAgo: lastDiagnosis.daysAgo };
  return { kind: 'free' };
}

const channelHref: Record<Prescription['channel'], string> = {
  infinity: '/q/infinity/solve', visual: '/q', conqueror: '/q/review', store: '/q',
};

// u04 (clean) — 풀림 컬러 위계 적용: 블루 메인, 라임 강조, 오렌지는 위급에만
export default function QHubPage() {
  const persona = currentPersona;
  const dday = getDday(persona);
  const recent = solveHistory.slice(0, 5);
  const correctCount = recent.filter(r => r.result === 'correct').length;
  const accuracy = recent.length > 0 ? Math.round((correctCount / recent.length) * 100) : 0;
  const wrongOnes = recent.filter(r => r.result === 'wrong');
  const weakPattern = wrongOnes[0]?.unit ?? '—';
  const signatures = explainLibrary.filter(e => e.isSignature).slice(0, 3);
  const now = pickNowAction();
  const last = thetaTrend[thetaTrend.length - 1]!;
  const prev = thetaTrend[thetaTrend.length - 2]!;
  const avgDelta = ((last.math - prev.math) + (last.english - prev.english) + (last.science - prev.science)) / 3;
  const masterImminent = leitnerCards.filter(c => c.box === 5).length;
  const overdueCount = overdueCards().length;
  const boxCounts = countByBox();
  const retention30 = Math.round(personalForgettingProfile.retention30d.me * 100);
  const peerRetention = Math.round(personalForgettingProfile.retention30d.peer * 100);
  const retentionDelta = retention30 - peerRetention;

  // 위급 여부 (NowCard만 warn 톤 허용)
  const isUrgent = now.kind === 'leitner_overdue' || now.kind === 'memory_overdue';

  const nowTitle =
    now.kind === 'leitner_overdue' ? `오답 ${now.count}개, 복습 시간이 지났어요` :
    now.kind === 'memory_overdue' ? `복습 ${now.count}개가 사라지기 직전이에요` :
    now.kind === 'prescription' ? `${now.rx.targetLabel} — 오늘 1순위 약점` :
    now.kind === 'diagnose_stale' ? '진단 다시 받을 시간이에요' :
    '오늘 급한 일은 없어요';
  const nowDetail =
    now.kind === 'prescription' ? `${now.rx.description}` :
    now.kind === 'memory_overdue' ? '기억이 사라지기 전 한 번 더 볼 시점이에요. 5분이면 다시 끌어올릴 수 있어요.' :
    now.kind === 'diagnose_stale' ? `마지막 진단 ${now.daysAgo}일 전 · 18분이면 끝나요` :
    now.kind === 'free' ? '자유 풀이로 가볍게 올려보세요.' :
    '잊혀가는 오답들. 잠깐만 잡으면 돼요.';
  const nowMeta =
    now.kind === 'prescription' ? [`실력 +${now.rx.expectedThetaGain.toFixed(2)} 예상`, `약 ${now.rx.effortMin}분`] :
    now.kind === 'leitner_overdue' ? ['실력 +0.5 예상', '약 5분'] :
    now.kind === 'memory_overdue' ? ['기억 회복', '약 5분'] :
    now.kind === 'diagnose_stale' ? ['약점 재파악', '약 18분'] :
    null;
  const nowHref =
    now.kind === 'leitner_overdue' || now.kind === 'memory_overdue' ? '/q/review' :
    now.kind === 'prescription' ? channelHref[now.rx.channel] :
    now.kind === 'diagnose_stale' ? '/q/analysis/diagnose' : '/q/infinity/solve';
  const nowCta =
    now.kind === 'leitner_overdue' ? '오답 정복하기' :
    now.kind === 'memory_overdue' ? '복습 시작' :
    now.kind === 'prescription' ? `${now.rx.channelLabel}에서 시작` :
    now.kind === 'diagnose_stale' ? '진단 시작' :
    '문제 풀러 가기';

  return (
    <div className="space-y-3">
      {/* 학생 헤더 — 블루 톤만 */}
      <section className="bg-gradient-to-r from-pullim-blue-100 to-pullim-blue-50 border-2 border-pullim-blue-200 rounded-2xl p-4">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-pullim-blue-500 to-pullim-blue-700 h-14 w-14 rounded-2xl flex items-center justify-center text-white text-xl font-bold ring-4 ring-white shrink-0">
            {persona.name.slice(0, 1)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-pullim-slate-900 text-lg font-bold tracking-tight">{persona.name} 학생</h2>
              <span className="inline-flex items-center gap-1 text-[11px] text-pullim-slate-700">
                <Flame className="text-pullim-warn h-3 w-3" />
                {persona.streakDays}일 연속 학습
              </span>
            </div>
            <div className="mt-2 h-2.5 bg-pullim-slate-200 rounded-full overflow-hidden ring-1 ring-pullim-slate-300">
              <div className="h-full bg-gradient-to-r from-pullim-blue-500 to-pullim-blue-700 rounded-full transition-all"
                style={{ width: `${(todaySession.problemsSolved / todaySession.totalToday) * 100}%` }} />
            </div>
            <p className="text-pullim-slate-600 mt-1 text-[11px]">
              오늘 진도 <strong className="font-mono">{todaySession.problemsSolved}/{todaySession.totalToday}문항</strong> ·
              정답률 <strong className="font-mono">{todaySession.accuracyToday}%</strong>
            </p>
          </div>
        </div>
      </section>

      {/* 지금 — 위급일 때만 warn 톤, 아니면 블루 톤 */}
      <section className={cn(
        'border-2 rounded-2xl p-5 relative overflow-hidden',
        isUrgent
          ? 'bg-gradient-to-br from-pullim-warn/15 to-pullim-warn/5 border-pullim-warn/40'
          : 'bg-gradient-to-br from-pullim-blue-100 to-pullim-blue-50 border-pullim-blue-200',
      )}>
        <div className={cn(
          'absolute -top-6 -right-6 h-24 w-24 rounded-full',
          isUrgent ? 'bg-pullim-warn/10' : 'bg-pullim-blue-200/40',
        )} />
        <div className="relative">
          <p className={cn(
            'text-[11px] font-bold uppercase tracking-[0.2em] inline-flex items-center gap-1',
            isUrgent ? 'text-pullim-warn' : 'text-pullim-blue-700',
          )}>
            <AlertTriangle className="h-3 w-3" />
            가장 먼저 챙길 것
          </p>
          <h2 className="text-pullim-slate-900 mt-2 text-2xl sm:text-3xl font-bold tracking-tight leading-tight">
            {nowTitle}
          </h2>
          <p className="text-pullim-slate-700 mt-2 text-sm leading-relaxed">{nowDetail}</p>
          {now.kind === 'leitner_overdue' && now.samples.length > 0 && (
            <p className="text-pullim-slate-500 mt-1.5 text-xs">예: {now.samples.map(s => `「${s.summary}」`).join(' · ')}</p>
          )}
          {nowMeta && (
            <div className="mt-3 flex flex-wrap items-center gap-1.5">
              {nowMeta.map((m, i) => (
                <span key={i} className={cn(
                  'bg-white inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold text-pullim-slate-700 border',
                  isUrgent ? 'border-pullim-warn/30' : 'border-pullim-blue-200',
                )}>
                  {m}
                </span>
              ))}
            </div>
          )}
          <Link href={nowHref} className={cn(
            'mt-4 inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-full px-7 py-3.5 text-base font-bold text-white transition-colors',
            isUrgent ? 'bg-pullim-warn-cta-bg hover:bg-pullim-warn-cta-bg/90' : 'bg-pullim-blue-600 hover:bg-pullim-blue-700',
          )}>
            {nowCta}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* 오답 정복 단계 — 블루 ramp, BOX 5만 라임 (시그니처 강조) */}
      <section className="bg-card rounded-2xl border p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-pullim-slate-900 text-sm font-bold tracking-tight inline-flex items-center gap-1.5">
            <Trophy className="text-pullim-lemon-ink h-4 w-4" />
            오답 정복 단계 — 5번 맞히면 끝!
          </h3>
          {masterImminent > 0 && (
            <span className="bg-pullim-lemon/20 text-pullim-lemon-ink inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold">
              정복 직전 {masterImminent}개
            </span>
          )}
        </div>
        <ol className="grid grid-cols-5 gap-2">
          {([1, 2, 3, 4, 5] as LeitnerBox[]).map(b => {
            const isMaster = b === 5;
            const stepBg: Record<LeitnerBox, string> = {
              1: 'bg-pullim-blue-100 text-pullim-blue-900',
              2: 'bg-pullim-blue-200 text-pullim-blue-900',
              3: 'bg-pullim-blue-400 text-white',
              4: 'bg-pullim-blue-700 text-white',
              5: 'bg-pullim-lemon text-pullim-lemon-ink',
            };
            const stepLabel: Record<LeitnerBox, string> = { 1: '매일', 2: '3일마다', 3: '일주일마다', 4: '2주마다', 5: '한 달마다' };
            return (
              <li key={b} className="text-center relative">
                {b < 5 && (
                  <div className="absolute top-6 right-0 translate-x-1/2 text-pullim-slate-300 text-base z-10">→</div>
                )}
                <div className={cn('mx-auto h-12 w-12 rounded-2xl flex items-center justify-center text-lg font-bold shadow-pullim-sm ring-2 ring-white', stepBg[b])}>
                  {isMaster ? <Trophy className="h-5 w-5" /> : b}
                </div>
                <p className="text-pullim-slate-900 mt-1.5 font-mono text-base font-bold">{boxCounts[b]}</p>
                <p className="text-pullim-slate-500 text-[10px]">{stepLabel[b]}</p>
              </li>
            );
          })}
        </ol>
        <p className="text-center text-[11px] text-pullim-slate-500 mt-2.5">
          정답이면 다음 단계로 · 틀리면 1단계로 돌아가요
        </p>
      </section>

      {/* Stats grid — 모두 동일 블루 ring, 숫자 색만 의미별 */}
      <section className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <KeyStat Icon={Target} value={`${accuracy}%`} label="어제 정답률" tone="neutral" />
        <KeyStat Icon={TrendingUp} value={`${avgDelta >= 0 ? '+' : ''}${avgDelta.toFixed(2)}`} label="이번 주 실력 변화" tone={avgDelta >= 0 ? 'success' : 'danger'} />
        <KeyStat Icon={Trophy} value={`${conquestStats.thisWeekConquered}개`} label="마스터한 유형" tone="accent" />
        <KeyStat Icon={Brain} value={`${retention30}%`} label="한 달 뒤 기억" tone="primary" sub={`${retentionDelta >= 0 ? '+' : ''}${retentionDelta}p 친구 대비`} />
      </section>

      {/* 추천 풀림 해설 — 라임 (시그니처) */}
      <section className="bg-pullim-lemon/10 border-2 border-dashed border-pullim-lemon/40 rounded-2xl p-4">
        <div className="flex items-center justify-between">
          <p className="text-pullim-lemon-ink text-[11px] font-bold uppercase tracking-[0.2em] inline-flex items-center gap-1">
            <Sparkles className="h-3 w-3" />
            추천 풀림 해설 — 한 문제 12 챕터로
          </p>
          <Link href="/q/infinity/explain" className="text-pullim-lemon-ink hover:underline text-[11px] font-bold inline-flex items-center gap-0.5">
            전체 <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-2.5">
          {signatures.map(e => (
            <Link key={e.sku} href={`/q/infinity/explain/${e.sku}`}
              className="bg-white hover:bg-pullim-lemon/20 border-pullim-lemon/40 group flex items-start gap-2 rounded-xl border p-2.5 transition-colors">
              <span className="bg-pullim-lemon flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-pullim-lemon-ink">
                <Star className="h-3.5 w-3.5 fill-current" aria-hidden />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-pullim-slate-900 line-clamp-2 text-xs font-bold leading-snug">{e.summary}</p>
                <p className="text-pullim-slate-500 mt-1 text-[10px]">{subjectLabels[e.subject]} · ★ {e.rating} · {e.views.toLocaleString()}회</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 다음 시험 + 어제 약점 — 블루 다크 */}
      <section className="bg-pullim-blue-900 text-white rounded-2xl p-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <p className="text-pullim-blue-200 text-[10px] uppercase tracking-[0.2em] font-bold inline-flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              다음 시험
            </p>
            <p className="text-base font-bold mt-1">{persona.examLabel} · <span className="font-mono text-pullim-lemon">D-{dday}</span></p>
            <p className="text-pullim-blue-200 text-[11px]">남은 학습 약 {dday * persona.weeklyHours / 7 | 0}시간 · 주 {persona.weeklyHours}시간 페이스</p>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <div>
              <p className="text-pullim-blue-200">자주 틀리는 유형</p>
              <p className="text-white font-bold">{weakPattern}</p>
            </div>
            {overdueCount > 0 && (
              <div>
                <p className="text-pullim-blue-200">곧 잊을 것 같은</p>
                <p className="text-pullim-warn font-bold inline-flex items-center gap-0.5">
                  <AlertTriangle className="h-3 w-3" />
                  {overdueCount}개
                </p>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

function KeyStat({ Icon, value, label, tone, sub }: {
  Icon: typeof Target; value: string; label: string;
  tone: 'neutral' | 'primary' | 'accent' | 'success' | 'danger';
  sub?: string;
}) {
  const valueClass =
    tone === 'success' ? 'text-pullim-success' :
    tone === 'danger' ? 'text-pullim-danger' :
    tone === 'accent' ? 'text-pullim-lemon-ink' :
    tone === 'primary' ? 'text-pullim-blue-700' :
    'text-pullim-slate-900';
  return (
    <article className="bg-card rounded-xl border ring-2 ring-pullim-blue-100 p-2.5">
      <div className="flex items-center gap-1.5">
        <Icon className="text-pullim-blue-600 h-3 w-3" />
        <p className="text-pullim-slate-500 text-[9px] font-bold tracking-wider uppercase truncate">{label}</p>
      </div>
      <p className={cn('font-mono mt-1 text-xl font-bold tabular-nums', valueClass)}>{value}</p>
      {sub && <p className="text-pullim-slate-500 text-[10px] mt-0.5">{sub}</p>}
    </article>
  );
}
