# 풀림 Q — F-2 모바일 카드 밀도 (차주 carry-over)

> **대응 src/ 파일** (2026-05-14 시작 시점): 변경 0개. 캡처 + 정성 판단 후 결정 PR 별도 신설.
>
> **게이트키퍼**: G1 (시각 정성 판단·밀도 기준 합의) + G4 (반응형 회귀).
>
> **출처**: [proc/archive/2026-05-13_q-carry-over-closing.md §1 F-2](../archive/2026-05-13_q-carry-over-closing.md) — 정량 기준 부재로 차주 이월. 본 plan 이 그 carry-over 의 단독 후속.

## 1. 배경 / 문제 정의

design-followup F-2 (레이아웃 밀도) 는 2026-05-12 design-audit 에서 제기됨 — 모바일 360px viewport 에서 학생 라우트 카드 행 높이·padding·라인 높이가 시각적으로 압박감이 든다는 정성 피드백. 2026-05-13 carry-over 마감 시 advice/FaaS 명세에 **정량 기준이 없어** 차주 이월 결정.

본 plan 은 정량 기준을 새로 박는 게 아니라, **3 라우트의 모바일 카드 before/after 1쌍 캡처** 를 만들고 그 비교로 "줄일지 / 유지할지 / 단계적으로 줄일지" 정성 결정하는 것이 핵심.

## 2. 대상 라우트 (모바일 360px 만)

1. **`/q/infinity/solve`** — 풀이 중 페이지. 문제 본문 + 보기 4개 + 액션 바. 카드 padding·보기 행 높이·marked 토글 위치
2. **`/q/review`** — "지금 복습할 것" 큐 행. 1행 64px 가정 vs 실측, CTA·시간 텍스트·뱃지 정렬
3. **`/q/review/conquer`** — 정복 워크룸. 다크 톤·5문항 카드 카운터·CTA 행

## 3. 캡처 기준

### 3.1 환경

- 디바이스: Playwright `Pixel 5` (393×851) 또는 chromium 360×740 emulation
- 데이터: 풀림 Q 기본 mock (fixture 변경 없음)
- 모드:
  - `/q/infinity/solve`: free 세션, 첫 문제 진입 직후
  - `/q/review`: 큐 5개 노출 (현재 mock 기본값)
  - `/q/review/conquer`: 진입 직후 1번 문제

### 3.2 산출

`proc/research/2026-05-14_f2-mobile-density/captures-before/` 3장:
- `infinity-solve-360.png`
- `review-360.png`
- `review-conquer-360.png`

after 캡처는 후속 PR (`density-trial-A` / `B` 등) 에서 별도.

### 3.3 측정 항목 (정성 판단을 보조하는 정량)

각 캡처에서 측정:
- 카드 상하 padding (px)
- 행 (또는 보기) 사이 gap (px)
- 1 viewport (740px 높이) 안에 보이는 카드 / 행 / 보기 수
- 텍스트 line-height vs font-size 비율

표로 정리 → `proc/research/2026-05-14_f2-mobile-density/measurements.md`

## 4. 결정 기준 (정성 판단 게이트)

캡처 + 측정 자료를 G1 에게 제시. 3 후보:

- **(a) 유지** — 현재 밀도가 모바일 360 에서 학생 친화적. 별도 후속 작업 없이 plan 닫음.
- **(b) 단계적 감소** — 라우트별 padding·gap 1단계(`p-4` → `p-3` 또는 `gap-3` → `gap-2`) 감소 후 비교 PR.
- **(c) 전면 감소** — 3 라우트 모두 한 번에 밀도 강화 + 캡처 회귀.

각 후보의 트레이드오프:
- (a): 작업 0, 단 design-audit F-2 가 영구 미닫힘
- (b): PR 3건 분산, 라우트별 개별 판단 가능
- (c): PR 1건, 정성 차이가 강해야 정당화. 자칫 정보 밀도 과부하

## 5. 작업 단계

### 5.1 캡처 (오늘 또는 다음 작업일)

- [ ] e2e 또는 `qa-design-capture` 변형으로 3장 캡처 — viewport 360×740 chromium
- [ ] 측정 표 작성 (§3.3)
- [ ] PR `chore/q-f2-density-capture` 머지 — research 디렉토리만

### 5.2 G1 정성 판단 (캡처 후)

- [ ] G1 에게 캡처 + 측정 표 + 3 후보 제시
- [ ] 후보 (a) / (b) / (c) 결정 → 본 plan §6 결과 절 채움
- [ ] 후보 (b) / (c) 면 후속 PR 명·범위 확정 후 본 plan 닫음 (`[x]` + 사유)

### 5.3 후속 (선택)

후보 (b) / (c) 결정 시:
- 별도 plan `2026-MM-DD_q-f2-density-apply.md` 신설 또는 본 plan 안에 §7 절 추가
- 후속 PR `feat/q-mobile-card-density-{routes}` 머지 + after 캡처 + 회귀 e2e

## 6. 결과 (캡처 후 채움)

- 캡처: (TBD)
- 측정 표: (TBD)
- G1 판단: (a) / (b) / (c) 중 (TBD)
- 후속 plan 또는 PR: (TBD)

## 7. 비범위 (이번 plan)

- 데스크탑 1280px 카드 밀도 — 본 plan 은 모바일 360 전용
- 타이포 토큰 (`text-sm` → `text-xs` 등) — 밀도 ≠ 활자, 활자는 별도 plan
- 다크 모드 카드 밀도 — `/q/review/conquer` 외 다크 톤 라우트 없음, 본 plan 은 라이트 기준

## 8. 위험과 완화

- **위험**: G1 가용성 — 캡처 후 정성 판단을 받는 데 시간이 걸려 plan 이 다시 carry-over 가능.
  - 완화: 캡처는 단독 PR 로 먼저 머지 (G1 응답 대기 무관). 판단은 비동기.
- **위험**: 모바일 360 가 현실의 최저선 보다 좁아서 (현실은 375~414 가 다수) 과도한 우려 가능.
  - 완화: 380·414 추가 캡처를 §5.1 후속 단계에서 1쌍씩만 (정성 판단 시 G1 가 요구할 때만).
