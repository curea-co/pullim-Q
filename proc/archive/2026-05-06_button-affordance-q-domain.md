# 2026-05-06 버튼 어포던스 회귀 정리 (풀림 Q)

> **상태**: ✅ 완료 (2026-05-07)
> **명세 권위**: [08-design-system.md § 7.3](../spec/08-design-system.md), [04-ux-flow.md § 6.4](../spec/04-ux-flow.md)
> **트리거 사건**: `/q/review`의 "정복 세트 풀이"가 `rounded-full` + `text-xs` + 작은 패딩 알약 모양으로 만들어져 있어 사용자가 버튼이 아니라 **태그·뱃지로 인식** → 클릭 가능 인지까지 시간 소요
> **분류**: **풀림 Q 도메인 락인 작업** (Q 페이지·컴포넌트만 편집)

## 목표

§ 7.3.2 모양↔의미 1:1 매핑 위반 사례를 풀림 Q 도메인에서 모두 찾아 § 7.3.3 Primary CTA 베이스라인으로 전환한다. "정복 세트 풀이"가 1차 대상.

## 작업 항목

### Step 1: 회귀 사례 탐색

- [x] **`/q/review` "정복 세트 풀이"** ([src/app/(student)/q/review/page.tsx](../../src/app/(student)/q/review/page.tsx) 또는 components 하위)
  - 현재: `bg-pullim-warn rounded-full px-3 py-1.5 text-xs font-bold text-white` (작은 알약)
  - 분류: § 7.3.2 위반 — `rounded-full` + 작은 사이즈 + 컬러 배경 = 태그·뱃지 패턴
- [x] **풀림 Q 전체 grep으로 동일 패턴 발견**
  - 명령: `grep -rn "rounded-full.*text-xs\|text-xs.*rounded-full" src/components/{infinity,coach,tutor,conqueror,memory,study-index,xray}/ src/app/\(student\)/q/`
  - 발견된 항목 중 **`<Link>` 또는 `<button>`**(액션) 인 것만 회귀 대상. 진짜 태그·뱃지인 것은 제외.
- [x] 회귀 대상 목록을 본 plan 표 아래 누적

### Step 2: § 7.3.3 Primary CTA로 전환

각 회귀 사례마다:
- [x] **모양**: `rounded-full` → `rounded-lg` 또는 `rounded-xl`
- [x] **크기**: `text-xs` → `≥ text-sm`, `px-3 py-1.5` → `px-4 py-2.5` 이상
- [x] **터치 타겟**: ≥ 44×44pt 보장 ([08 § 6.4](../spec/08-design-system.md))
- [x] **타이포 위계**: `font-semibold` 이상 (이미 `font-bold`이면 OK)
- [x] **색상**: `bg-pullim-warn` 대신 액션 강조 컬러 (`bg-pullim-blue-600` 또는 `bg-pullim-lemon`) 사용 검토 — warn은 경고/위험을 시사하는 컬러라 정복(공격적 성공 액션)과 결이 안 맞음
- [x] **위치**: 섹션 헤더 우측 작은 알약 위치 → 콘텐츠 흐름 끝 또는 상단 우측 적절한 크기로
- [x] **텍스트**: 명사구 단독이면 동사 단서 추가 검토 (예: "정복 세트 풀이" → "정복 세트 풀기" 또는 "→ 정복 세트 풀기")

### Step 3: 회귀 사례 표 (진행하면서 누적)

| 사례 | 위치 | 변경 전 | 변경 후 | 비고 |
|---|---|---|---|---|
| 정복 세트 풀이 | `app/(student)/q/review/page.tsx:174` (섹션 헤더 우측) | `bg-pullim-warn rounded-full px-3 py-1.5 text-xs` | `bg-pullim-lemon text-pullim-lemon-ink rounded-xl px-4 py-2.5 text-sm` (텍스트: "정복 세트 풀이" → "정복 세트 풀기") | warn(경고)은 정복(공격적 성공 액션)과 결이 안 맞아 lemon으로. lemon-ink 텍스트로 가독성 확보 |
| 코치 Hero CTA | `components/coach/coach-hero.tsx:31` | `rounded-full bg-white px-3 py-1.5 text-xs` (블루 그라디언트 위 흰색 알약) | `rounded-xl bg-white px-4 py-2.5 text-sm` (텍스트는 동사형 mock 데이터) | Hero 섹션의 메인 CTA — 블루 위 흰 버튼 색상은 유지, 모양·크기만 Primary CTA 베이스라인으로 |
| 풀이분석 "플래너에" | `components/xray/action-suggestions.tsx:55` | `bg-pullim-lemon ... rounded-full px-3 py-1.5 text-xs` | `bg-pullim-lemon text-pullim-lemon-ink rounded-lg px-4 py-2.5 text-sm` (텍스트: "플래너에" → "플래너에 추가") | 동사 단서 추가, lemon 컬러는 유지 |
| 무한풀기 "상세 분석" | `app/(student)/q/infinity/page.tsx:197` | `border-pullim-warn/40 rounded-full px-3 py-1.5 text-xs font-semibold` | `... rounded-lg px-4 py-2.5 text-sm` | 시험 결과 카드 secondary CTA |
| 해설 "다음 행동" 3 CTA | `app/(student)/q/infinity/explain/[sku]/page.tsx:116-133` | `rounded-full ... px-3 py-2 text-xs` (3개 모두) | `rounded-xl ... px-4 py-2.5 text-sm` | "친척 문제 풀어보기" + "풀림 복습으로" + "풀림 복습에 저장" — 블루 그라디언트 패널 안 |
| 정복 완료 CTA 2종 | `app/(student)/q/review/conquer/page.tsx:117-130` | Primary `bg-pullim-blue-600 rounded-full px-4 py-2 text-sm` + Secondary `border-pullim-blue-300 rounded-full px-3 py-2 text-xs` | Primary `rounded-xl px-4 py-2.5 text-sm` + Secondary `rounded-lg px-4 py-2.5 text-sm` | "분석에서 갱신 확인" / "복습 홈으로" — Primary는 모양만 알약→사각, Secondary는 사이즈 위계 강화 |
| 진단 완료 CTA 2종 | `app/(student)/q/analysis/diagnose/page.tsx:90-103` | 동일 패턴 (Primary `rounded-full px-4 py-2 text-sm` + Secondary `rounded-full px-3 py-2 text-xs`) | Primary `rounded-xl`, Secondary `rounded-lg`, 둘 다 `text-sm px-4 py-2.5` | "약점·처방 4종 보러가기" / "분석 홈" |
| 진단 인트로 CTA 2종 | `app/(student)/q/analysis/diagnose/page.tsx:155-172` | 동일 패턴 | 동일 처리 | "시작하기" / "분석 홈으로" |

