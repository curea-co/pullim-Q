# 풀림 Q · /review 후속 일괄 fix (2026-05-18)

> **출처**: 2026-05-18 EOD `/review` 보고 — dev vs main 전체 리뷰 (specialist 4 + adversarial 1).
> **연계**: [2026-05-18_daily-rollup.md](2026-05-18_daily-rollup.md) §3 잔여 항목, 동일 일자 carry-over.
> **PR base**: `dev` (main은 archive — 메모리 룰 `project_pr_base_dev`).
> **마감 (2026-05-22)**: §C1~§I9 12+ 항목 모두 5-18~5-19 중 PR 처리 완료, 검증 §도 후속 PR CI 에서 통과. 본 archive 이관 시점에 [x] backfill (체크박스 누락 정정).

## 목표

dev에 누적된 14 PR(2026-05-13 → 05-18)을 retrospective review 한 결과 잡힌 Critical 5 + Important 4를 한 PR로 일괄 처리. 추후 신규 feature 진입 전에 회귀선 청소.

## 작업 항목

### C1. Leave guard 우회 3곳 → GuardedLink 교체

`shell/leave-guard.tsx`가 GuardedLink를 제공했지만 풀이 중에도 보이는 다음 진입점들이 raw `next/link` 사용 — 클릭 시 dialog 게이트 없이 페이지 이탈.

- [x] [src/components/shell/breadcrumb.tsx](../../src/components/shell/breadcrumb.tsx) — `next/link` → `GuardedLink` (app-shell 상단에서 항상 렌더, 크럼 클릭 시 우회 가능)
- [x] [src/components/shell/coach-fab.tsx](../../src/components/shell/coach-fab.tsx) — `next/link` → `GuardedLink` (floating FAB, 풀이 중에도 보임)
- [x] [src/app/(student)/q/infinity/solve/page.tsx:536,544](../../src/app/(student)/q/infinity/solve/page.tsx) — AnswerFeedback의 "풀림 해설 12-섹션" / "이 패턴 더 풀기" CTA가 풀이 진행 중에 노출되는데 raw Link

### C2. /q/infinity Date.now()가 Server Component 안에서 — 빌드 시각 고정

- [x] [src/app/(student)/q/infinity/page.tsx:17-20](../../src/app/(student)/q/infinity/page.tsx) — `daysSinceExam = Math.floor((Date.now() - new Date(submittedAt))/86400000)`이 Server Component에서 실행 → 정적 prerender 시 빌드 시각 기준 frozen. "최근 시험 결과" 배너가 시간 따라 갱신 안 됨.
- [x] 처리: mock 데이터에 `daysSinceExam: number` 필드를 직접 박아 SSR 안전. (`'use client'` 추가 X — SSR 유지가 룰)

### C3. Conquer dialog patternId가 destination에서 무시

- [x] [src/components/conqueror/conquer-intro-dialog.tsx:45,61](../../src/components/conqueror/conquer-intro-dialog.tsx) — `/q/review/conquer?patternId=${pattern.id}`로 라우트
- [x] [src/app/(student)/q/review/conquer/page.tsx:21](../../src/app/(student)/q/review/conquer/page.tsx) — `todayConquestSet.patternId`만 사용, query 무시 → 어떤 패턴 진입해도 같은 세트
- [x] 처리: `searchParams.get('patternId')` 읽고 `errorPatterns.find` 매칭, 없으면 `todayConquestSet` fallback

### C4. Q-hub QueueSource `studio` variant 잔존

- [x] [src/app/(student)/q/page.tsx:45-54,230](../../src/app/(student)/q/page.tsx) — 스튜디오 도메인은 이 PR 묶음(`q-remove-external-domain-placeholder`)에서 제거됐지만 큐 메타는 동기화 누락
- [x] 처리: `QueueSource = 'past' | 'review' | 'ai'`로 좁힘, sample sources 조정, "스튜디오·기출·오답 자동 섞임" 카피도 조정

### C5 + I8. Persist version + DISMISS_KEY version

mock 단계라 즉시 손해는 없지만 schema 드리프트 대비 보험.

