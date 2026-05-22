# 풀림 Q — 모바일 AI 1st-class 진입점 (BottomNav 5탭 통합)

> **상위 의사결정**: [proc/research/2026-05-18_coach-fab-occlusion/send-draft.md](../research/2026-05-18_coach-fab-occlusion/send-draft.md) §7 — G4 잠정 락인 C (안2 단기 유지 + 안1 별도 plan 본격)
>
> **게이트키퍼**: G4 (UI 톤·정보 hierarchy) + G1 (BottomNav 4→5탭 구조 변경 정책)
>
> **상태**: 잠정 락인 직후 작성. G4 회신 도착 시 §0에서 확정/철회 결정.

## 0. 진행 현황

### 0.1 잠정 락인 진입 (2026-05-20)

- 2026-05-18 PR #50 안2 (44×44 icon-only) 머지 완료 — 모바일 점유 6238→2288 px² (-63%)
- 안1 (BottomNav 5번째 슬롯 통합) 측정값 0 px² 우월하나 BottomNav 4→5탭 구조 변경 비용으로 단기 보류
- 2026-05-20 G4 잠정 락인 C 적용 — 본 plan 진입은 결정됐으나 구현은 G4 회신 도착 후 정식 결정
- 2026-05-22 G4 8일차 미회신 → CONVENTION §6.C 룰 C 발동, §0.2 "미회신 (6일차+) C" 분기 적용. **1단계 stub PR #85 머지**: nav-config `studentBottomTabs` 5번째 슬롯 `풀림 AI` (Sparkles icon, matchPrefix `['/q/talk']`) + CoachFab `hidden md:flex` (모바일 완전 비노출, 데스크탑 라벨 pill 유지). 2단계(/q/talk onboarding) · 3단계(데스크탑 FAB 위치 재조정)는 G4 회신 도착 시 재합의.

### 0.2 G4 회신 분기 처리

| G4 회신 | 본 plan 처리 |
|---|---|
| A (안2 유지) | 본 plan §1~§6 보류, §0에 회신 + 사유 backfill 후 마감 |
| B (안1 즉시 전환) | 본 plan §1~§6 즉시 진입 + 안2 revert PR(coach-fab.tsx) 동반 |
| C (단계 분리, 잠정 락인 정식 합의) | 본 plan §1~§6 단계적 진입, 안2는 §6 시점까지 유지 |
| 미회신 (6일차+) | C 잠정 락인 그대로 — 본 plan §1만 1단계 stub 머지 (룰 6.C 첫 단계 머지 원칙) — **2026-05-22 8일차 적용, PR #85 머지** |

## 1. 배경 / 문제 정의

`src/components/coach/coach-fab.tsx` 가 모바일 viewport (360×740) 에서 우측 하단 44×44 면적을 점유. 안2 적용 후도 마지막 카드 우측 일부 가림 (2288 px²). 동시에 모바일 AI 진입점이 데스크탑 라벨 pill 대비 어포던스 약화 — "AI에게 묻기" 텍스트 라벨이 모바일에서 사라져 첫 진입 학습 비용 발생.

**안1 채택 시 해소 효과**:
- 모바일 점유 0 px² 보장
- AI 진입점이 BottomNav 1탭(5번째 슬롯)으로 승격 → 모바일에서 학생이 "AI에게 묻기" 위치를 4탭 다른 탭과 동등하게 인지
- 데스크탑은 기존 라벨 pill 유지(`md:` 분기) → 진입 동선 일관성

## 2. 가정 (반드시 통과)

| 항목 | 가정값 | 설계 함의 |
|---|---|---|
| BottomNav 탭 수 | 4 → 5 (모바일) | `nav-config.ts` 5번째 슬롯 정의 |
| AI 탭 라벨 | "AI에게 묻기" 또는 "풀림 AI" | i18n key 확정 필요 |
| AI 탭 라우트 | `/q/talk` (현 Q Talk 도메인 재활용) | 별도 라우트 신설 vs 기존 talk 흡수 결정 |
| 데스크탑 표시 | BottomNav 자체 `md:hidden` (이미 셸 구조) → 데스크탑은 FAB 또는 사이드바 진입 | `coach-fab.tsx`에서 `md:` 가시 분기 명시 |
| 활성 표시 | 현 `/q/talk` 진입 시 5번째 탭 강조 | `BottomNav` `aria-current` 동일 패턴 |
| 모바일 폭 | 360px (최저) | 5탭이 360px에 맞는지 — 1탭=72px, 5탭 360 = 그대로 OK |

