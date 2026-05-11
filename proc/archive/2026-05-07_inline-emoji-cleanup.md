# 2026-05-07 인라인 emoji 리터럴 정리 (라벨·헤딩·뱃지)

> **상태**: 🟢 완료 (2026-05-07 — 결정 ①~⑤=A 모두 채택, Step 1~7 완료, 후속 sweep에서 누락 11건 추가 처리)
> **명세 권위**: [08-design-system.md §14.1 + §14.1.1](../spec/08-design-system.md) (lucide-react 단독 + Q-1/Q-2 예외)
> **부모 plan**: [2026-05-07_mock-emoji-cleanup-tail.md](2026-05-07_mock-emoji-cleanup-tail.md) — "범위 외"로 명시했던 inline 텍스트 emoji 후속
> **분류**: **광역 작업** — 결정 ①~⑤ 모두 A(예외 확장) 채택 시 ~15건/10 파일로 축소. 모두 B(lucide 전환) 시 ~89건/37 파일.
> **발견 경위**: mock-emoji-cleanup-tail PR B Step 2 sweep 중 `library/visual/onboarding`에 ✦/📈 잔존 → 그 plan 명시 "범위 외" 후보로 계류 → 본 plan에서 일괄 정리

## 0. 자가 검토 결과 (2026-05-07)

초안 작성 후 자가 검토에서 다음 누락·이슈 발견 후 본 plan에 반영:

- **누락 scope** (초안 미포함): `lib/mock/coach.ts` 12+건, `lib/mock/visual.ts:thumbEmoji` 3건, `components/planner-builder/step-content.tsx` 7건 (PreviewBlock prop 포함), planner 도메인 `burnout-card/month-heatmap/views/month-view` 4건, shell `onboarding-template:137 + section-intro:108` 2건, `study/weak-spot-card`, `infinity/{mode-toggle,solve-session-bar}` 4건, `lib/mock/phase1.ts:52` 1건
- **신규 결정 필요** ③④⑤: chat 메시지 emoji, thumbEmoji 데이터 필드, 봇 페르소나 메시지 텍스트 안 emoji
- **암묵적 cascade 위험**: `⚑ = 시험·모평` legend (지표 + legend 동시 변경), `★ SIGNATURE` 4-파일 일관 처리, `PreviewBlock type="🎯 약점 보강"` prop signature 변경
- **strict regex로 재 grep**: 89 occurrences / 37 in-scope files (Q-1/Q-2 §14.1.1 예외 제외)

## 1. 카테고리 정의

### IN-SCOPE: lucide로 전환 (결정 = B 시)

**A. Filter/option/tab 라벨 prefix** — 5건
- `library/visual/page.tsx:14-21` (5 chip), `q/infinity/explain/page.tsx:14` (1 chip), `library/page.tsx:52` (info card prefix)

**B. 헤딩 prefix** — 4건
- `library/visual/[id]/page.tsx:124, 138`, `components/builder/step-content.tsx:101`, `planner-builder/unit-editor-modal.tsx:250, 326`

**C. 뱃지·메타 decoration** (★/✦/⭐/👁) — ~10건
- `★ SIGNATURE` 4 파일 (q/infinity/explain/[sku]:55, q/infinity/onboarding:134/162, q/infinity/page:164, q/page:460, shell/onboarding-template:137, shell/section-intro:108)
- `⭐ {rating} · 👁 {views}` 패턴 (q/infinity/explain/[sku]:63, q/infinity/explain/page:170, library/visual/[id]:66)
- `✦ {recommendationReason}` (visual/vlm-card:92), `✦ AI 추천` (library/visual/[id]:58)

**D. Toast / inline feedback emoji** — 6건 (결정 ② 분기)
- `toast.success('🏆 ...')`, `toast.info('💾 ...')`, `toast.success('🎯 ...')`, `toast.success('🚀 ...')`, `🎉 정답이에요!`, `안녕하세요... 👋`

