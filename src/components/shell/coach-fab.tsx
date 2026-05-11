'use client';

import Link from 'next/link';
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
      className="bg-pullim-blue-500 hover:bg-pullim-blue-600 fixed right-4 bottom-20 z-40 flex h-13 items-center gap-2 rounded-full px-4 text-sm font-semibold text-white shadow-lg shadow-blue-500/30 transition-all hover:shadow-blue-500/50 md:bottom-6"
      style={{ height: 52 }}
    >
      <Sparkles className="h-4 w-4" />
      AI에게 묻기
    </Link>
  );
}
