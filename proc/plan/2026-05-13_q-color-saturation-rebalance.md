# 풀림 Q — 강한 색 사용 재조정 (saturation rebalance)

> **대응 src/ 파일** (2026-05-14 기준): 현재 working tree 변경 0개. §3 오디트 표·§5 PR 분할에 명시된 파일이 작업 시 신규로 잡힘 — 헤로 그라디언트 7개, 환경 텍스트 8~10개, warn 그라디언트 2개, shadow 5개, 온보딩 3개.
>
> **게이트키퍼**: G1 (§6 open question — D-day hero·레몬 위치·온보딩 데모 박스 시각 판단) + G4 (FE 회귀 캡처 비교 검증).

## 1. 배경 / 문제 정의

전체적으로 풀채도 색(주로 `pullim-blue-600/700`, `pullim-lemon`, `pullim-warn` 풀톤, `pullim-blue-700 → 500` 그라디언트)이 **기능적 강조가 아닌 환경/장식 영역**까지 광범위하게 등장한다. 그 결과:

- Primary CTA가 시각적으로 1번 액션으로 도드라지지 못함 (주변 hero·헤더·뱃지가 같은 강도로 발화)
- 학생 도메인 톤 가이드(§11.1 "깨끗하고 학생 친화적", §14.1 "색 강조 토큰 동시 사용 ≤ 3종")가 실측에서 깨짐
- 온보딩·환영 화면이 톤 가이드(§14.2 Comfortable 베이스라인)보다 과하게 urgent하게 느껴짐

배경 데이터: 2026-05-13 색 사용 오디트(별도 conversation 결과, 본 plan §3에 요약). [proc/spec/08-design-system.md](../spec/08-design-system.md) §1.7 (채도·명도 조정)·§7.3 (Primary CTA 베이스라인)·§14.1 (Layer 1 베이스라인)을 기준선으로 한다.

> 이 plan은 **토큰 값**을 다시 건드리지 않는다 (§1.7에서 이미 한 차례 조정 완료). 토큰은 그대로 두고 **사용처(usage)** 만 줄인다.

## 2. 원칙 — "강한 색은 어디에만 쓰는가"

> 풀채도 = `pullim-blue-{500|600|700}`, `pullim-lemon`, `pullim-success/warn/danger` 전경(전체 채움), `from-blue-700` 같은 hero 그라디언트.

**허용 영역 (강한 색 OK)**

1. **Primary CTA 1개** — 페이지/모달/섹션 당 정확히 1개의 행위 버튼 (§7.3.3)
2. **상태 의미 뱃지/칩** — 정답/오답, 연속 N일, T1/T2/T3 tier, IRT 레벨, Leitner 박스 등 색이 의미를 운반하는 경우 (§7.3.2 표)
3. **데이터 시각화** — 차트 스트로크/필, 히트맵 셀, 망각곡선 등 (§1.4·§1.5)
4. **시험 모드 / 위험 알림** — `exam-status-bar`, danger toast 등 사용자에게 명시적으로 모드 변경을 알리는 의도적 영역 (§14.1 예외)

**금지 영역 (강한 색 → 소프트 톤으로)**

- Hero / 페이지 배너 / 섹션 인트로 그라디언트
- 환경 텍스트 (section heading, eyebrow, breadcrumb, helper copy)
- 아이콘 컨테이너 / 장식 박스 / 일러스트 배경
- 온보딩 step 카드 (단, step 안의 CTA 1개는 허용)
- 빈 상태 / 일러스트 / Decorative gradient

**원칙 한 줄**: 강한 색은 *행위(action)*와 *의미(meaning)*에만 쓴다. *환경(chrome)*과 *장식(decor)*은 슬레이트 + 블루-50/100 + 흰 배경으로 빠진다.

## 3. 오디트 요약 (rebalance 대상)

### 3.1 풀채도 hero 그라디언트 (7개 파일)

