'use client';

import { useState, useRef, useEffect } from 'react';
import {
  Send, Sparkles, CalendarClock, Wrench, Flame, BarChart3, BookOpen,
  type LucideIcon,
} from 'lucide-react';
import {
  agents, coachGreeting, quickQuestions, demoReplies, pickAgentForQuestion,
  currentPersona, type AgentId,
} from '@/lib/mock';
import { aiTierMeta } from '@/lib/tokens/tier';
import { cn } from '@/lib/utils';

const agentIconMap: Record<AgentId, LucideIcon> = {
  orchestrator: Sparkles,
  planning:     CalendarClock,
  tutor:        Wrench,
  motivation:   Flame,
  analysis:     BarChart3,
  curation:     BookOpen,
};

type Turn = {
  id: string;
  role: 'student' | 'agent';
  text: string;
  agentId?: AgentId;
};

const initial: Turn[] = [
  { id: 't0', role: 'agent', text: coachGreeting, agentId: 'orchestrator' },
];

export function CoachChat() {
  const [turns, setTurns] = useState<Turn[]>(initial);
  const [pending, setPending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [turns, pending]);

  function send(question: string) {
    if (!question.trim() || pending) return;
    setTurns(t => [...t, { id: `s${Date.now()}`, role: 'student', text: question.trim() }]);
    setPending(true);

    const preset = demoReplies[question.trim()];
    const agentId = preset?.agent ?? pickAgentForQuestion(question);
    const reply =
      preset?.reply ??
      `(${agents.find(a => a.id === agentId)?.name} 에이전트가 응답할 영역) — 데모용. 실제 서비스에서는 학생 데이터를 종합해 답해요.`;

    setTimeout(() => {
      setTurns(t => [...t, { id: `a${Date.now()}`, role: 'agent', text: reply, agentId }]);
      setPending(false);
    }, 800);
  }

  return (
    <section className="bg-card flex flex-col rounded-2xl border h-full">
      <header className="border-b p-3.5">
        <div className="text-pullim-blue-600 text-[10px] font-bold tracking-wider uppercase">
          통합 코치 채팅
        </div>
        <h2 className="text-pullim-slate-900 text-sm font-bold">자유롭게 질문하면 적절한 에이전트가 답해요</h2>
      </header>

      {/* 대화 영역 */}
      <div ref={scrollRef} className="flex max-h-[560px] min-h-[360px] flex-col gap-3 overflow-y-auto p-3.5">
        {turns.map(t => <Bubble key={t.id} turn={t} />)}
        {pending && <PendingBubble />}
      </div>

      {/* 빠른 질문 */}
      <div className="border-t p-3 space-y-2">
        <div className="flex flex-wrap gap-1.5">
          {quickQuestions.map(q => (
            <button
              key={q.text}
              type="button"
              onClick={() => send(q.text)}
              disabled={pending}
              className="bg-pullim-blue-50 text-pullim-blue-700 hover:bg-pullim-blue-100 disabled:opacity-50 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold transition-colors"
            >
              {q.text}
            </button>
          ))}
        </div>

        <form
          onSubmit={e => {
            e.preventDefault();
            const input = e.currentTarget.elements.namedItem('q') as HTMLInputElement;
            send(input.value);
            input.value = '';
          }}
          className="flex items-center gap-2"
        >
          <input
            name="q"
            placeholder="자유롭게 질문해보세요…"
            className="border-pullim-slate-200 focus-visible:border-pullim-blue-400 flex-1 rounded-full border px-3.5 py-2 text-sm outline-none"
          />
          <button
            type="submit"
            disabled={pending}
            aria-label="질문 보내기"
            className="bg-pullim-blue-600 hover:bg-pullim-blue-700 disabled:opacity-50 flex h-9 w-9 items-center justify-center rounded-full text-white"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </section>
  );
}

function Bubble({ turn }: { turn: Turn }) {
  const isStudent = turn.role === 'student';
  const agent = !isStudent && turn.agentId ? agents.find(a => a.id === turn.agentId) : undefined;
  const tier = agent ? aiTierMeta[agent.tier] : null;
  const AgentIcon = agent ? agentIconMap[agent.id] : null;

  return (
    <div className={cn('flex gap-2', isStudent && 'flex-row-reverse')}>
      <div
        aria-hidden
        className={cn(
          'flex h-7 w-7 shrink-0 items-center justify-center rounded-full',
          isStudent
            ? 'bg-pullim-slate-200 text-pullim-slate-700 text-xs font-bold'
            : 'bg-pullim-blue-600 text-white',
        )}
      >
        {isStudent ? currentPersona.name[0] : AgentIcon && <AgentIcon className="h-3.5 w-3.5" />}
      </div>

      <div className={cn('max-w-[82%] flex flex-col gap-1', isStudent && 'items-end')}>
        {!isStudent && agent && (
          <div className="flex flex-wrap items-center gap-1.5 text-[10px]">
            <span className="bg-pullim-blue-100 text-pullim-blue-700 inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 font-bold">
              {agent.name} 에이전트
            </span>
            {tier && (
              <span
                className="inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 font-mono text-[9px] font-bold"
                style={{ background: tier.bg, color: tier.color }}
              >
                {agent.tier} · {tier.label}
              </span>
            )}
          </div>
        )}
        <div
          className={cn(
            'rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-wrap',
            isStudent
              ? 'bg-pullim-blue-600 text-white rounded-tr-sm'
              : 'bg-pullim-slate-50 text-pullim-slate-800 rounded-tl-sm',
          )}
        >
          {turn.text}
        </div>
      </div>
    </div>
  );
}

function PendingBubble() {
  return (
    <div className="flex gap-2">
      <div className="bg-pullim-blue-600 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-white">
        <Sparkles className="h-3.5 w-3.5" />
      </div>
      <div className="bg-pullim-slate-50 flex items-center gap-1 rounded-2xl rounded-tl-sm px-4 py-3">
        <span className="bg-pullim-slate-400 h-1.5 w-1.5 animate-bounce rounded-full" style={{ animationDelay: '0ms' }} />
        <span className="bg-pullim-slate-400 h-1.5 w-1.5 animate-bounce rounded-full" style={{ animationDelay: '120ms' }} />
        <span className="bg-pullim-slate-400 h-1.5 w-1.5 animate-bounce rounded-full" style={{ animationDelay: '240ms' }} />
      </div>
    </div>
  );
}
