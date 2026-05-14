import Link from 'next/link';
import {
  ArrowRight, AlertTriangle, Clock, Target, Sparkles, TrendingUp, Trophy,
  Flame, Calendar, Award, BookOpen, GraduationCap, Pencil,
  Wrench, ScrollText, Star,
} from 'lucide-react';
import {
  todaySession, lastExamResult, explainLibrary, subjectLabels,
  overdueCards, todayCards, conquestStats, leitnerCards,
  todayDue, dueItems,
  thetaTrend, prescriptions, lastDiagnosis,
  currentPersona, getDday,
  solveDeck, type SolveProblem,
  type LeitnerCard, type Prescription,
} from '@/lib/mock';
import { CrossDomainSlot } from '@/components/q-hub/cross-domain-slot';
import { cn } from '@/lib/utils';

type NowAction =
  | { kind: 'leitner_overdue'; count: number; samples: LeitnerCard[] }
  | { kind: 'memory_overdue'; count: number }
  | { kind: 'prescription'; rx: Prescription }
  | { kind: 'free' };

function pickNowAction(): NowAction {
  const lOverdue = overdueCards();
  if (lOverdue.length > 0) {
    return { kind: 'leitner_overdue', count: lOverdue.length, samples: lOverdue.slice(0, 2) };
  }
  const mOverdue = dueItems().filter(i => i.nextReviewInHours < 0);
  if (mOverdue.length > 0) return { kind: 'memory_overdue', count: mOverdue.length };
  const topRx = prescriptions.find(p => p.priority === 1);
  if (topRx) return { kind: 'prescription', rx: topRx };
  return { kind: 'free' };
}

const channelHrefMap: Record<Prescription['channel'], string> = {
  infinity:  '/q/infinity/solve',
  visual:    '/q',
  conqueror: '/q/review',
  store:     '/q',
};

/** 오늘 풀이 큐 — 5문항 인터리빙 (Q doc §4.1).
 *  소스: 스튜디오 / 기출 / 오답 / AI 생성 */
type QueueSource = 'studio' | 'past' | 'review' | 'ai';
const queueSourceMeta: Record<QueueSource, { label: string; Icon: typeof Wrench; cls: string }> = {
  studio: { label: '스튜디오', Icon: Wrench,     cls: 'bg-pullim-blue-50 text-pullim-blue-600' },
  past:   { label: '기출 복원', Icon: ScrollText, cls: 'bg-pullim-slate-100 text-pullim-slate-700' },
  review: { label: '오답 보강', Icon: Target,    cls: 'bg-pullim-warn/10 text-pullim-warn' },
  ai:     { label: 'AI 생성',  Icon: Sparkles,  cls: 'bg-pullim-lemon/30 text-pullim-lemon-ink' },
};

function todayQueue(): { problem: SolveProblem; source: QueueSource }[] {
  const sources: QueueSource[] = ['studio', 'past', 'review', 'studio', 'ai'];
  return solveDeck.slice(0, 5).map((p, i) => ({ problem: p, source: sources[i]! }));
}

export default function QHubPage() {
  const persona = currentPersona;
  const dday = getDday(persona);
  const now = pickNowAction();

  return (
    <div className="space-y-section">
      <DDayHero persona={persona} dday={dday} />

      {/* §3.2 — referrer EntryContextCard 가시성 강화: 첫 스크롤 안에 들어오도록 hero 직후로 승격 */}
      <CrossDomainSlot />

      <NowSection now={now} />

      <TodayQueueSection />

      <ThisWeekSection />

      <UpcomingSection persona={persona} dday={dday} />

      <ExplainPicks />
    </div>
  );
}

/* ─────────────────────────  D-day Hero  ───────────────────────── */

