# 풀림 Q — 섹션 간격 토큰화 + e2e 가드

> **대응 src/ 파일** (2026-05-14 working tree, 11 files + e2e):
> - 토큰: [src/app/globals.css](../../src/app/globals.css) §--spacing-section / --spacing-section-heading 추가, [src/lib/tokens/index.ts](../../src/lib/tokens/index.ts) `pullimSpacing` export 추가
> - 컴포넌트: [src/components/shell/section-heading.tsx](../../src/components/shell/section-heading.tsx) `mb-3` → `mb-section-heading`
> - 라우트 7개 (top-level wrapper `space-y-5|6` → `space-y-section`):
>   - [src/app/(student)/q/page.tsx](../../src/app/(student)/q/page.tsx) (`space-y-6` → token)
>   - [src/app/(student)/q/infinity/page.tsx](../../src/app/(student)/q/infinity/page.tsx)
>   - [src/app/(student)/q/talk/page.tsx](../../src/app/(student)/q/talk/page.tsx)
>   - [src/app/(student)/q/analysis/page.tsx](../../src/app/(student)/q/analysis/page.tsx)
>   - [src/app/(student)/q/analysis/diagnose/page.tsx](../../src/app/(student)/q/analysis/diagnose/page.tsx) (2 지점)
>   - [src/app/(student)/q/review/page.tsx](../../src/app/(student)/q/review/page.tsx)
>   - [src/app/(student)/q/review/conquer/page.tsx](../../src/app/(student)/q/review/conquer/page.tsx)
> - e2e: [playwright.config.ts](../../playwright.config.ts) 신규 + [e2e/q-spacing.spec.ts](../../e2e/q-spacing.spec.ts) 신규 + 스냅샷 4장
> - 의존성: package.json `@playwright/test` devDep + `test:e2e`·`test:e2e:update` 스크립트, bun.lock 동반, .gitignore `playwright-report/test-results/.cache` 추가
>
> **게이트키퍼**: G4 (FE 시각 회귀·e2e 스냅샷 baseline 합의).

## 1. 배경 / 문제 정의

어제(2026-05-13)까지 풀림 Q 학생 라우트 7개의 최상위 wrapper 가 `space-y-5` (5 라우트) / `space-y-6` (1 라우트 — `/q`) 로 **불일치**. `SectionHeading` 내부 `mb-3` (12px) 까지 합치면 페이지마다 섹션 첫 카드 위 여백이 들쭉날쭉. 시각적으로:

- `/q` 홈은 살짝 더 헐겁고(`space-y-6` = 24px)
- 나머지는 빡빡(`space-y-5` = 20px)
- 섹션 헤딩과 첫 카드 사이 `mb-3` (12px) 가 페이지 내 큰 간격(20·24px)보다 작아서 헤딩이 콘텐츠에 붙음 → 위계 약함

본 plan은 (a) 페이지 최상위 섹션 간격 1.5rem (24px) (b) 섹션 헤딩 → 콘텐츠 간격 1rem (16px) 두 값으로 통일하고, **토큰**으로 박아 회귀를 e2e 로 가드한다. 토큰 값 자체 결정은 `/q` 홈의 `space-y-6` 을 기준선으로 채택 (이미 가장 쾌적했던 페이지).

## 2. 토큰 정의

[src/app/globals.css](../../src/app/globals.css) `@theme` 블록 안에 신규:

```css
/* 섹션 리듬 — 페이지 최상위 섹션 간격 / 섹션 헤딩 → 콘텐츠 간격 */
--spacing-section: 1.5rem;          /* 24px — page.tsx 최상위 space-y */
--spacing-section-heading: 1rem;    /* 16px — SectionHeading 하단 mb */
```

[src/lib/tokens/index.ts](../../src/lib/tokens/index.ts) 에 `pullimSpacing` 객체 동기 export — JS 측에서도 같은 값을 참조할 수 있게.

Tailwind 4 `@theme` 가 `--spacing-section` 을 `space-y-section`·`mb-section-heading` 유틸로 자동 매핑하므로 별도 plugin 불필요.

## 3. 적용 범위 (이번 plan)

### 3.1 최상위 페이지 wrapper (7 라우트)

| 파일 | 변경 |
|---|---|
| `src/app/(student)/q/page.tsx` | `space-y-6` → `space-y-section` |
| `src/app/(student)/q/infinity/page.tsx` | `space-y-5` → `space-y-section` |
| `src/app/(student)/q/talk/page.tsx` | `space-y-5` → `space-y-section` |
| `src/app/(student)/q/analysis/page.tsx` | `space-y-5` → `space-y-section` |
| `src/app/(student)/q/analysis/diagnose/page.tsx` | `space-y-5` → `space-y-section` (인트로·결과 2 지점) |
| `src/app/(student)/q/review/page.tsx` | `space-y-5` → `space-y-section` |
| `src/app/(student)/q/review/conquer/page.tsx` | `space-y-5` → `space-y-section` |

### 3.2 SectionHeading

[src/components/shell/section-heading.tsx](../../src/components/shell/section-heading.tsx) wrapper `mb-3` → `mb-section-heading`. 모든 페이지의 섹션 헤딩이 한 번에 16px 로 통일됨 (개별 페이지 수정 불필요).

### 3.3 범위 밖 (Out of scope)