**E. 인라인 라벨 안 카테고리·상태 emoji** — 8건
- planner-builder mock preview: `<PreviewBlock type="🎯/✏️/📘/✏️/🧠">` 5개 (line 865-869) + `🚀 배포하기` button label + `💡 hint` 2건
- `library/visual/onboarding:78, 82` mock 콘텐츠 라벨

**F. 정보 prefix** (⚠/⏳/⏰/⚑/✦/✨/💬/🎤/🎵) — ~15건
- 빌더 step-content:120 (`🎵/🎤` 라벨), 253 (`⏳`), 392 (`✓/⚠`), 501 (`🚀 toast`), planner-builder:178 (`💡`), 360 (`⚠`), 518 (`💡`), classbot/{live-feed-panel:68 `💬`, scope-control:73 `⏰`, classbot/onboarding:65 `⏰`}, teacher/classbot:55 (`⚠`), planner/onboarding:26 (`⚑ 표시`), planner/burnout-card:89 (`✨`), planner/month-heatmap:25 (`⚑ legend`), 120 (`⚑ 실 사용`), planner/views/month-view:15 (`🔥`), 22 (`⚑`), study/weak-spot-card:17 (`✨`), infinity/mode-toggle:91 (`⚠`), solve-session-bar:21-23 (`📅/🎯/🔓`), planner-builder/unit-editor-modal:200 (`✦`)

### OUT-OF-SCOPE: 그대로 유지

**G. 타이포 화살표·체크·동그라미숫자**: `→ ↑ ↓ ✓ ① ②` 등 punctuation 역할 — §14.1 미적용

**H. Q-1 §14.1.1 예외**: planner conditionMeta/emotionEmojis (이미 처리)

**I. Q-2 §14.1.1 예외**: classbot bot avatars, infinity TeacherVoice, classbot/replay/page (이미 처리)

**J. 코멘트 안 emoji**: `lib/mock/features.ts:27 (★개수 코멘트)` — 사용자 노출 없음

### 결정 분기 (각 항목별 A/B 선택 — Step 0에서 답변 후 본격 작업)

- **①** planner onboarding `bullets: ['😴 피곤 → -20%', ...]` (`src/app/(student)/planner/onboarding/page.tsx:67`) — Q-1 픽커 의미 설명 텍스트
  - **A** 유지 (Q-1 예외 의미 reuse) / **B** lucide 전환
  - **권장 A**

- **②** transient feedback emoji (toast 6건 + 학생 홈 `👋` + `🎉 정답이에요!` + 빈 상태 `✨`) — 일시적·축하·환영 톤
  - **A** §14.1.1에 "transient feedback emoji" 예외 추가 / **B** 모두 lucide
  - **권장 A** (toast/축하/empty state는 emoji가 표현력 우위)

- **③** 봇 agent 메시지 emoji (`lib/mock/coach.ts` 12+건, `🌅 좋은 아침`, `📚 큐 만기`, `🔥 17일 연속` 등 chat-like agent stream)
  - **A** §14.1.1 Q-2 예외 확장 — "봇 페르소나가 발화하는 메시지 텍스트 안 emoji는 예외" / **B** 모두 lucide
  - **권장 A** (봇 message stream UI는 카톡 스타일이라 emoji가 자연. Q-2와 같은 정신)

- **④** `lib/mock/visual.ts:thumbEmoji` 데이터 필드 (3건: 📈/🛗/🎧) — VLM 카드 썸네일
  - **A** §14.1.1에 "콘텐츠 썸네일 indicator emoji는 예외" 추가 (사용자 자율, Q-2와 유사) / **B** Icon 필드 전환 (mock-emoji-cleanup-tail Step 1.4 패턴)
  - **권장 A** (콘텐츠 다양성 표현. 썸네일은 이미지 placeholder 역할)

