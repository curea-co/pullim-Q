'use client';

import {
  Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Cell,
} from 'recharts';
import { weeklyInflow, inflowBySource, memorySourceMeta } from '@/lib/mock';
import { pullimSlate, pullimBlue } from '@/lib/tokens';

/**
 * 크로스앱 이벤트 버스 시각화 — 마스터 4.5.
 * "여러 기능에서 흘러온 학습이 하나의 기억 타임라인으로".
 */
export function CrossAppTimeline() {
  const totalThisWeek = weeklyInflow.reduce((s, d) => s + d.total, 0);
  const sortedSources = [...inflowBySource].sort((a, b) => b.count - a.count);
  const sumOfSources = sortedSources.reduce((s, x) => s + x.count, 0);

  return (
    <section className="bg-card rounded-xl border">
      <header className="border-b p-4">
        <p className="text-pullim-blue-600 text-[10px] font-bold tracking-wider uppercase">
          크로스앱 이벤트 버스
        </p>
        <h2 className="text-pullim-slate-900 mt-0.5 text-base font-bold tracking-tight">
          여러 기능이 하나의 기억으로
        </h2>
        <p className="text-pullim-slate-500 mt-0.5 text-[11px]">
          이번 주 <strong className="text-pullim-blue-600 font-mono">{totalThisWeek}</strong>개 항목이 풀림 복습으로 유입됐어요
        </p>
      </header>

      <div className="grid grid-cols-1 gap-4 p-4 lg:grid-cols-[1fr_220px]">
        {/* 일별 차트 */}
        <div>
          <div className="text-pullim-slate-500 mb-2 text-[10px] font-bold tracking-wider uppercase">
            일별 유입량
          </div>
          <div className="h-32">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyInflow} margin={{ top: 4, right: 4, bottom: 0, left: -28 }}>
                <XAxis
                  dataKey="day"
                  tickLine={false} axisLine={false}
                  tick={{ fontSize: 10, fill: pullimSlate[500] }}
                />
                <YAxis
                  tickLine={false} axisLine={false}
                  tick={{ fontSize: 9, fill: pullimSlate[400] }}
                  width={24}
                />
                <Tooltip
                  cursor={{ fill: 'rgba(59,111,246,0.06)' }}
                  contentStyle={{
                    fontSize: 11, borderRadius: 8,
                    border: `1px solid ${pullimSlate[200]}`, padding: '6px 10px',
                  }}
                  formatter={(v) => [`${v}개`, '유입']}
                />
                <Bar dataKey="total" radius={[4, 4, 0, 0]} barSize={22}>
                  {weeklyInflow.map((_, i) => (
                    <Cell key={i} fill={pullimBlue[500]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 출처별 누적 */}
        <div>
          <div className="text-pullim-slate-500 mb-2 text-[10px] font-bold tracking-wider uppercase">
            출처별 누적 (7일)
          </div>
          <ul className="space-y-1.5">
            {sortedSources.map(s => {
              const meta = memorySourceMeta[s.source];
              const pct = Math.round((s.count / sumOfSources) * 100);
              return (
                <li key={s.source} className="text-xs">
                  <div className="mb-0.5 flex items-center justify-between">
                    <span className="text-pullim-slate-700 font-semibold">{meta.label}</span>
                    <span className="text-pullim-slate-500 font-mono text-[10px]">
                      {s.count}개 · {pct}%
                    </span>
                  </div>
                  <div className="bg-pullim-slate-100 h-1.5 overflow-hidden rounded-full">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${pct}%`, background: meta.color }}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}
