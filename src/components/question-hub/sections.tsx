'use client';

import Link from 'next/link';
import { AlertTriangle, ArrowRight, Award, BookOpen, Calendar, Check, ChevronRight, Compass, Eye, FlaskConical, Globe, Headphones, Heart, History, Mic, Pin, Scroll, Sparkles, Star, Target, Users } from 'lucide-react';
import {
  type ExplainContent, type SolutionPath, type ChoicePsychology,
  type TeacherVoice, type RelatedProblem,
} from '@/lib/mock';
import { cn } from '@/lib/utils';

/** 12-섹션 anchor 정의 */
export type SectionAnchor = {
  id: string;
  label: string;
  Icon: React.ComponentType<{ className?: string }>;
  signature?: boolean;
};

export const sectionAnchors: SectionAnchor[] = [
  { id: 's1',  label: 'Hero Recap',        Icon: Eye },
  { id: 's2',  label: 'Prologue',          Icon: BookOpen },
  { id: 's3',  label: '4-Path 풀이',       Icon: Compass, signature: true },
  { id: 's4',  label: 'Root Graph',        Icon: BookOpen },
  { id: 's5',  label: 'Error Anatomy',     Icon: Target },
  { id: 's6',  label: '100명의 선택',      Icon: Users, signature: true },
  { id: 's7',  label: 'Visual Canvas',     Icon: Sparkles },
  { id: 's8',  label: 'Pattern Family',    Icon: FlaskConical },
  { id: 's9',  label: 'Feynman Challenge', Icon: Mic },
  { id: 's10', label: 'Teacher Voices',    Icon: Headphones, signature: true },
  { id: 's11', label: 'History + Real',    Icon: History },
  { id: 's12', label: 'Memory Anchor',     Icon: Heart },
];

/** 1. Hero Recap */
export function HeroRecap({ data, problemStatement, choices, defaultOpen }: {
  data: ExplainContent; problemStatement: string; choices: string[];
  defaultOpen?: boolean;
}) {
  const my = choices[data.myAnswer];
  const right = choices[data.correctAnswer];
  const isCorrect = data.myAnswer === data.correctAnswer;

  return (
    <Section id="s1" title="Hero Recap" subtitle="내 답 vs 정답" defaultOpen={defaultOpen}>
      <div className="bg-pullim-slate-50 rounded-xl p-4">
        <p className="text-pullim-slate-800 mb-3 text-sm leading-relaxed">{problemStatement}</p>
        <div className="grid grid-cols-2 gap-3">
          <div className={cn(
            'rounded-lg border-2 p-3',
            isCorrect ? 'border-pullim-success bg-pullim-success-bg' : 'border-pullim-danger bg-pullim-danger-bg',
          )}>
            <div className={cn('text-[10px] font-bold tracking-wider uppercase', isCorrect ? 'text-pullim-success' : 'text-pullim-danger')}>
              내 답 {['①','②','③','④','⑤'][data.myAnswer]}
            </div>
            <div className="text-pullim-slate-900 mt-1 text-sm font-bold">{my}</div>
          </div>
          <div className="border-pullim-success bg-pullim-success-bg rounded-lg border-2 p-3">
            <div className="text-pullim-success text-[10px] font-bold tracking-wider uppercase">
              정답 {['①','②','③','④','⑤'][data.correctAnswer]}
            </div>
            <div className="text-pullim-slate-900 mt-1 text-sm font-bold">{right}</div>
          </div>
        </div>
      </div>
    </Section>
  );
}

/** 2. Prologue */
export function Prologue({ data, defaultOpen }: { data: ExplainContent; defaultOpen?: boolean }) {
  return (
    <Section id="s2" title="Prologue" subtitle="왜 이 문제인가" defaultOpen={defaultOpen}>
      <p className="text-pullim-slate-700 leading-relaxed">{data.prologue}</p>
    </Section>
  );
}

/** 3. 4-Path Solution Spine — 시그니처 ★ */
export function FourPathSpine({ paths, defaultOpen }: { paths: SolutionPath[]; defaultOpen?: boolean }) {
  return (
    <Section id="s3" title="4-Path Solution Spine" subtitle="같은 답, 4개 독립 경로" signature defaultOpen={defaultOpen}>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
        {paths.map(p => <PathColumn key={p.id} path={p} />)}
      </div>
    </Section>
  );
}

