/**
 * 풀림 Q 도메인 메타 (단일 도메인).
 */

import type { LucideIcon } from 'lucide-react';
import { BookOpen } from 'lucide-react';

export type DomainStatus = 'live' | 'coming-soon';

export type Domain = {
  slug: 'q';
  name: string;
  tagline: string;
  slogan: string;
  status: DomainStatus;
  icon: LucideIcon;
  childSlugs: string[];
};

export const domains: Domain[] = [
  {
    slug: 'q',
    name: '풀림 Q',
    tagline: '문제 풀이·분석·복습·AI 대화 통합',
    slogan: '풀고, 분석하고, 복습하고, 묻는다 — 학습 사이클 한 곳.',
    status: 'live',
    icon: BookOpen,
    childSlugs: ['infinity', 'talk', 'analysis', 'review'],
  },
];

export function findDomain(slug: string): Domain | undefined {
  return domains.find(d => d.slug === slug);
}

export function getDomainRoute(_slug: Domain['slug']): string {
  return '/q';
}

/** 풀림 생태계 외부 도메인 — Q와 크로스 진입 */
export type ExternalDomain = {
  key: 'studio' | 'store';
  name: string;
  /** 실제 도메인 호스트 미정 — placeholder 라우트 */
  href: string;
  external: boolean;
};

export const PULLIM_DOMAINS: Record<'studio' | 'store', ExternalDomain> = {
  studio: { key: 'studio', name: '풀림 스튜디오', href: '/q/external/studio', external: true },
  store:  { key: 'store',  name: '풀림 스토어',   href: '/q/external/store',  external: true },
};
