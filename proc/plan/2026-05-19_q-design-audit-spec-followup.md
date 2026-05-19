# 풀림 Q · design audit SPEC followup (2026-05-19)

> **출처**: [input/design-system/](../../input/design-system/) (DESIGN_SYSTEM.md / IMPROVEMENTS.md / private-q.md / tokens.json), [input/q/private/](../../input/q/private/) audit (일자 2026-05-19).
> **선행**: SPEC 변경 4파일 ([00-index](../spec/00-index.md), [04-ux-flow](../spec/04-ux-flow.md), [07-branding](../spec/07-branding.md), [08-design-system](../spec/08-design-system.md)) 작성 완료 — uncommitted. PR-1로 commit.
> **PR base**: 모두 `dev` (project memory `project_pr_base_dev.md`).
> **병행 작업**: [2026-05-19 BE Ph3 read endpoints](2026-05-19_q-be-ph3-read-endpoints.md) — 본 plan과 독립 (BE 트랙).

## 목표

audit 결과로 도출된 5개 PR을 순차 머지해 SPEC ↔ 코드 정합 회복. PR-1(spec) → PR-2~5(코드 변경) 의존성 순서.

## PR 묶음

### PR-1 — `chore/q-spec-design-audit-2026-05-19` (코드 변경 0)

- [ ] 새 브랜치 `chore/q-spec-design-audit-2026-05-19` (base=dev) 분기
- [ ] SPEC 변경 4파일 stage + commit
  - [proc/spec/00-index.md](../spec/00-index.md) — 2026-05-19 변경 이력 항목
  - [proc/spec/04-ux-flow.md](../spec/04-ux-flow.md) — §6.2.1 3페이즈, §6.7 Solve, §6.8 복습 3-bucket
  - [proc/spec/07-branding.md](../spec/07-branding.md) — §5.3 해설 라벨 영↔한 매핑
  - [proc/spec/08-design-system.md](../spec/08-design-system.md) — §1.1 교차 참조 / §1.2.1 slate-400 / §1.3.1 AA 분리 / §3.4.1 금지 사이즈 / §4.3 radius 축약 / §10.1·10.3 모션 / §12.1.1 :focus-visible
- [ ] `input/design-system/`, `input/q/` 폴더 commit (audit 산출물 영구 보존)
- [ ] push + `gh pr create --base dev`
- [ ] 검증: spec 안 cross-link 깨지지 않는지 grep

### PR-2 — `chore/q-a11y-color-aa`

> SPEC §1.3.1·§1.2.1 → globals.css 반영.

