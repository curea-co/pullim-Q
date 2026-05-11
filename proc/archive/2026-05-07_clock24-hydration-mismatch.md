# 2026-05-07 Clock24 SVG hydration mismatch

> **상태**: 🟢 완료 (2026-05-07, 분기 A 적용 — `r()` helper로 `.toFixed(2)` 정규화 + Step 4 sweep)
> **명세 권위**: Next 16.2.4 SSR/CSR 정합 일반 규칙 (별도 spec 없음 — React 표준 hydration 가이드)
> **분류**: **컴포넌트 단독 작업** (`components/planner/clock-24.tsx` — 풀림 플래너 도메인 락인)
> **발견 경위**: 2026-05-07 어포던스/카피 plan 4종 라이브 검증 중 부수 발견. 우리 PR은 className만 변경 — Clock24 SVG path 미변경. **사전 존재 이슈**.

## 증상

`/planner/calendar`, `/planner/onboarding` 진입 시 콘솔 에러 1건:

```
A tree hydrated but some attributes of the server rendered HTML didn't match the client properties.
```

스택의 diff가 보여주는 정확한 불일치 위치 — `<svg width=280 height=280 viewBox="0 0 280 280" aria-label="24시간 학습 시계">` 안:

```
<path
  d="M 16.737014060432358 126.5005075..."   ← client
  d="M 16.737014060432372 126.5005075..."   ← server
/>
<line
  y1={29.148748315591888}                   ← client
  y1="29.148748315591874"                   ← server
/>
```

부동소수점 마지막 1~2 자리 (`...358` vs `...372`, `...888` vs `...874`)가 SSR과 CSR 사이에서 갈림. 시각적 차이는 미인식 (sub-pixel). React가 patch하지 않는다고 경고만 띄움.

## 원인 가설

`clock-24.tsx`가 SVG path/line 좌표를 계산할 때:

- `Math.cos`, `Math.sin`, `Math.atan2` 등 부동소수점 연산이 **노드 (서버) vs V8 (브라우저)** 사이에서 마지막 ULP가 다른 결과 — 알려진 IEEE 754 구현 차이
- 또는 `Date.now()` / `new Date()` 기반 (현재 시각) 좌표 회전 — 서버 시각과 클라 시각 불일치 (가장 흔함)
- 또는 24h 그라디언트의 `toFixed` 미적용으로 raw float 그대로 path attribute에 박힘

가장 유력: **각도 → `Math.cos/sin` → 좌표 변환** 경로의 마지막 자리 차이.

## 작업 항목

### Step 1: 원인 확정

- [x] `src/components/planner/clock-24.tsx` 열고 path/line attribute 생성 코드 추적 — **원인: Math.cos/sin 결과의 ULP 차이가 SVG attr 마지막 자리에 그대로 노출.** `now='18:50'` 기본값 deterministic + Date.now() 미사용 → **분기 A 확정 (부동소수점 정밀도)**.
- [x] SSR ↔ CSR inputs 동일 확인 — 입력 동일 + 결과 마지막 ULP만 차이 → IEEE 754 구현 차이 (Node V8 vs Browser V8)

### Step 2: 처리 방향 결정 (분기)

#### A. 부동소수점 정밀도 차이만이라면 (정적 입력) — **채택 ✅**
- [x] **`r()` helper 도입** — `Math.round(n * 100) / 100` 으로 소수 둘째 자리 정규화. SVG sub-pixel 무영향 (280×280 viewBox).
- [x] `arcPath()` 8 좌표 (xo0~xi1) `r()` 적용
- [x] hourTicks 24개 (x1/y1/x2/y2/lx/ly) `r()` 적용
- [x] 시계 바늘 좌표 (handX/handY) `r()` 적용
- [x] 짧은 인라인 코멘트 1줄 — IEEE 754 hint

#### B. 현재 시각 의존이라면 (동적 회전) — **N/A (Step 1에서 분기 A 확정)**
- [N/A] ~~useEffect 안 갱신~~
- [N/A] ~~dynamic SSR 비활성화~~

