'use client';

import {
  Area, AreaChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, ReferenceDot,
} from 'recharts';
import { TrendingUp, Brain } from 'lucide-react';
import { forgettingCurve, personalForgettingProfile } from '@/lib/mock';
import { pullimBlue, pullimSlate } from '@/lib/tokens';

/**
 * 에빙하우스 망각 곡선 — 평균 vs 개인 추정.
 * 마스터 4.5 (개인별 파라미터 베이지안 추정).
 */
export function ForgettingCurveChart() {
  const profile = personalForgettingProfile;
  const day30 = forgettingCurve[forgettingCurve.length - 1];

  return (
    <section className="bg-card overflow-hidden rounded-2xl border">
      <header className="flex items-end justify-between border-b p-4">
        <div>
          <p className="text-pullim-blue-600 flex items-center gap-1 text-[10px] font-bold tracking-wider uppercase">
            <Brain className="h-3 w-3" />
            개인 망각 곡선
          </p>
          <h2 className="text-pullim-slate-900 mt-0.5 text-base font-bold tracking-tight">
            나는 평균보다 잘 기억해요
          </h2>
        </div>
        <div className="text-right">
          <div className="text-pullim-success inline-flex items-center gap-1 text-xs font-bold">
            <TrendingUp className="h-3.5 w-3.5" />
            +{profile.retentionAdvantageVsPeer}p
          </div>
          <div className="text-pullim-slate-400 text-[10px]">vs 또래 평균</div>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-4 p-4 lg:grid-cols-[1fr_180px]">
        {/* 차트 */}
        <div className="h-52">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={forgettingCurve} margin={{ top: 8, right: 4, bottom: 0, left: -20 }}>
              <defs>
                <linearGradient id="personal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"   stopColor={pullimBlue[500]} stopOpacity={0.4} />
                  <stop offset="100%" stopColor={pullimBlue[500]} stopOpacity={0.05} />
                </linearGradient>
                <linearGradient id="base" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"   stopColor={pullimSlate[400]} stopOpacity={0.25} />
                  <stop offset="100%" stopColor={pullimSlate[400]} stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="day" type="number" domain={[0, 30]} ticks={[0, 1, 4, 7, 14, 30]}
                tickLine={false} axisLine={false}
                tick={{ fontSize: 10, fill: pullimSlate[500] }}
                tickFormatter={d => `D+${d}`}
              />
              <YAxis
                domain={[0, 1]} ticks={[0, 0.25, 0.5, 0.75, 1]}
                tickLine={false} axisLine={false}
                tick={{ fontSize: 9, fill: pullimSlate[400] }}
                tickFormatter={v => `${Math.round(Number(v) * 100)}%`}
                width={32}
              />
              <Tooltip
                contentStyle={{
                  fontSize: 11, borderRadius: 8,
                  border: `1px solid ${pullimSlate[200]}`, padding: '6px 10px',
                }}
                formatter={(v, name) => [`${Math.round(Number(v) * 100)}%`, name]}
                labelFormatter={(l) => `D+${l}`}
              />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, paddingTop: 4 }} />
              <Area
                type="monotone" name="또래 평균"
                dataKey="baseRetention"
                stroke={pullimSlate[400]} strokeDasharray="3 3"
                fill="url(#base)" strokeWidth={1.5}
              />
              <Area
                type="monotone" name="내 남은 기억"
                dataKey="personalRetention"
                stroke={pullimBlue[500]} fill="url(#personal)" strokeWidth={2}
              />
              <ReferenceDot
                x={day30.day} y={day30.personalRetention}
                r={4} fill={pullimBlue[500]} stroke="white" strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* 사이드 인사이트 */}
        <div className="space-y-2 text-xs">
          <Insight label="망각 속도" value={`${profile.decayRate.toFixed(2)}`} sub="(1.0 = 평균)" tone="good" />
          <Insight label="30일 남은 기억" value={`${Math.round(profile.retention30d.me * 100)}%`} sub={`평균 ${Math.round(profile.retention30d.peer * 100)}%`} tone="good" />
          <Insight label="누적 학습" value={profile.totalItems.toLocaleString()} sub="개 항목" />
          <Insight label="마스터 단계" value={profile.mastered.toLocaleString()} sub={`${Math.round((profile.mastered / profile.totalItems) * 100)}%`} tone="lemon" />
        </div>
      </div>
    </section>
  );
}

function Insight({
  label, value, sub, tone,
}: {
  label: string; value: string; sub?: string;
  tone?: 'good' | 'lemon';
}) {
  const valueClass =
    tone === 'good' ? 'text-pullim-success'
    : tone === 'lemon' ? 'text-pullim-lemon-ink'
    : 'text-pullim-slate-900';
  return (
    <div className="bg-pullim-slate-50 rounded-lg px-2.5 py-2">
      <div className="text-pullim-slate-500 text-[10px] font-bold tracking-wider uppercase">{label}</div>
      <div className="flex items-baseline gap-1">
        <span className={`font-mono text-lg font-bold ${valueClass}`}>{value}</span>
        {sub && <span className="text-pullim-slate-400 text-[10px]">{sub}</span>}
      </div>
    </div>
  );
}