- 카드 내부 `space-y-*` 또는 `gap-*` — 본 plan은 **페이지 최상위**와 **섹션 헤딩** 두 지점만
- 온보딩 / `[questionId]` 디테일 라우트 — 학생 메인 라우트 7개에 한정. 후속 sweep 가능
- 모바일·데스크탑 폭별 차등 (예: `sm:space-y-section`) — 현재 1.5rem 단일값으로 충분, 차등은 향후 결정

## 4. e2e 가드

### 4.1 부트스트랩

- `@playwright/test@^1.59.1` devDependency
- `package.json` scripts: `test:e2e`·`test:e2e:update`
- `playwright.config.ts`:
  - `baseURL: http://localhost:3031` (풀림 Q dev 포트 — MEMORY [feedback_dev_port_3031])
  - `webServer: bun run dev` (reuseExistingServer=local)
  - `expect.toHaveScreenshot.maxDiffPixelRatio: 0.01`
  - chromium 단일 프로젝트 (cross-browser 는 후속)

### 4.2 첫 spec

[e2e/q-spacing.spec.ts](../../e2e/q-spacing.spec.ts) — 4 라우트(`/q/infinity`, `/q/talk`, `/q/analysis`, `/q/review`) 각각:

1. `div.space-y-section` 첫 매치의 첫 두 자식 사이 실측 픽셀 갭이 24px (±1px) 인지 검증
2. `fullPage` 스크린샷 baseline 캡처 (snapshots 디렉토리에 4장)

### 4.3 baseline 스냅샷

`e2e/q-spacing.spec.ts-snapshots/` 디렉토리에 chromium 1280×720 4장. 본 PR 머지 시 baseline 으로 박힘. 향후 시각 회귀 발생 시 diff 0.01 초과면 fail.

## 5. 검증

### 5.1 정적

```
bunx tsc --noEmit && bun run lint && bun run build
```

### 5.2 e2e

```
bun run test:e2e
```

4/4 pass + 스냅샷 일치.

### 5.3 수동 (라이브)

`bun dev` (포트 3031) → `/q`, `/q/infinity`, `/q/talk`, `/q/analysis`, `/q/review`, `/q/review/conquer`, `/q/analysis/diagnose` 7 라우트 — 섹션 간격이 24px 로 일관, 섹션 헤딩 → 첫 카드 간격이 16px 로 동일한지 시각 확인.

## 6. PR 분할

본 plan 은 **단일 PR** 로 머지. 토큰·라우트·e2e·의존성이 한 cohesive 변경 (e2e 가 토큰을 검증하는 구조). PR 명: `chore/q-section-spacing-tokens` 또는 `feat/q-section-spacing-tokens`.

기존 5개 plan (color-saturation-rebalance, analysis-visual-redesign, review-priority-queue, solve-resume, curea-deep-dialog) 과 파일 중복:
- `q/analysis/page.tsx` ↔ analysis-visual-redesign — 본 plan 머지 후 진입
- `q/review/page.tsx` ↔ review-priority-queue — 본 plan 머지 후 진입
- `q/review/conquer/page.tsx` ↔ curea-deep-dialog (`?patternId=` 시그니처) — 본 plan 머지 후 진입

따라서 본 plan 이 **base** — 시각 plan들의 의존선상에 둠.

## 7. 위험과 완화

- **위험**: 토큰 값 1.5rem / 1rem 이 일부 페이지에서 어색할 수 있음.
  - 완화: `/q` 홈은 이미 `space-y-6` (1.5rem) 사용해서 검증됨. 나머지 6 라우트는 +4px 증가로 큰 시각 변화 아님.
- **위험**: e2e baseline 이 chromium 1280×720 에 묶여서 다른 viewport 회귀 못 잡음.
  - 완화: 본 plan 은 e2e **부트스트랩** 만. mobile·tablet viewport 는 후속 spec 으로.
- **위험**: `space-y-section` 이 Tailwind 4 의 `@theme` arbitrary spacing scale 외래어 — IDE auto-complete 미지원 가능.
  - 완화: tokens/index.ts 에 typed export 동기 유지 + 코드 내 사용처는 7곳 한정이라 grep 으로 추적 충분.

## 8. 명세 반영

본 변경 머지 후 [proc/spec/08-design-system.md](../spec/08-design-system.md):

- §14.1 "Layer 1 베이스라인" 절에 "페이지 최상위 섹션 간격 = `--spacing-section` (24px)" 1줄 추가
- §14 신규 소절 "14.4 섹션 리듬 토큰" — `--spacing-section` / `--spacing-section-heading` 2 값 정의

## 9. 다음 한 걸음

1. 본 PR 머지 → spacing baseline 박힘
2. 5 plan 중 `q/analysis/page.tsx` / `q/review/page.tsx` / `q/review/conquer/page.tsx` 건드리는 plan 진입 시 본 토큰을 그대로 사용

## 10. 클로저 (2026-05-18)

- ✅ **PR #33** (`98e5e82` 풀림 Q feat — 섹션 간격 토큰화 + e2e 가드 부트스트랩) 머지로 모든 §3 적용 범위 + §4 e2e + §2 토큰 + §3.2 SectionHeading 통일 완료
- ✅ 검증: `--spacing-section: 1.5rem` / `--spacing-section-heading: 1rem` 토큰 [src/app/globals.css:116-117](../../src/app/globals.css#L116-L117) 존재. [e2e/q-spacing.spec.ts](../../e2e/q-spacing.spec.ts) baseline 박힘
- 후속 base 역할: PR #33 머지 후 `q/analysis` (PR #41) / `q/review` (PR #46) / `q/review/conquer` (PR #47·#48·#50) 모두 본 토큰 자연 사용