function PathColumn({ path }: { path: SolutionPath }) {
  return (
    <article className={cn(
      'relative flex flex-col gap-2 rounded-xl border p-3.5 transition-all',
      path.recommended
        ? 'border-pullim-warn ring-pullim-warn/30 bg-pullim-warn/5 ring-2'
        : 'border-pullim-slate-200 bg-pullim-slate-50/50',
    )}>
      {path.recommended && (
        <span className="bg-pullim-warn absolute -top-2 left-3 inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[9px] font-bold tracking-wider text-white uppercase">
          <Award className="h-2.5 w-2.5" />
          RECOMMENDED
        </span>
      )}

      <header className="flex items-center gap-1.5">
        <span className="bg-pullim-slate-900 rounded px-1.5 py-0.5 font-mono text-[10px] font-bold text-white">
          {path.tag}
        </span>
        <span className="text-pullim-slate-400 font-mono text-[10px]">{path.estimatedSec}s</span>
      </header>

      <h4 className="text-pullim-slate-900 text-sm font-bold tracking-tight">
        {path.name}
      </h4>

      {/* 평점 */}
      <div className="flex gap-3 text-[10px]">
        <RatingBar label="우아함" value={path.elegance} max={5} />
        <RatingBar label="일반화" value={path.generalization} max={5} />
      </div>

      {/* 단계 카드 */}
      <ol className="mt-1 space-y-1.5">
        {path.steps.map((s, i) => (
          <li key={i} className="bg-white border-pullim-slate-200 rounded-lg border p-2 text-xs">
            <div className="flex items-start gap-1.5">
              <span className="bg-pullim-blue-100 text-pullim-blue-700 mt-0.5 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full font-mono text-[9px] font-bold">
                {i + 1}
              </span>
              <span className="text-pullim-slate-700 leading-relaxed">{s.description}</span>
            </div>
            {s.cite && (
              <div className="text-pullim-blue-600 mt-1 ml-5.5 inline-block text-[10px] italic font-mono">
                → {s.cite}
              </div>
            )}
          </li>
        ))}
      </ol>

      <footer className="border-pullim-slate-200 mt-auto border-t pt-1.5 text-[10px]">
        <span className="text-pullim-slate-500">이 경로 정답률</span>
        <span className="text-pullim-slate-900 ml-1 font-mono font-bold">{path.successRate}%</span>
      </footer>
    </article>
  );
}

function RatingBar({ label, value, max }: { label: string; value: number; max: number }) {
  return (
    <div>
      <div className="text-pullim-slate-500 text-[9px] font-bold tracking-wider uppercase">{label}</div>
      <div className="mt-0.5 flex gap-0.5">
        {Array.from({ length: max }).map((_, i) => (
          <span
            key={i}
            className={cn(
              'h-1.5 w-2 rounded-sm',
              i < value ? 'bg-pullim-blue-500' : 'bg-pullim-slate-200',
            )}
          />
        ))}
      </div>
    </div>
  );
}

/** 4. Textbook Root Graph — 간단 트리 */
export function RootGraph({ data, defaultOpen }: { data: ExplainContent; defaultOpen?: boolean }) {
  const g = data.rootGraph;
  return (
    <Section id="s4" title="Textbook Root Graph" subtitle="이 개념이 어디서 와서 어디로 가는가" defaultOpen={defaultOpen}>
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
        {/* 선수 */}
        <Tier label="선수 개념" tone="muted" items={g.prerequisites.map(p => p.label)} />
        {/* 현재 */}
        <div className="bg-pullim-blue-600 flex flex-col items-center justify-center rounded-xl p-4 text-white shadow-lg">
          <div className="text-pullim-blue-100 text-[10px] font-bold tracking-wider uppercase">
            이 문제의 핵심
          </div>
          <div className="mt-1 text-base font-bold tracking-tight text-center">{g.current.label}</div>
        </div>
        {/* 후속 */}
        <Tier label="앞으로 쓰일 곳" tone="next" items={g.nextUses.map(n => n.label)} />
      </div>
    </Section>
  );
}

function Tier({ label, items, tone }: { label: string; items: string[]; tone: 'muted' | 'next' }) {
  const accent = tone === 'next' ? 'border-pullim-success/40 bg-pullim-success-bg' : 'border-pullim-slate-200 bg-pullim-slate-50';
  const labelClr = tone === 'next' ? 'text-pullim-success' : 'text-pullim-slate-500';
  return (
    <div className={cn('rounded-xl border p-3', accent)}>
      <div className={cn('text-[10px] font-bold tracking-wider uppercase', labelClr)}>{label}</div>
      <ul className="mt-2 space-y-1">
        {items.map(it => (
          <li key={it} className="text-pullim-slate-800 text-xs font-semibold">
            • {it}
          </li>
        ))}
      </ul>
    </div>
  );
}

