'use client';

import {
  LineChart, Line, ResponsiveContainer, XAxis, YAxis,
  Tooltip, ReferenceLine, Legend,
} from 'recharts';
import { thetaTrend } from '@/lib/mock';
import { pullimSubjectColors, pullimSlate } from '@/lib/tokens';

/**
 * θ 성장 추적 — 마스터 4.2 "1주/1개월 후 재진단 → 성장 비교".
 * 단일 점수 UI 금지, 반드시 시간축 추세 (Q 디자인 원칙).
 */
export function GrowthTrend() {
  return (
    <section className="bg-card rounded-xl border">
      <header className="flex items-end justify-between border-b p-4">
        <div>
          <p className="text-pullim-blue-600 text-[10px] font-bold tracking-wider uppercase">
            성장 추적
          </p>
          <h2 className="text-pullim-slate-900 mt-0.5 text-base font-bold tracking-tight">
            지난 8주 실력 점수 추세
          </h2>
        </div>
        <div className="text-pullim-slate-500 text-right text-[11px]">
          <div>재진단 권장 <span className="text-pullim-warn font-bold">5일 후</span></div>
          <button className="text-pullim-blue-600 mt-0.5 text-xs font-bold hover:underline">
            5분 퀵 진단 시작
          </button>
        </div>
      </header>

      <div className="h-56 p-3">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={thetaTrend} margin={{ top: 8, right: 8, bottom: 0, left: -20 }}>
            <XAxis
              dataKey="week"
              tickLine={false} axisLine={false}
              tick={{ fontSize: 10, fill: pullimSlate[500] }}
            />
            <YAxis
              domain={[-1, 1]}
              tickLine={false} axisLine={false}
              tick={{ fontSize: 9, fill: pullimSlate[400] }}
              width={28}
            />
            <ReferenceLine y={0} stroke={pullimSlate[300]} strokeDasharray="2 3" />
            <Tooltip
              contentStyle={{
                fontSize: 11, borderRadius: 8,
                border: `1px solid ${pullimSlate[200]}`, padding: '6px 10px',
              }}
              formatter={(v) => [Number(v).toFixed(2), '실력 점수']}
            />
            <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, paddingTop: 4 }} />
            <Line
              type="monotone" name="수학"
              dataKey="math" stroke={pullimSubjectColors.math} strokeWidth={2}
              dot={{ r: 3 }} activeDot={{ r: 5 }}
            />
            <Line
              type="monotone" name="영어"
              dataKey="english" stroke={pullimSubjectColors.english} strokeWidth={2}
              dot={{ r: 3 }} activeDot={{ r: 5 }}
            />
            <Line
              type="monotone" name="과학"
              dataKey="science" stroke={pullimSubjectColors.science} strokeWidth={2}
              dot={{ r: 3 }} activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