**제외된 (액션 아님 / 정당한 사용)**:
- `q/page.tsx:105` 스트릭 div, `q/page.tsx:246/459`, `q/review/page.tsx:216/254` 행 번호 — non-action 스팬·뱃지
- `q/review/conquer/page.tsx:107` `+12p` delta — 진짜 뱃지(상태 라벨)
- `infinity/explain/sections.tsx:262` 섹션 번호, `:297` 비활성 placeholder 버튼 (준비 중)
- `coach/coach-chat.tsx:159` 아바타 원형
- `study-index/mastery-heatmap.tsx:52`, `cognitive-radar.tsx:36` segmented 토글 컨트롤
- `q/infinity/history/page.tsx:75`, `q/infinity/explain/page.tsx:96` 필터 탭 (segmented control — `rounded-full`이 필터 칩 컨벤션으로 정당)
- `q/infinity/solve/page.tsx:456` 이미 `rounded-lg` (이전/다음 문항 컨트롤)

### Step 4: 라이브 검증 (2026-05-07 통과)

- [x] **정적 검증**: `pnpm exec tsc --noEmit` 통과 (0 에러)
- [x] **트리거 사례 검증**: `/q/review` 진입 시 "정복 세트 풀기"가 lemon 컬러 + `rounded-xl` + `text-sm px-4 py-2.5`로 § 7.3.3 Primary CTA 베이스라인 충족, 첫 시선에 버튼으로 인지됨
- [x] after 캡처: [output/live-shots/review-cta-after.png](../../output/live-shots/review-cta-after.png) (1280x720)
- [x] § 7.3.5 검증 — `/q/review` 페이지에 `rounded-full` 액션 패턴 잔재 0건 (남은 `rounded-full`은 행 번호·뱃지·필터 칩 = 정당한 사용)
- [x] 라이브 서버 콘솔 에러 0건

### Step 5: 명세 회귀 사례 갱신

- [ ] [08-design-system.md § 7.3.5](../spec/08-design-system.md) "회귀 사례" 항목에 처리 완료 표기 — 후속 작업

## 범위 외

- **풀림 Q 외 도메인** (플래너·클래스봇·라이브러리)에서 같은 패턴이 발견되면 **본 plan에서 처리하지 않음** — 도메인별 별도 plan으로 분리. CLAUDE.md 락인 컨벤션 준수.
- 베이스 컴포넌트(`components/ui/button.tsx`) 기본 variant 정비는 글로벌 작업이라 본 plan 범위 외 (필요 시 별도 plan).
- **카피 정리(텍스트 자체 변경 — θ, 한자어)** — [별도 plan](2026-05-06_copy-cleanup-jargon-and-hanja.md)
- **오버플로 베이스** — [별도 plan](2026-05-06_overflow-base-components.md)

## 비고

- "정복 세트 풀이"의 색상이 `bg-pullim-warn`(주황/경고)인 이유를 코드 히스토리에서 한 번 확인 후 변경 — 의도가 있을 수 있음. 의도 없는 임시 컬러면 § 7.3.3 권장 컬러로 정리.
- 한 PR로 1차 처리. 회귀 사례가 많이 발견되면 페이지별로 쪼개기.
- 커밋 메시지: `fix(review): conqueror CTA affordance per 08 § 7.3.3`

### 다른 도메인 발견 사례 (별도 plan 필요)

풀림 Q 락인 작업이라 편집은 안 했고, 다음 사례들은 도메인별 별도 plan으로 분리해야 한다 (CLAUDE.md 락인 컨벤션):

- **풀림 라이브러리 (4건)**:
  - `app/(student)/library/visual/page.tsx:102` — 필터 탭 (segmented control이라 정당할 수 있음 — 검증 필요)
  - `app/(student)/library/visual/[id]/page.tsx:100` — `bg-pullim-blue-600 rounded-full px-3 py-1.5 text-xs` Primary CTA, **명확한 회귀 사례**
  - `app/(student)/library/visual/[id]/page.tsx:153, 159, 165` — 블루 그라디언트 위 3종 CTA, **명확한 회귀 사례** (Q의 explain/[sku] 동일 패턴)
- **풀림 플래너 (2건)**:
  - `components/planner/block-card.tsx:113` — 액션 버튼 가능성, 검증 필요
  - `components/planner/views/day-view.tsx:44` — `bg-pullim-blue-600 rounded-full px-3 py-2 text-xs` 액션, **회귀 사례 후보**
- **풀림 클래스봇**: `replay-review.tsx`, `live-quiz-card.tsx` — 대부분 뱃지/태그로 보이지만 정밀 검토 필요

→ **`proc/plan/2026-05-XX_button-affordance-{library,planner,classbot}.md`** 식으로 도메인별 별도 plan 생성 권장.