- [ ] 새 브랜치 `chore/q-a11y-color-aa` (base=dev)
- [ ] [src/app/globals.css](../../src/app/globals.css) 시맨틱 토큰 fg/bg/cta-bg 분리
  - `--color-pullim-warn-fg: #B7791F` (텍스트용)
  - `--color-pullim-warn-cta-bg: #D97706` (CTA 배경, 흰글자 위 AA)
  - `--color-pullim-success-fg: #0E8C56` (기존 #12B26B는 bg 페어에서만)
  - `--color-pullim-danger-fg: #C03B3F` (기존 #E5484D는 큰 라벨·뱃지에서만)
- [ ] `pullim-slate-400` (#97A0B4) <14px 사용처 grep
  ```
  rg -n "pullim-slate-400|#97A0B4" src/ --type tsx --type ts
  ```
  - 메타/캡션 <14px 케이스 → `pullim-slate-500` (#6B7489) 치환
- [ ] warn 버튼 흰글자 케이스 grep → `bg-pullim-warn-cta-bg`
  ```
  rg -n "(bg-pullim-warn|#F59E0B)" src/components src/app | grep -i "white\|on-bg\|text-white"
  ```
- [ ] `bunx tsc --noEmit && bun run lint && bun run build`
- [ ] `bun dev` → `/qa` 라이브 검증 (warn 버튼·메타 텍스트 시각 회귀 0)
- [ ] PR description에 before/after 캡처 첨부

### PR-3 — `feat/q-motion-tokens-and-utils`

> SPEC §10.1·§10.3 → 토큰 + 유틸 신설. 적용은 PR-4에서.

- [ ] 새 브랜치 `feat/q-motion-tokens-and-utils` (base=dev)
- [ ] [src/app/globals.css](../../src/app/globals.css) motion 토큰 추가
  - `--motion-duration-fast: 120ms`
  - `--motion-duration-base: 200ms`
  - `--motion-duration-slow: 320ms`
  - `--motion-easing-standard: cubic-bezier(0.4, 0, 0.2, 1)`
  - `--motion-easing-emphasis: cubic-bezier(0.2, 0.8, 0.2, 1)`
- [ ] `src/lib/motion/` 신설
  - `index.ts` — duration/easing 상수 export
  - `use-correct-answer-reveal.ts` (M1)
  - `use-wrong-answer-shake.ts` (M2)
  - `use-timer-pulse.ts` (M3)
  - `use-count-up.ts` (M4)
  - `use-stagger.ts` (M5)
  - `use-streak-bump.ts` (M6)
  - `use-mastery-shimmer.ts` (M7)
  - `accordion-phase.ts` (M8 — Solve/Explain 해설 페이즈 토글)
  - `use-hint-slide.ts` (M9)
  - `use-break-modal.ts` (M10)
- [ ] `prefers-reduced-motion` 룰 (§10.3.1)
- [ ] `bunx tsc --noEmit && bun run lint && bun run build`
- [ ] PR description에 motion 동작 GIF (있으면)

### PR-4 — `feat/q-solve-canvas` (PR-3 의존)

> SPEC §6.7 → /q/infinity/solve 라우트 풀이 캔버스 실제 구현.

- [ ] PR-3 머지 확인 후 새 브랜치 `feat/q-solve-canvas` (base=dev)
- [ ] `src/components/infinity/solve/` 디렉토리 (또는 기존 컴포넌트 확장)
  - `solve-canvas.tsx` — 컨테이너 (top bar / stem / choices / bottom action)
  - `solve-top-bar.tsx` — sticky, 나가기 + 진행 + 타이머(M3) + 메뉴
  - `solve-stem.tsx` — KaTeX 렌더 (`react-katex`)
  - `solve-choice-card.tsx` — radio card 64h, 선택 시 brand.50+border-2 brand-600
  - `solve-bottom-action.tsx` — 북마크/신고/힌트(M9) + Primary CTA
  - `solve-fullscreen-toggle.tsx` — `F`키 hook, ESC 해제
- [ ] `/q/infinity/solve/page.tsx` 라우트 가드
  - 카테고리 픽커 fallback 유지 (기존 동작)
  - `?topic=` 또는 `?block=` 딥링크 시 캔버스 렌더
- [ ] M1/M2/M3/M9 적용 (PR-3 유틸 사용)
- [ ] a11y: 선지 키보드 네비 ↑↓ / 숫자키 / Enter 제출 / Space 토글
- [ ] 모바일 hit-area ≥ 44px 검증
- [ ] `bunx tsc --noEmit && bun run lint && bun run build`
- [ ] `bun dev` → `/qa` 라이브 검증 (desktop + mobile + 시험모드 + 풀스크린)
- [ ] PR description에 before(빈 카테고리 화면) / after(풀이 캔버스) 캡처 첨부

### PR-5 — `chore/q-radius-3-tier`

> SPEC §4.3 → 9단계 → 14/20/pill 축약. 마지막 처리 (시각 회귀 가장 큼).

- [ ] PR-4 머지 확인 후 새 브랜치 `chore/q-radius-3-tier` (base=dev)
- [ ] `rounded-2xl` (18px) 사용처 grep → `rounded-xl` (20px) 또는 `rounded-lg` (14px)
  ```
  rg -n "rounded-(2xl|3xl|4xl)" src/
  ```
  - section card 67회 → `rounded-xl` (20px, hierarchy 정상화)
- [ ] `rounded-3xl` (22px), `rounded-4xl` (26px) 잔재 0건 확인
- [ ] `radius-2xl/3xl/4xl` CSS custom property 자체는 일단 보존 (deprecation 단계, Ph2에서 제거)
- [ ] `bunx tsc --noEmit && bun run lint && bun run build`
- [ ] `bun dev` → `/qa` 라이브 검증 (시각 회귀 확인 — card·CTA·chip 일관성)
- [ ] PR description에 5장 비교 캡처 (홈/infinity/analysis/review/talk)

## 검증 매트릭스

각 PR 공통:

- [ ] `bunx tsc --noEmit` 통과
- [ ] `bun run lint` 통과
- [ ] `bun run build` 통과
- [ ] 라이브 캡처(`/qa`) 회귀 0건
- [ ] `gh pr create --base dev` (memory `project_pr_base_dev.md`)
- [ ] PR description에 출처 spec 절·검증 캡처

## 디자인 결정

- **단일 plan 사용 vs PR별 분리**: 5개 PR이 같은 audit 출처에서 파생되므로 단일 plan 안에서 추적. 각 PR 머지 시 해당 섹션 체크박스 갱신.
- **base=dev 일관**: BE Ph3 같은 stacking PR과 무관. FE는 dev에서 직접 분기.
- **input/{design-system,q} 폴더 처리**: read-only audit input. PR-1에 함께 commit (영구 보존).
- **토큰 즉시 삭제 vs deprecate**: radius 2xl/3xl/4xl은 CSS 변수 자체는 PR-5에서 보존 (코드 사용 0건 후 별도 Ph2 PR에서 제거). 시각 회귀 안전망.

## Out of scope

- 3앱 통합 디자인 시스템 패키지화 (`@pullim/design-tokens` 등) — 별도 워크스페이스 결정
- Planner/Classbot 도메인 audit 결과 — 본 워크스페이스(풀림 Q 단독)에 도메인 부재
- BE Ph3+ read/write endpoint 후속 — 별도 trace([2026-05-19 BE Ph3 plan](2026-05-19_q-be-ph3-read-endpoints.md))
- Explain 페이지 3페이즈 묶음 구현 — Solve 캔버스 + 데이터 (Ph4 write) 확보 후 별도 PR

## 메모

- PR-1만 SPEC 변경 단독 — 다른 PR과 conflict 없음
- PR-2 a11y 컬러는 시각 미세 변화 (warn 버튼 색 한 톤 darken) — 디자인 의도 회귀 0 확인 필요
- PR-4 Solve 캔버스는 BE Ph4 write endpoint(채점/제출)와 page 됨 — 본 PR은 mock 기반 UI만, 데이터 wiring은 Ph7
- PR-5 radius 축약은 시각 충격이 가장 큼 — 단일 PR로 묶고 review 단계에서 라이브 비교