- **⑤** 봇 페르소나 메시지 텍스트 안 emoji (`lib/mock/phase1.ts:52` `🙌`)
  - **A** ③과 동일 룰 (봇 발화 텍스트) / **B** lucide
  - **권장 A**

### 권장안 채택 시 실제 in-scope 수

- A (결정 ①): 1 file 유지
- A (결정 ②): 7-8건 유지 — toast 6 + `👋` + `🎉` + `✨ 빈 상태`
- A (결정 ③): 12+건 유지 (`coach.ts`)
- A (결정 ④): 3건 유지 (`visual.ts thumbEmoji`)
- A (결정 ⑤): 1건 유지 (`phase1.ts`)
- **남는 변환 작업**: ~50건 → ~15건 (Category A/B/C/E/F의 상당 부분)

## 2. Discovery 결과 (전수 grep — 2026-05-07 strict re-audit)

**총 in-scope 파일 (Q-1/Q-2 예외 제외)**: 37
**총 occurrences**: 89

도메인별 in-scope 파일 (권장안 A 모두 채택 후 실제 변환 대상만 ★ 표시):

#### 풀림 라이브러리 (도메인 락인) — 7건 변환
- ★ `library/page.tsx:52` — `✦ AI가 내 설명을...` (info card prefix)
- ★ `library/visual/page.tsx:15-20` — 5개 filter chip 라벨
- ★ `library/visual/[id]/page.tsx:58, 124, 138, 66` — `✦ AI 추천`, h2 `📋/🧩`, `⭐ rating`
- ★ `library/visual/onboarding/page.tsx:78, 82` — mock 라벨 `📈`
- ★ `components/visual/vlm-card.tsx:92` — `✦ {recommendationReason}`

#### 풀림 Q (도메인 락인) — ~10건 변환
- ★ `q/infinity/explain/page.tsx:14, 170` — `✦ 시그니처` filter, `👁`
- ★ `q/infinity/explain/[sku]/page.tsx:55, 63` — `★ SIGNATURE`, `⭐/👁`
- ★ `q/infinity/onboarding/page.tsx:134, 162` — `★` 시그니처 뱃지·텍스트
- ★ `q/infinity/page.tsx:164` — `★`
- ★ `q/page.tsx:460` — `★`
- (A 권장) `q/review/conquer/page.tsx:46` — `🏆 toast` 유지
- ★ `q/analysis/diagnose/page.tsx:253` — `✓ 응답 저장됨` (단독 ✓ 케이스 — 변환)

#### 풀림 클래스봇 (도메인 락인) — ~7건 변환
- ★ `components/builder/step-content.tsx:101, 120, 253, 392` — `🎤` 헤딩, `🎵/🎤` 라벨, `⏳` info, `⚠` 합계
- (A 권장) `components/builder/step-content.tsx:501` — `🚀 toast` 유지
- ★ `components/builder/step-content.tsx:601` — `🚀 배포하기` 버튼 라벨 (toast 아닌 button 라벨이라 변환)
- ★ `components/classbot/live-feed-panel.tsx:68` — `💬 {botAnswer}` (라벨 prefix)
- ★ `components/classbot/scope-control.tsx:73` — `⏰ 자동 스위치`
- ★ `app/(student)/classbot/onboarding/page.tsx:65` — `⏰ 자동 스위치` (동일 패턴)
- ★ `app/(teacher)/teacher/classbot/page.tsx:55` — `⚠ 위기 신호 알림`
- (A 권장) `components/classbot/live-quiz-card.tsx:102` — `🎉 정답이에요!` 유지
- (G 타이포) `components/classbot/quiz-launcher.tsx:30` — `✓` 인라인 — 검토 후 결정

#### 풀림 플래너 (도메인 락인) — ~12건 변환
- ★ `app/(student)/planner/onboarding/page.tsx:26, 49, 98` — `⚑ 표시`, `✏️ 문제 풀이`, `📘 미분 기본 공식`
  - L67 `bullets: ['😴 ...']`은 결정 ①=A로 유지