/** 5. Error Anatomy */
export function ErrorAnatomy({ data, defaultOpen }: { data: ExplainContent; defaultOpen?: boolean }) {
  return (
    <Section id="s5" title="Error Anatomy" subtitle="네 풀이의 실수 지점" defaultOpen={defaultOpen}>
      <div className="bg-pullim-danger-bg border-pullim-danger/30 mb-3 rounded-lg border p-3 text-xs">
        <div className="text-pullim-danger inline-flex items-center gap-1 font-bold mb-1">
          <AlertTriangle className="h-3 w-3" aria-hidden />
          흔한 함정
        </div>
        <p className="text-pullim-slate-700 leading-relaxed">{data.errorAnatomy.studentMistake}</p>
      </div>
      <div className="bg-pullim-success-bg border-pullim-success/30 mb-3 rounded-lg border p-3 text-xs">
        <div className="text-pullim-success inline-flex items-center gap-1 font-bold mb-1">
          <Check className="h-3 w-3" aria-hidden />
          정확한 접근
        </div>
        <p className="text-pullim-slate-700 leading-relaxed">{data.errorAnatomy.correctApproach}</p>
      </div>
      <div className="space-y-1.5">
        {data.errorAnatomy.annotations.map(a => (
          <div
            key={a.lineNo}
            className={cn(
              'flex items-start gap-2 rounded-lg p-2 text-xs',
              a.isWrong ? 'bg-pullim-danger/10' : 'bg-pullim-slate-50',
            )}
          >
            <span className={cn(
              'inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full font-mono text-[10px] font-bold',
              a.isWrong ? 'bg-pullim-danger text-white' : 'bg-pullim-slate-300 text-pullim-slate-700',
            )}>
              {a.lineNo}
            </span>
            <span className="text-pullim-slate-700">{a.note}</span>
          </div>
        ))}
      </div>
    </Section>
  );
}

/** 6. 100명의 선택 — 시그니처 ★ */
export function HundredChoices({ data, choices, defaultOpen }: { data: ExplainContent; choices: string[]; defaultOpen?: boolean }) {
  const max = Math.max(...data.choices.map(c => c.pct));
  return (
    <Section id="s6" title="100명의 선택" subtitle="선지별 분포 + 심리적 이유" signature defaultOpen={defaultOpen}>
      <ul className="space-y-2.5">
        {data.choices.map(c => <ChoiceRow key={c.index} choice={c} max={max} text={choices[c.index]} />)}
      </ul>
    </Section>
  );
}

function ChoiceRow({ choice, max, text }: { choice: ChoicePsychology; max: number; text: string }) {
  const widthPct = (choice.pct / max) * 100;
  return (
    <li className={cn(
      'rounded-xl border p-3',
      choice.isAnswer
        ? 'border-pullim-success bg-pullim-success-bg ring-pullim-success/20 ring-2'
        : 'border-pullim-slate-200 bg-pullim-slate-50/50',
    )}>
      <div className="flex items-center gap-2">
        <span className={cn(
          'flex h-7 w-7 shrink-0 items-center justify-center rounded-full font-mono text-xs font-bold',
          choice.isAnswer ? 'bg-pullim-success text-white' : 'bg-pullim-slate-200 text-pullim-slate-700',
        )}>
          {['①','②','③','④','⑤'][choice.index]}
        </span>
        <div className="min-w-0 flex-1 text-sm">
          <span className={cn('font-semibold', choice.isAnswer ? 'text-pullim-success' : 'text-pullim-slate-800')}>
            {text}
          </span>
        </div>
        <span className="font-mono text-base font-bold text-pullim-slate-900">{choice.pct}%</span>
      </div>
      <div className="bg-pullim-slate-200 mt-2 h-1.5 overflow-hidden rounded-full">
        <div
          className={cn('h-full rounded-full', choice.isAnswer ? 'bg-pullim-success' : 'bg-pullim-slate-400')}
          style={{ width: `${widthPct}%` }}
        />
      </div>
      <p className="text-pullim-slate-600 mt-2 text-[11px] leading-relaxed">{choice.reason}</p>
    </li>
  );
}

