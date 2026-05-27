import { AlertTriangle, Dice5 } from 'lucide-react';
import { guessDetection } from '@/lib/mock';

/**
 * 찍기 탐지 카드 — 마스터 5.3 시그니처.
 */
export function GuessingDetector() {
  const g = guessDetection;

  return (
    <section className="bg-card rounded-xl border p-4">
      <header className="mb-3 flex items-center gap-2">
        <span className="bg-pullim-danger flex h-9 w-9 items-center justify-center rounded-xl text-white">
          <Dice5 className="h-4 w-4" />
        </span>
        <div>
          <p className="text-pullim-danger text-[10px] font-bold tracking-wider uppercase">
            찍기 탐지
          </p>
          <h2 className="text-pullim-slate-900 text-sm font-bold">
            이번 주 의심 {g.weeklyGuesses}건 · 오늘 {g.totalGuesses}건
          </h2>
        </div>
      </header>

      <div className="grid grid-cols-2 gap-2 mb-3">
        <Stat label="운으로 맞춤" value={`${g.luckyHitRate}%`} desc="찍어서 정답" tone="warn" />
        <Stat label="이번 주 누적" value={`${g.weeklyGuesses}회`} desc="패턴 분석 중" tone="danger" />
      </div>

      <div className="border-pullim-slate-100 border-t pt-3">
        <div className="text-pullim-slate-500 mb-2 inline-flex items-center gap-1 text-[10px] font-bold tracking-wider uppercase">
          <AlertTriangle className="h-2.5 w-2.5" />
          찍기 의심 영역
        </div>
        <ul className="space-y-1.5">
          {g.hotspots.map(h => (
            <li key={h.label} className="flex items-center justify-between rounded-lg bg-pullim-danger/5 px-2.5 py-1.5 text-xs">
              <span className="text-pullim-slate-700">{h.label}</span>
              <span className="text-pullim-danger font-mono font-bold">{h.count}회</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function Stat({
  label, value, desc, tone,
}: {
  label: string; value: string; desc: string; tone: 'warn' | 'danger';
}) {
  const cls = tone === 'warn' ? 'bg-pullim-warn-bg text-pullim-warn' : 'bg-pullim-danger-bg text-pullim-danger';
  return (
    <div className={`rounded-lg p-2.5 ${cls}`}>
      <div className="text-[10px] font-bold tracking-wider uppercase">{label}</div>
      <div className="font-mono text-lg font-bold mt-0.5">{value}</div>
      <div className="text-[10px] opacity-80">{desc}</div>
    </div>
  );
}