#### C. Recharts/제3자 라이브러리 발 차이 — **N/A (Clock24는 외부 라이브러리 미사용, 순수 SVG)**
- [N/A] ~~라이브러리 SSR 정합~~

### Step 3: 검증

- [x] `pnpm exec tsc --noEmit` 통과 (no output = 0 errors)
- [x] 라이브: `/planner/calendar`, `/planner/onboarding` 진입 시 콘솔 에러 **0건** (이전 1건씩) — Clock24 hydration 완전 해소
- [x] SVG attrs 정규화 확인 — DOM evaluate: `firstPath = "M 17.06 156.19 ..."`, `firstLine x1="140" y1="12"` 모두 `.toFixed(2)` 단위
- [x] 시각: 시계 dial 동일 렌더 캡처 — [`output/live-shots/2026-05-07_clock24-after-fix.png`](../../output/live-shots/2026-05-07_clock24-after-fix.png) (production은 stop했으므로 dev mode 캡처)
- [N/A] 다크 모드 sanity check — Clock24는 컬러 토큰 사용 (테마 자동), 좌표 정규화는 컬러 무관

### Step 4: 영향 범위 추가 audit

- [x] `grep -rln "Clock24" src --include='*.tsx'` — 사용처: `planner/views/day-view.tsx`, `planner/onboarding/page.tsx` (두 라우트 모두 위 검증에서 0 errors 확인)
- [x] 비슷한 패턴 SVG 컴포넌트 sweep — `Math.(cos|sin|atan|tan|sqrt|pow)` 사용처 2곳:
  - `src/components/planner/clock-24.tsx` (본 plan에서 fix 완료)
  - `src/components/visual/derivative-sign-sim.tsx` — `Math.sqrt` 사용. 라이브 `/library/visual/math-derivative-sign` 콘솔 errors 0건, warnings 0건 → **정합** (`'use client'` + `useState` 패턴이라 hydration 시점 SSR-fallback 동일 입력 보장됨). **fix 불필요.**
  - `week-grid.tsx`, `burnout-card.tsx`, `step-content.tsx` 등 plan 비고에 언급된 후보들 — Math 함수 미사용 (grep 0건) → 잠재 risk 없음. **추가 plan 불필요.**

## 락인 규칙

편집 OK: `src/components/planner/clock-24.tsx` (단독)
편집 가능 부수: 위 컴포넌트가 의존하는 헬퍼 (있을 시 `lib/planner/*` 류). 사용자 명시 확인 필요.
편집 금지: 다른 도메인, shell, ui primitives

## 우선순위 (당시)

**P3** — 기능 정상, 사용자 시각 무영향 (sub-pixel), 콘솔 경고만이었으나, 같은 세션 내 캡처 검증 phase와 자연스레 묶여 즉시 처리됨.

## 비고

- 2026-05-07 plan 4종 (어포던스 + 카피)에 무관한 사전 존재 이슈로 확인. 그 PR들 모두 라이브 검증 통과 + 본 issue 미규정.
- React 19 / Next 16에서는 `suppressHydrationWarning` prop을 path/line에 박는 우회도 가능하지만 **근본 원인 회피라 비권장** — `r()` 정규화로 깔끔하게 해소.
- Step 4 sweep 결과 `week-grid.tsx`/`burnout-card.tsx`/`step-content.tsx`에는 Math.cos/sin 등 미사용 → 비고에서 제기한 잠재 risk는 없음으로 확정.
- `derivative-sign-sim.tsx`는 `Math.sqrt` 사용하지만 `'use client'` + `useState` 패턴 → SSR fallback과 hydration 입력 동일 → 실측 hydration error 0건. fix 불필요.

## 범위 외

- React/Next 자체 hydration 메커니즘 보강 — 우리 영역 아님
- Clock24 디자인 변경 — 본 plan은 hydration 정합만
- 다른 SVG 컴포넌트 일괄 정밀도 정규화 — 별도 sweep plan 후보 (Step 4 결과 따라)

## 커밋 메시지 후보

`fix(planner): clock24 SVG coords precision for SSR hydration`
