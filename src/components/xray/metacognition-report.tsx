import { Brain, Sparkles, Check, X } from 'lucide-react';
import { metaCognitionReport } from '@/lib/mock';
import { aiTierMeta } from '@/lib/tokens/tier';

/**
 * 메타인지 리포트 — AI 생성 텍스트.
 * 학습자 유형 + 강점·약점 분석.
 */
export function MetaCognitionReport() {
  const r = metaCognitionReport;
  const tier = aiTierMeta.T3;

  return (
    <section className="bg-card overflow-hidden rounded-xl border">
      <header className="border-b p-4">
        <div className="flex items-center gap-2">
          <span className="bg-pullim-blue-600 flex h-9 w-9 items-center justify-center rounded-xl text-white">
            <Brain className="h-4 w-4" />
          </span>
          <div className="flex-1">
            <p className="text-pullim-blue-600 flex items-center gap-1 text-[10px] font-bold tracking-wider uppercase">
              <Sparkles className="h-3 w-3" />
              메타인지 리포트
              <span
                className="ml-1 rounded-sm px-1 py-0.5 font-mono text-[8px] font-bold"
                style={{ background: tier.bg, color: tier.color }}
              >
                T3 · {tier.label}
              </span>
            </p>
            <h2 className="text-pullim-slate-900 text-base font-bold tracking-tight">
              당신은 <span className="text-pullim-blue-600">{r.learnerType}</span>
            </h2>
          </div>
        </div>
      </header>

      <div className="p-4 space-y-4">
        <p className="text-pullim-slate-700 text-sm leading-relaxed">
          {r.description}
        </p>

        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
          {/* 강점 */}
          <div className="bg-pullim-success-bg border-pullim-success/20 rounded-xl border p-3">
            <div className="text-pullim-success mb-2 inline-flex items-center gap-1 text-[10px] font-bold tracking-wider uppercase">
              <Check className="h-3 w-3" />
              강점
            </div>
            <ul className="space-y-1.5 text-xs">
              {r.strengths.map((s, i) => (
                <li key={i} className="text-pullim-slate-700 flex items-start gap-1.5">
                  <Check className="text-pullim-success mt-0.5 h-3 w-3 shrink-0" />
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* 약점 */}
          <div className="bg-pullim-warn-bg border-pullim-warn/20 rounded-xl border p-3">
            <div className="text-pullim-warn mb-2 inline-flex items-center gap-1 text-[10px] font-bold tracking-wider uppercase">
              <X className="h-3 w-3" />
              개선 영역
            </div>
            <ul className="space-y-1.5 text-xs">
              {r.weaknesses.map((w, i) => (
                <li key={i} className="text-pullim-slate-700 flex items-start gap-1.5">
                  <X className="text-pullim-warn mt-0.5 h-3 w-3 shrink-0" />
                  <span>{w}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <p className="text-pullim-slate-500 border-pullim-slate-100 border-t pt-3 text-[10px] italic text-center">
          {r.signature}
        </p>
      </div>
    </section>
  );
}