- (A 권장) `app/(student)/planner/builder/page.tsx:57` — `💾 toast` 유지
- ★ `components/planner-builder/step-content.tsx:178, 360, 518` — `💡 hint`, `⚠ 시간 부족`, `💡 AI 초안`
- (A 권장 ②) `components/planner-builder/step-content.tsx:835` — `🎯 toast` 유지
- ★ `components/planner-builder/step-content.tsx:865-869` — 5개 PreviewBlock `type="🎯/✏️/📘/✏️/🧠"` (data prop 패턴 변경)
- ★ `components/planner-builder/unit-editor-modal.tsx:200, 250, 326` — 3건 (`✦` 단독 span, `📚 코스별`, `📋 출처`)
- ★ `components/planner/burnout-card.tsx:89` — `✨ AI 추천` (텍스트 안 ✨)
- ★ `components/planner/month-heatmap.tsx:25, 120` — legend 설명 + 실제 ⚑ marker 동시 변환 (cascade 주의)
- ★ `components/planner/views/month-view.tsx:15, 22` — `🔥 streak`, `⚑` marker

#### 풀림 인피니티 (Q 도메인 sub) — 분리해서 표기
- ★ `components/infinity/mode-toggle.tsx:91` — `⚠ 시험 진행 중`
- ★ `components/infinity/solve-session-bar.tsx:21-23` — `📅/🎯/🔓` (데이터 분기 라벨)

#### 글로벌 — ~3건 (사용자 명시 확인 필요)
- ★ `components/shell/onboarding-template.tsx:137` — `★ 시그니처` (시그니처 뱃지 헬퍼)
- ★ `components/shell/section-intro.tsx:108` — `★` (시그니처 표시)
- ★ `components/study/weak-spot-card.tsx:17` — `✨ 약점 없어요` (B 권장 케이스 — 빈 상태가 transient라 결정 ② A면 유지)
  - 결정 ②=A 시: 유지
- (A 권장) `app/(student)/page.tsx:28` — `👋` 유지

#### 결정 ①~⑤ A 채택 시 유지되는 파일 (편집 안 함)
- `lib/mock/coach.ts` (12건) — Q-2 봇 메시지 예외 확장 (③ A)
- `lib/mock/visual.ts` (thumbEmoji 3건) — 콘텐츠 썸네일 예외 (④ A)
- `lib/mock/phase1.ts:52` — 봇 메시지 텍스트 예외 (⑤ A)
- planner/onboarding/page.tsx:67 (😴/🙂/🤩 bullets) — Q-1 픽커 설명 (① A)
- toast/축하 emoji 6건 — transient (② A)

## 3. 작업 항목 (실행 — 결정 답변 후)

### Step 0: 결정 답변 + §14.1.1 명세 확장

- [x] 결정 ①~⑤ 답변 받기 — 권장 모두 A 채택 (2026-05-07)
- [x] §14.1.1에 채택 결과 명시 — `proc/spec/08-design-system.md:424-437`에 6개 예외(picker, 봇 페르소나 식별, transient, 봇 발화 메시지, 콘텐츠 썸네일, Q-1 픽커 의미 설명) 정리 + 결정 출처(본 plan 경로) 명시
- [x] [`spec-regression-closing` 패턴](2026-05-07_spec-regression-closing.md) 따라 §14.1.1 회귀 점검 표 갱신 — §14.1.1 본문이 결정 출처 + plan 경로를 명시해 closing 역할 자체 수행 (Step 7 참조)

### Step 1: 라이브러리 도메인 (sub-agent A)

