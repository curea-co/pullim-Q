# 2026-05-06 정보 밀도 패턴 위반 수정 (Comfortable bracket)

> **상태**: ✅ **구현 완료 + 회귀 검증 완료** (2026-05-06)
>
> **PR 분할 실행 결과**:
> - **PR 1** (P-1 헤더 과밀 + P-2 Nav 이중화): 완료, **4 bracket(375/768/1024/1440) 검증** → [output/live-shots/p1-p2-after/](../../output/live-shots/p1-p2-after/)
> - **PR 2** (P-3 학습 집중형 + P-7 Primary CTA): 완료, 데스크탑 검증 → [output/live-shots/pr2-after/](../../output/live-shots/pr2-after/)
> - **PR 3** (P-6 메타 hierarchy): 완료, 데스크탑 검증 → [output/live-shots/pr3-after/](../../output/live-shots/pr3-after/)
> - **PR 4** (P-4 톤 혼재 + P-5 색·이모지): 완료, 데스크탑 검증 → [output/live-shots/pr4-after/](../../output/live-shots/pr4-after/)
> - **회귀 검증**: 8 라우트 × 3 bracket(Compact/Cozy/Tablet-landscape) = 24장 → [output/live-shots/full-regression/](../../output/live-shots/full-regression/)
>
> **콘솔 에러**: 0건 (Recharts width warning만 — 기존 사항)
>
> **파일 변경 정리** (총 unique 20개):
> - **신규** (1): `src/components/ui/meta-row.tsx`
> - **Plan 1 + Plan 2 둘 다 손댐** (3): `(student)/q/page.tsx` · `(student)/q/infinity/page.tsx` · `(student)/q/review/page.tsx`
> - **Plan 1 단독** (3): `shell/section-heading.tsx` · `infinity/mode-toggle.tsx` · `study-index/ability-hero.tsx`
> - **Plan 2 단독** (13): `shell/{coach-fab,app-header,app-sidebar}.tsx` · `(student)/q/{infinity/solve,infinity/history,analysis/page,analysis/diagnose}/page.tsx` · `infinity/coach-pane.tsx` · `memory/{review-queue,cross-app-timeline,review-formats}.tsx` · `xray/meta-hero.tsx` · `conqueror/error-pattern-list.tsx`
>
> **잔손질 (2026-05-06 ~ 2026-05-07 추가 처리)**:
> - ✅ Cozy(768) review home KPI `sm:grid-cols-5` → `sm:grid-cols-4` ([review/page.tsx:96](../../src/app/(student)/q/review/page.tsx#L96))
> - ✅ 터치 타겟 정합 — NavRow `py-1.5` → `min-h-11 py-2` (44pt) / SubNavRow `h-8` → `min-h-10 py-2` (40pt) ([app-sidebar.tsx](../../src/components/shell/app-sidebar.tsx))
> - ✅ `PracticeStatusBar.tsx` dead file 삭제 (사용처 0건 grep 확인 후)
> - ✅ **`/q/review/conquer` 라이트 전환** (옵션 B 결정): 완료 hero(success+blue gradient) + 워크룸 헤더(slate-950) → 둘 다 라이트화. `Stat` 컴포넌트도 라이트화. 💡 emoji → `Lightbulb` icon. → [conquer/page.tsx](../../src/app/(student)/q/review/conquer/page.tsx)
> - ✅ **`leitner-boxes.tsx`** 다크→라이트 + IRT 5-step blue ramp + lucide Check/X (used in onboarding) → [leitner-boxes.tsx](../../src/components/conqueror/leitner-boxes.tsx)
> - ✅ **`q/review/onboarding/page.tsx`** MockBrowser dark 제거 + 정복 미리보기 라이트화
> - ✅ **`exam-status-bar.tsx` 다크 예외** [08-design-system.md §14.1](../spec/08-design-system.md#L416)에 명시 (의도적 시그널 — 룰 위반 아님)
> - ✅ 검증 캡처: [output/live-shots/conquer-light/](../../output/live-shots/conquer-light/) (3장: desktop conquer, desktop onboarding, cozy conquer)
>
> **남은 의도적 보류**:
> - `conquest-list.tsx` — 사용처 0건 (grep 확인) → dead code일 가능성. 후속 dead-code sweep PR에서 삭제 또는 P-3+P-4 동시 적용 후 살리기 결정
> - Mock 데이터 emoji 필드 (memory.ts, xray.ts, irt.ts) — 컴포넌트 consumer는 무시하지만 데이터 잔존. 옵션 결정 대기 (A: 하드 삭제 / B: iconKey로 변경 / C: 그대로)

## 목표

Comfortable bracket(≥1024px = 태블릿 landscape, 데스크탑) 화면에서 발견된 **7가지 조잡함 패턴**을 [Layer 1 + Layer 2](../spec/08-design-system.md#L361) 기준에 맞춰 수정.

라이브 검증(`output/live-shots/desktop-*.png` + `tablet-landscape-*.png`)에서 7개 패턴 모두 위반 확인됨. Compact bracket은 별도 plan ([2026-05-06_mobile-layout-bug-fixes.md](2026-05-06_mobile-layout-bug-fixes.md)) 참조.

## 작업 항목

### P-1: 헤더 과밀 해소 (인터랙션 11개 → 5~6개)

- [x] **위반 룰**: [Layer 1 §14.1](../spec/08-design-system.md#L376) "Primary CTA 정확히 1개 / Secondary 액션 ≤ 3개"
- [x] **현재 상태** (Comfortable): 풀림 로고 + "스터디" 라벨 + 학생/교사 토글 + 6개 도메인 탭(스튜디오·스토어·플래너·Q·클래스봇·라이브러리) + 17일 뱃지 + 검색 + 알림 + 아바타 = **11요소 한 줄**
- [x] **목표 상태**:
  - 헤더 핵심 5요소: 로고 + 검색 + 알림 + 아바타 + (역할 토글 OR 스트릭 뱃지)
  - 6개 도메인 탭 → **사이드바로 이동** 또는 **메가 메뉴 드롭다운**으로 압축
  - "스터디" 라벨은 로고와 통합
- [x] **컴포넌트**: `src/components/shell/app-header.tsx`, `src/components/shell/role-switcher.tsx`, `src/components/shell/nav-config.ts`
- [x] **수정 방향**:
  - 도메인 탭을 헤더에서 제거하고 사이드바 1차 nav로 통합
  - 역할 토글은 아바타 드롭다운 또는 사이드바 하단으로 이동
- [x] **검증**: 헤더 한 줄 인터랙션 ≤6개. 1024/1280/1440px 캡처 비교.
- [x] **참고 캡처**: [output/live-shots/desktop-02-q-hub.png](../../output/live-shots/desktop-02-q-hub.png)

### P-2: Nav 이중화 해소 (글로벌 헤더 + 좌측 사이드바)

- [x] **위반 룰**: [Layer 1 §14.1](../spec/08-design-system.md#L376) "메타 hierarchy 명확" + 사용자 결정 부담 최소화 원칙
- [x] **현재 상태**: 헤더에 6개 도메인 탭 + 좌측 사이드바에 도메인 내부 nav (홈/무한풀기/코치/분석/복습/소개하기) — **두 nav 동시 노출**
- [x] **목표 상태**: 단일 nav 계층
  - 사이드바를 **2단 트리** 구조로 변경: top-level 도메인 6개 + 선택된 도메인의 sub-nav 펼침
  - 또는 헤더 도메인 탭 제거 후 사이드바만 (P-1과 통합 가능)
  - **태블릿 portrait의 "아이콘 사이드바" 패턴 (이미 동작 확인됨)을 데스크탑에 적용**
- [x] **컴포넌트**: `src/components/shell/app-sidebar.tsx`, `src/components/shell/nav-config.ts`
- [x] **수정 방향**:
  - Cozy bracket에서 작동 중인 아이콘 사이드바를 Comfortable에서 **확장 가능 (hover/click expand)**으로 일반화
  - 헤더와 사이드바의 책임 분리: 헤더 = 글로벌 액션 / 사이드바 = navigation
- [x] **검증**: 한 화면에 노출되는 nav 영역 = 1개. P-1과 함께 확인.
- [x] **참고 캡처**: [output/live-shots/tablet-portrait-02-q-hub.png](../../output/live-shots/tablet-portrait-02-q-hub.png) (좋은 예), [desktop-02-q-hub.png](../../output/live-shots/desktop-02-q-hub.png) (현재 위반)

### P-3: 학습 집중형 정보 과부하 해소

- [x] **위반 룰**: [Layer 2 §14.2.2 학습 집중형 / Comfortable](../spec/08-design-system.md#L420) "Primary 인터랙션 ≤ 5"
- [x] **현재 상태** (`/q/infinity/solve`): 한 화면에 **≈14개 영역** (헤더 + 사이드바 + breadcrumb + 페이지 타이틀·부제 + 메트릭 타일 4개 + 연습/시험 토글 + 문제 + 5개 선지 + 풀림 튜터 패널 + 다음 문제 + sticky AI 버튼)
- [x] **목표 상태**: Primary 인터랙션 ≤5
  - 메트릭 타일 4개 → 상단 1줄 요약(축약 inline)으로 압축 또는 수업 시작 전에만 노출
  - 풀림 튜터 패널은 토글로 (기본 collapsed)
  - sticky AI 버튼 + 다음 문제 중복 액션 감소
- [x] **컴포넌트**: `src/components/infinity/`, `src/components/tutor/`, `src/components/coach/`
- [x] **수정 방향**:
  - 풀이 화면 Hero 영역 = 문제 + 선지 + Primary CTA(다음 문제) **만 강조**
  - 메트릭/튜터/코치는 **보조 영역** (작은 폰트, 약한 컬러)
  - 메인 콘텐츠 폭 ≥60% 보장
- [x] **검증**: 화면 영역 카운트 ≤ 8개. 학생 첫 인상 "지금 뭘 풀어야 하지?" 즉시 인지.
- [x] **참고 캡처**: [output/live-shots/desktop-04-infinity-solve.png](../../output/live-shots/desktop-04-infinity-solve.png)

### P-4: 다크/라이트 톤 혼재 제거

- [x] **위반 룰**: [Layer 1 §14.1](../spec/08-design-system.md#L376) "한 화면 베이스 톤 = 단일 (다크 OR 라이트, 혼재 금지)"
- [x] **현재 상태**:
  - `/q/review/conquer`: 상단 정복 세트 카드 = 다크, 하단 문제 영역 = 라이트
  - `/q/analysis/process`: 상단 메타인지 4 카테고리 카드 = 다크, 하단 메트릭 = 라이트
  - `/q/analysis/diagnose`: 진단 카드 = 파랑 dark accent, 가이드 라인 = 회색
- [x] **목표 상태**: 각 화면이 단일 베이스 톤
  - 권장: **라이트 베이스로 통일** (학생 학습 환경 + Pretendard 가독성)
  - 다크 사용은 **데이터 강조 카드** 등 의도적 영역에 한정 + 명시적 다크 모드 토글이 켜진 경우만
- [x] **컴포넌트**: `src/components/conqueror/`, `src/components/xray/`, `src/components/study-index/diagnose-*`
- [x] **수정 방향**:
  - 다크 카드를 라이트 카드(slate-900 텍스트 on slate-25/50 배경)로 재설계
  - 강조가 필요하면 brand blue accent(blue-50/100 배경 + blue-700 텍스트) 사용
- [x] **검증**: 화면 캡처 시 베이스 톤 일관 (RGB 기준 두 톤 동시 점유 비율 차이 ≥80:20).
- [x] **참고 캡처**: [output/live-shots/desktop-12-review-conquer.png](../../output/live-shots/desktop-12-review-conquer.png), [desktop-09-analysis-process.png](../../output/live-shots/desktop-09-analysis-process.png), [desktop-10-analysis-diagnose.png](../../output/live-shots/desktop-10-analysis-diagnose.png)

### P-5: 이모지·아이콘·색 남발 정리

- [x] **위반 룰**: [Layer 1 §14.1](../spec/08-design-system.md#L376) "색 강조 토큰 동시 사용 ≤3종 (성공/주의/위험 + 풀림 블루까지 4종 한도)" + "lucide-react 단독"
- [x] **현재 상태**:
  - `/q/review`: "기억"·"오답" 빨간 뱃지 + 이모지 🍪🎯💎✨ + 아이콘 + 색상 강조 다중
  - `/q/analysis/process`: 메타인지 4 카테고리에 4 이모지(💧🪞🧭🧠) + 4 색상 다양 + 카드 안 다중 폰트 크기
- [x] **목표 상태**:
  - 이모지는 **카테고리당 1개** 또는 lucide 아이콘으로 통일
  - 강조 컬러 토큰 동시 사용 ≤4종 (베이스라인)
  - 같은 의미는 같은 표기 (예: "복습" 항목은 이모지+컬러를 항상 같게)
- [x] **컴포넌트**: `src/components/memory/`, `src/components/conqueror/`, `src/components/xray/`, `src/components/study-index/`
- [x] **수정 방향**:
  - 이모지 사용 audit: 의미 있는 곳만 남기고 장식용 제거
  - 카테고리 색은 IRT 5단계 또는 학습 히트맵 6단계 토큰 재사용
- [x] **검증**: 한 화면 강조 색 토큰 카운트 ≤4. 이모지 사용 의도가 명확.
- [x] **참고 캡처**: [output/live-shots/desktop-11-review-home.png](../../output/live-shots/desktop-11-review-home.png), [desktop-09-analysis-process.png](../../output/live-shots/desktop-09-analysis-process.png)

### P-6: 메타 텍스트 hierarchy 명확화

- [x] **위반 룰**: [Layer 1 §14.1](../spec/08-design-system.md#L376) "메타 텍스트 hierarchy 2단계 (primary/secondary)"
- [x] **현재 상태** (`/q/infinity/history`): 단원·SKU·시간·힌트·시각이 모두 비슷한 회색·작은 폰트로 한 줄에 늘어섬 → 스캔 가능성 떨어짐
- [x] **목표 상태**:
  - Primary meta: 단원, 시간 (slate-600/700, 13~14px)
  - Secondary meta: SKU, 힌트 횟수, 부가 시각 (slate-400/500, 12px)
  - 시각적 구분: 폰트 weight 또는 폰트 크기 (모두 같은 회색 금지)
- [x] **컴포넌트**: `src/components/infinity/history-*`, `src/components/memory/`, `src/components/conqueror/`, 일반 카드 컴포넌트
- [x] **수정 방향**:
  - 카드 내 메타 텍스트를 두 종류 클래스로 분류 (`.meta-primary`, `.meta-secondary`) 또는 디자인 토큰 활용
  - 카드 컴포넌트 props로 hierarchy 강제 (primary/secondary slot)
- [x] **검증**: 카드 안 메타 두 단계 시각 차이 명확. 5초 스캔 테스트로 핵심 정보(단원, 시간)가 먼저 잡히는지.
- [x] **참고 캡처**: [output/live-shots/desktop-08-analysis-ability.png](../../output/live-shots/desktop-08-analysis-ability.png) (이력 화면도 같은 패턴)

### P-7: Primary CTA 모호 해소

- [x] **위반 룰**: [Layer 1 §14.1](../spec/08-design-system.md#L376) "Primary CTA 정확히 1개 / Secondary 액션 ≤ 3개"
- [x] **현재 상태** (`/q/infinity` 무한풀기 홈): "오늘 플래너" 항목 클릭 + "약점 보강" 항목 + "자유 풀이" 과목 그리드 + sticky "AI에게 묻기" — 비슷한 비중 액션 4~5개. 학생이 "지금 뭘 눌러야 하지?" 망설임.
- [x] **목표 상태**:
  - 화면별 Primary CTA 명확히 1개 (시각적으로 가장 강하게)
  - Secondary는 시각적 위계 약하게 (outline button, ghost button 등)
  - sticky "AI에게 묻기"는 floating helper로 위계 분리 (primary와 경쟁 X)
- [x] **컴포넌트**: 도메인별 홈 페이지 (`src/app/(student)/q/{infinity,review,analysis,talk}/page.tsx`), `src/components/study/today-action-cards.tsx`
- [x] **수정 방향**:
  - 각 도메인 홈 진입 시 "지금 가장 권장되는 1 액션"을 확정 → 그 액션만 Primary 색·크기로 강조
  - 다른 액션은 Secondary 또는 카드 nav로 위계 구분
- [x] **검증**: 화면 정중앙 1초 시선 테스트로 Primary CTA가 즉시 식별. Secondary는 시야 외곽.
- [x] **참고 캡처**: [output/live-shots/desktop-03-infinity-home.png](../../output/live-shots/desktop-03-infinity-home.png)

## 수정 후 라이브 재검증

- [x] Comfortable(1440px) 12개 라우트 재캡처 → `output/live-shots/desktop-*-after.png`
- [x] Cozy(1024px landscape) 4개 핵심 라우트 재캡처 → `output/live-shots/tablet-landscape-*-after.png`
- [x] before/after diff 24+장 (12+12)
- [x] [Layer 1+2 룰](../spec/08-design-system.md#L361) 위반 0건 확인
- [x] 학생 핵심 6단계 루프 click-through dead-end 0건 유지 (기존 검증 회귀)

## 비고

### 우선순위

| Pattern | 영향 범위 | 작업량 | 우선순위 |
|---|---|---|---|
| P-1 헤더 과밀 | 모든 화면 공통 | 큼 (shell + nav-config) | **P0** |
| P-2 Nav 이중화 | 모든 화면 공통 | 큼 (P-1과 동시) | **P0** |
| P-3 학습 집중형 과부하 | 풀이/해설/정복 | 중 | P1 |
| P-7 Primary CTA 모호 | 도메인 홈 4종 | 중 | P1 |
| P-6 메타 hierarchy | 카드 컴포넌트 전반 | 중 (디자인 토큰 작업) | P1 |
| P-4 톤 혼재 | 분석·복습 일부 | 작음 | P2 |
| P-5 색·이모지 남발 | 복습·분석 일부 | 작음 | P2 |

### 작업 그루핑 권고

- **PR 1**: P-1 + P-2 동시 (shell 전반 재구성, 한 PR로 묶어야 일관성 보장)
- **PR 2**: P-3 + P-7 (콘텐츠 위계 작업, 도메인별 홈/풀이 화면)
- **PR 3**: P-6 (카드/메타 컴포넌트 일괄, 토큰 작업 포함)
- **PR 4**: P-4 + P-5 (시각 정리, 색·톤·이모지 audit)

PR 4개 분할 — 한 번에 다 건드리면 회귀 잡기 어려움.

### 도메인 단위 검증 안전망

- 각 PR 후 [04-ux-flow.md §8 학생 dead-end 검증](../spec/04-ux-flow.md#L318) 통과 필수
- [도메인 이동 알럿 정책 §6.5](../spec/04-ux-flow.md#L300) 위반 없도록 (시스템 자동 이동 시 알럿 발동)

### 범위 외

- Compact bracket(<768) 모바일 버그는 [별도 plan](2026-05-06_mobile-layout-bug-fixes.md)
- 디자인 시스템 컬러 팔레트 자체 변경은 본 plan 범위 아님
- 교사 화면(`(teacher)`)은 데스크탑 우선 페르소나 — Layer 2 룰 동일 적용하되 정보 밀도 더 높게 허용 (별도 가이드 필요 시 후속 plan)
