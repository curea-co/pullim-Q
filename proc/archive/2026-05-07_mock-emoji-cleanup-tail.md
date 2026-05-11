# 2026-05-07 Mock Emoji 광역 정리 — Tail (옵션 A 마무리 + 명세 의제 결정)

> **상태**: 🟢 PR A + PR B 완료 (2026-05-07, §14.1 예외 추가 + Q-1 revert + Step 1.2~1.4 + Step 2 onboarding sweep)
> **선행**: [archive/2026-05-07_mock-emoji-cleanup-broader.md](../archive/2026-05-07_mock-emoji-cleanup-broader.md)에서 5 mock + 15 consumer 처리 완료. 그 작업의 cross-partition audit에서 발견된 잔여 6 카테고리 + 1 명세 의제를 본 plan이 마무리한다.
> **명세 권위**: [08-design-system.md §14.1](../spec/08-design-system.md) "아이콘 일관성: lucide-react 단독" + 예외 항목 (감정 픽커, 봇 정체성 등 — 본 plan Step 0에서 결정)
> **분류**: **데이터 + UI 광역 작업** (mock 파일 3개 + builder-types 2개 + shell 2개 + onboarding 페이지 8개 + 봇 페이지 5개 — 총 ~20 파일)

## 목표

직전 cleanup PR이 audit으로 발견한 emoji 잔존 케이스를 모두 해소. 단, 그 중 일부는 "emoji가 정보·정체성 신호"로 작동하는 케이스 — 명세 §14.1 예외 결정이 선행되어야 처리 방향이 갈림.

## Step 0: §14.1 명세 결정 (블로킹) ⚠️

후속 Step의 처리 방향을 결정하므로 **반드시 먼저 결정**.

- [x] **Q-1**: 감정·컨디션 픽커(`conditionMeta`, `emotionIcons`)에서 emoji 사용 허용?
  - **A** ✅ (선택) — 허용. §14.1에 "셀프 affect 보고 픽커는 emoji 예외" 명시. 직전 PR에서 lucide로 변경한 것을 **revert**
  - **B**: 불허 — 현재 상태 유지 (Frown/Meh/Smile/SmilePlus/Laugh)
- [x] **Q-2**: 봇 아바타·교사 음성 페르소나(`ClassBot.avatarEmoji`, `LiveSessionRow.botEmoji`, `BotSettingsState.identity.avatarEmoji`, `TeacherVoice.emoji`)에서 emoji 사용 허용?
  - **A** ✅ (선택) — 허용. §14.1에 "봇·교사 페르소나 식별 emoji 예외 (사용자 커스터마이징 가능 영역)" 명시. 그대로 유지
  - **B**: 불허 — 모두 lucide 아이콘으로 변경 (예: GraduationCap 다양 variant)
- [x] **Q-3**: 그 외 모든 emoji 필드(`TeacherVoice` voice tone, builder의 toneMeta/teachingStyleMeta, onboarding step.emoji, shell ValueBullet.emoji 등)
  - **A** ✅ (선택) — 모두 lucide로 변경 (현재 §14.1 룰 그대로)
  - **B**: 케이스별 예외 검토 — 별도 의제

> **권장**: Q-1=A (감정 픽커는 emoji가 표현력 우위), Q-2=A (봇 정체성 사용자 자율), Q-3=A (decorative emoji는 lucide). 단 사용자 의사결정 우선.

결정 결과는 [08-design-system.md §14.1](../spec/08-design-system.md) "아이콘 일관성" 룰에 예외 명시 (또는 "예외 없음" 명시).

---

## Step 1: 단순 하드 삭제 (Q-3=A 전제)

옵션 A 패턴 그대로. 각 mock 필드 제거 + consumer lucide 매핑 추가.

### 1.1 TeacherVoice.emoji (infinity.ts)

> **SKIP — Q-2=A §14.1.1 예외**: 교사 페르소나 emoji는 명세 §14.1.1 예외 항목으로 보존. 본 PR에서 처리하지 않음.