| 파일 | 현재 패턴 | 처리 |
|---|---|---|
| [src/components/shell/onboarding-template.tsx:46](../../src/components/shell/onboarding-template.tsx#L46) | `from-pullim-blue-700 to-pullim-blue-500` (모든 온보딩 헤더가 여기서 옴) | §4.1 소프트 hero로 |
| [src/components/shell/section-intro.tsx](../../src/components/shell/section-intro.tsx) | 동일 패턴 | §4.1 |
| [src/components/question-hub/sections.tsx](../../src/components/question-hub/sections.tsx) | 동일 패턴 (`shadow-blue-500/20` 포함) | §4.1 + §4.4 |
| [src/components/coach/coach-hero.tsx](../../src/components/coach/coach-hero.tsx) | 동일 패턴 | §4.1 |
| [src/app/(student)/q/page.tsx:**DDayHero**](../../src/app/(student)/q/page.tsx) | D-day 풀톤 hero | §4.1 (단 D-day는 leftover 시급도 신호이므로 약한 톤 유지 검토 — §6.1 결정 필요) |
| [src/app/(student)/q/analysis/[questionId]/page.tsx](../../src/app/(student)/q/analysis/[questionId]/page.tsx) | `from-pullim-blue-600 to-pullim-blue-500` | §4.1 |
| [src/app/(student)/q/talk/onboarding/page.tsx](../../src/app/(student)/q/talk/onboarding/page.tsx) | 동일 패턴 | §4.1 |
| [src/app/(student)/q/infinity/exam-result/page.tsx](../../src/app/(student)/q/infinity/exam-result/page.tsx) | `from-pullim-warn to-pullim-warn/80` 풀톤 warn | §4.2 (warn-bg 또는 톤다운) |

### 3.2 환경 영역 풀채도 텍스트

- [src/app/(student)/q/page.tsx](../../src/app/(student)/q/page.tsx): `text-pullim-blue-700` (큐 source 라벨 "스튜디오") — 의미 운반이 아닌 컨텍스트
- [src/app/(student)/q/review/page.tsx](../../src/app/(student)/q/review/page.tsx): `text-pullim-blue-600` ("전체 이력" 링크) — 텍스트 링크는 §7.3.4에 따르면 underline 사용
- [src/app/(student)/q/review/memory/[id]/page.tsx](../../src/app/(student)/q/review/memory/[id]/page.tsx): `text-pullim-blue-600` (오버레이 라벨 "질문", "답 보기") — 같은 케이스

오디트 추산: 환경 컨텍스트의 `text-pullim-blue-{500|600|700}` 약 40건.

### 3.3 온보딩 페이지 풀채도 남발

- `/q/onboarding` Leitner 데모: 의도적 강조 → **유지** (§2 원칙 2 — 의미 운반)
- `/q/analysis/onboarding`: `bg-pullim-lemon` 버튼 → **CTA 1개만 남기고 나머지는 outline**
- `/q/infinity/onboarding`: `from-pullim-warn to-pullim-warn/80` → §4.2
- `/q/talk/onboarding`: 헤더 그라디언트 → §4.1

### 3.4 Off-token raw shadow

5개 파일에서 `shadow-blue-500/{20|30|50}`, `shadow-amber-500/{20|30}` 사용:
- [src/components/shell/coach-fab.tsx](../../src/components/shell/coach-fab.tsx)
- [src/components/question-hub/mobile-panel-trigger.tsx](../../src/components/question-hub/mobile-panel-trigger.tsx)
- [src/components/question-hub/sections.tsx](../../src/components/question-hub/sections.tsx)
- [src/components/infinity/mode-toggle.tsx](../../src/components/infinity/mode-toggle.tsx)
- [src/app/(student)/q/infinity/exam-result/page.tsx](../../src/app/(student)/q/infinity/exam-result/page.tsx)

→ 풀림 토큰(`shadow-pullim-md` / `shadow-pullim-glow` / 또는 신규 `--shadow-pullim-accent`) 로 이전. §4.4 참고.

## 4. 처리안 (선택지 + 권장)

### 4.1 Hero / 섹션 인트로 그라디언트 → 소프트 hero

**현재**: `bg-gradient-to-br from-pullim-blue-700 to-pullim-blue-500 text-white`

**옵션 A (권장 — soft tonal hero)**:
- `bg-pullim-blue-50 border border-pullim-blue-100 text-pullim-slate-900`
- accent: 헤더 안 작은 chip 1개만 `bg-pullim-blue-600 text-white` (CTA·중요 메타)
- 레몬 radial blur 제거 또는 opacity 10% 이하로

**옵션 B (white card + 좌측 컬러 바)**:
- `bg-card border border-pullim-slate-200`
- 좌측 4px `bg-pullim-blue-600` 액센트 바
- 미니멀, 정보 위계 명확. 시그니처감은 약함.

**옵션 C (현행 + opacity 낮춤)**:
- 그라디언트 유지하되 `opacity-90`·`from-pullim-blue-600 to-pullim-blue-400` 등 한 단계 톤다운
- 변화 폭 작음. 근본 문제(환경의 풀채도) 미해결 → **비권장**.

### 4.2 Warn 그라디언트 (exam-result, infinity onboarding)

**권장**: `from-pullim-warn to-pullim-warn/80` → `bg-pullim-warn-bg border border-pullim-warn/20 text-pullim-slate-900`. warn 전경은 아이콘/뱃지에만 쓰고, 면적 채움은 -bg 변형(§1.3)으로.

### 4.3 환경 영역 풀채도 텍스트

- 큐 source 라벨/eyebrow/breadcrumb 등 컨텍스트성 텍스트: `text-pullim-blue-700` → `text-pullim-slate-600` (또는 카테고리 의미를 살리려면 `text-pullim-blue-600` 1단계만 톤다운)
- "전체 이력" 류 보조 링크: §7.3.4대로 `text-pullim-slate-600 underline underline-offset-3 hover:text-foreground`
- 카테고리 칩의 색은 §3.1 표대로 의미가 있으므로 **유지** (review=warn, ai=lemon 등)

### 4.4 Off-token shadow

옵션 A (권장): 기존 `--shadow-pullim-glow` (focus ring용) 외에 액션 강조용 토큰을 1개 추가 — `--shadow-pullim-accent: 0 8px 24px rgba(59, 111, 246, 0.18)`. globals.css 에 등록 + tokens/index.ts 갱신.

옵션 B: shadow 제거하고 border 또는 ring으로 강조 — FAB 등 plate가 떠야 하는 곳은 옵션 A가 자연.

### 4.5 온보딩 — CTA 단일화

각 step 안에서 강한 색은 **최대 1개**. 보조 액션은 outline. step 카드 자체는 `bg-card border` 유지, decorative emphasis(테두리 채움 등)는 빼기.

## 5. 작업 단위 (PR 분할)

1. **PR-A — Hero 그라디언트 소프트화 (옵션 A 적용)**
   - 7개 파일의 hero/section-intro 패턴 일괄 교체
   - 라이브 검증: `bun dev` 후 desktop/mobile 캡처 18장 (각 hero 3 viewport)
   - 크기: 약 7 파일, 100~150 lines diff

2. **PR-B — 환경 텍스트 톤다운**
   - `text-pullim-blue-700` (환경 컨텍스트만) → `text-pullim-slate-600` 또는 `text-pullim-blue-600`
   - 큐 source 칩 라벨, "전체 이력" 류 보조 링크, 메모리 오버레이 라벨
   - 의미 운반 텍스트(`text-pullim-success` 정답 표시 등)는 **건드리지 않음**
   - 크기: 약 8~10 파일, 60~80 lines diff

3. **PR-C — Warn 그라디언트 → warn-bg**
   - exam-result + infinity onboarding 2개 파일
   - 크기: 작음

4. **PR-D — Shadow 토큰 도입**
   - globals.css + tokens/index.ts에 `--shadow-pullim-accent` 추가
   - 5개 파일의 `shadow-blue-500/30` 등을 토큰으로 교체
   - 크기: 6~7 파일

5. **PR-E — 온보딩 CTA 단일화**
   - `/q/{analysis,infinity,talk}/onboarding` step별 강한 색 1개로 축소
   - 라이브 검증 필수

PR-A는 가장 시각적 임팩트가 크고 독립적이라 **먼저**. PR-B/C는 PR-A 머지 후 톤이 안정된 상태에서 검증. PR-D는 토큰 추가가 선행이라 PR-A와 병렬 가능.

## 6. 결정이 필요한 항목 (open questions)

### 6.1 D-day hero (`/q` 홈) 톤

D-day는 "남은 시험일까지의 시급도"를 표시하는 의미 운반 영역으로 볼 수도 있고, 단순 환경 hero로 볼 수도 있다.

- **(a) 시급도 신호로 유지** — 현재 풀채도 그대로. D-day가 카운트다운인 만큼 정보 가치 있음.
- **(b) 소프트로** — 다른 hero와 일관성. 시급도는 카운트다운 숫자의 typography로만 표현.

> 결정 사람: 디자인. 권장: (b). 일관성 우선이고, 진짜 시급도는 NowSection의 leitner_overdue/memory_overdue 액션이 신호하기 때문.

### 6.2 Primary CTA에서 레몬(`pullim-lemon`) 위치

§7.3.3에 "Primary CTA는 blue-600 또는 lemon"으로 되어 있지만, 같은 화면에 둘 다 쓰이면 강도 충돌. 정복/스트릭에만 레몬, 일반 CTA는 blue-600으로 합의할지 결정 필요.

> 권장: 레몬은 **정복 액션 + 스트릭 메달**에만. 일반 CTA는 blue-600 단일화.

### 6.3 Onboarding Leitner 데모 박스

`/q/onboarding`에서 박스의 빨강/주황/파랑이 의도된 데모인데, 위 원칙으로는 §2 허용 #2(의미 운반)이라 유지. 다만 같은 화면 안에 다른 hero 그라디언트가 풀채도면 압도된다.

> 권장: PR-A에서 hero가 소프트해지면 데모 박스가 자연스럽게 도드라짐. 별도 처리 불필요.

## 7. 검증

### 7.1 정적
- `bunx tsc --noEmit && bun run lint && bun run build`

### 7.2 라이브 (PR마다)
- `bun dev` (port 3031) → `/qa` 또는 수동 검증
- 영향 라우트:
  - `/q`, `/q/onboarding`
  - `/q/infinity`, `/q/infinity/onboarding`, `/q/infinity/exam-result`
  - `/q/review`, `/q/review/memory/[id]`
  - `/q/analysis`, `/q/analysis/[questionId]`, `/q/analysis/onboarding`
  - `/q/talk`, `/q/talk/onboarding`

### 7.3 캡처 비교
- 기준: [proc/research/2026-05-13_color-tone-apply/](../research/2026-05-13_color-tone-apply/) (직전 채도 조정 캡처)
- 본 plan 결과는 `proc/research/2026-05-13_color-saturation-rebalance/captures/` 에 desktop(1280) / tablet-portrait(820) / mobile(390) × 영향 8 라우트 = 24장

### 7.4 규칙 회귀 가드
- 강한 색 grep 카운트를 PR-A·B 전후로 기록 (`bg-pullim-blue-{500|600|700}`, `text-pullim-blue-{600|700}`, `from-pullim-blue-7`, `shadow-blue-500`)
- 합산 감소량을 PR 본문 evidence로

## 8. 명세 반영

본 변경 머지 후 [proc/spec/08-design-system.md](../spec/08-design-system.md):

- §1.7 채도 조정 표 아래 §1.8 신설 — "강한 색 사용 영역 가이드" (§2의 원칙 그대로 반영)
- §11.1 "전반 톤"에 "환경(chrome)은 슬레이트+소프트 블루, 강한 색은 행위·의미에만" 1줄 추가
- §14.1 표의 "색 강조 토큰 동시 사용 ≤ 3종" 항목 옆에 PR-A 이후 측정치 reference link

## 9. 범위 밖 (Out of scope)

- 토큰 값 자체 (HEX) 재조정 — §1.7에서 처리됨, 본 plan에서 또 손대지 않음
- 차트/히트맵/IRT 컬러 — 데이터 시각화는 의미 운반이라 유지
- 다크 모드 — 본 plan은 라이트 기준. 다크 검증은 PR-A 머지 후 별도 후속
- 교사 영역 — Q 단독 워크스페이스에 미존재. 추후 도메인 추가 시 동일 원칙 자동 적용

---

**다음 한 걸음**: §6 open question 3개에 의사결정 → PR-A 착수.