- [x] `library/visual/page.tsx:14-21` — 5 filter chip 데이터 구조 변경 (`label: '...'` + `Icon: LucideIcon` 추가)
- [x] `library/visual/page.tsx` chip 렌더 함수 — `<chip.Icon /> {chip.label}` 형식
- [x] `library/page.tsx:52` — `✦` → `<Sparkles />`
- [x] `library/visual/[id]/page.tsx:58, 66, 124, 138` — 4건 처리
- [x] `library/visual/onboarding/page.tsx:78, 82` — 2건 처리
- [x] `components/visual/vlm-card.tsx:92` — `✦` → `<Sparkles />`

#### Step 1 처리표 (2026-05-07 완료)

| 파일 | 위치 | 변환 전 | 변환 후 |
|---|---|---|---|
| `src/app/(student)/library/page.tsx` | L52 | `✦ AI가 내 설명을…` | `<Sparkles className="h-3 w-3" /> AI가 내 설명을…` (`inline-flex gap-1`) |
| `src/app/(student)/library/visual/page.tsx` | L13-24 | `{ id, label: '✦/🎚️/📈/🎬/✍️ …' }` × 5 | `FilterChip { id, label, Icon? }` — `Sparkles/SlidersHorizontal/LineChart/Film/PencilLine` |
| `src/app/(student)/library/visual/page.tsx` | L96-110 (chip render) | `{f.label}` 단독 | `{f.Icon && <f.Icon className="h-3 w-3" />} {f.label}` (`inline-flex items-center gap-1`) |
| `src/app/(student)/library/visual/[id]/page.tsx` | L58 | `✦ AI 추천` 뱃지 | `<Sparkles className="h-2.5 w-2.5" /> AI 추천` |
| `src/app/(student)/library/visual/[id]/page.tsx` | L66 | `⭐ {vlm.rating}` | `<Star className="text-pullim-warn h-3 w-3 fill-current" /> {rating}` |
| `src/app/(student)/library/visual/[id]/page.tsx` | L124 | `<h2>📋 인터랙션 항목</h2>` | `<h2 ...inline-flex gap-1.5><ListChecks className="h-3.5 w-3.5"/> 인터랙션 항목</h2>` |
| `src/app/(student)/library/visual/[id]/page.tsx` | L138 | `<h2>🧩 다루는 핵심 개념</h2>` | `<h2 ...inline-flex gap-1.5><Puzzle className="h-3.5 w-3.5"/> 다루는 핵심 개념</h2>` |
| `src/app/(student)/library/visual/onboarding/page.tsx` | L78 | `📈 f(x) = x³ + ax + b · 부호 변화 체험` | `<LineChart className="h-3 w-3"/> f(x) = …` (h4 `inline-flex gap-1`) |
| `src/app/(student)/library/visual/onboarding/page.tsx` | L82 | `<span>📈 SVG 그래프 (실제 시뮬에서 동작)</span>` | `<span ...inline-flex gap-1><LineChart className="h-2.5 w-2.5"/> SVG 그래프 …</span>` |
| `src/components/visual/vlm-card.tsx` | L92 | `✦ {vlm.recommendationReason}` | `<Sparkles className="h-2.5 w-2.5 shrink-0"/> <span>{reason}</span>` (`inline-flex items-start gap-1`) |

**lucide imports 추가**:
- `library/page.tsx`: 변경 없음 (이미 `Sparkles` import)
- `library/visual/page.tsx`: `SlidersHorizontal, LineChart, Film, PencilLine` 추가 + `ComponentType` (filter chip Icon 타입)
- `library/visual/[id]/page.tsx`: `Star, ListChecks, Puzzle` 추가 (이미 `Sparkles` import)
- `library/visual/onboarding/page.tsx`: `LineChart` 추가 (이미 `Sparkles` import)
- `components/visual/vlm-card.tsx`: 변경 없음 (이미 `Sparkles` import)

**rating star 패턴** (L66): `<Star className="text-pullim-warn h-3 w-3 fill-current" />` — `fill-current` + 컬러 클래스로 같은 색상 외곽선·내부 모두 채움. `vlm-card.tsx:98` 기존 footer 별 패턴(`text-pullim-warn fill-current`)과 일관.

