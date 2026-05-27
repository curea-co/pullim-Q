'use client';

import { useState } from 'react';
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Legend,
} from 'recharts';
import { cognitiveBySubject, subjectLabels, type SubjectKey } from '@/lib/mock';
import { pullimSubjectColors, pullimSlate } from '@/lib/tokens';
import { cn } from '@/lib/utils';

const subjects: SubjectKey[] = ['math', 'english', 'science'];

/**
 * 사고유형 레이더차트 — 마스터 4.2 "사고유형별 레이더차트" 시그니처.
 * 내 능력 vs 또래 평균 비교.
 */
export function CognitiveRadar() {
  const [active, setActive] = useState<SubjectKey>('english');
  const data = cognitiveBySubject[active];
  const color = pullimSubjectColors[active];

  // 약점 축 찾기 (peer 대비 -10p 이하)
  const weakAxis = data.find(d => d.value - d.peer <= -15);

  return (
    <section className="bg-card rounded-xl border">
      <header className="flex items-end justify-between border-b p-4">
        <div>
          <p className="text-pullim-blue-600 text-[10px] font-bold tracking-wider uppercase">
            사고유형 프로필
          </p>
          <h2 className="text-pullim-slate-900 mt-0.5 text-base font-bold tracking-tight">
            능력 차원 분석
          </h2>
        </div>
        <div className="bg-pullim-slate-100 inline-flex rounded-full p-0.5 text-xs">
          {subjects.map(s => (
            <button
              key={s}
              type="button"
              onClick={() => setActive(s)}
              className={cn(
                'rounded-full px-3 py-1 font-semibold transition-all',
                active === s
                  ? 'bg-white text-pullim-slate-900 shadow-pullim-xs'
                  : 'text-pullim-slate-500',
              )}
            >
              {subjectLabels[s]}
            </button>
          ))}
        </div>
      </header>

      <div className="p-4">
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={data} outerRadius="80%">
              <PolarGrid stroke={pullimSlate[200]} />
              <PolarAngleAxis
                dataKey="axis"
                tick={{ fontSize: 11, fill: pullimSlate[600], fontWeight: 600 }}
              />
              <PolarRadiusAxis
                domain={[0, 100]}
                tick={{ fontSize: 9, fill: pullimSlate[400] }}
                tickCount={5}
              />
              <Radar
                name="또래 평균"
                dataKey="peer"
                stroke={pullimSlate[400]}
                fill={pullimSlate[300]}
                fillOpacity={0.15}
                strokeDasharray="3 3"
              />
              <Radar
                name="내 능력"
                dataKey="value"
                stroke={color}
                fill={color}
                fillOpacity={0.35}
                strokeWidth={2}
              />
              <Legend
                align="center"
                wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
                iconSize={10}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {weakAxis && (
          <div className="bg-pullim-danger-bg border-pullim-danger/20 mt-2 rounded-lg border p-2.5 text-xs">
            <strong className="text-pullim-danger">집중 필요 ·</strong>{' '}
            <span className="text-pullim-slate-700">
              <strong>{weakAxis.axis}</strong> 영역이 또래 평균보다 {weakAxis.peer - weakAxis.value}p 낮아요.
              아래 처방 카드에서 맞춤 학습 경로를 확인하세요.
            </span>
          </div>
        )}
      </div>
    </section>
  );
}
