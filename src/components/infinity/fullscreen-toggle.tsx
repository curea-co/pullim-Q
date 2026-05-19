'use client';

import { useEffect, useState, useCallback } from 'react';
import { Maximize2, Minimize2 } from 'lucide-react';

/**
 * 풀스크린 모드 토글 — spec 04 §6.7.2 풀이 캔버스 명세.
 * `F` 키로 토글 (또는 버튼 클릭), `Esc`로 해제.
 * 풀스크린 시 사이드바·헤더 숨김 (data attribute로 부모가 감지).
 *
 * 사용:
 *   <FullscreenToggle isOn={isFs} onToggle={setIsFs} />
 *   {isFs && <style>{`body{--shell-chrome-display:none}`}</style>}  // 부모에서
 */
export function FullscreenToggle({
  isOn,
  onToggle,
}: {
  isOn: boolean;
  onToggle: (next: boolean) => void;
}) {
  const handleToggle = useCallback(() => onToggle(!isOn), [isOn, onToggle]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      // 입력 필드에서는 비활성
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;

      if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        handleToggle();
      } else if (e.key === 'Escape' && isOn) {
        e.preventDefault();
        onToggle(false);
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [handleToggle, isOn, onToggle]);

  return (
    <button
      type="button"
      onClick={handleToggle}
      aria-label={isOn ? '풀스크린 해제 (F)' : '풀스크린 모드 (F)'}
      title={isOn ? '풀스크린 해제 (F)' : '풀스크린 모드 (F)'}
      className="text-pullim-slate-600 hover:text-pullim-blue-600 hover:bg-pullim-blue-50 inline-flex h-8 w-8 items-center justify-center rounded-lg transition-colors"
    >
      {isOn ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
    </button>
  );
}