## 3. 단계 분할

### 3.1 1단계 — nav-config 5번째 슬롯 정의 + coach-fab `md:` 가시 분기

- `src/components/shell/nav-config.ts` — 5번째 슬롯 "풀림 AI" 추가 (route `/q/talk`, icon Sparkles 또는 BrainCircuit)
- `src/components/shell/bottom-nav.tsx` — 4탭 가정 grid 클래스 → 5탭 grid-cols-5
- `src/components/coach/coach-fab.tsx` — 모바일(`<md:`)에서 `hidden`, 데스크탑(`md:`)에서만 노출
- mock fixture / nav-config 정합성 검증

### 3.2 2단계 — 진입 시 AI Talk 환영 onboarding (1회성)

- `/q/talk` 신규 진입 학생용 1회성 setup hint — BottomNav 5번째 탭 클릭 첫 1초 동안 카드 가시
- localStorage `q-talk-onboarded` 플래그
- 별도 PR

### 3.3 3단계 — 데스크탑 FAB 위치 조정 + 사이드바 통합 검토

- 데스크탑에서 FAB가 모바일 BottomNav 1탭화로 인해 단독 fallback이 됨 → 사이드바 메뉴에 흡수할지 별도 검토
- 별도 plan으로 분리 가능

## 4. 컴포넌트·파일 변경

- [src/components/shell/nav-config.ts](../../src/components/shell/nav-config.ts) — 5번째 슬롯 정의
- [src/components/shell/bottom-nav.tsx](../../src/components/shell/bottom-nav.tsx) — `grid-cols-4` → `grid-cols-5`
- [src/components/coach/coach-fab.tsx](../../src/components/coach/coach-fab.tsx) — 모바일 hide
- (선택) `src/app/(student)/q/talk/page.tsx` — 1회성 onboarding (2단계)

## 5. 검증

- **정적**: `bunx tsc --noEmit && bun run lint && bun run build`
- **시각·동작 (라이브)**: `bun dev` (포트 3031) → 모바일 360px viewport에서:
  - BottomNav 5탭 정렬 깨지지 않음 (1탭당 72px)
  - FAB가 모바일에서 보이지 않음 (마지막 카드 우측 가림 0)
  - `/q/talk` 진입 시 5번째 탭 `aria-current="page"`
  - 데스크탑 1280px에서 FAB 라벨 pill 유지

## 6. 비범위 (별도 plan)

- AI 탭 자체 콘텐츠 재설계 (현 `/q/talk` UI 그대로 유지)
- 데스크탑 FAB 사이드바 통합 (3단계로 분리)
- BottomNav 4→5탭 변경에 따른 학생 학습 비용 측정 (별도 UX audit 항목)

## 7. 위험과 완화

- **위험**: 4탭 → 5탭 변경이 학생에게 갑작스러움.
  - 완화: 첫 진입 시 1회성 onboarding tooltip (2단계). 또한 5번째 탭만 Sparkles 등 시각적 차별화로 "새 탭 알림" 자연 인지.
- **위험**: 360px 1탭=72px 좁아짐.
  - 완화: 현재 4탭=90px에서 5탭=72px로 줄어드는 정도. icon-only 또는 label 짧게 조정. iOS/Android 표준 BottomNav 5탭 70~80px 라인 안.
- **위험**: G4 회신 미도착 시 §0.2 "C 잠정 락인 + 1단계 stub 머지"가 또 룰 C 발동.
  - 완화: 룰 C 발동은 임계 초과 시 정당화된 진입. 1단계 stub만 머지하고 2~3단계는 G4 회신 도착 시 재합의.