- [N/A] ~~**Mock**~~: [src/lib/mock/infinity.ts:365](../../src/lib/mock/infinity.ts) — SKIP per Q-2=A §14.1.1 예외
- [N/A] ~~**Consumer**~~: [src/components/infinity/explain/sections.tsx:390](../../src/components/infinity/explain/sections.tsx) — SKIP per Q-2=A
- [N/A] ~~라인 365+ 다른 milestone emoji~~ — SKIP per Q-2=A

### 1.2 builder/builder-types.ts (9 emoji)

- [x] **Mock**: [src/components/builder/builder-types.ts](../../src/components/builder/builder-types.ts) — `toneMeta`, `teachingStyleMeta` 등 9개 emoji 필드 제거
- [x] **Consumer**: [src/components/builder/step-content.tsx:84, 280](../../src/components/builder/step-content.tsx) `{meta.emoji}` 두 곳 → lucide 매핑 (tone/style 키 기반)

### 1.3 planner-builder/builder-types.ts (8 emoji)

- [x] **Mock**: [src/components/planner-builder/builder-types.ts](../../src/components/planner-builder/builder-types.ts) — `blockPatternMeta`, `motivationStyleMeta` 등 8개 emoji 필드 제거
- [x] **Consumer**: [src/components/planner-builder/step-content.tsx:644, 729](../../src/components/planner-builder/step-content.tsx) `{meta.emoji}` 두 곳 + 라인 333/341 인라인 emoji literal (📚🌅 등) → lucide

### 1.4 library-generator-form 옵션 selector (1 spot)

- [x] **Consumer**: [src/components/visual/library-generator-form.tsx:305](../../src/components/visual/library-generator-form.tsx) `{o.emoji && <span>{o.emoji}</span>}` — option 자료구조에 emoji 필드 있는지 확인 후 제거. lucide 대체 또는 emoji 자체 제거

---

## Step 2: Onboarding 광역 sweep (8 페이지 + shell 2)

shell 타입과 caller 데이터를 동시에 변경해야 하므로 **단일 PR로 묶음**.

- [x] **Shell type 변경**:
  - [x] [src/components/shell/onboarding-template.tsx:6](../../src/components/shell/onboarding-template.tsx) `OnboardingStep.emoji: string` → `Icon: LucideIcon` + 렌더 `<step.Icon className="h-6 w-6" />`
  - [x] [src/components/shell/section-intro.tsx:6](../../src/components/shell/section-intro.tsx) `ValueBullet.emoji: string` → `Icon: LucideIcon` + 렌더 `<v.Icon className="h-4 w-4" />`
  - [x] SectionIntro 유일 caller `app/(student)/planner/page.tsx` 동시 갱신 (Brain/Heart/Repeat)
- [x] **Caller 페이지 8개 데이터 형태 변경**:
  - [x] [src/app/(student)/planner/onboarding/page.tsx](../../src/app/(student)/planner/onboarding/page.tsx) — 📅Calendar, ⏯️PlayCircle, 😊Smile, 🫀HeartPulse, 🧠Brain
  - [x] [src/app/(student)/classbot/onboarding/page.tsx](../../src/app/(student)/classbot/onboarding/page.tsx) — 🧑‍🏫UserCircle, 🛡️Shield, 💬MessageCircle, 👁️Eye
  - [x] [src/app/(student)/q/onboarding/page.tsx](../../src/app/(student)/q/onboarding/page.tsx) — 📖BookOpen, 📚Library, 📈BarChart3, 💬MessageCircle
  - [x] [src/app/(student)/q/analysis/onboarding/page.tsx](../../src/app/(student)/q/analysis/onboarding/page.tsx) — 🎯Target, 📊BarChart3, 🧠Brain, ⚡Zap (+ inline 🔁→Repeat)
  - [x] [src/app/(student)/q/review/onboarding/page.tsx](../../src/app/(student)/q/review/onboarding/page.tsx) — 🎯Target, 🏆Trophy, 🧠Brain, 🔀Shuffle
  - [x] [src/app/(student)/q/infinity/onboarding/page.tsx](../../src/app/(student)/q/infinity/onboarding/page.tsx) — 🎚️SlidersHorizontal, 🤖Bot, ⏱️Timer, 📖BookOpen, 📊BarChart3
  - [x] [src/app/(student)/q/talk/onboarding/page.tsx](../../src/app/(student)/q/talk/onboarding/page.tsx) — 🧭Compass, 💬MessageCircle, 🧩Puzzle
  - [x] [src/app/(student)/library/visual/onboarding/page.tsx](../../src/app/(student)/library/visual/onboarding/page.tsx) — 📚Library, ✦Sparkles, 🎚️SlidersHorizontal, 🔄RefreshCw
