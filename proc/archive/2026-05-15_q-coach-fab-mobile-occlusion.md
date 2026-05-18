# 풀림 Q — CoachFab 모바일 점유 해소

> **대응 src/ 파일**: [src/components/shell/coach-fab.tsx](../../src/components/shell/coach-fab.tsx) (전면 수정 또는 일부 라우트 hide) + 안1 선택 시 [src/components/shell/nav-config.ts](../../src/components/shell/nav-config.ts) · [src/components/shell/bottom-nav.tsx](../../src/components/shell/bottom-nav.tsx) 동반 수정.
>
> **게이트키퍼**: G4 (모바일 IA·BottomNav 회귀) + G1 (5번째 슬롯 카피·진입 동선 합의 시).
>
> **출처**: 2026-05-14 UX audit (C1) — `proc/research/2026-05-14_ux-audit/findings.md`. 본 plan 은 daily_outcome 2026-05-15 09:30 약속에 따른 단독 후속.
>
> **상태**: ✅ 마감 — G4 안2 결정, PR #50 머지 (2026-05-18).
>
> **carry-over 추적**: [2026-05-18_daily-rollup.md](../plan/2026-05-18_daily-rollup.md) §1 — §4.1 자료 산출 마감(캡처 18장 + 측정표), G4 송부 대기.

## 1. 배경 / 문제 정의

`/Users/curea/dev_git/pullim-Q/src/components/shell/coach-fab.tsx` 의 `fixed right-4 bottom-20` 위치가 모바일 360 viewport 에서 6개 학생 라우트의 마지막 카드 우측을 가린다.

영향 라우트 (2026-05-14 UX audit 캡처 30장 중 모바일 360 발췌):
- `/q` — Q 홈 마지막 카드
- `/q/infinity` — 무한풀기 진입 카드 마지막 행
- `/q/analysis` — 분석 카드 마지막 슬롯
- `/q/review` — "지금 복습할 것" 큐 마지막 행
- `/q/analysis/diagnose` — 진단 단계 카드 마지막 행
- `/q/onboarding` — 온보딩 마지막 진입 CTA

FAB 본인은 학습 집중 화면(`/q/talk`, `/q/infinity/solve`, `/q/review/conquer`) 에서만 hide 처리되어 있어, 위 6개 라우트에서는 카드와 FAB 이 우측 하단에서 시각/터치 점유 충돌.

## 2. 후보안 (G4 선택)

### 안1 — BottomNav 5번째 슬롯에 "코치" 통합 + FAB 데스크탑 전용

- `nav-config.ts` `studentBottomTabs` 의 `/me` 5번째 슬롯을 `/q/talk` (라벨 "코치" 또는 "AI", icon `Sparkles`) 로 교체. 내정보(`/me`) 는 AppHeader/사이드바 동선으로 옮김.
- `coach-fab.tsx` 에 `hidden md:flex` (모바일 hide, 데스크탑 전용) 처리.
- 모바일에서는 BottomNav 5탭 안에서 코치 진입, 데스크탑에서는 우측 하단 FAB 유지.

**Pros**: 모바일에서 FAB 완전 제거 → 6개 라우트 카드 가림 0. BottomNav 가 AI 동선의 1st-class 진입점 → AI 발견율 ↑.
**Cons**: `/me` 슬롯 이동 → 내정보 진입 동선 변경 (사용자 학습 비용 1회). nav IA 변경이라 G1 카피 합의 필요.

### 안2 — 모바일 icon-only 44×44 축소

- `coach-fab.tsx` 의 라벨 "AI에게 묻기" 텍스트를 모바일에서 hide (`hidden md:inline` on span)
- 사이즈 `h-13` → 모바일에서 `h-11 w-11` (44×44), 데스크탑에서 기존 유지
- 위치는 `fixed right-4 bottom-20` 유지

**Pros**: 변경 범위 작음 (`coach-fab.tsx` 만). nav IA 무변경 → G1 합의 불필요. FAB 유지로 진입 동선 일관.
**Cons**: FAB 점유가 줄어들 뿐 0 이 되진 않음 (44px 가림 여전). 라벨 텍스트 손실로 발견율 ↓ 가능.

## 3. 결정 보조 자료 (AI 우선 위임)