function DDayHero({
  persona, dday,
}: { persona: typeof currentPersona; dday: number }) {
  return (
    <section className="bg-pullim-blue-50 border-pullim-blue-100 relative overflow-hidden rounded-2xl border p-6">
      <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-pullim-blue-700 inline-flex items-center gap-1 text-[11px] font-bold tracking-wider uppercase">
            <Sparkles className="h-3 w-3" />
            오늘의 풀림 Q
          </p>
          <h1 className="text-pullim-slate-900 mt-1 text-2xl font-bold tracking-tight">
            {persona.name} 학생, 안녕하세요
          </h1>
          <p className="text-pullim-slate-700 mt-1 text-sm">
            {persona.examLabel}까지 <strong className="text-pullim-blue-700 font-mono">D-{dday}</strong> · {persona.streakDays}일 연속 학습 중 · 오늘 {todaySession.problemsSolved}/{todaySession.totalToday}문항
          </p>
        </div>
        <div className="bg-card border-pullim-blue-200 text-pullim-slate-700 inline-flex items-center gap-1.5 self-start rounded-full border px-3 py-1.5 text-xs font-bold">
          <Flame className="text-pullim-warn h-3.5 w-3.5" />
          연속 {persona.streakDays}일
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────  지금  ───────────────────────── */

function NowSection({ now }: { now: NowAction }) {
  return (
    <section>
      <TimelineHeading
        time="지금"
        Icon={AlertTriangle}
        accent="warn"
        sub="가장 먼저 챙겨야 할 것"
      />
      <NowCard now={now} />
    </section>
  );
}

function NowCard({ now }: { now: NowAction }) {
  if (now.kind === 'leitner_overdue') {
    return (
      <ActionCard
        accent="warn"
        Icon={AlertTriangle}
        title={`오답 ${now.count}개, 복습 시간이 지났어요`}
        description={
          now.samples.length > 0
            ? `예: ${now.samples.map(s => `「${s.summary}」`).join(' · ')}`
            : '잊기 전에 빨리 풀어주세요.'
        }
        cta={{ label: '오답 정복하기', href: '/q/review' }}
      />
    );
  }
  if (now.kind === 'memory_overdue') {
    return (
      <ActionCard
        accent="warn"
        Icon={Clock}
        title={`잊을 수 있어요 — 복습 ${now.count}개 대기`}
        description="망각 곡선 임계점을 지난 항목이에요. 5분이면 다시 끌어올릴 수 있어요."
        cta={{ label: '복습 시작', href: '/q/review' }}
      />
    );
  }
  if (now.kind === 'prescription') {
    return (
      <ActionCard
        accent="primary"
        Icon={Target}
        title={`${now.rx.targetLabel} — 1순위 약점 처방`}
        description={`${now.rx.description} 예상 실력 점수 +${now.rx.expectedThetaGain.toFixed(2)} · 약 ${now.rx.effortMin}분`}
        cta={{ label: `${now.rx.channelLabel}에서 시작`, href: channelHrefMap[now.rx.channel] }}
      />
    );
  }
  return (
    <ActionCard
      accent="primary"
      Icon={Sparkles}
      title="오늘 급한 일은 없어요"
      description="자유 풀이로 실력을 가볍게 올려보세요."
      cta={{ label: '문제 풀러 가기', href: '/q/infinity/solve' }}
    />
  );
}

function ActionCard({
  accent, title, description, cta, Icon,
}: {
  accent: 'primary' | 'warn';
  title: string; description: string;
  cta: { label: string; href: string };
  Icon: React.ComponentType<{ className?: string }>;
}) {
  const containerClass =
    accent === 'warn'
      ? 'border-pullim-warn/40 bg-pullim-warn/5 ring-1 ring-pullim-warn/20'
      : 'border-pullim-blue-200 bg-pullim-blue-50/30';
  const iconClass = accent === 'warn' ? 'bg-pullim-warn' : 'bg-pullim-blue-600';
  const ctaClass =
    accent === 'warn'
      ? 'bg-pullim-warn hover:bg-pullim-warn/90'
      : 'bg-pullim-blue-600 hover:bg-pullim-blue-700';

  return (
    <article className={cn('flex flex-col gap-3 rounded-2xl border-2 p-4 sm:flex-row sm:items-start sm:gap-4 sm:p-5', containerClass)}>
      <div className="flex w-full items-start gap-3 sm:w-auto sm:flex-1 sm:gap-4">
        <span className={cn('flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-white', iconClass)}>
          <Icon className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="text-pullim-slate-900 text-base font-bold tracking-tight">{title}</h3>
          <p className="text-pullim-slate-600 mt-1 text-sm leading-snug">{description}</p>
        </div>
      </div>
      <Link
        href={cta.href}
        className={cn(
          'inline-flex w-full shrink-0 items-center justify-center gap-1.5 rounded-full px-4 py-2.5 sm:py-2 text-sm font-bold whitespace-nowrap text-white transition-colors sm:mt-1 sm:w-auto min-h-11 sm:min-h-9',
          ctaClass,
        )}
      >
        {cta.label}
        <ArrowRight className="h-3.5 w-3.5" />
      </Link>
    </article>
  );
}

/* ─────────────────────────  오늘 풀이 큐  ───────────────────────── */

function TodayQueueSection() {
  const queue = todayQueue();
  const todayDueLeitnerCount = todayCards().length;
  const todayDueMemoryCount = todayDue().length;

  return (
    <section>
      <TimelineHeading
        time="오늘 풀이 큐"
        Icon={Pencil}
        accent="primary"
        sub={`5문항 인터리빙 — 스튜디오·기출·오답 자동 섞임 · 오늘 복습 ${todayDueLeitnerCount + todayDueMemoryCount}건 별도`}
      />
      <ol className="space-y-1.5">
        {queue.map(({ problem, source }, i) => {
          const meta = queueSourceMeta[source];
          return (
            <li key={problem.sku}>
              <Link
                href={`/q/infinity/solve?kind=free&subject=${problem.subject}`}
                className="hover:border-pullim-blue-300 hover:bg-pullim-blue-50/30 group flex items-center gap-3 rounded-xl border p-3 transition-colors"
              >
                <span className="bg-pullim-slate-100 text-pullim-slate-600 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full font-mono text-xs font-bold">
                  {i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className={cn('inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold', meta.cls)}>
                      <meta.Icon className="h-3 w-3" />
                      {meta.label}
                    </span>
                    <span className="text-pullim-slate-400 text-[11px]">
                      {subjectLabels[problem.subject]} · {problem.unit}
                    </span>
                  </div>
                  <h4 className="text-pullim-slate-900 mt-0.5 line-clamp-1 text-sm font-semibold">
                    {problem.statement}
                  </h4>
                </div>
                <ArrowRight className="text-pullim-slate-300 group-hover:text-pullim-blue-500 h-4 w-4 shrink-0 transition-colors" />
              </Link>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

/* ─────────────────────────  이번 주  ───────────────────────── */

function ThisWeekSection() {
  const last = thetaTrend[thetaTrend.length - 1]!;
  const prev = thetaTrend[thetaTrend.length - 2]!;
  const dMath = last.math - prev.math;
  const dEng = last.english - prev.english;
  const dSci = last.science - prev.science;
  const avgDelta = (dMath + dEng + dSci) / 3;
  const masterImminent = leitnerCards.filter(c => c.box === 5).length;

  return (
    <section>
      <TimelineHeading
        time="이번 주"
        Icon={TrendingUp}
        accent="success"
        sub="지난 7일 동안 일어난 변화"
      />
      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
        <WeekStat
          Icon={TrendingUp}
          eyebrow="실력 점수 변화"
          value={`${avgDelta >= 0 ? '+' : ''}${avgDelta.toFixed(2)}`}
          sub={`수학 ${dMath >= 0 ? '+' : ''}${dMath.toFixed(2)} · 영어 ${dEng >= 0 ? '+' : ''}${dEng.toFixed(2)} · 과학 ${dSci >= 0 ? '+' : ''}${dSci.toFixed(2)}`}
          accent="success"
        />
        <WeekStat
          Icon={Target}
          eyebrow="패턴 정복"
          value={`${conquestStats.thisWeekConquered}개`}
          sub={`누적 ${conquestStats.totalConquered}개 · 성공률 ${conquestStats.successRate}%`}
        />
        <WeekStat
          Icon={Trophy}
          eyebrow="마스터 코앞"
          value={`${masterImminent}개`}
          sub="BOX 5에서 5회 연속 성공 시 마스터"
          accent="lemon"
        />
      </div>
    </section>
  );
}

function WeekStat({
  Icon, eyebrow, value, sub, accent,
}: {
  Icon: React.ComponentType<{ className?: string }>;
  eyebrow: string; value: string; sub: string;
  accent?: 'success' | 'lemon';
}) {
  const valueClass =
    accent === 'success' ? 'text-pullim-success'
    : accent === 'lemon' ? 'text-pullim-warn'
    : 'text-pullim-slate-900';
  return (
    <article className="bg-card rounded-xl border p-3.5">
      <div className="flex items-center gap-2">
        <span className="bg-pullim-blue-50 text-pullim-blue-600 flex h-8 w-8 items-center justify-center rounded-lg">
          <Icon className="h-4 w-4" />
        </span>
        <div className="text-pullim-slate-500 text-[10px] font-bold tracking-wider uppercase">{eyebrow}</div>
      </div>
      <div className={cn('mt-2 font-mono text-2xl font-bold tabular-nums', valueClass)}>{value}</div>
      <div className="text-pullim-slate-500 mt-0.5 text-[11px]">{sub}</div>
    </article>
  );
}

/* ─────────────────────────  다가오는  ───────────────────────── */

function UpcomingSection({
  persona, dday,
}: { persona: typeof currentPersona; dday: number }) {
  const exam = lastExamResult;
  const examDelta = exam.thetaAfter - exam.thetaBefore;

  return (
    <section>
      <TimelineHeading
        time="다가오는"
        Icon={GraduationCap}
        accent="primary"
        sub="지나온 시험 + 앞으로의 큰 일정"
      />
      <ul className="space-y-2">
        <li>
          <Link
            href="/q/infinity/exam-result"
            className="hover:border-pullim-warn/50 hover:bg-pullim-warn/5 group flex items-start gap-3 rounded-xl border p-3 transition-colors"
          >
            <span className="bg-pullim-warn-bg text-pullim-warn flex h-9 w-9 shrink-0 items-center justify-center rounded-lg">
              <Award className="h-4 w-4" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="text-pullim-warn text-[10px] font-bold tracking-wider uppercase">
                지난 시험 결과
              </div>
              <h4 className="text-pullim-slate-900 mt-0.5 truncate text-sm font-bold">
                {exam.examTitle}
              </h4>
              <div className="mt-0.5 flex flex-wrap items-baseline gap-x-1.5">
                <span className="text-pullim-slate-700 text-[11px] font-semibold">
                  {exam.rawScore}점 · {exam.estimatedGrade}등급
                </span>
                <span className="text-pullim-slate-300" aria-hidden>·</span>
                <span className="text-pullim-slate-400 text-[10px]">
                  실력 {exam.thetaBefore.toFixed(2)} → {exam.thetaAfter.toFixed(2)}
                </span>
                <span className="text-pullim-success text-[10px] font-bold">
                  ({examDelta >= 0 ? '+' : ''}{examDelta.toFixed(2)})
                </span>
              </div>
            </div>
            <ArrowRight className="text-pullim-slate-300 group-hover:text-pullim-warn mt-1 h-4 w-4 shrink-0 transition-colors" />
          </Link>
        </li>
        <li>
          <div className="bg-pullim-blue-50/40 flex items-start gap-3 rounded-xl border border-dashed p-3">
            <span className="bg-pullim-blue-100 text-pullim-blue-700 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg">
              <Calendar className="h-4 w-4" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="text-pullim-slate-600 text-[10px] font-bold tracking-wider uppercase">
                D-{dday}
              </div>
              <h4 className="text-pullim-slate-900 mt-0.5 text-sm font-bold">{persona.examLabel}</h4>
              <div className="text-pullim-slate-500 text-[11px]">
                남은 학습 시간 약 {dday * persona.weeklyHours / 7 | 0}시간 (주 {persona.weeklyHours}시간 기준)
              </div>
            </div>
          </div>
        </li>
        {lastDiagnosis.daysAgo >= lastDiagnosis.nextRecommendedIn && (
          <li>
            <Link
              href="/q/analysis/diagnose"
              className="hover:border-pullim-blue-300 group flex items-start gap-3 rounded-xl border p-3 transition-colors"
            >
              <span className="bg-pullim-blue-50 text-pullim-blue-700 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg">
                <BookOpen className="h-4 w-4" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="text-pullim-slate-600 text-[10px] font-bold tracking-wider uppercase">
                  추천
                </div>
                <h4 className="text-pullim-slate-900 mt-0.5 text-sm font-bold">
                  진단 다시 받기
                </h4>
                <div className="text-pullim-slate-500 text-[11px]">
                  마지막 진단 {lastDiagnosis.daysAgo}일 전 · 18분이면 끝나요
                </div>
              </div>
              <ArrowRight className="text-pullim-slate-300 group-hover:text-pullim-blue-500 mt-1 h-4 w-4 shrink-0 transition-colors" />
            </Link>
          </li>
        )}
      </ul>
    </section>
  );
}

/* ─────────────────────────  풀림 해설 추천  ───────────────────────── */

function ExplainPicks() {
  const picks = explainLibrary.filter(e => e.isSignature).slice(0, 3);
  if (picks.length === 0) return null;
  return (
    <section>
      <TimelineHeading
        time="더 깊이"
        Icon={BookOpen}
        accent="primary"
        sub="이번 주 인기 풀림 해설 — 한 문제 12-섹션"
      />
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        {picks.map(e => (
          <Link
            key={e.sku}
            href={`/q/infinity/explain/${e.sku}`}
            className="hover:border-pullim-warn/50 hover:bg-pullim-warn/5 group flex items-start gap-2.5 rounded-xl border p-3 transition-colors"
          >
            <span className="bg-pullim-warn flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-white">
              <Star className="h-3.5 w-3.5 fill-current" aria-hidden />
            </span>
            <div className="min-w-0 flex-1">
              <div className="text-pullim-slate-900 line-clamp-2 text-xs font-bold leading-snug">
                {e.summary}
              </div>
              <div className="text-pullim-slate-400 mt-1 inline-flex items-center gap-1 text-[10px]">
                <span>{subjectLabels[e.subject]}</span>
                <span aria-hidden>·</span>
                <Star className="text-pullim-warn h-2.5 w-2.5 fill-current" aria-hidden />
                <span>{e.rating}</span>
                <span aria-hidden>·</span>
                <span>{e.views.toLocaleString()}회</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

/* ─────────────────────────  공통  ───────────────────────── */

function TimelineHeading({
  time, Icon, accent, sub,
}: {
  time: string;
  Icon: React.ComponentType<{ className?: string }>;
  accent: 'primary' | 'warn' | 'success';
  sub: string;
}) {
  const dotClass =
    accent === 'warn' ? 'bg-pullim-warn'
    : accent === 'success' ? 'bg-pullim-success'
    : 'bg-pullim-blue-500';
  const iconClass =
    accent === 'warn' ? 'text-pullim-warn'
    : accent === 'success' ? 'text-pullim-success'
    : 'text-pullim-blue-600';
  return (
    <div className="mb-2.5 flex items-center gap-2">
      <span className={cn('h-2 w-2 rounded-full', dotClass)} />
      <Icon className={cn('h-3.5 w-3.5', iconClass)} />
      <p className="text-pullim-slate-900 text-sm font-bold tracking-tight">{time}</p>
      <span className="text-pullim-slate-400 text-[11px]">— {sub}</span>
    </div>
  );
}
