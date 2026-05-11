# 2026-05-07 Mock Emoji 광역 정리 (옵션 A 확장)

> **상태**: ✅ **부분 완료** (2026-05-07 — 5개 mock 파일 + 12+ 직접 consumer 처리, 사이드 발견된 추가 spec 위반은 별도 후속 PR로 분리 권장)
>
> **실행 방식**: 3 sub-agent 병렬 (file-partition isolation, 충돌 0건)
> - Agent A: visual.ts + library/* + visual/*
> - Agent B: planner.ts + planner/* + today-block + solve-session-picker
> - Agent C: coach.ts + classbot.ts + infinity.ts + coach/* + classbot/* + shell helper + teacher/quiz
>
> **수정된 mock 파일** (5개): `visual.ts` (vlmTypeMeta + vlmCatalog + mediaKindMeta) · `planner.ts` (blockTypeMeta + conditionMeta + emotionEmojis→emotionIcons) · `coach.ts` (Agent.emoji 삭제) · `classbot.ts` (StudentBotIntent.emoji → id semantic key) · `infinity.ts` (solveModeMeta.emoji 삭제 — 죽은 필드)
>
> **수정된 consumer 파일** (15개+): visual/{vlm-card, media-card, generator-entry-card, library-generator-form} · library/{visual/[id], storage, [id], create/[type]}/page.tsx · planner/page.tsx + planner/{block-card, day-view, condition-slider, week-grid} + study/today-block + infinity/solve-session-picker · coach/{coach-chat, agent-card} + study/today-action-cards + classbot/student-intents + (teacher)/teacher/quiz · 모두 lucide 매핑으로 교체
>
> **검증** (2026-05-07):
> - 라이브 검증 6 라우트 (`/library`, `/library/storage`, `/planner`, `/planner/calendar`, `/q/talk`, `/q/infinity`) 200 OK + 시각 정상
> - 빌드 에러 0건 (HMR 캐시 잔존 emotionEmojis 에러는 dev 서버 fresh restart로 해결)
> - 캡처: [output/live-shots/mock-emoji-broader/](../../output/live-shots/mock-emoji-broader/) (6장)
>
> **conditionMeta / emotionIcons 결정**:
> - Layer 1 §14.1 "lucide 단독" 룰 그대로 적용 (Frown/Meh/Smile/SmilePlus/Laugh)
> - **개방 의제**: 감정·컨디션 픽커는 emoji가 정보 자체일 수 있어 §14.1 예외 검토 필요. Agent B가 자체 판단으로 lucide 적용했으나, 사용자 비교 후 §14.1에 "감정 픽커 예외" 명시할지 결정 대기.
>
> **agent들이 발견한 cross-partition 추가 위반** (본 plan 범위 외, 별도 PR 후보):
> - `infinity.ts TeacherVoice.emoji` (consumer: `infinity/explain/sections.tsx:390`)
> - `classbot.ts ClassBot.avatarEmoji` + `LiveSessionRow.botEmoji` + `BotSettingsState.identity.avatarEmoji` (consumer: classbot/* + teacher/live + teacher/settings 페이지) — 봇 아바타 정체성 케이스, 감정 픽커와 비슷한 "emoji가 식별 신호" 의제
> - `shell/onboarding-template.tsx OnboardingStep.emoji` + `shell/section-intro.tsx ValueBullet.emoji` — 타입은 shell이 정의하지만 값은 caller 페이지(`q/onboarding`, `planner/onboarding`, `classbot/onboarding`, `library/visual/onboarding`, 등 8+ 페이지)에서 주입. shell + 모든 caller를 한 PR로 묶어야 함
> - `builder/builder-types.ts toneMeta/teachingStyleMeta.emoji` (consumer: `builder/step-content.tsx`)
> - `planner-builder/builder-types.ts` (consumer: `planner-builder/step-content.tsx`)
> - `infinity.ts` 라인 365+ milestone/celebration emoji + `library-generator-form.tsx:305` `o.emoji` (option selector emoji) — 별도 데이터 소스
>
> 이 항목들에 대해 후속 PR 권장: `2026-05-XX_mock-emoji-cleanup-tail.md` (예상 작업량 1.5~2h, 같은 옵션 A 패턴 + onboarding 페이지 grouping).
>
> **Plan 3 진정 범위**: 5 mock 파일 + 직접 consumer는 ✅ 완료. tail-end 5종은 plan 범위 외였으나 audit으로 발견됨, defer.
> **선행 작업**: 2026-05-06 mock emoji 정리 ([archive/2026-05-06_density-pattern-fixes-comfortable.md](../archive/2026-05-06_density-pattern-fixes-comfortable.md) §"잔손질")가 4개 mock 필드(memory/xray/irt) + 2개 LIVE consumer를 처리.
> **트리거**: 위 작업 후 광역 grep에서 5개 mock 파일 + 12+ live consumer가 같은 패턴(`emoji: string` field + `{meta.emoji}` 렌더)으로 잔존 발견.
> **명세 권위**: [08-design-system.md §14.1](../spec/08-design-system.md#L376) "아이콘 일관성: lucide-react 단독" + "색 강조 토큰 동시 사용 ≤ 4종"
> **분류**: **데이터 레이어 작업** (5 mock 파일 type 변경 → 12+ consumer 영향). 단일 PR 또는 도메인별 분할 PR 둘 다 가능.

## 목표

데이터(mock) 레이어부터 emoji string 필드를 제거. 컴포넌트가 lucide icon을 매핑하도록 강제. **신규 PR이 실수로 emoji 부활시키는 위험을 데이터 표면에서 차단**.

옵션 A 패턴 (이전 PR과 동일):
- emoji 필드가 **순수 장식**이면 → 하드 삭제 (consumer가 다른 semantic field로 매핑)
- emoji 필드가 **고유 신호 정보**(같은 type 안에서 변별 필요)면 → `iconKey: 'literal' \| ...`로 변경

## 작업 항목

### Step 1: visual.ts (19개 emoji)

- [ ] **`vlmTypeMeta`** (line 19) — 4개 type metadata
  - 처리: `emoji` 삭제. consumer가 `VlmType` (simulation/graph/animation/handwriting)을 lucide 매핑 (Sliders/TrendingUp/Film/PenLine 등)
- [ ] **`vlmCatalog`** (line 33+) — 8개 VLM 항목 각각 emoji 보유
  - 처리: 각 VLM은 이미 type/title이 있으므로 emoji 삭제. 시각 신호가 필요하면 type 기반 매핑 활용
- [ ] **`mediaTypeMeta`** (line 255) — 4개 media type (image/video/audio/card)
  - 처리: `emoji` → `iconKey` 또는 type 기반 매핑 (ImageIcon/Film/Headphones/FileText)

**LIVE consumer**:
- `library/storage/page.tsx:182, 651` — `{meta.emoji}` 두 곳
- `library/[id]/page.tsx:71` — eyebrow에 emoji 텍스트 합성 (`${meta.emoji} ${meta.label}`)
- `library/create/[type]/page.tsx:37` — title에 emoji 합성
- `visual/media-card.tsx:59` — 카드 우상단 emoji
- `visual/generator-entry-card.tsx:62` — 카드 안 emoji
- `visual/library-generator-form.tsx:205` — title 합성

### Step 2: planner.ts (15개 emoji)

- [ ] **`blockTypeMeta`** (line 50) — 8개 block type
  - 처리: `BlockType` enum (concept/practice/review/memorize/mock/tutor/self_explain/break) 기반 lucide 매핑 (BookOpen/PenLine/Target/Brain/FileText/MessageCircle/Mic/Coffee 등)
- [ ] **`conditionMeta`** (line 179) — 컨디션 5단계 (😴🥱🙂😊🤩)
  - 처리: 감정/컨디션은 emoji가 시각적으로 의미 전달이 직관적인 케이스. **예외 검토 가치 있음** (Layer 1 §14.1 "lucide 단독" 룰에 "감정 컨디션 픽커는 예외" 추가 또는 lucide Frown/Meh/Smile/SmilePlus/Laugh로 매핑)
  - 권장: 우선 lucide 매핑 시도, UX 비교 후 예외 채택 여부 결정 (별도 명세 의사결정 필요)

**LIVE consumer**:
- `study/today-block.tsx:43`
- `planner/block-card.tsx:69`
- `planner/week-grid.tsx:60`
- (`planner-builder/step-content.tsx:644, 729` — conditionMeta 사용 가능)

### Step 3: coach.ts (7개 emoji)

- [ ] 7 코치 에이전트 (학습매니저/문제해결사/오답박사/시험전략가/멘탈코치/플래너 등) emoji
  - 처리: 에이전트별 semantic icon 매핑 (Brain/Wrench/Target/GraduationCap/Heart/CalendarClock 등)

**LIVE consumer 확인 필요** (audit 단계)

### Step 4: infinity.ts (7개 emoji)

- [ ] **`solveModeMeta`** (line 14, 21, 28) — 풀이 모드 (이미 mode-toggle에서 lucide 사용 중)
  - 처리: `emoji` 필드 dead 가능성 높음. grep 후 삭제 OR consumer 정리
- [ ] line 368, 530, 542 등 — milestone/celebration emoji
  - 처리: 케이스별 검토. 일반적 보상 표시는 lucide Trophy/PartyPopper/Sparkles 가능

**LIVE consumer**:
- `infinity/solve-session-picker.tsx:61`

### Step 5: classbot.ts (6개 emoji)

- [ ] **`quickActions`** (line 283) — 6 학생 빠른 액션 (📚❓🎯✅💬)
  - 처리: 액션별 lucide (BookOpen/HelpCircle/Target/CheckCircle/MessageCircle)

**LIVE consumer 확인 필요**

### Step 6: 최종 감사

- [ ] `grep -rn "emoji: string\|{.*\.emoji}" src/lib/mock src/components src/app` 결과 0건
- [ ] `grep -rn "channelIcon" src` 결과 0건
- [ ] 라이브 캡처 (영향 받은 라우트 12+개, Compact + Comfortable 두 폭에서)
- [ ] 콘솔 에러 0건 (Recharts width warning 제외)

### Step 7: 명세 갱신

- [ ] [08-design-system.md §14.1](../spec/08-design-system.md#L418) "아이콘 일관성: lucide-react 단독"에 **데이터 레이어 강제** 명시 추가
- [ ] **컨디션 픽커 emoji 예외 결정**: 라이브 비교 후 "lucide 매핑 / 의도된 emoji 예외" 선택. 후자면 §14.1에 예외 항목 추가

## 비고

### 우선순위

| Step | 영향 | 위험 | 우선순위 |
|---|---|---|---|
| Step 4 (infinity.ts) | 학생 핵심 루프 (solve) | 낮음 (consumer 1) | **P0** — 빠른 win |
| Step 5 (classbot.ts) | 학생/교사 클래스봇 | 낮음 | P1 |
| Step 3 (coach.ts) | /q/talk | 낮음 | P1 |
| Step 1 (visual.ts) | /library/* 전체 | 중간 (6+ consumer) | P1 |
| Step 2 (planner.ts) | /planner/* + planner-builder | 중간 (3+ consumer) + **컨디션 emoji 결정 필요** | P2 |

### 작업 그루핑 권고

- **PR A** (한 번에): Step 4 + 5 + 6 — 작은 mock 파일 + consumer 1~2개씩, 30~45분
- **PR B**: Step 1 (visual) — library 도메인 전체 영향, 단일 PR 권장. 60분
- **PR C**: Step 2 (planner) — conditionMeta 의사결정 후 진행. 60분

### iconKey vs 하드 삭제 결정 매트릭스

| 케이스 | 처리 | 예시 |
|---|---|---|
| `id`/`type`/`channel`이 이미 semantic key 역할 | 하드 삭제, consumer가 매핑 | `Prescription.channel`, `MemoryItem.source`, `BlockType` |
| 같은 type 안에서 변별 필요한 시각 신호 | `iconKey` 추가 | `ActionSuggestion.iconKey` (id가 단순 as1/as2) |
| 감정·컨디션 등 emoji가 정보 자체 | **명세 예외 검토** | `conditionMeta` (별도 결정) |

### 범위 외

- mock 데이터의 `color` field는 그대로 유지 (시각 신호로 유효, lucide와 별개)
- PracticeStatusBar / conquest-list 등 dead file 추가 발생 시 병행 정리