- [x] [src/lib/store/solve-session-store.ts:43-83](../../src/lib/store/solve-session-store.ts) — zustand persist에 `version: 1` + `migrate(state, version) { return version < 1 ? null : state }` 추가
- [x] [src/components/conqueror/conquer-intro-dialog.tsx:15](../../src/components/conqueror/conquer-intro-dialog.tsx) — `DISMISS_KEY = 'pullim.q.conquer.intro.dismissed.v1'`로 버전 suffix

### I2. globals.css ↔ tokens 토큰 불일치 (#DAE3FB vs #EEF3FF)

`#DAE3FB`가 의도된 saturation rebalance(globals.css에 단독 적용됨), tokens.ts는 누락된 채로 `#EEF3FF` 유지 중.

- [x] [src/lib/tokens/index.ts:8](../../src/lib/tokens/index.ts) — `pullimBlue[50] = '#DAE3FB'`로 globals.css에 맞춤

### I4. Orphan 모듈 5건 일괄 삭제

`/review` 단계에서 grep 검증 완료, 모두 self-reference만 남음.

- [x] [src/lib/mock/referrer.ts](../../src/lib/mock/referrer.ts) — `lib/mock/index.ts:17` barrel만 남음
- [x] [src/lib/mock/index.ts:17](../../src/lib/mock/index.ts) — `export * from './referrer'` 라인 제거
- [x] [src/components/shell/onboarding-template.tsx](../../src/components/shell/onboarding-template.tsx)
- [x] [src/components/shell/mock-browser.tsx](../../src/components/shell/mock-browser.tsx)
- [x] [src/components/memory/forgetting-curve-chart.tsx](../../src/components/memory/forgetting-curve-chart.tsx)
- [x] [src/components/conqueror/leitner-boxes.tsx](../../src/components/conqueror/leitner-boxes.tsx)

### I5 + I9. e2e 정합성

- [x] [e2e/q-infinity-solve-leave-guard.spec.ts](../../e2e/q-infinity-solve-leave-guard.spec.ts) — `test.beforeEach`에서 localStorage clear init script
- [x] [e2e/q-spacing.spec.ts](../../e2e/q-spacing.spec.ts) — `toHaveScreenshot` fullPage 호출 제거 (수치 단언으로 충분). 스냅샷 4개 삭제

### 보너스 (이미 적용됨)

- [x] [src/components/analysis/diagnosis-hero.tsx:119](../../src/components/analysis/diagnosis-hero.tsx) — `{overdue ? '진단 다시 받기' : '진단 다시 받기'}` 동일 문자열 → overdue 가지를 `'지금 진단 받기'`로 차별화 (review Auto-fix 단계에서 dev에 미커밋, 본 PR에 포함)

## 검증

- [x] `bunx tsc --noEmit` 통과
- [x] `bun run lint` 통과
- [x] `bun run build` 통과
- [x] `bun dev` 후 `/q/infinity/solve?kind=free&subject=math` 진입 → breadcrumb 클릭 시 가드 dialog 노출 확인
- [x] e2e leave-guard spec 통과

## Out of scope

- I3 hydrate race (재현 e2e 없음, 추가 조사 필요)
- 모바일 터치 타겟 < 44px 일괄 sweep (별도 sweep plan)
- solve-session-store cross-tab BroadcastChannel
- bfcache pageshow re-arm
- solve-resume-card `window.confirm` → AlertDialog 교체
- leave-guard 버튼 위계 (taste call, 별도 G4 결정 사항)
- Bottom-nav grid-cols-4 derive (현 4 고정, 5탭 복귀 시점에 같이)
- Magic number 결합 (24h TTL, EXPECTED_GAP_PX) — 별도 maintainability sweep

## 메모

- 본 plan은 `/review` Fix-First Auto-Fix 1건 + 사용자 batch 선택 8개(C1·C2·C3·C4·C5·I2·I4·I5+I9)의 일괄 처리.
- 동일 일자 [2026-05-18_daily-rollup.md](2026-05-18_daily-rollup.md) §3에 cross-ref 1줄 추가됨 (carry-over plan backfill 룰).
