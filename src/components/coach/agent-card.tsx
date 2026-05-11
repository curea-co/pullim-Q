import Link from 'next/link';
import {
  ArrowRight, Sparkles, CalendarClock, Wrench, Flame, BarChart3, BookOpen,
  type LucideIcon,
} from 'lucide-react';
import type { Agent, AgentId } from '@/lib/mock';
import { aiTierMeta } from '@/lib/tokens/tier';
import { cn } from '@/lib/utils';

const toneMeta = {
  good:      { label: '성과', class: 'bg-pullim-success-bg text-pullim-success border-pullim-success/30' },
  warn:      { label: '주의', class: 'bg-pullim-warn-bg text-pullim-warn border-pullim-warn/30' },
  info:      { label: '안내', class: 'bg-pullim-blue-50 text-pullim-blue-700 border-pullim-blue-100' },
  urgent:    { label: '긴급', class: 'bg-pullim-danger-bg text-pullim-danger border-pullim-danger/30' },
  celebrate: { label: '축하', class: 'bg-pullim-lemon/20 text-pullim-lemon-ink border-pullim-lemon-ink/30' },
} as const;

const agentIconMap: Record<AgentId, LucideIcon> = {
  orchestrator: Sparkles,
  planning:     CalendarClock,
  tutor:        Wrench,
  motivation:   Flame,
  analysis:     BarChart3,
  curation:     BookOpen,
};

/**
 * 에이전트 카드 — 6개 그리드 항목.
 * Orchestrator는 시그니처라 강조 (size lg).
 */
export function AgentCard({ agent, large }: { agent: Agent; large?: boolean }) {
  const tone = toneMeta[agent.signalTone];
  const tier = aiTierMeta[agent.tier];
  const isOrchestrator = agent.id === 'orchestrator';
  const AgentIcon = agentIconMap[agent.id];

  const inner = (
    <article
      className={cn(
        'group relative flex h-full flex-col gap-3 rounded-2xl border p-4 transition-all',
        isOrchestrator
          ? 'from-pullim-slate-900 to-pullim-blue-900 bg-gradient-to-br border-pullim-blue-600/30 text-white shadow-xl'
          : 'bg-card hover:border-pullim-blue-300 hover:shadow-pullim-md',
      )}
      style={isOrchestrator ? undefined : { borderLeftWidth: 3, borderLeftColor: agent.accentVar }}
    >
      <header className="flex items-start gap-3">
        <span
          aria-hidden
          className={cn(
            'flex shrink-0 items-center justify-center rounded-xl',
            large ? 'h-14 w-14' : 'h-11 w-11',
            isOrchestrator
              ? 'bg-white/15 text-pullim-lemon'
              : 'bg-pullim-slate-100 text-pullim-slate-700',
          )}
        >
          <AgentIcon className={large ? 'h-7 w-7' : 'h-5 w-5'} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className={cn(
              'text-[10px] font-bold tracking-wider uppercase',
              isOrchestrator ? 'text-pullim-lemon' : 'text-pullim-slate-500',
            )}>
              {agent.role}
            </span>
            <span
              className="rounded-sm px-1 py-0.5 font-mono text-[8px] font-bold tracking-wider"
              style={{ background: tier.bg, color: tier.color }}
            >
              {agent.tier}
            </span>
          </div>
          <h3 className={cn(
            'text-base font-bold tracking-tight',
            isOrchestrator ? 'text-white' : 'text-pullim-slate-900',
          )}>
            {agent.name}
            {isOrchestrator && (
              <span className="text-pullim-lemon ml-1.5 text-[10px] font-normal opacity-90">Orchestrator</span>
            )}
          </h3>
        </div>
      </header>

      {/* 신호 */}
      <div
        className={cn(
          'rounded-lg border p-2.5 text-xs leading-relaxed',
          isOrchestrator ? 'bg-white/10 border-white/15 text-white' : tone.class,
        )}
      >
        <div className={cn(
          'mb-1 inline-block rounded-full px-1.5 py-0.5 text-[9px] font-bold tracking-wider uppercase',
          isOrchestrator ? 'bg-pullim-lemon text-pullim-lemon-ink' : 'bg-current/15',
        )}>
          {tone.label}
        </div>
        <p>{agent.currentSignal}</p>
      </div>

      <footer className={cn(
        'flex items-center gap-2 text-[11px]',
        isOrchestrator ? 'text-white/70' : 'text-pullim-slate-500',
      )}>
        <span>오늘 {agent.activityToday}회 활동</span>
        <span className={isOrchestrator ? 'text-white/40' : 'text-pullim-slate-300'}>·</span>
        <span className="truncate">{agent.linkedFeatureLabel}</span>
        {agent.linkedHref && !isOrchestrator && (
          <ArrowRight className="text-pullim-slate-300 group-hover:text-pullim-blue-500 ml-auto h-3 w-3 shrink-0 transition-colors" />
        )}
      </footer>
    </article>
  );

  if (agent.linkedHref && !isOrchestrator) {
    return <Link href={agent.linkedHref} className="block h-full">{inner}</Link>;
  }
  return inner;
}
