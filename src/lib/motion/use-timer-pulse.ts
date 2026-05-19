/**
 * M3 — 타이머 ≤30s pulse.
 * 입력 remainingSeconds에 따라 className 반환. 30s 이하면 pulse + live.fg.
 * 마지막 10s는 진동(navigator.vibrate)도 권장 (호출부에서 별도 처리).
 */
export function useTimerPulse(remainingSeconds: number) {
  const isUrgent = remainingSeconds <= 30 && remainingSeconds > 0;
  const isCritical = remainingSeconds <= 10 && remainingSeconds > 0;

  return {
    isUrgent,
    isCritical,
    className: isUrgent
      ? 'animate-timer-pulse text-pullim-danger-fg font-mono'
      : 'font-mono text-pullim-slate-900',
  };
}
