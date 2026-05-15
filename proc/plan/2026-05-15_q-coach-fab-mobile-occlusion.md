# 풀림 Q — CoachFab 모바일 점유 해소

> **대응 src/ 파일**: [src/components/shell/coach-fab.tsx](../../src/components/shell/coach-fab.tsx) (전면 수정 또는 일부 라우트 hide) + 안1 선택 시 [src/components/shell/nav-config.ts](../../src/components/shell/nav-config.ts) · [src/components/shell/bottom-nav.tsx](../../src/components/shell/bottom-nav.tsx) 동반 수정.
>
> **게이트키퍼**: G4 (모바일 IA·BottomNav 회귀) + G1 (5번째 슬롯 카피·진입 동선 합의 시).
>
> **출처**: 2026-05-14 UX audit (C1) — `proc/research/2026-05-14_ux-audit/findings.md`. 본 plan 은 daily_outcome 2026-05-15 09:30 약속에 따른 단독 후속.
>
> **상태**: ⏸ G4 결정 대기. 결정 시까지 PR 미생성, 미결정 시 익일 이월.

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

- [ ] 6개 라우트(`/q`, `/q/infinity`, `/q/analysis`, `/q/review`, `/q/analysis/diagnose`, `/q/onboarding`) 모바일 360 캡처 — CoachFab **있을 때 / 없을 때 / 44×44 축소 시** 3종 변형
- [ ] 캡처별 정량: 가린 픽셀 영역, 마지막 카드 CTA 가시성, 라벨 도달성
- [ ] 비교표 산출 → `proc/research/2026-05-15_coach-fab-occlusion/measurements.md`

자료 산출은 plan 결정과 분리. G4 결정 전 자료 제출 → G4 가 자료 기반으로 안 택일.

## 4. 작업 단계

### 4.1 자료 산출 (오늘 — G4 결정 전)
- [ ] 6개 라우트 모바일 360 캡처 3 변형
- [ ] 측정 표 + 비교 단락 작성
- [ ] G4 에게 자료 + 안1/안2 트레이드오프 제출

### 4.2 G4 결정 후 (이번 plan 의 정의된 완료선)

**G4 가 안1 선택 시**:
- [ ] `nav-config.ts` `studentBottomTabs` 5번째 슬롯 교체 + `/me` 동선 이전 위치 확정 (G1 합의 1턴)
- [ ] `coach-fab.tsx` 에 `hidden md:flex` 추가
- [ ] e2e `q-spacing.spec.ts` 가 BottomNav 5탭 라벨 변경에 의존하지 않는지 회귀 확인
- [ ] base=dev PR 머지

**G4 가 안2 선택 시**:
- [ ] `coach-fab.tsx` 라벨 hide + 44×44 축소
- [ ] 모바일 360 캡처 회귀 (가린 픽셀 측정)
- [ ] base=dev PR 머지

**G4 응답 지연**: 본 plan 본문 §5 에 "결정 대기 중" 명시 + 익일 이월. PR 미생성.

## 5. 결정 로그

- 2026-05-15 — plan 신설. G4 응답 대기. 자료 산출은 본 plan 결정 무관하게 오늘 선행.