/** 7. Visual Canvas (placeholder) */
export function VisualCanvas({ data, defaultOpen }: { data: ExplainContent; defaultOpen?: boolean }) {
  return (
    <Section id="s7" title="Visual Intuition Canvas" subtitle="인터랙티브 시각화" defaultOpen={defaultOpen}>
      <div className="bg-pullim-blue-50 border-pullim-blue-200 flex flex-col items-center gap-3 rounded-xl border-2 border-dashed p-8 text-center">
        <span className="bg-pullim-blue-600 flex h-12 w-12 items-center justify-center rounded-xl text-white text-xl">
          ✨
        </span>
        <p className="text-pullim-slate-700 max-w-md text-sm leading-relaxed">{data.visualHint}</p>
        <button
          type="button"
          disabled
          className="bg-pullim-slate-200 text-pullim-slate-500 inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-bold cursor-not-allowed"
        >
          ▶ 인터랙티브 실행 (준비 중)
        </button>
      </div>
    </Section>
  );
}

/** 8. Pattern Family */
export function PatternFamily({ data, defaultOpen }: { data: ExplainContent; defaultOpen?: boolean }) {
  return (
    <Section id="s8" title="Pattern Family" subtitle="같은 패턴의 친척 문제" defaultOpen={defaultOpen}>
      <ul className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3">
        {data.family.map(p => <RelatedCard key={p.sku} item={p} />)}
      </ul>
    </Section>
  );
}

function RelatedCard({ item }: { item: RelatedProblem }) {
  return (
    <li>
      <Link
        href={`/q/infinity/solve?kind=retry&sku=${item.sku}`}
        className="group bg-pullim-slate-50 hover:bg-pullim-blue-50 hover:border-pullim-blue-300 flex h-full flex-col rounded-xl border border-transparent p-3 transition-colors"
      >
        <header className="mb-1 flex items-center gap-1.5 text-[10px]">
          <span className="bg-pullim-slate-900 rounded px-1.5 py-0.5 font-mono text-white font-bold">{item.source}</span>
          {item.year && <span className="text-pullim-slate-500">{item.year}</span>}
          <span className="text-pullim-slate-400 ml-auto font-mono">{item.sku}</span>
        </header>
        <p className="text-pullim-slate-800 line-clamp-2 text-sm font-semibold leading-snug">{item.summary}</p>
        <span className="text-pullim-blue-600 group-hover:text-pullim-blue-700 mt-2 inline-flex items-center gap-0.5 text-[10px] font-bold">
          풀어보기
          <ArrowRight className="h-2.5 w-2.5" />
        </span>
      </Link>
    </li>
  );
}

