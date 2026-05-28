'use client';

import {
  Bar, BarChart, ResponsiveContainer, XAxis, YAxis, ReferenceLine, Cell, Tooltip,
} from 'recharts';
import { Clock, AlertTriangle } from 'lucide-react';
import { timeDistribution } from '@/lib/mock';
import { pullimSlate, pullimBlue } from '@/lib/tokens';

/**
 * 풀이 시간 분포 — Q 4.7 #2.
 * 각 막대는 실제 시간 / 기준선 = 평균 expected.
 */
export function TimeDistributionChart() {
  const expectedAvg = Math.round(
    timeDistribution.reduce((s, d) => s + d.expectedSec, 0) / timeDistribution.length,
  );
  const overTime = timeDistribution.filter(d => d.actualSec > d.expectedSec * 1.5).length;
  const guesses = timeDistribution.filter(d => d.isGuess).length;

  return (
    <section className="bg-card rounded-xl border">
      <header className="flex items-end justify-between border-b p-4">
        <div>
          <p className="text-pullim-blue-600 flex items-center gap-1 text-[10px] font-bold tracking-wider uppercase">
            <Clock className="h-3 w-3" />
            풀이 시간 분포
          </p>
          <h2 className="text-pullim-slate-900 mt-0.5 text-base font-bold tracking-tight">
            최근 40문항
          </h2>
        </div>
        <div className="text-right text-[11px]">
          <div className="text-pullim-warn font-bold">오버타임 {overTime}건</div>
          <div className="text-pullim-danger inline-flex items-center gap-0.5 font-bold">
            <AlertTriangle className="h-2.5 w-2.5" />
            찍기 의심 {guesses}건
          </div>
        </div>
      </header>

      <div className="h-48 p-3">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={timeDistribution} margin={{ top: 8, right: 8, bottom: 0, left: -20 }}>
            <XAxis
              dataKey="idx"
              tickLine={false} axisLine={false}
              tick={{ fontSize: 9, fill: pullimSlate[400] }}
              interval={4}
            />
            <YAxis
              tickLine={false} axisLine={false}
              tick={{ fontSize: 9, fill: pullimSlate[400] }}
              width={28}
              tickFormatter={v => `${v}s`}
            />
            <Tooltip
              cursor={{ fill: 'rgba(59,111,246,0.06)' }}
              contentStyle={{
                fontSize: 11, borderRadius: 8,
                border: `1px solid ${pullimSlate[200]}`, padding: '6px 10px',
              }}
              labelFormatter={l => `문항 ${l}`}
              formatter={(v, name) => [`${v}s`, name === 'actualSec' ? '실제' : '예상']}
            />
            <ReferenceLine y={expectedAvg} stroke={pullimSlate[400]} strokeDasharray="3 3" label={{ value: `평균 ${expectedAvg}s`, fontSize: 10, fill: pullimSlate[500], position: 'right' }} />
            <Bar dataKey="actualSec" radius={[2, 2, 0, 0]} barSize={6}>
              {timeDistribution.map((d, i) => {
                const fill = d.isGuess
                  ? 'var(--color-pullim-danger)'
                  : !d.isCorrect
                  ? 'var(--color-pullim-warn)'
                  : d.actualSec > d.expectedSec * 1.5
                  ? 'var(--color-pullim-warn)'
                  : pullimBlue[500];
                return <Cell key={i} fill={fill} />;
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* 범례 */}
      <div className="text-pullim-slate-500 flex flex-wrap items-center gap-3 border-t border-pullim-slate-100 px-4 py-2.5 text-[10px]">
        <Legend color="var(--color-pullim-blue-500)" label="정답·정상시간" />
        <Legend color="var(--color-pullim-warn)" label="오답 또는 오버타임" />
        <Legend color="var(--color-pullim-danger)" label="찍기 의심 (시간 < 30%)" />
      </div>
    </section>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1">
      <span className="h-2.5 w-2.5 rounded-sm" style={{ background: color }} />
      {label}
    </span>
  );
}
