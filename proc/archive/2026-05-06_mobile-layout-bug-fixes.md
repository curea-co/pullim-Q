# 2026-05-06 모바일 레이아웃 버그 수정

> **상태**: ✅ **완료** (2026-05-06)
> **검증**: mobile 375x812 라이브 재캡처 → before/after diff 5건 confirmed
> **결과 캡처**: [output/live-shots/mobile-02-q-hub-after.png](../../output/live-shots/mobile-02-q-hub-after.png) · [mobile-03-infinity-home-after.png](../../output/live-shots/mobile-03-infinity-home-after.png) · [mobile-04-infinity-solve-after.png](../../output/live-shots/mobile-04-infinity-solve-after.png) · [mobile-08-analysis-ability-after.png](../../output/live-shots/mobile-08-analysis-ability-after.png) · [mobile-11-review-home-after.png](../../output/live-shots/mobile-11-review-home-after.png)
> **콘솔 에러**: 0건 (Recharts width warning만 — 기존 사항, 본 PR 범위 외)

## 목표

라이브 검증(`output/live-shots/mobile-*.png`)에서 발견된 **모바일(<768px) 레이아웃 버그 5종**을 모두 수정. 디자인 시스템 [Layer 1 베이스라인](../spec/08-design-system.md#L361)의 `white-space: nowrap`, 터치 타겟 ≥44pt, 본문 ≥16px, 카드 간격 ≥12px 룰을 위반하지 않도록 정리.

이 plan은 **순수 버그 수정** 범위. 디자인 패턴 위반(헤더 과밀, nav 이중화 등)은 별도 plan ([2026-05-06_density-pattern-fixes-comfortable.md](2026-05-06_density-pattern-fixes-comfortable.md)) 참조.

## 작업 항목

### Bug-1: 풀이 화면 토글 텍스트 세로 깨짐

- [x] **위치**: `/q/infinity/solve` (Compact 375px 기준)
- [x] **컴포넌트**: `src/components/infinity/` (mode-toggle 또는 picker 컴포넌트)
- [x] **증상**: "연습 모드"/"시험 모드" 토글 안 텍스트가 `연/습/모/드` 한 글자씩 세로로 끊어짐
- [x] **원인 추정**: 토글 컨테이너에 `flex` + 자동 wrap, 자식 텍스트에 `nowrap` 미설정. 내부 padding이 폭을 압박.
- [x] **수정 방향**:
  - 토글 안 텍스트에 `white-space: nowrap` 추가 (Layer 1 룰)
  - Compact bracket에서 토글이 한 줄에 안 들어가면 **세로 스택**으로 전환 (가로 한 줄 강요 X)
- [x] **검증**: 375px / 414px / 480px에서 토글 텍스트 1줄 또는 깨끗한 2줄. 캡처 비교.
- [x] **참고 캡처**: [output/live-shots/mobile-04-infinity-solve.png](../../output/live-shots/mobile-04-infinity-solve.png)

### Bug-2: Q허브 "오답 정복하기" 버튼 카드 침범

- [x] **위치**: `/q` (Q 허브, Compact)
- [x] **컴포넌트**: 풀이 큐 카드 또는 "지금" 알럿 카드 (`src/components/study/today-action-cards.tsx` 또는 `src/components/conqueror/`)
- [x] **증상**: 카드 내 "오답 정복하기" 버튼이 카드 영역 우측 경계를 넘어서 **다음 카드 영역에 걸쳐 보임**
- [x] **원인 추정**: 버튼이 `position: absolute` + 우측 위치 고정인데 카드 우측 padding 부족. Compact에서 카드 폭 좁아져 버튼이 overflow.
- [x] **수정 방향**:
  - Compact에서 버튼을 카드 **하단 풀 폭**으로 자동 전환 (또는 카드 우측 padding 명시 확보)
  - 카드/블록 간격 ≥12px 베이스라인 준수
- [x] **검증**: 375px에서 버튼이 카드 안에 정확히 들어옴 + 다음 카드와 ≥12px 간격.
- [x] **참고 캡처**: [output/live-shots/mobile-02-q-hub.png](../../output/live-shots/mobile-02-q-hub.png)

### Bug-3: 무한풀기 홈 "플래너에서 일정 관리" 줄바꿈 어색

- [x] **위치**: `/q/infinity` (무한풀기 홈, Compact)
- [x] **컴포넌트**: 플래너 진입점 헤더 영역 (`src/components/infinity/` 내 헤더 또는 `today-block.tsx`)
- [x] **증상**: "플래너에서 일정 관리" / "세션 직접 고르기" 두 액션 라벨이 비좁은 폭에서 **단어가 줄바꿈** (예: "플래너에서 일정\n관리")
- [x] **원인 추정**: 두 액션이 가로 정렬 + 각 라벨에 wrap 허용. 폭 부족 시 단어 단위로 깨짐.
- [x] **수정 방향**:
  - 라벨에 `white-space: nowrap` + Compact에서 두 액션을 **세로 스택** 또는 **icon-only + tooltip** 형태로 축약
  - 터치 타겟 ≥44×44pt 보장
- [x] **검증**: 375px에서 라벨 1줄 표시 또는 명확한 세로 스택.
- [x] **참고 캡처**: [output/live-shots/mobile-03-infinity-home.png](../../output/live-shots/mobile-03-infinity-home.png)

### Bug-4: 분석/능력치 메트릭 폰트 압축

- [x] **위치**: `/q/analysis/ability` (Compact)
- [x] **컴포넌트**: 과목별 실시간 능력치 카드 (`src/components/study-index/` 또는 `analysis-ability` 내 메트릭 그리드)
- [x] **증상**: 수학·영어·과학 3개 메트릭이 한 줄에 다 들어가면서 폰트 크기 ~11px로 압축됨. 본문 ≥16px 베이스라인 위반.
- [x] **원인 추정**: 메트릭 그리드가 `grid-cols-3` 고정. Compact bracket에서도 3열 유지하면서 폰트만 줄임.
- [x] **수정 방향**:
  - [Layer 2 §14.2.2 분석/차트형 룰](../spec/08-design-system.md#L420) 준수: Compact는 **세로 스택 또는 carousel** (≥3 한 줄 금지)
  - 권장: Compact에서 `grid-cols-1` 또는 `grid-cols-2` + 가로 스와이프 carousel
  - 메트릭 라벨/값 폰트 ≥16px 유지
- [x] **검증**: 375px에서 각 메트릭 카드 폭 ≥160px + 폰트 ≥16px.
- [x] **참고 캡처**: [output/live-shots/mobile-08-analysis-ability.png](../../output/live-shots/mobile-08-analysis-ability.png)

### Bug-5: 복습 홈 메트릭 카드 + "정복 세트 풀이" 깨짐

- [x] **위치**: `/q/review` (Compact)
- [x] **컴포넌트**: 복습 홈 상단 메트릭 영역 + "정복 세트 풀이" CTA (`src/components/conqueror/` 또는 `memory/`)
- [x] **증상**: 5개 메트릭(시간 지남/오늘 복습/마스터 임박/누적 정복/30일 잔존)이 한 카드 안에 2x3 그리드로 빡빡하게 배치됨. "정복 세트 풀이" 버튼이 다음 줄로 깨져서 카드 밖으로 부분 노출됨.
- [x] **원인 추정**: 한 카드 안 다중 메트릭 + 외부 CTA가 같은 wrapper에 묶임. Compact에서 폭 부족 시 CTA가 줄바꿈되며 잘림.
- [x] **수정 방향**:
  - [Layer 2 §14.2.2 목록형 룰](../spec/08-design-system.md#L420) 준수: Compact는 메트릭 카드 **≤4개**. 5번째 메트릭("30일 잔존")은 expand 영역 또는 상세 페이지로 이동.
  - "정복 세트 풀이"는 **별도 카드** 또는 sticky bottom CTA로 분리
  - 카드/블록 간격 ≥12px 보장
- [x] **검증**: 375px에서 메트릭 카드 4개 그리드(2x2) + CTA 별도 카드/sticky로 분리됨.
- [x] **참고 캡처**: [output/live-shots/mobile-11-review-home.png](../../output/live-shots/mobile-11-review-home.png)

## 수정 후 라이브 재검증

- [x] `bun dev`에서 Compact(375px) 12개 라우트 재캡처 → `output/live-shots/mobile-*-after.png`
- [x] before/after diff 5건 확인
- [x] [Layer 1 베이스라인 §14.1](../spec/08-design-system.md#L376) 위반 0건 확인 (자동 lint 또는 수동 체크리스트)
- [x] 콘솔 에러 0건 유지

## 비고

### 우선순위

| Bug | 영향 | 우선순위 |
|---|---|---|
| Bug-1 (토글 깨짐) | 학습 집중형 — 풀이 시작 자체가 어색 | **P0** |
| Bug-2 (버튼 침범) | 대시보드형 — 첫인상 조잡 | P1 |
| Bug-4 (폰트 압축) | 분석형 — 가독성 직접 위반 | P1 |
| Bug-5 (복습 깨짐) | 목록형 — 정보 손실 | P1 |
| Bug-3 (라벨 wrap) | 헤더 부분 — 부수적 | P2 |

### 작업 단위 권고

- 한 PR당 1~2 bug. 각 bug는 before/after 캡처 1쌍 첨부.
- Layer 1+2 룰 위반은 명시적 commit message에 인용 (예: `fix(infinity): mode toggle nowrap (Layer 1 §14.1)`).

### 범위 외

- Comfortable bracket(≥1024px)의 7가지 패턴 위반은 [별도 plan](2026-05-06_density-pattern-fixes-comfortable.md).
- 디자인 시스템 토큰 자체 변경(컬러·타이포)은 본 plan 범위 아님.
