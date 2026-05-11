'use client';

import { Lightbulb, Eye, MessageCircle, Sparkles, Send, Lock } from 'lucide-react';
import { type SolveProblem } from '@/lib/mock';
import { aiTierMeta } from '@/lib/tokens/tier';

type Props = {
  problem: SolveProblem;
  /** 현재 문제의 힌트 진행 단계 — 부모에서 문제별로 보존 */
  hintIndex: number;
  /** 다음 힌트 단계로 넘기기 */
  onAdvanceHint: () => void;
  /** 시험 모드 진입 시 disabled로 회색조 + 메시지 */
  disabled?: boolean;
};

export function CoachPane({ problem, hintIndex, onAdvanceHint, disabled }: Props) {
  const showHints = hintIndex > 0;
  const allUsed = hintIndex >= problem.hints.length;

  return (
    <section className="bg-card relative overflow-hidden rounded-xl border">
      <header className="border-pullim-slate-200 flex items-center gap-2 border-b p-3">
        <span className="bg-pullim-blue-600 flex h-7 w-7 items-center justify-center rounded-lg text-white">
          <Sparkles className="h-3.5 w-3.5" />
        </span>
        <div className="flex-1">
          <div className="text-pullim-blue-600 text-[10px] font-bold tracking-wider uppercase">
            AI 풀이 코치
          </div>
          <div className="text-pullim-slate-900 text-sm font-bold">풀림 튜터 — Scope L3</div>
        </div>
        <button
          type="button"
          disabled={disabled}
          className="text-pullim-warn hover:bg-pullim-warn-bg disabled:opacity-50 inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-semibold transition-colors"
          aria-label="풀림 해설 12-섹션 자세히 보기"
          title="풀림 해설 12-섹션 자세히 보기"
        >
          <Eye className="h-3 w-3" />
          해설
        </button>
        <span
          className="rounded-sm px-1.5 py-0.5 font-mono text-[9px] font-bold"
          style={{ background: aiTierMeta.T2.bg, color: aiTierMeta.T2.color }}
        >
          T2 · {aiTierMeta.T2.label}
        </span>
      </header>

      <div className="space-y-3 p-3">
        {/* 주 액션 — 힌트 받기 (Primary). 풀림 해설은 헤더 우측 텍스트 링크로 demote */}
        <button
          type="button"
          onClick={onAdvanceHint}
          disabled={allUsed || disabled}
          className="bg-pullim-blue-600 text-white hover:bg-pullim-blue-700 disabled:opacity-50 inline-flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-bold transition-colors"
        >
          <Lightbulb className="h-4 w-4" />
          <span>{allUsed ? '힌트 모두 사용' : `힌트 받기 (${hintIndex}/${problem.hints.length})`}</span>
        </button>

        {/* 힌트 표시 영역 */}
        <div className="bg-pullim-slate-50 min-h-[140px] rounded-lg p-3 text-xs">
          {showHints && hintIndex > 0 ? (
            <ol className="space-y-2.5">
              {problem.hints.slice(0, hintIndex).map((h, i) => (
                <li key={i} className="flex gap-2">
                  <span className="bg-pullim-blue-600 flex h-5 w-5 shrink-0 items-center justify-center rounded-full font-mono text-[10px] font-bold text-white">
                    {i + 1}
                  </span>
                  <p className="text-pullim-slate-700 leading-relaxed">{h}</p>
                </li>
              ))}
            </ol>
          ) : (
            <p className="text-pullim-slate-400 text-center italic">
              막히면 “힌트 받기”를 눌러보세요.<br />단계별 사고 유도로 답을 스스로 찾을 수 있어요.
            </p>
          )}
        </div>

        {/* 자유 입력 */}
        <form
          onSubmit={e => e.preventDefault()}
          className="flex items-center gap-2"
        >
          <input
            placeholder="자유롭게 질문해보세요…"
            disabled={disabled}
            className="border-pullim-slate-200 focus-visible:border-pullim-blue-400 disabled:bg-pullim-slate-50 disabled:opacity-60 flex-1 rounded-full border px-3 py-1.5 text-sm outline-none"
          />
          <button
            type="submit"
            disabled={disabled}
            aria-label="질문 보내기"
            className="bg-pullim-blue-600 hover:bg-pullim-blue-700 disabled:opacity-50 flex h-8 w-8 items-center justify-center rounded-full text-white"
          >
            <Send className="h-3.5 w-3.5" />
          </button>
        </form>

        {/* 연관 오답 링크 — 부가 영역, 기본 접힘 */}
        <details className="border-pullim-slate-200 border-t pt-2.5">
          <summary className="text-pullim-slate-500 mb-1 cursor-pointer text-[10px] font-bold tracking-wider uppercase select-none">
            연관 오답 패턴
          </summary>
          <button
            type="button"
            disabled={disabled}
            className="text-pullim-blue-700 hover:bg-pullim-blue-50 disabled:opacity-50 mt-1 inline-flex w-full items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-semibold"
          >
            <MessageCircle className="h-3 w-3" />
            “부호 변화 생략” 패턴 → 풀림 복습(정복)으로
          </button>
        </details>
      </div>

      {/* 시험 모드 disabled overlay */}
      {disabled && (
        <div
          aria-hidden
          className="absolute inset-0 flex flex-col items-center justify-center gap-2 rounded-xl bg-pullim-slate-900/85 px-6 text-center backdrop-blur-sm"
        >
          <span className="bg-pullim-warn flex h-10 w-10 items-center justify-center rounded-full text-white">
            <Lock className="h-5 w-5" />
          </span>
          <h3 className="text-base font-bold text-white">AI 코치 차단됨</h3>
          <p className="text-pullim-slate-300 text-xs leading-relaxed">
            시험 모드에서는 힌트·해설·자유 질문이 모두 차단돼요.<br />
            제출 후 채점·해설을 받을 수 있어요.
          </p>
        </div>
      )}
    </section>
  );
}
