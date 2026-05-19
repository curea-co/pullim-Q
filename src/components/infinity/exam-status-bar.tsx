'use client';

import { useEffect, useState } from 'react';
import { Eye, Radio, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

type Props = {
  /** 시험 시작 후 경과 초 (initial seconds remaining) */
  totalSec: number;
  remainingSec: number;
  onTimeout?: () => void;
  proctorAlert?: boolean;
};

/**
 * 시험 모드 전용 상단 빨간 띠 — 큰 숫자 타이머 + AI 감독관 표시.
 */
export function ExamStatusBar({ totalSec, remainingSec, onTimeout, proctorAlert }: Props) {
  const [secs, setSecs] = useState(remainingSec);
  const [prevRemaining, setPrevRemaining] = useState(remainingSec);

  // Re-sync internal countdown when parent prop changes — adjust during render (React idiom)
  if (remainingSec !== prevRemaining) {
    setPrevRemaining(remainingSec);
    setSecs(remainingSec);
  }

  useEffect(() => {
    if (secs <= 0) { onTimeout?.(); return; }
    const id = setInterval(() => setSecs(s => Math.max(0, s - 1)), 1000);
    return () => clearInterval(id);
  }, [secs, onTimeout]);

  const m = Math.floor(secs / 60);
  const s = secs % 60;
  const pct = Math.max(0, Math.min(100, ((totalSec - secs) / totalSec) * 100));
  const isLowTime = secs < 5 * 60;

  return (
    <section className="bg-pullim-slate-950 relative overflow-hidden rounded-2xl text-white">
      {/* 진행 바 */}
      <div
        aria-hidden
        className={cn(
          'absolute top-0 left-0 h-1 transition-all',
          isLowTime ? 'bg-pullim-danger' : 'bg-pullim-warn',
        )}
        style={{ width: `${pct}%` }}
      />

      <div className="flex flex-wrap items-center gap-4 px-5 py-4">
        {/* 큰 타이머 */}
        <div className="flex items-baseline gap-2">
          <span className="text-pullim-warn text-[10px] font-bold tracking-wider uppercase">
            남은 시간
          </span>
          <span className={cn(
            'font-mono text-3xl font-bold tabular-nums tracking-tight',
            isLowTime ? 'text-pullim-danger animate-pulse' : 'text-white',
          )}>
            {String(m).padStart(2, '0')}:{String(s).padStart(2, '0')}
          </span>
        </div>

        {/* LIVE */}
        <span className="bg-pullim-danger inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase">
          <span className="bg-white inline-block h-1.5 w-1.5 animate-pulse rounded-full" />
          시험 중
        </span>

        {/* AI 감독관 */}
        <span className="text-pullim-slate-300 ml-auto inline-flex items-center gap-1.5 text-[11px]">
          <Eye className="text-pullim-success h-3 w-3" />
          AI 감독관 모니터링 중
        </span>
        <span className="text-pullim-slate-500 inline-flex items-center gap-1 text-[11px]">
          <Radio className="h-3 w-3" />
          탭 이탈 0건
        </span>
      </div>

      {proctorAlert && (
        <div className="bg-pullim-danger flex items-center gap-2 px-5 py-1.5 text-[11px] font-bold">
          <AlertCircle className="h-3.5 w-3.5" />
          탭 이탈이 감지됐어요 — 시험 데이터에 기록됩니다
        </div>
      )}
    </section>
  );
}
