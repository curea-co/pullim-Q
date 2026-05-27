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
