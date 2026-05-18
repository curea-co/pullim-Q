'use client';

import { GuardedLink as Link } from './leave-guard';
import { Sparkles } from 'lucide-react';
import { usePathname } from 'next/navigation';

/**
 * 풀림 AI 대화 진입 FAB.
 * 모든 학생 화면에 떠 있어 코치(메타) / 튜터(한 문제) 두 모드 한 곳으로 진입.
 * AI 대화 화면 자체에서는 숨김.
 */
export function CoachFab() {
  const pathname = usePathname();
  // 학습 집중형 화면에서는 inline 코치/튜터 패널이 이미 있어 FAB 중복 → 숨김
  if (pathname.startsWith('/q/talk')) return null;
  if (pathname.startsWith('/q/infinity/solve')) return null;
  if (pathname.startsWith('/q/review/conquer')) return null;

  return (
    <Link
      href="/q/talk"
      aria-label="풀림 AI에게 질문하기"
      className="bg-pullim-blue-500 hover:bg-pullim-blue-600 shadow-pullim-accent fixed right-4 bottom-20 z-40 flex h-[44px] w-[44px] items-center justify-center rounded-full text-white transition-all md:h-[52px] md:w-auto md:gap-2 md:bottom-6 md:px-4 md:text-sm md:font-semibold"
    >
      <Sparkles className="h-4 w-4" />
      <span className="hidden md:inline">AI에게 묻기</span>
    </Link>
  );
}