- [x] 각 페이지: `emoji: '📖'` 등을 `Icon: BookOpen` 등으로 교체. 페이지 내 import에 lucide 추가

> **작업 분할 옵션**: 8 페이지가 같은 패턴이면 sub-agent 4개 병렬 (페이지 2개씩). shell 변경 먼저 → 8 caller 병렬 진행 가능 (shell은 1회만 수정).

---

## Step 3: 봇 정체성 emoji (Q-2 결정 분기)

### Q-2=A (예외 허용) 시: 명세에 명시만 추가
- [x] [08-design-system.md §14.1](../spec/08-design-system.md)에 예외 추가 (§14.1.1 "아이콘 일관성 예외"로 신설):
  > "봇·교사 페르소나 식별 emoji는 예외 — 사용자 커스터마이징 가능 영역. 데이터 형태로 emoji 보존, 컴포넌트는 그대로 렌더."
- [x] 코드 변경 없음

### Q-2=B (불허) 시: 옵션 A 패턴 적용 (큰 작업) — **N/A (Q-2=A 채택, 본 분기 미적용)**
- [N/A] **Mock 변경** (Q-2=B 분기, 미적용):
  - ~~[src/lib/mock/classbot.ts:12] `ClassBot.avatarEmoji` 제거~~
  - ~~[src/lib/mock/classbot.ts:914] `LiveSessionRow.botEmoji` 제거~~
  - ~~[src/lib/mock/classbot.ts:1313] `BotSettingsState.identity.avatarEmoji` 제거~~
- [N/A] **Consumer 변경 (5+ 페이지)** (Q-2=B 분기, 미적용)
- [N/A] 봇 정체성 fallback (Q-2=B 분기, 미적용)

### Q-1=A (감정 픽커 예외) 시: 직전 변경 revert
- [x] [src/lib/mock/planner.ts:184](../../src/lib/mock/planner.ts) `conditionMeta` `Icon` → `emoji` 복귀 (😴🥱🙂😊🤩)
- [x] [src/lib/mock/planner.ts:214](../../src/lib/mock/planner.ts) `emotionIcons` → `emotionEmojis` 복귀 (😔😤😐🙂😊)
- [x] Consumer revert: `condition-slider.tsx`, `block-card.tsx`, `planner/page.tsx`의 lucide 렌더 → emoji span 복귀
- [x] 명세 §14.1에 예외 명시 (§14.1.1 신설)

---

## Step 4: 최종 감사 + 라이브 검증

- [x] `grep -rn "emoji" src/lib/mock src/components src/app --include='*.ts' --include='*.tsx'` 결과 — **PR B Step 2 완료 후 (2026-05-07)**:
  - Q-1=A 잔존 (예상): `lib/mock/planner.ts:183-188` conditionMeta + `lib/mock/planner.ts:214` emotionEmojis + consumer (`condition-slider.tsx:46`, `block-card.tsx:88`, `planner/page.tsx:122,195,196`)
  - Q-2=A 잔존 (예상): `lib/mock/infinity.ts:365,527,533,539` TeacherVoice + `infinity/explain/sections.tsx:390` + `app/(student)/classbot/replay/page.tsx:71,123,124,137` avatarEmoji
  - 나머지 0건 ✅ (Step 1.2~1.4, Step 2 모두 정리됨)