/** 9. Feynman Challenge (placeholder) */
export function FeynmanChallenge({ data, defaultOpen }: { data: ExplainContent; defaultOpen?: boolean }) {
  return (
    <Section id="s9" title="Feynman Challenge" subtitle="2분 안에 친구에게 설명" defaultOpen={defaultOpen}>
      <div className="bg-pullim-slate-950 rounded-xl p-5 text-white">
        <p className="text-pullim-slate-200 text-sm leading-relaxed">“{data.feynman.prompt}”</p>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button
            type="button"
            className="bg-pullim-danger inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-bold text-white"
          >
            <Mic className="h-4 w-4" />
            마이크 시작 (2분)
          </button>
          <span className="text-pullim-slate-400 text-[11px]">
            STT + AI 평가 · 체크리스트 자동 채점
          </span>
        </div>

        <div className="mt-4">
          <div className="text-pullim-lemon mb-1.5 text-[10px] font-bold tracking-wider uppercase">
            평가 체크리스트
          </div>
          <ul className="space-y-1 text-xs">
            {data.feynman.checklist.map((c, i) => (
              <li key={i} className="text-pullim-slate-300 flex items-start gap-1.5">
                <span className="bg-white/10 mt-0.5 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-sm">
                  ☐
                </span>
                {c}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Section>
  );
}

/** 10. Teacher Voices — 시그니처 ★ */
export function TeacherVoices({ data, defaultOpen }: { data: ExplainContent; defaultOpen?: boolean }) {
  return (
    <Section id="s10" title="Teacher Voices" subtitle="같은 해설, 3가지 톤" signature defaultOpen={defaultOpen}>
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
        {data.teacherVoices.map(v => <VoiceCard key={v.tone} voice={v} />)}
      </div>
    </Section>
  );
}

function VoiceCard({ voice }: { voice: TeacherVoice }) {
  const tones = {
    정석:    { bg: 'bg-pullim-blue-50',    border: 'border-pullim-blue-200',    label: 'text-pullim-blue-700' },
    친구:    { bg: 'bg-pullim-lemon/15',   border: 'border-pullim-lemon-ink/20',label: 'text-pullim-lemon-ink' },
    스파르타:{ bg: 'bg-pullim-danger-bg',  border: 'border-pullim-danger/30',   label: 'text-pullim-danger' },
  } as const;
  const t = tones[voice.tone];
  return (
    <article className={cn('rounded-xl border-2 p-4', t.bg, t.border)}>
      <header className={cn('flex items-center gap-2 mb-2 text-[10px] font-bold tracking-wider uppercase', t.label)}>
        <span className="text-base">{voice.emoji}</span>
        {voice.tone} 톤
      </header>
      <p className="text-pullim-slate-800 text-sm leading-relaxed">{voice.text}</p>
    </article>
  );
}

/** 11. History + Real-World */
export function HistoryReal({ data, defaultOpen }: { data: ExplainContent; defaultOpen?: boolean }) {
  return (
    <Section id="s11" title="History + Real-World" subtitle="개념의 역사 + 현실 응용" defaultOpen={defaultOpen}>
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        <div className="bg-pullim-slate-50 rounded-xl p-4">
          <div className="text-pullim-slate-500 mb-1 inline-flex items-center gap-1 text-[10px] font-bold tracking-wider uppercase">
            <Scroll className="h-3 w-3" aria-hidden />
            역사
          </div>
          <p className="text-pullim-slate-700 text-sm leading-relaxed">{data.historyReal.history}</p>
        </div>
        <div className="bg-pullim-blue-50 rounded-xl p-4">
          <div className="text-pullim-blue-700 mb-1 inline-flex items-center gap-1 text-[10px] font-bold tracking-wider uppercase">
            <Globe className="h-3 w-3" aria-hidden />
            현실 응용
          </div>
          <p className="text-pullim-slate-700 text-sm leading-relaxed">{data.historyReal.realWorld}</p>
        </div>
      </div>
    </Section>
  );
}

/** 12. Memory Anchor */
export function MemoryAnchor({ data, defaultOpen }: { data: ExplainContent; defaultOpen?: boolean }) {
  return (
    <Section id="s12" title="Memory Anchor" subtitle="암기 닻 + 다음 복습" defaultOpen={defaultOpen}>
      <div className="from-pullim-blue-700 to-pullim-blue-500 relative overflow-hidden rounded-2xl bg-gradient-to-br p-6 text-white shadow-lg shadow-blue-500/20">
        <Pin className="absolute -right-8 -bottom-4 h-32 w-32 opacity-20" aria-hidden />
        <div className="relative">
          <div className="text-pullim-lemon text-[10px] font-bold tracking-wider uppercase">한 줄 암기문</div>
          <p className="mt-2 text-2xl font-bold tracking-tight">{data.memoryAnchor.line}</p>

          <div className="mt-5 flex flex-wrap items-center gap-3 text-xs">
            <span className="bg-white/15 inline-flex items-center gap-1 rounded-full px-3 py-1 font-bold">
              <Calendar className="h-3 w-3" aria-hidden />
              다음 복습 {data.memoryAnchor.nextReviewIn}
            </span>
            <span className="text-white/80">
              자동으로 풀림 복습 큐에 등록됨
            </span>
          </div>
        </div>
      </div>
    </Section>
  );
}

/**
 * 공통 Section wrapper — native <details>로 collapsible.
 * `defaultOpen`은 advice §4 기능 2 (등급별 depth 자동 펼침) 출력에서 흘러들어옴.
 */
function Section({
  id, title, subtitle, signature, defaultOpen = true, children,
}: {
  id: string; title: string; subtitle: string;
  signature?: boolean;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  return (
    <details
      id={id}
      open={defaultOpen}
      className={cn(
        'bg-card group scroll-mt-24 rounded-2xl border',
        signature && 'ring-pullim-warn/30 ring-2',
      )}
    >
      <summary className="hover:bg-pullim-slate-50/60 flex cursor-pointer list-none flex-wrap items-baseline gap-2 rounded-2xl p-5 transition-colors [&::-webkit-details-marker]:hidden">
        <ChevronRight
          aria-hidden
          className="text-pullim-slate-400 mt-1 h-4 w-4 shrink-0 transition-transform group-open:rotate-90"
        />
        <h3 className="text-pullim-slate-900 text-base font-bold tracking-tight">
          {title}
        </h3>
        {signature && (
          <span className="bg-pullim-warn inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[9px] font-bold tracking-wider text-white uppercase">
            <Star className="h-2 w-2 fill-current" aria-hidden />
            SIGNATURE
          </span>
        )}
        <span className="text-pullim-slate-500 text-xs">{subtitle}</span>
      </summary>
      <div className="px-5 pb-5">{children}</div>
    </details>
  );
}