- [x] 6개 라우트 모바일 360 캡처 3종 변형 → [proc/research/2026-05-18_coach-fab-occlusion/captures/](../research/2026-05-18_coach-fab-occlusion/captures/) 18장 (PR #49)
- [x] 정량 측정: 가린 픽셀 영역 (FAB 그대로 6238px² / 44×44 2288px² / 제거 0px²)
- [x] 비교표 → [measurements.md](../research/2026-05-18_coach-fab-occlusion/measurements.md) 산출

자료 산출은 plan 결정과 분리. G4 결정 전 자료 제출 → G4 가 자료 기반으로 안 택일.

## 4. 작업 단계

### 4.1 자료 산출 (오늘 — G4 결정 전)
- [x] 6개 라우트 모바일 360 캡처 3 변형 — [proc/research/2026-05-18_coach-fab-occlusion/captures/](../research/2026-05-18_coach-fab-occlusion/captures/) (18장, `scripts/qa-coach-fab-occlusion-2026-05-18.mjs`)
- [x] 측정 표 + 비교 단락 작성 — [measurements.md](../research/2026-05-18_coach-fab-occlusion/measurements.md): FAB 그대로 평균 6238px²(2.34%) / 44×44 2288px²(0.86%) / 제거 0px²
- [x] G4 송부 + 안2 결정 회신 (PM 송부, 2026-05-18 오후)

### 4.2 G4 결정 후 (이번 plan 의 정의된 완료선)

**G4 가 안1 선택 시** (안2 채택으로 비범위):
- [x] ~~`nav-config.ts` `studentBottomTabs` 5번째 슬롯 교체~~ — 안2 채택, 미수행. 안1 IA 변경은 별도 "모바일 AI 1st-class 진입점" plan 후보로 분리
- [x] ~~`coach-fab.tsx` 에 `hidden md:flex` 추가~~ — 안2 채택, 미수행
- [x] ~~e2e `q-spacing.spec.ts` BottomNav 5탭 라벨 회귀~~ — 안2 채택, 미수행
- [x] ~~base=dev PR 머지~~ — 안2 채택, 미수행 (PR #50 은 안2 으로 머지)

**G4 가 안2 선택 시**:
- [x] `coach-fab.tsx` 라벨 hide + 44×44 축소 — 모바일 `h-[44px] w-[44px]` icon-only, desktop `md:h-[52px] md:w-auto md:px-4` + 라벨 `md:inline` 복원. inline `style={{ height: 52 }}` 제거 → Tailwind arbitrary values 로 통일
- [x] 측정 회귀: `scripts/qa-coach-fab-occlusion-2026-05-18.mjs` 의 `fab-44` 변형이 실제 구현과 동일한 DOM (44×44 + 텍스트 hide) 을 모사 → 2288px² 측정값 그대로 사실 반영
- [x] base=dev PR 머지 (PR #50)

**G4 응답 지연**: 본 plan 본문 §5 에 "결정 대기 중" 명시 + 익일 이월. PR 미생성.

## 5. 결정 로그

- 2026-05-15 — plan 신설. G4 응답 대기. 자료 산출은 본 plan 결정 무관하게 오늘 선행.
- 2026-05-18 — §4.1 자료 산출 마감(캡처 18장 + 측정표). §3 캡처 경로 `2026-05-15_…` → `2026-05-18_…` 정정. G4 송부 대기.
- 2026-05-18 (오후) — **G4 안2 결정**. 사유: lead time 짧음(coach-fab.tsx 1파일), nav IA 안전, 가린 면적 -63%. 안1(BottomNav 5번째 슬롯 통합)은 별도 "모바일 AI 1st-class 진입점" plan 으로 분리. PR #50 머지.

## 6. 클로저 (2026-05-18)

- ✅ §4.1 자료 산출 (캡처 18장 + measurements.md) PR #49 머지
- ✅ §4.2 안2 분기 PR #50 머지 — 모바일 44×44 icon-only, 데스크탑 pill 유지, aria-label 보존
- ❌ §4.2 안1 분기 — G4 안2 채택으로 비범위. 안1 (BottomNav 5번째 슬롯 통합) 은 별도 plan 후보 (`2026-MM-DD_q-mobile-ai-first-class-entry.md`)
- 후속: occlusion 자체는 -63% 로 해결. 카드 우측 가림 완전 0 이 필요한 시점이 오면 별도 plan 으로 안1 재검토
