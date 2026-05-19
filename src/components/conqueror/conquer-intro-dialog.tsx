'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Sparkles, Clock, Target, Repeat } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { ErrorPattern } from '@/lib/mock';

// v1 suffix — 다이얼로그 내용·정책 변경 시 키 bump 해서 새 안내가 다시 노출되게.
const DISMISS_KEY = 'pullim.q.conquer.intro.v1.dismissed';

function isDismissed(): boolean {
  if (typeof window === 'undefined') return false;
  return window.localStorage.getItem(DISMISS_KEY) === '1';
}

function setDismissed() {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(DISMISS_KEY, '1');
}

/**
 * CUREA DEEP "패턴 맞춤 5문제" 진입 전 안내 다이얼로그.
 *
 * plan: proc/plan/2026-05-13_curea-deep-pre-route-explainer-dialog.md
 * - 첫 진입은 강제 노출, "다음부터 보지 않기" 체크 시 그 이후 skip.
 * - 라우팅은 다이얼로그 "시작하기" 버튼에서만 (`/q/review/conquer?patternId=`).
 * - ESC / × / 백드롭 클릭 / "취소" 버튼 모두 close 만 (이동 X).
 * - 데스크탑·모바일 모두 중앙 모달 (Sheet 변형 안 함).
 * - Default focus = "취소" (실수 진입 방지 — §11.1 친절).
 */
export function ConquerIntroDialog({ pattern }: { pattern: ErrorPattern }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [dontShow, setDontShow] = useState(false);
  const cancelRef = useRef<HTMLButtonElement>(null);

  const onTriggerClick = useCallback(() => {
    if (isDismissed()) {
      router.push(`/q/review/conquer?patternId=${pattern.id}`);
      return;
    }
    setOpen(true);
  }, [router, pattern.id]);

  // 다이얼로그 오픈 시 default focus = "취소" 버튼
  useEffect(() => {
    if (!open) return;
    const t = window.setTimeout(() => cancelRef.current?.focus(), 0);
    return () => window.clearTimeout(t);
  }, [open]);

  const handleStart = useCallback(() => {
    if (dontShow) setDismissed();
    setOpen(false);
    router.push(`/q/review/conquer?patternId=${pattern.id}`);
  }, [dontShow, router, pattern.id]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <button
        type="button"
        onClick={onTriggerClick}
        className="bg-pullim-blue-600 text-white hover:bg-pullim-blue-700 mt-2 inline-flex min-h-9 items-center gap-1 rounded-full px-3 py-1.5 text-[11px] font-bold transition-colors"
      >
        <Sparkles className="h-3 w-3" />
        패턴 맞춤 5문제 정복 시작
      </button>

      <DialogContent className="max-w-sm">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <span className="bg-pullim-blue-50 text-pullim-blue-600 inline-flex h-9 w-9 items-center justify-center rounded-xl">
              <Target className="h-4 w-4" />
            </span>
            <div className="min-w-0">
              <DialogTitle className="text-pullim-slate-900 text-base font-bold tracking-tight">
                정복 모드 시작
              </DialogTitle>
              <DialogDescription className="text-pullim-slate-600 mt-0.5 text-xs">
                {pattern.name}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <ul className="space-y-2 text-sm leading-relaxed">
          <li className="text-pullim-slate-700 flex items-start gap-2">
            <Repeat className="text-pullim-blue-500 mt-0.5 h-4 w-4 shrink-0" aria-hidden />
            <span>5문항 연속 풀이 — 중간에 멈추고 이어 풀 수 있어요</span>
          </li>
          <li className="text-pullim-slate-700 flex items-start gap-2">
            <Sparkles className="text-pullim-warn mt-0.5 h-4 w-4 shrink-0" aria-hidden />
            <span>3회 연속 정답이면 패턴 정복 스탬프</span>
          </li>
          <li className="text-pullim-slate-700 flex items-start gap-2">
            <ArrowRight className="text-pullim-blue-500 mt-0.5 h-4 w-4 shrink-0" aria-hidden />
            <span>결과는 분석·복습·플래너에 바로 반영돼요</span>
          </li>
        </ul>

        <div className="text-pullim-slate-500 inline-flex items-center gap-1 text-xs">
          <Clock className="h-3 w-3" aria-hidden />
          소요 시간 약 5~8분
        </div>

        <label className="text-pullim-slate-600 flex items-center gap-2 text-xs cursor-pointer select-none">
          <input
            type="checkbox"
            checked={dontShow}
            onChange={(e) => setDontShow(e.target.checked)}
            className="accent-pullim-blue-600 h-3.5 w-3.5"
          />
          다음부터 같은 안내 보지 않기
        </label>

        <div className="flex gap-2">
          <button
            ref={cancelRef}
            type="button"
            onClick={() => setOpen(false)}
            className="border-pullim-slate-200 text-pullim-slate-700 hover:bg-pullim-slate-50 flex-1 inline-flex items-center justify-center rounded-xl border px-3 py-2.5 text-sm font-semibold"
          >
            취소
          </button>
          <button
            type="button"
            onClick={handleStart}
            className="bg-pullim-blue-600 text-white hover:bg-pullim-blue-700 flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl px-3 py-2.5 text-sm font-bold"
          >
            시작하기
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
