/**
 * 풀림 Q 기능 메타 (4개 sub-domain).
 */

import type { LucideIcon } from 'lucide-react';
import { Infinity, MessageCircle, ScanSearch, Repeat } from 'lucide-react';

export type FeatureStage = 'core';

export type Feature = {
  slug: string;
  name: string;
  code: string;
  tagline: string;
  slogan: string;
  stage: FeatureStage;
  priority: 1 | 2 | 3;
  icon: LucideIcon;
};

export const features: Feature[] = [
  {
    slug: 'infinity', name: '풀림 무한풀기', code: 'Infinity Engine',
    tagline: '적응형 문제 + 모의고사 통합 — 연습/시험 모드 토글',
    slogan: '문제가 떨어지지 않는다. 내 실력에 딱 맞는 문제가 끊임없이 나온다.',
    stage: 'core', priority: 3, icon: Infinity,
  },
  {
    slug: 'analysis', name: '풀림 분석', code: 'Analytics',
    tagline: '능력치(무엇을 잘하나) + 과정(어떻게 푸나) 두 차원',
    slogan: '같은 학생을 두 각도로 본다 — IRT 능력치와 메타인지 과정.',
    stage: 'core', priority: 3, icon: ScanSearch,
  },
  {
    slug: 'review', name: '풀림 복습', code: 'Review',
    tagline: '오답 정복(Leitner) + 전체 기억(망각곡선) 통합',
    slogan: '같은 spaced repetition의 두 진입점을 한 곳에서.',
    stage: 'core', priority: 3, icon: Repeat,
  },
  {
    slug: 'talk', name: '풀림 AI 대화', code: 'AI Dialog',
    tagline: '코치(전체 학습) + 튜터(한 문제) 두 모드',
    slogan: '자기주도 AI 대화의 두 컨텍스트 — 메타 vs 마이크로.',
    stage: 'core', priority: 3, icon: MessageCircle,
  },
];

export const featuresByStage = {
  core: features,
};

export const stageLabel: Record<FeatureStage, string> = { core: 'Core' };
export const stageDescription: Record<FeatureStage, string> = {
  core: '풀림 Q 4개 핵심 기능',
};

export function findFeature(slug: string): Feature | undefined {
  return features.find(f => f.slug === slug);
}

/**
 * 기능 slug → 실제 진입 라우트.
 */
export function getFeatureRoute(slug: string): string {
  switch (slug) {
    case 'infinity':
    case 'exam':
      return '/q/infinity/solve';
    case 'index':
    case 'xray':
    case 'analysis':
      return '/q/analysis';
    case 'conqueror':
    case 'memory':
    case 'review':
      return '/q/review';
    case 'tutor':
    case 'coach':
    case 'talk':
      return '/q/talk';
    default:
      return '/q';
  }
}
