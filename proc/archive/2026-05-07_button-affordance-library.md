# 2026-05-07 버튼 어포던스 회귀 정리 (풀림 라이브러리)

> **상태**: 🟢 완료 (2026-05-07, 라이브 검증 통과 — 4건 CTA fix)
> **명세 권위**: [08-design-system.md § 7.3](../spec/08-design-system.md), [04-ux-flow.md § 6.4](../spec/04-ux-flow.md)
> **부모 plan**: [2026-05-06_button-affordance-q-domain.md](2026-05-06_button-affordance-q-domain.md) (Q 도메인 1차 처리 완료, 그 작업의 grep으로 라이브러리 회귀 발견)
> **분류**: **풀림 라이브러리 도메인 락인 작업** (CLAUDE.md 락인 컨벤션 준수)

## 목표

§ 7.3.2 모양↔의미 1:1 매핑 위반(`rounded-full` + 작은 사이즈 + 컬러 배경 = 태그·뱃지 패턴인데 액션으로 사용) 사례를 라이브러리 도메인에서 모두 § 7.3.3 Primary CTA 베이스라인으로 전환한다.

## 작업 항목

### Step 1: 회귀 사례 1차 식별 (이미 grep 완료)

다음 4건은 액션(링크/버튼)으로 확인됨 — 처리 대상:

- [x] **`src/app/(student)/library/visual/[id]/page.tsx:112`** — 비주얼 상세 메인 CTA
  - 현재: `bg-pullim-blue-600 hover:bg-pullim-blue-700 mt-3 inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-bold text-white`
  - 처리: `rounded-xl px-4 py-2.5 text-sm`로 상향. 컬러는 그대로(blue-600 = 브랜드 Primary 적합).
- [x] **`src/app/(student)/library/visual/[id]/page.tsx:165`** — 우하단 CTA 1
  - 현재: `text-pullim-blue-700 inline-flex items-center gap-1 rounded-full bg-white px-3 py-2 text-xs font-bold`
  - 처리: `rounded-xl px-4 py-2.5 text-sm` (블루 그라디언트 위 흰 버튼이면 흰색 유지)
- [x] **`src/app/(student)/library/visual/[id]/page.tsx:171`** — 우하단 CTA 2
  - 현재: `bg-white/15 hover:bg-white/25 inline-flex items-center gap-1 rounded-full px-3 py-2 text-xs font-bold`
  - 처리: `rounded-xl px-4 py-2.5 text-sm`. (반투명 흰 버튼은 secondary 톤 — 그대로 두면 OK)
- [x] **`src/app/(student)/library/visual/[id]/page.tsx:177`** — 우하단 CTA 3
  - 위와 동일 패턴, 동일 처리

### Step 2: 추가 grep 검증 (정당한 사용 vs 회귀 구분)

다음 사례들은 **태그·뱃지로 정당한 사용**으로 추정 — 액션 여부 1차 검증 후 결정:

- [x] `library/visual/[id]/page.tsx:143` — `concepts.map` 렌더링. `<li>`에 onClick·href 없음. **개념 라벨 — 처리 X (정당한 뱃지).**
- [x] `library/visual/page.tsx:102` — 필터 칩. `rounded-full`이 필터 칩 컨벤션이라 정당. 처리 X.
- [x] `library/storage/page.tsx:205, 218` — 상태 토글 필터 칩 (생성중/실패 카운트). border + 컬러 + 작은 크기 = 칩 패턴, 같은 그룹 안에서 토글 일관성 → **처리 X.**
- [x] `library/storage/page.tsx:263, 290` — 종류·출처 필터 칩 그룹. 102와 동일한 필터 칩 컨벤션. **처리 X.**

### Step 3: 처리 표 (진행하면서 누적)

| 위치 | 분류 | 변경 전 | 변경 후 | 비고 |
|---|---|---|---|---|
| `library/visual/[id]/page.tsx:112` | 액션 → 처리 | `rounded-full px-3 py-1.5 text-xs` | `rounded-xl px-4 py-2.5 text-sm` | 메인 CTA, blue-600 유지 |
| `library/visual/[id]/page.tsx:165` | 액션 → 처리 | `rounded-full px-3 py-2 text-xs` | `rounded-xl px-4 py-2.5 text-sm` | 우하단 1 ("관련 문제 풀기"), 흰 배경 유지 |
| `library/visual/[id]/page.tsx:171` | 액션 → 처리 | `rounded-full px-3 py-2 text-xs` | `rounded-xl px-4 py-2.5 text-sm` | 우하단 2 ("코치에게 질문"), bg-white/15 유지 |
| `library/visual/[id]/page.tsx:177` | 액션 → 처리 | `rounded-full px-3 py-2 text-xs` | `rounded-xl px-4 py-2.5 text-sm` | 우하단 3 ("풀림 복습에 저장"), bg-white/15 유지 |
| `library/visual/[id]/page.tsx:143` | 라벨 (정당) | — | — | concepts.map `<li>`, 액션 아님 — 처리 X |
| `library/visual/page.tsx:102` | 필터 칩 (정당) | — | — | 처리 X |
| `library/storage/page.tsx:205, 218` | 상태 토글 칩 (정당) | — | — | 생성중/실패 토글, 칩 패턴 — 처리 X |
| `library/storage/page.tsx:263, 290` | 필터 칩 (정당) | — | — | 종류/출처 토글 그룹, 102와 동일 컨벤션 — 처리 X |

### Step 4: 검증

- [x] `pnpm exec tsc --noEmit` 통과 (2026-05-07)
- [x] 라이브 검증 (2026-05-07): `/library/visual/math-derivative-sign` 우하단 3 CTA + `/library/visual/math-normal-dist` 4 CTA 모두 (메인 + 우하단 클러스터 3) `rounded-xl px-4 py-2.5 text-sm` DOM 확인. `/library/storage` 15 pill 모두 chip group (siblings 1~4) 정당.
- [x] after 캡처 (production build, Chrome headless): [`output/live-shots/2026-05-07_library-cta-after.png`](../../output/live-shots/2026-05-07_library-cta-after.png) — `/library/visual/math-normal-dist` 메인 + 우하단 클러스터 4 CTA가 `rounded-xl` 사각 버튼으로 노출. before는 git rollback 불가, DOM evaluate가 추가 증거 (`hasRoundedXl: true`, `hasTextSm: true`).
- [x] 콘솔 에러 0건 (3 라우트 모두 errors=0)

### Step 5: 명세 회귀 사례 갱신

- [x] [08-design-system.md § 7.3.5](../spec/08-design-system.md) 회귀 사례에 라이브러리 처리 표기 — [`spec-regression-closing` plan](2026-05-07_spec-regression-closing.md)에서 처리 완료 (2026-05-07)

## 락인 규칙

편집 OK: `app/(student)/library/*`, `components/visual/*`
편집 금지: 다른 도메인 — 발견하면 보고만 (Q는 이미 처리, 플래너·클래스봇은 별도 plan)

## 범위 외

- 풀림 Q (이미 처리), 플래너·클래스봇·shell — 별도 plan
- 베이스 컴포넌트 button variant 정비 — 글로벌 작업

## 비고

- 트리거 패턴: 우하단 회색 panel 위 CTA 3개가 같은 알약 모양 → 위계 없이 평면적이면 사용자가 어느 게 Primary인지 모름. 검증 시 위계 적용 검토 (Primary 1개 + Secondary 2개).
- 커밋 메시지: `fix(library): visual detail CTAs affordance per 08 § 7.3.3`