**mock content 결정** (onboarding L78/L82): **변환 적용**. 본 plan 1.E에 명시된 결정을 따름. mock browser preview 안 라벨이지만 §14.1.1 예외 5(콘텐츠 썸네일 indicator)는 `lib/mock/visual.ts:thumbEmoji` 데이터 필드에만 한정되며, JSX 텍스트 안 emoji는 §14.1 본 룰 적용 대상.

**tsc**: PASS (`pnpm exec tsc --noEmit` 0 error)

**검증 라우트** (main session Playwright):
- `http://localhost:3000/library`
- `http://localhost:3000/library/visual`
- `http://localhost:3000/library/visual/math-derivative-sign`
- `http://localhost:3000/library/visual/onboarding`

### Step 2: Q 도메인 (sub-agent B)

- [x] `q/infinity/explain/page.tsx:14, 170` — filter + 👁
- [x] `q/infinity/explain/[sku]/page.tsx:55, 63` — ★ SIGNATURE + ⭐/👁
- [x] `q/infinity/onboarding/page.tsx:134, 162` — ★ 사용처
- [x] `q/infinity/page.tsx:164`, `q/page.tsx:460` — ★ standalone (lucide `<Star fill="currentColor" />`)
- [x] `q/analysis/diagnose/page.tsx:253` — `✓ 응답 저장됨` → `<Check /> ...`
- [x] `components/infinity/mode-toggle.tsx:91`, `solve-session-bar.tsx:21-23` — Q sub
- [x] (Q-2 결정 ②=A 시) review/conquer toast `🏆` 유지

### Step 3: 클래스봇 도메인 (sub-agent C)

- [x] `components/builder/step-content.tsx:101, 120, 253, 392, 601` — 5건
- [x] `components/classbot/live-feed-panel.tsx:68`, `scope-control.tsx:73`, `app/(student)/classbot/onboarding:65`, `app/(teacher)/teacher/classbot:55` — 4건
- [x] (결정 ②=A 시) live-quiz-card `🎉`, builder/step-content `🚀 toast` 유지

### Step 4: 플래너 도메인 (sub-agent D)

- [x] `app/(student)/planner/onboarding/page.tsx:26, 49, 98` — 3건 (line 67 bullets는 ①=A로 유지)
- [x] `components/planner-builder/step-content.tsx:178, 360, 518, 865-869` — 8건 (PreviewBlock prop signature 변경 포함)
- [x] `components/planner-builder/unit-editor-modal.tsx:200, 250, 326` — 3건
- [x] `components/planner/burnout-card.tsx:89`, `month-heatmap.tsx:25, 120`, `views/month-view.tsx:15, 22` — 5건 (legend ↔ marker cascade 주의)
- [x] (②=A 시) `planner/builder:57 💾 toast`, `planner-builder/step-content:835 🎯 toast` 유지

### Step 5: 글로벌 (사용자 명시 확인 후 sub-agent E 또는 본 세션)

- [x] `components/shell/onboarding-template.tsx:137` — `★ 시그니처` → `<Star className="h-2 w-2 fill-current" /> 시그니처` (signature 뱃지 inline-flex)
- [x] `components/shell/section-intro.tsx:108` — `★` 단독 → `<Star className="h-2 w-2 fill-current" />` (sub-route signature 마크)
- [x] `components/study/weak-spot-card.tsx:17` — 결정 ②=A로 `✨` 유지 (transient empty state)

### Step 6: 검증

