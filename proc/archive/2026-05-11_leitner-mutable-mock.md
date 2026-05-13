# Leitner 박스 이동 시뮬레이션 — mock 가변화

## 목표
오답 재풀이(`?kind=retry&sku=`)에서 정답 처리 시 해당 SKU의 Leitner 카드가 실시간으로 다음 박스로 이동하는 모습을 보이게 한다. 현재 `leitnerCards`가 static const라 풀이 후에도 화면이 변하지 않아 정복 진행 피드백 부재.

## 작업 항목

### 1. mock 가변화 인프라
- [x] [src/lib/store/leitner-store.ts](src/lib/store/leitner-store.ts) 신규 — zustand store `useLeitnerStore`. seed는 [src/lib/mock/conqueror.ts](src/lib/mock/conqueror.ts) `leitnerCards` 의 deep copy
- [x] `applyResult(sku: string, correct: boolean): { prevBox, newBox, isMaster } | null` (정답 → box+1, BOX 5는 stays; 오답 → BOX 1 복귀; streak/attempts/nextReviewInHours/lastResult 갱신)
- 컨벤션 변경: plan 초안의 `window.__pullim` 글로벌 hook 대신 **zustand store** 채택. 이유: `subscriptions.ts` 컨벤션이 실제로는 미존재 + zustand가 이미 설치돼 있어 SSR/타입 안정성·React 리액티브성 양쪽 더 우월. 후속 plan(memory-retry-route)도 같은 store 패턴 차용.

### 2. retry 모드 정답 처리 연결
- [x] [src/app/(student)/q/infinity/solve/page.tsx](src/app/(student)/q/infinity/solve/page.tsx) retry 모드에서 `handleSelect` 시 첫 선택분만 `applyResult` 호출 (정/오 모두 박스 전이 적용)
- [x] AnswerFeedback에 추가 카피 — `BOX {N} → BOX {N+1} 이동` · 마스터 임박 · BOX 1 복귀 3분기

### 3. 시각 피드백
- [x] toast — 정답: `BOX N → BOX N+1 이동 · 다음 복습 {interval} 후`, 마스터 임박: `마스터 임박! BOX N → BOX 5`, 오답: `BOX N → BOX 1 복귀`
- [x] [src/app/(student)/q/review/page.tsx](src/app/(student)/q/review/page.tsx) `'use client'` 전환 + `useLeitnerStore`에서 cards 읽기. PriorityQueue·LeitnerSummary 모두 store 기반 리액티브.

### 4. 검증
- [x] `bunx tsc --noEmit && bun run lint && bun run build` 전부 exit 0
- [ ] Playwright: retry 라우트 진입 → 정답 선택 → leitner 박스 이동 toast 표시 + /q/review 복귀 시 큐 갱신 확인 (수동 브라우저 확인 예정)

## 비범위
- 실제 SRS 알고리즘(SuperMemo·FSRS)
- 박스 이동 시 nextReviewInHours 정확 계산 (data-driven 추정으로 충분)
- 부모/교사 대시보드 알림
- 백엔드 영속화

## SSOT 통합 (구현 후)
- `05-business-rules.md` — Leitner 박스 전이 규칙 명시
- `06-content-data.md` — mock 가변화 컨벤션 추가