- [x] **TypeScript 타입 검증**: `pnpm exec tsc --noEmit` PASS (0 errors)
- [x] 라이브 sweep (2026-05-07) — main session에서 13+ 라우트 검증 완료. 캡처는 Playwright MCP screenshot 5s timeout으로 skipped, **DOM evaluate**로 emoji/lucide 카운트 + 누수 체크. 결과 라우트별:
  - 8 onboarding 페이지 sweep — decorative emoji 0건 (Q-1=A planner 😊 1건, Q-2=A classbot 🧑‍🏫 1건은 §14.1.1 예외; library/visual/onboarding의 ✦/📈 2건은 inline label 리터럴 — plan "범위 외" 명시), `[object Object]` 누수 0건, lucide SVG 50~65개씩 정상 렌더
  - 빌더 페이지 (`/teacher/builder`, `/planner/builder`) — decorative emoji 0건, lucide 40~53개
  - library generator (`/library/create/image`) — decorative emoji 0건, lucide 67개
  - PR A revert 검증 (`/planner`, `/planner/calendar`) — conditionMeta 🙂 1건 (현재 컨디션 QuickStat) + emotion emoji 3건 (블록카드) 정상 렌더
  - 봇 페이지·해설 voice는 §14.1.1 Q-2=A 예외라 본 PR scope 밖 (코드 변경 0건)
- [x] 빌드 에러 0건, 콘솔 에러 0건 — `pnpm exec tsc --noEmit` PASS (PR A + PR B 양쪽 sub-agent 후 main session 재확인). 라이브 콘솔 errors=0 (사전 존재 Clock24 hydration mismatch 제외 — 별도 [`Clock24 hydration plan`](2026-05-07_clock24-hydration-mismatch.md))

---

## 비고

### 우선순위

| Step | 영향 | 작업량 | 우선순위 |
|---|---|---|---|
| Step 0 | 후속 Step 방향 결정 | 5분 (사용자 결정만) | **P0 블로킹** |
| Step 1 | TeacherVoice + builders + library option | 30~45분 (5 파일 + 4-5 consumer) | P1 |
| Step 2 | onboarding 8 페이지 + shell | 60~90분 (단일 PR로 묶음, 4 sub-agent 병렬 가능) | P1 |
| Step 3 (Q-2=B) | 봇 정체성 5+ 페이지 | 60~90분 (Q-2=B 선택 시) | P2 (Q-2=A면 0분) |
| Step 3 (Q-1=A revert) | conditionMeta + emotionIcons 8 spot revert | 30분 (Q-1=A 선택 시) | P2 (Q-1=B면 0분) |

### 작업 그루핑 권고

**시나리오 1 — 모두 Option A** (가장 단순, Q-1=Q-2=Q-3=B):
- PR A: Step 1 + 명세 §14.1 "예외 없음" 확정 (45분)
- PR B: Step 2 onboarding sweep (90분, sub-agent 병렬)
- PR C: Step 3 봇 정체성 lucide 변경 (60분)
- 총 ~3.5h

**시나리오 2 — 권장 (Q-1=A 감정 예외, Q-2=A 봇 예외, Q-3=A 나머지 lucide)**:
- PR A: 명세 §14.1 예외 추가 + Step 3 conditionMeta revert (30분)
- PR B: Step 1 + Step 2 (90~120분, sub-agent 병렬)
- 총 ~2h

**시나리오 3 — 최소** (Q-1=A, Q-2=A, Step 1만 진행, Step 2/3 추가 deferred):
- PR A: 명세 §14.1 예외 추가 + Step 1 + Step 3 revert (60분)
- 총 1h
- onboarding 페이지 emoji는 별개 plan으로 더 미루기

### 본 plan 진입 전 확인사항

1. Step 0 의사결정 완료
2. dev 서버 떠 있는 상태 (검증용)
3. archive/2026-05-07_mock-emoji-cleanup-broader.md 인지 — 본 plan은 그 작업의 tail

### 범위 외

- conditionMeta/emotionIcons 그 외 파라미터 (label, difficultyAdj 등) — 본 plan은 emoji 필드만 다룸
- 봇 빌더의 voice tone parameter — TeacherVoice와 별개 데이터일 가능성 있음, 별도 audit 필요
- mock 데이터의 raw text 안 emoji (예: `description: '🎯 5문항 맞히면...'` 같은 inline 문자열) — emoji 필드가 아니므로 본 plan 범위 외, 추후 텍스트 정리 PR 후보