- [x] `pnpm exec tsc --noEmit` 통과 (Step 1~5 + 후속 sweep 누락 11건 처리 후 0 error)
- [x] 잔존 emoji 재 grep — IN-SCOPE 0건, OUT-OF-SCOPE만 남음 (toast 5건 = ②=A, picker 1건 = ①=A, 코멘트 안 ★ 3건 = J)
- [x] 라이브 검증 sweep 완료 (2026-05-07, Playwright):
  - 라이브러리 4개 라우트 PASS (thumbEmoji `📈/🛗/🎧`는 §14.1.1 예외 5 유지)
  - Q 5개 라우트 PASS — `/q/infinity/explain/Q-MATH-CALC-0042`에서 라이브 sweep 시 추가 누락 5건 발견 후 처리:
    - sections.tsx s11 헤딩 `📜/🌍` 2건 → `<Scroll/>/<Globe/>` 변환 (Step 8 표 갱신)
    - s5 annotations `⚠ ` (mock 데이터 안) — plan §7 "범위 외(mock 학습 콘텐츠 본문)" 적용 → 유지
    - s10 voice.emoji `🙌/🔥` — §14.1.1 예외 2 (페르소나 식별) → 유지
  - 클래스봇 4개 라우트 PASS
  - 플래너 4개 라우트 PASS (picker `😴/🙂/🤩` = §14.1.1 예외 6 유지)
  - 글로벌 `/` PASS (`👋` = §14.1.1 예외 3 transient)
- [x] DOM evaluate: IN-SCOPE emoji 0건 (예외 영역만 잔존)
- [x] 콘솔 에러 0건 (본 plan 코드 변경 무관 — Recharts width warning + Fast Refresh full reload 경고는 기존 issue)

### Step 7: 명세 회귀 사례 갱신

- [x] §14.1.1 갱신은 본 plan과 동시에 진행됨 — `proc/spec/08-design-system.md:424-437` 6개 예외 영역 + 결정 출처 (`proc/archive/2026-05-07_inline-emoji-cleanup.md`) 명시. 별도 회귀 점검 표 추가 불필요(본문 자체가 closing 역할).

### Step 8: 후속 sweep — 본 plan 누락 11건 (2026-05-07 추가 처리)

본 plan grep이 strict regex로 89건이라고 했지만 실제 sweep에서 11건 누락 발견. 같은 결정 ①~⑤=A 룰 적용해 추가 처리:

| 파일 | 위치 | 변환 전 | 변환 후 |
|---|---|---|---|
| `src/app/(student)/q/page.tsx` | L467 | `· ⭐ {e.rating} · {views}회` | `<Star text-pullim-warn h-2.5 w-2.5 fill-current /> {rating}` (inline-flex 그룹) |
| `src/app/(student)/q/infinity/page.tsx` | L169 | 동일 패턴 (signaturePicks 메타) | 동일 처리 |
| `src/app/(student)/q/infinity/explain/page.tsx` | L144 | `⭐ <span>{rating}</span>` | `<Star /> <span>{rating}</span>` |
| `src/components/infinity/explain/sections.tsx` | L209 | `⚠ 흔한 함정` | `<AlertTriangle /> 흔한 함정` |
| `src/components/infinity/explain/sections.tsx` | L213 | `✓ 정확한 접근` | `<Check /> 정확한 접근` |
| `src/components/infinity/explain/sections.tsx` | L421 | `<div text-8xl>📌</div>` (배경 데코) | `<Pin h-32 w-32 opacity-20 />` |
| `src/components/infinity/explain/sections.tsx` | L428 | `📅 다음 복습 {next}` | `<Calendar /> 다음 복습 {next}` |
| `src/components/infinity/explain/sections.tsx` | L458 | `★ SIGNATURE` | `<Star h-2 w-2 fill-current /> SIGNATURE` |
| `src/app/(teacher)/teacher/page.tsx` | L197 | `💬 {q.botAnswerPreview}` | `<MessageCircle /> <span line-clamp-1>{preview}</span>` (live-feed-panel 패턴 일치) |
| `src/components/infinity/explain/sections.tsx` | L410 | `📜 역사` (s11 HistoryReal) | `<Scroll /> 역사` (라이브 sweep 추가 발견) |
| `src/components/infinity/explain/sections.tsx` | L414 | `🌍 현실 응용` | `<Globe /> 현실 응용` (라이브 sweep 추가 발견) |

