'use client';

import {
  Area, AreaChart, ResponsiveContainer, XAxis, YAxis, ReferenceArea, Tooltip,
} from 'recharts';
import { Sun } from 'lucide-react';
import { hourlyAccuracy } from '@/lib/mock';
import { pullimSlate, pullimBlue } from '@/lib/tokens';

/**
 * 시간대별 정답률 — Q 4.7 #4.
 * 피크 시간대 자동 하이라이트.
 */
export function HourlyAccuracyChart() {
  const peak = hourlyAccuracy.reduce((m, d) => (d.accuracy > m.accuracy ? d : m), hourlyAccuracy[0]);
  const totalProblems = hourlyAccuracy.reduce((s, d) => s + d.problemCount, 0);
  const avgAccuracy = Math.round(
    hourlyAccuracy.reduce((s, d) => s + d.accuracy * d.problemCount, 0) / totalProblems,
  );

  return (
    <section className="bg-card rounded-xl border">
      <header className="flex items-end justify-between border-b p-4">
        <div>
          <p className="text-pullim-blue-600 flex items-center gap-1 text-[10px] font-bold tracking-wider uppercase">
            <Sun className="h-3 w-3" />
            시간대별 정답률
          </p>
          <h2 className="text-pullim-slate-900 mt-0.5 text-base font-bold tracking-tight">
            골드 타임 — {peak.hour}시 ({peak.accuracy}%)
          </h2>
        </div>
        <div className="text-pullim-slate-500 text-right text-[11px]">
          <div>전체 평균 <span className="text-pullim-slate-900 font-mono font-bold">{avgAccuracy}%</span></div>
          <div>{totalProblems}문항 누적</div>
        </div>
      </header>

      <div className="h-44 p-3">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={hourlyAccuracy} margin={{ top: 8, right: 8, bottom: 0, left: -20 }}>
            <defs>
              <linearGradient id="acc" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stopColor={pullimBlue[500]} stopOpacity={0.4} />
                <stop offset="100%" stopColor={pullimBlue[500]} stopOpacity={0.05} />
              </linearGradient>
            </defs>

            <XAxis
              dataKey="hour"
              tickLine={false} axisLine={false}
              tick={{ fontSize: 9, fill: pullimSlate[500] }}
              tickFormatter={h => `${h}시`}
              interval={1}
            />
            <YAxis
              domain={[0, 100]}
              tickLine={false} axisLine={false}
              tick={{ fontSize: 9, fill: pullimSlate[400] }}
              tickFormatter={v => `${v}%`}
              width={32}
            />
            <Tooltip
              contentStyle={{
                fontSize: 11, borderRadius: 8,
                border: `1px solid ${pullimSlate[200]}`, padding: '6px 10px',
              }}
              formatter={(v, _, ctx) => {
                const d = ctx?.payload;
                return [`${v}% (${d?.problemCount}문항)`, '정답률'];
              }}
              labelFormatter={l => `${l}시`}
            />
            <ReferenceArea x1={peak.hour - 0.5} x2={peak.hour + 0.5} fill="var(--color-pullim-lemon)" fillOpacity={0.25} />
            <Area
              type="monotone" dataKey="accuracy"
              stroke={pullimBlue[500]} fill="url(#acc)" strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
