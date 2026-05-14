'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { AlertTriangle } from 'lucide-react';
import { useSolveSessionStore } from '@/lib/store/solve-session-store';

type LeaveGuardContextValue = {
  /** 가드가 활성일 때 (풀이 중) true, 아니면 false */
  isActive: () => boolean;
  /** 가드 통과 후 router.push 또는 router.replace 트리거 */
  confirmNavigate: (href: string, opts?: { replace?: boolean }) => void;
};

const Ctx = createContext<LeaveGuardContextValue | null>(null);

export function useLeaveGuard(): LeaveGuardContextValue {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useLeaveGuard outside LeaveGuardProvider');
  return ctx;
}

/**
 * 풀이 중 페이지 이탈 가드.
 *
 * plan: proc/plan/2026-05-13_solve-resume-and-leave-guard.md §3 분기 3
 * - 앱 내 nav 클릭: GuardedLink 가 confirmNavigate 호출 → dialog → 확인 시 push
 * - 브라우저 뒤로가기: popstate 1차 차단 + dialog
 * - 탭 닫기 / 새로고침: beforeunload (브라우저 기본 confirm)
 */
export function LeaveGuardProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const inProgress = useSolveSessionStore((s) => s.inProgress);
  const [open, setOpen] = useState(false);
  const pending = useRef<{ href: string; replace?: boolean } | null>(null);
  const popstateBlocked = useRef(false);

  const isActive = useCallback(() => inProgress, [inProgress]);

  const confirmNavigate = useCallback(
    (href: string, opts?: { replace?: boolean }) => {
      if (!inProgress) {
        if (opts?.replace) router.replace(href);
        else router.push(href);
        return;
      }
      pending.current = { href, replace: opts?.replace };
      setOpen(true);
    },
    [inProgress, router],
  );

  const handleStay = useCallback(() => {
    pending.current = null;
    setOpen(false);
  }, []);

  const handleLeave = useCallback(() => {
    const target = pending.current;
    pending.current = null;
    setOpen(false);
    if (!target) return;
    if (target.replace) router.replace(target.href);
    else router.push(target.href);
  }, [router]);

  // beforeunload — 탭 닫기 / 새로고침
  useEffect(() => {
    if (!inProgress) return;
    function handler(e: BeforeUnloadEvent) {
      e.preventDefault();
      e.returnValue = '';
    }
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [inProgress]);

  // popstate — 브라우저 뒤로가기 1차 차단 + dialog
  useEffect(() => {
    if (!inProgress) {
      popstateBlocked.current = false;
      return;
    }
    // 가드 활성 시 history 에 더미 state 1회 push — 뒤로가기 1회는 dummy 만 빠짐
    window.history.pushState({ __pullimGuard: true }, '');
    popstateBlocked.current = true;

    function handler() {
      if (!popstateBlocked.current) return;
      // 한번 더 dummy 를 push 해서 뒤로가기 직전 위치 유지
      window.history.pushState({ __pullimGuard: true }, '');
      pending.current = { href: '__back__' };
      setOpen(true);
    }
    window.addEventListener('popstate', handler);
    return () => window.removeEventListener('popstate', handler);
  }, [inProgress]);

  const handleLeaveOrBack = useCallback(() => {
    const target = pending.current;
    pending.current = null;
    setOpen(false);
    if (!target) return;
    if (target.href === '__back__') {
      popstateBlocked.current = false;
      window.history.back();
      return;
    }
    if (target.replace) router.replace(target.href);
    else router.push(target.href);
  }, [router]);

  const value = useMemo<LeaveGuardContextValue>(
    () => ({ isActive, confirmNavigate }),
    [isActive, confirmNavigate],
  );

  return (
    <Ctx.Provider value={value}>
      {children}
      <Dialog open={open} onOpenChange={(o) => !o && handleStay()}>
        <DialogContent className="max-w-xs">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <span className="bg-pullim-warn-bg text-pullim-warn inline-flex h-9 w-9 items-center justify-center rounded-xl">
                <AlertTriangle className="h-4 w-4" />
              </span>
              <div className="min-w-0">
                <DialogTitle className="text-pullim-slate-900 text-base font-bold tracking-tight">
                  풀이 중이에요
                </DialogTitle>
                <DialogDescription className="text-pullim-slate-600 mt-0.5 text-xs">
                  나가면 진행 상태가 저장돼요
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <p className="text-pullim-slate-700 text-sm leading-relaxed">
            지금까지 푼 문항이 자동 저장돼서, 다시 들어왔을 때 이어풀기 카드로 복귀할 수 있어요.
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleStay}
              className="border-pullim-slate-200 text-pullim-slate-700 hover:bg-pullim-slate-50 flex-1 inline-flex items-center justify-center rounded-xl border px-3 py-2.5 text-sm font-semibold"
            >
              계속 풀기
            </button>
            <button
              type="button"
              onClick={handleLeaveOrBack}
              className="bg-pullim-blue-600 text-white hover:bg-pullim-blue-700 flex-1 inline-flex items-center justify-center rounded-xl px-3 py-2.5 text-sm font-bold"
            >
              나가기
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </Ctx.Provider>
  );
}

/**
 * 가드를 통과하는 Next.js Link 래퍼.
 * 풀이 중이 아닐 땐 Link 와 동일, 풀이 중이면 dialog 게이트.
 */
type GuardedLinkProps = Omit<React.ComponentProps<typeof Link>, 'href' | 'replace'> & {
  href: string;
  replace?: boolean;
  children: ReactNode;
};

export function GuardedLink({
  href,
  replace,
  onClick,
  children,
  ...rest
}: GuardedLinkProps) {
  const { isActive, confirmNavigate } = useLeaveGuard();
  return (
    <Link
      {...rest}
      href={href}
      onClick={(e) => {
        onClick?.(e);
        if (e.defaultPrevented) return;
        if (!isActive()) return; // 가드 비활성 — Link 기본 동작
        e.preventDefault();
        confirmNavigate(href, { replace });
      }}
    >
      {children}
    </Link>
  );
}