**lucide imports 추가**:
- `q/page.tsx`, `q/infinity/page.tsx`, `q/infinity/explain/page.tsx`: `Star` 이미 import (변경 없음)
- `infinity/explain/sections.tsx`: `AlertTriangle, Calendar, Check, Pin, Star` 추가
- `teacher/page.tsx`: `MessageCircle` 추가

**누락 사유**: 초안 grep이 인라인 라벨·헤딩·뱃지 위주여서 (a) `· ⭐ rating ·` 형태 메타 inline 텍스트, (b) `infinity/explain/sections.tsx` 같이 큰 컴포넌트 안 분산된 emoji 5건, (c) `teacher/page.tsx` 같이 명시 안 된 페이지가 빠짐. 같은 ②=A/J 룰을 반영해 추가 처리.

## 4. 락인 규칙 (도메인 분할 권장)

본 plan은 광역이지만 sub-agent 4-5개로 도메인 락인 가능 (Step 1~5 분리). 글로벌 Step 5는 사용자 명시 확인 후 별도.

**Sub-agent 동시 진행 가능성**: 
- A(라이브러리) / B(Q + Q-sub: infinity) / C(클래스봇) / D(플래너) — 4개 병렬 OK (도메인 boundary 깨끗)
- E(글로벌 shell + study) — 사용자 확인 후 분리

## 5. 우선순위

**P2** — UI 일관성. 기능 영향 없음. mock-emoji-cleanup-tail 자연스러운 후속.

권장 ①~⑤ 모두 A 채택 시 실제 작업량 ~50건 → ~15-20건 (대폭 축소).

## 6. 비고

- mock-emoji-cleanup-tail이 emoji 필드만 다뤘다면, 본 plan은 **JSX 텍스트 안 리터럴**까지.
- 화살표 `→` 같은 타이포는 §14.1 적용 대상 아님 (out-of-scope G).
- 권장 ①~⑤ 모두 A 채택 시 §14.1.1 예외 항목이 5종으로 확장 — 명세가 점차 풍부해짐. **명세 일관성 vs 표현력 trade-off** 사용자 판단.
- `★` SIGNATURE는 4 파일에서 일관 처리 — `<Star fill="currentColor" />` lucide 매핑 동일.
- `⚑ legend ↔ marker` cascade — 같은 PR 안에서 양쪽 동시 변경 (legend 텍스트 "⚑ = 시험·모평" → "<Flag /> = 시험·모평", 실제 marker도 lucide).
- `PreviewBlock type="🎯 약점 보강"` prop signature 변경 — string → `{ Icon: LucideIcon, label: string }` 객체 또는 `<PreviewBlock Icon={Target} type="약점 보강">` 분리. cascade는 PreviewBlock 컴포넌트 한 곳에 한정.

## 7. 범위 외

- 화살표·체크·동그라미숫자 등 타이포 글리프 (out-of-scope G)
- mock 데이터의 학습 콘텐츠 안 emoji (문항·해설 본문, 만약 있다면)
- §14.1.1 예외 항목 (Q-1/Q-2 + ① ② ③ ④ ⑤ A 채택 시 추가되는 예외)
- nav-config·shell 외 다른 컴포넌트 안 emoji (이미 mock-emoji-cleanup-tail Step 2에서 처리)

## 8. 커밋 메시지 후보

- `fix(library): inline emoji literals → lucide per §14.1`
- `fix(q): badge/rating emoji → lucide per §14.1`
- `fix(classbot): heading/info emoji → lucide per §14.1`
- `fix(planner): preview/legend emoji → lucide per §14.1`
- `fix(shell): SIGNATURE star → lucide per §14.1`
- `docs(spec): §14.1.1 예외 확장 (transient/persona-message/thumbnail)`
