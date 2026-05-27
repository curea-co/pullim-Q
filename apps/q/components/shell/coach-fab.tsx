'use client';

import { GuardedLink as Link } from './leave-guard';
import { Sparkles } from 'lucide-react';
import { usePathname } from 'next/navigation';

/**
 * 풀림 AI 대화 진입 FAB.
 * 데스크탑(`md:`)에서만 노출 — 모바일은 BottomNav 5번째 슬롯 "풀림 AI" 가 1st-class 진입점.
 * AI 대화 화면 + 학습 집중형 화면(inline 패널 중복) 에서는 데스크탑도 숨김.
 *
 * mobile-ai-1st-class plan §3.1 1단계 stub (2026-05-22 G4 룰 C 발동).
 */
export function CoachFab() {
  const pathname = usePathname();
  if (pathname.startsWith('/q/talk')) return null;
  if (pathname.startsWith('/q/infinity/solve')) return null;
  if (pathname.startsWith('/q/review/conquer')) return null;

  return (
    <Link
      href="/q/talk"
      aria-label="풀림 AI에게 질문하기"
      className="bg-pullim-blue-500 hover:bg-pullim-blue-600 shadow-pullim-accent fixed right-4 bottom-6 z-40 hidden h-[52px] items-center justify-center gap-2 rounded-full px-4 text-sm font-semibold text-white transition-all md:flex"
    >
      <Sparkles className="h-4 w-4" />
      <span>AI에게 묻기</span>
    </Link>
  );
}
