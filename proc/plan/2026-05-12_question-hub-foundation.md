# 풀림 Q — 문제 단위 학습 허브 기반 잡기

방향성 출처: [input/docs-archive/advice/pullim_q_analysis_보완기능_제안_for_박승훈.md](input/docs-archive/advice/pullim_q_analysis_보완기능_제안_for_박승훈.md) (이하 "advice")
원본 정의서: [input/docs-archive/advice/pullim_learning_dashboard_faas_project_definition.md](input/docs-archive/advice/pullim_learning_dashboard_faas_project_definition.md) (이하 "FaaS 정의서")

## 목표
풀림 Q를 "거시 진단(습관/단원) → 미시 학습 허브(문제 한 개) → 복습"의 닫힌 흐름으로 만든다. advice의 핵심 가설은 **"`/q/analysis`는 거시 진단을 잘 하지만 문제 한 개 단위 드릴다운이 비어 있다"**. 이 빈 층을 채우는 게 이번 작업 묶음의 한 줄 목표.

## 정합 검토 — 기존 작업 묶음과의 관계

오늘 작성한 [proc/plan/2026-05-12_q-design-followup.md](proc/plan/2026-05-12_q-design-followup.md) 와 비교:

| 묶음 | 레이어 | 우선순위 변경 |
|---|---|---|
| design-followup (디자인 audit 캡처 / 홈 재배치 / 채도·명도) | **UI 폴리시** | → Phase 2 이후로 후순위 조정. 콘텐츠 IA가 흔들리면 폴리시가 헛수고. |
| 본 plan (문제 단위 학습 허브) | **콘텐츠 IA + 라우팅** | → 새 Phase 1. 풀림 Q의 차별점 핵심. |
| R값 디자인 시스템 (PR #11) | 디자인 토큰 문서 | → 그대로 유지 (코드 무변경 가이드). |
| 기억장치 라우트 (PR #7 머지) | 콘텐츠 IA의 한 갈래 | → 본 plan §5 기능 5(복습 push)와 자연 연결. 재활용. |

핵심 판단: **디자인 audit 후속(F-2 레이아웃 밀도, F-7 전문용어, F-9 한/영 혼재)은 본 plan Phase 1 끝난 뒤 다시 본다.** 콘텐츠 블록이 자리 잡기 전에 폴리시부터 가면 결국 두 번 일하게 됨.

## 현재 코드 ↔ advice 매핑

advice §4 5개 기능을 현 코드와 매핑:

| advice 기능 | 현 상태 | 필요한 일 |
|---|---|---|
| **기능 1. 오답 원인 진단 카드** | 없음. solve-feedback에 정/오 즉시 피드백만 있음. | 신규: `wrongReason` taxonomy + `/q/analysis` 상단 "최근 오답 원인 Top 3" 미니카드 |
| **기능 2. 구조화 해설 블록** | **이미 풍성하게 있음** — [src/app/(student)/q/infinity/explain/[sku]/page.tsx](src/app/(student)/q/infinity/explain/[sku]/page.tsx) 의 12-섹션 (HeroRecap·Prologue·FourPathSpine·RootGraph·ErrorAnatomy·HundredChoices·VisualCanvas·PatternFamily·FeynmanChallenge·TeacherVoices·HistoryReal·MemoryAnchor) | **재포지셔닝**: 학생 레벨(`predictedGrade`)별 기본 펼침 섹션 자동화 + 진입 경로 재배치 |
| **기능 3. 개념·배경지식·용어 사전 패널** | 부분 — explain 안의 `MemoryAnchor`·`RootGraph`가 일부 커버. 그러나 "한 화면 우측 패널" 형태는 아님 | 재배치: 데스크탑 우측 고정 패널 / 모바일 하단 시트로 추출 |
| **기능 4. 유형 분류 + 변형 문제** | 부분 — explain 안의 `PatternFamily`가 유형 카드. `?kind=retry` 라우팅으로 무한풀기 연결 가능 ([src/app/(student)/q/infinity/solve/page.tsx](src/app/(student)/q/infinity/solve/page.tsx)) | "이 유형으로 무한풀기" CTA를 explain 내부에서 명시화 |
| **기능 5. 자동 오답노트 + 복습 push** | 부분 — Leitner store(오답)·Memory store(개념) 이미 가변. [src/app/(student)/q/review/conquer/page.tsx](src/app/(student)/q/review/conquer/page.tsx) 가 오답노트 화면 | 풀이 종료 시점에 메타데이터(`wrongReason`·놓친 개념)와 함께 큐로 push하는 액션 |

핵심 관찰: **기능 2가 이미 깊이 있게 있어서, "신규 라우트를 또 만든다"보다 "기존 `/q/infinity/explain/[sku]`를 advice의 미시 학습 허브로 격상"이 더 빠르고 정합적**.

### 12-섹션 ↔ advice §4 기능 2 7블록 매핑 (2026-05-12 EOD 보강)

advice 기능 2가 명시한 7블록은 풀림 Q 기존 12-섹션 중 7개에 직접 대응한다. 나머지 5개는 **advice 비범위 — 풀림 Q 확장 기능**으로 둔다 (advice를 위반하지 않음, 기능 풍부화).

| advice 7블록 | 풀림 Q 12-섹션 | 컴포넌트 | 비고 |
|---|---|---|---|
| 정답과 핵심 근거 | s1 — HeroRecap | `HeroRecap` | 문제+학생 답+정답 한 화면 |
| 풀이 전 봐야 할 단서 | s2 — Prologue | `Prologue` | "이 문제를 보면 떠올려야 할 것" |
| 단계별 풀이 | s3 — FourPathSpine | `FourPathSpine` | 4-step path 시각화 |
| 선지별 판단 | s5 — ErrorAnatomy + s6 — HundredChoices | `ErrorAnatomy` / `HundredChoices` | 오답 함정 anatomy + 선지 100% breakdown |
| 자주 하는 착각 | s5 — ErrorAnatomy (공유) | `ErrorAnatomy` | "자주 하는 착각"이 ErrorAnatomy 내부 카드 |
| 같은 유형 풀이 전략 | s8 — PatternFamily | `PatternFamily` | + "이 유형으로 무한풀기" CTA (Phase 2.1) |
| 3분 복습 요약 | s12 — MemoryAnchor | `MemoryAnchor` | 핵심 1줄 + 기억 트리거 |

**advice 비범위 (풀림 Q 확장)**: s4 RootGraph(개념 그래프), s7 VisualCanvas(도식 그리기), s9 FeynmanChallenge(설명해보기), s10 TeacherVoices(교사 음성 멘트), s11 HistoryReal(실전 기출 변천)

### 수준별 depth 매핑 (advice §4 기능 2)

advice의 3-tier ↔ `depth.ts` `getDepthRule` 동작:

| 등급 | advice 명시 펼침 | 현 코드 펼침 (`predictedGrade`) |
|---|---|---|
| 상위(1~2) | 정답 근거 + 같은 유형 전략 | s1, s8 + s6(선지 분석) |
| 중위(3~4) | 단계별 풀이 + 선지별 판단 | s1, s3, s5, s8 |
| 하위(5~9) | 배경지식 + 용어 | s1, s2, s3, s4, s5, s11, s12 |

**알려진 차이**: advice는 상위에 "정답 근거 + 같은 유형 전략 2개만"을 명시했으나 현 코드는 +s6(HundredChoices)도 펼침. 의사 결정: **유지** — 상위권도 선지 100% breakdown은 1분 안에 확인 가능, 인지 부담이 낮음. advice 정신(상위는 답안만 빠르게)에서 크게 벗어나지 않음.

## 미리 결정해야 할 5가지 (advice §8)

> 이 plan을 코드로 옮기기 전, 다음 5개는 별도 의사결정 라운드(또는 본 plan 리뷰)에서 못 박는다.

- [x] **D1. 미시 허브 라우트 — `/q/analysis/[questionId]` 신설** (2026-05-12 결정)
  - 결정 근거: advice §5-2 "분석 페이지 안에서 거시→미시 드릴다운" 멘탈모델과 일치. URL 자체가 학생에게 "이건 내가 푼 그 문제에 대한 분석"으로 읽힘.
  - 코드 영향:
    1. **컴포넌트 추출**: `src/components/infinity/explain/sections.tsx` 와 `anchor-nav.tsx` → `src/components/question-hub/` 로 이동. 12개 섹션은 라우트 중립으로 만든다.
    2. **신규 라우트**: `src/app/(student)/q/analysis/[questionId]/page.tsx` — sections 재사용 + advice §5-2 레이아웃 (상단 오답 원인 hero / 좌·가운데·우 3분할 / 하단 유형·다음 학습)
    3. **기존 라우트 정리**: `/q/infinity/explain/page.tsx` (해설 라이브러리 인덱스)는 "browse-mode"로 유지. `/q/infinity/explain/[sku]/page.tsx`는 `/q/analysis/[questionId]?from=library`로 308 redirect — 자산 손실 0, 진입 경로만 단일화.
    4. **deep link 호환**: solve 종료 → analysis hub로 라우팅. 기존 explain 직링이 외부에 있어도 redirect로 흡수.
- [ ] **D2. `predictedGrade` 재사용**
  - 현재 `myAbility[].expectedGrade`가 `lib/mock/irt.ts`에 있음 → 그대로 hub 페이지 props로 흘려보낼지 결정
  - 권고: 그대로 재사용. advice §4 기능 2의 "수준별 depth가 무료로 따라온다"가 정확히 이걸 가리킴.
- [ ] **D3. 복습 큐 push API 형태**
  - 현재 `useLeitnerStore.applyResult` / `useMemoryStore.applyResult` 가 박스/retention 갱신은 함
  - 필요: `enqueueWithMeta({sku, wrongReason, missedConceptIds})` 같은 메타 동봉 push
  - 권고: 두 store에 `enqueueFromHub` 액션 추가, 기존 applyResult 라인은 유지.
- [x] **D4. 오답 원인 fallback taxonomy — FaaS 정의서 §8.1 풀 10종** (2026-05-12 결정)
  - 결정 근거: 사용자 방향성("advice 문서 최우선"). FaaS 정의서가 advice의 원본이고, 10종이 데모에서 다양한 오답 사례를 풍부하게 보일 수 있어 가치 검증에 유리. 콘텐츠 파트너 v1 도착 시 교체 전제.
  - 10종 코드 (FaaS 정의서 §8.1 그대로):
    1. `지문_근거_놓침` — 지문에서 정답을 가리키는 단서를 못 봄
    2. `단어_의미_오해` — 핵심 단어/어휘를 다른 뜻으로 해석
    3. `선지_범위_과대해석` — 선지의 일반화 범위를 실제보다 넓게 받아들임
    4. `조건_누락` — 문제 조건을 끝까지 읽지 않거나 빠뜨림
    5. `개념_혼동` — 닮은 두 개념(예: 함수의 정의역 vs 치역)을 헷갈림
    6. `계산_실수` — 풀이 방향은 맞지만 수식·연산 오류
    7. `자료_해석_순서_오류` — 표·그래프를 잘못된 순서로 읽음
    8. `유형_전략_모름` — 문제 유형 자체에 맞는 접근법 미숙
    9. `배경지식_부족` — 지문/문제가 전제한 사전 지식 부재
    10. `문장_구조_해석_실패` — 영어/국어 복잡한 문장의 구조 파악 실패
  - 산출물: [src/lib/mock/wrong-reason.ts](src/lib/mock/wrong-reason.ts) — `WrongReasonCode` 유니온, `wrongReasonCatalog` (각 항목당 `{code, label, oneLineMessage, subjectExamples: Record<Subject, string>, nextStepHint}`), `pickPrimaryReasons(attempt)` helper
  - 교체 인터페이스: 콘텐츠 파트너 v1 도착 시 `oneLineMessage`와 `subjectExamples`만 덮어쓰면 됨. 코드 변경 없음.
- [ ] **D5. 변형 문제 — LLM 실시간 vs 사전 캐시**
  - 데모는 mock이라 어느 쪽이든 동작은 함. 의사결정 의미는 "실제 백엔드 붙일 때 무한풀기 응답속도"
  - 권고: 데모는 캐시(`patternFamily` 기존 mock 재사용), 실제 시점에 재검토.

남은 결정: D2, D3, D5 — Phase 1 진행 중 결정 가능.

## 작업 항목

### Phase 0 — 분석 페이지 진입점 + taxonomy 토대 (1 PR)

advice §5-1 의 "분석 페이지 하단 신규 블록"만 먼저. **신규 라우트 없이** 클릭률·도달률 측정 가능한 표면부터.

#### 0.1 오답 원인 fallback taxonomy — FaaS §8.1 10종
- [x] [src/lib/mock/wrong-reason.ts](src/lib/mock/wrong-reason.ts) 신설 — 10종 catalog + `wrongAttemptDiagnoses` 7건 + `aggregateRecentWrongReasons` 헬퍼
- [x] `wrongAttemptDiagnoses` mock — 10종 골고루 분포되도록 가상 시도 5개 추가 (history h2/h5/h6 + h9~h12)
- [x] [src/lib/mock/index.ts](src/lib/mock/index.ts) barrel export 갱신

#### 0.2 `/q/analysis` 상단 "최근 오답 원인 Top 3"
- [x] [src/components/analysis/wrong-reason-top3.tsx](src/components/analysis/wrong-reason-top3.tsx) — 빈도 Top 3, 학생 주 과목 예시, "n회" 카운터
- [x] [src/app/(student)/q/analysis/page.tsx](src/app/(student)/q/analysis/page.tsx) PageHeader 직후 삽입

#### 0.3 `/q/analysis` 하단 "다시 봐야 할 문제" 카드
- [x] [src/components/analysis/recent-mistakes.tsx](src/components/analysis/recent-mistakes.tsx) — 4장 카드, reason chip 1~2개, "이 문제 풀이 다시 보기" CTA
- [x] CTA href = `/q/analysis/[sku]` (Phase 1.4 redirect로 explain 직링도 흡수)
- [x] [src/app/(student)/q/analysis/page.tsx](src/app/(student)/q/analysis/page.tsx) 기존 두 블록 아래에 배치

#### 0.4 검증
- [x] `bunx tsc --noEmit && bun run build` exit 0
- [x] Playwright [scripts/qa-analysis-entry.mjs](scripts/qa-analysis-entry.mjs) — 14/14 pass (Phase 0 시점)

### Phase 1 — `/q/analysis/[questionId]` 신설 + 컴포넌트 추출 (2 PR)

D1 결정 반영. 자산 손실 없이 라우트만 단일화.

#### 1.0 컴포넌트 추출 (chore PR — #16 머지 완료)
- [x] `infinity/explain/sections.tsx` → [src/components/question-hub/sections.tsx](src/components/question-hub/sections.tsx) (`git mv` 86% 유사도)
- [x] `infinity/explain/anchor-nav.tsx` → [src/components/question-hub/anchor-nav.tsx](src/components/question-hub/anchor-nav.tsx)
- [x] 컴포넌트 내용 변경 없음 — 순수 file move

#### 1.1 신규 라우트 `/q/analysis/[questionId]` (PR #14 머지 완료)
- [x] [src/app/(student)/q/analysis/[questionId]/page.tsx](src/app/(student)/q/analysis/[questionId]/page.tsx) 신설
- [x] `generateStaticParams` — `explainLibrary`에서 questionId(= sku) 매핑
- [x] 레이아웃 (advice §5-2): 상단 hero / 좌 anchor / 가운데 본문 / 우 패널 / 하단 자동 노트·다음 학습

#### 1.2 수준별 depth 자동 펼침 (PR #15 머지 완료)
- [x] [src/components/question-hub/depth.ts](src/components/question-hub/depth.ts) `getDepthRule`·`getDepthMeta`
- [x] [src/components/question-hub/sections.tsx](src/components/question-hub/sections.tsx) Section 래퍼 native `<details>/<summary>` collapsible
- [x] 12개 섹션 모두 `defaultOpen?` prop 추가, 페이지에서 흘려줌
- [x] `myAbility[subject].expectedGrade` lookup → `predictedGrade` (D2 그대로 재사용)
- [x] "예상 N등급 — 중위권" 안내 카피 노출

#### 1.3 오답 원인 hero + 우측 학습 재료 패널
- [x] [src/components/question-hub/wrong-reason-hero.tsx](src/components/question-hub/wrong-reason-hero.tsx) — 학생 답·정답·코드 ≤2·`nextStepHint` (PR #14)
- [x] [src/components/question-hub/learning-materials-panel.tsx](src/components/question-hub/learning-materials-panel.tsx) — 선수·암기·이어지는 개념 3카드 + 개념별 코치 미니 버튼 (PR #15)
- [x] [src/components/question-hub/mobile-panel-trigger.tsx](src/components/question-hub/mobile-panel-trigger.tsx) — sticky 트리거 + Sheet (PR #15)
- [x] 데스크탑 grid `lg:grid-cols-[200px_1fr_300px]` 3-col

#### 1.4 기존 라우트 redirect (PR #14 머지 완료)
- [x] [next.config.ts](next.config.ts) `redirects()` — `/q/infinity/explain/:sku` → `/q/analysis/:sku?from=library` (permanent 308)
- [x] [src/app/(student)/q/infinity/explain/page.tsx](src/app/(student)/q/infinity/explain/page.tsx) 라이브러리 카드 href 갱신
- [x] 구 `[sku]/page.tsx` 파일 삭제 — redirect로 흡수

### Phase 2 — 흐름 닫기 (PR #17 머지 완료)

#### 2.1 "이 유형으로 무한풀기" 명시 CTA
- [x] [src/components/question-hub/sections.tsx](src/components/question-hub/sections.tsx) PatternFamily 섹션 안에 CTA — `/q/infinity/solve?kind=weak&subject=...&pattern=<patternNameForSku>`
- [x] solve 페이지가 이미 `kind=weak`/`pattern` 쿼리 인식 — 라우트 변경 불필요

#### 2.2 자동 오답노트 + 복습 큐 (D3는 store 액션 대신 store 구독 + 토스트로 단순화)
- [x] [src/components/question-hub/auto-note-preview.tsx](src/components/question-hub/auto-note-preview.tsx) — `useLeitnerStore` 구독, 현재 sku 카드의 BOX·다음 복습·wrongReason chip
- [x] 마운트 시 toast "오답노트에 등록됨 · BOX N · 다음 복습 X 후" (1회)
- [x] [src/app/(student)/q/review/page.tsx](src/app/(student)/q/review/page.tsx) 우선 큐 leitner 행에 `wrongAttemptDiagnoses` sku 매칭 chip
- store에 새 enqueue 액션 추가는 보류 — 데모 데이터(leitnerCards)에 카드가 이미 있어 UI 표현만으로 충분. v1 백엔드 시점에 재검토.

#### 2.3 다음 학습 카드 5종
- [x] [src/components/question-hub/next-learning-cards.tsx](src/components/question-hub/next-learning-cards.tsx) — 5종 카드:
  - `easy_same_type`: family 최저 난이도
  - `missed_concept`: memoryQueue 최저 retention → `/q/review/memory/[id]`
  - `similar_exam`: family 중 수능/모평/학평 우선
  - `tomorrow_retry`: 현재 sku, leitner 상태 반영
  - `background`: 같은 과목 다른 explain entry → `/q/analysis/[sku]`

### Phase 3 — 검증·정리

#### 3.1 회귀 테스트
- [x] [scripts/qa-analysis-entry.mjs](scripts/qa-analysis-entry.mjs) 통합 — **42/42 pass** (별도 qa-question-hub.mjs 신설 대신 진입점 스크립트가 hub 도달까지 다 커버)
  - 분석 진입점 (Top 3, 다시 봐야 할 문제, 모바일)
  - 미시 허브 (Hero, 12-섹션 collapsible, depth 정확도, 우측 패널, 모바일 트리거)
  - Phase 2 (PatternFamily CTA, 자동 오답노트, 다음 학습 5종, review chip)
  - redirect (구 explain → 새 hub + `from=library` 보존)

#### 3.2 SSOT 통합
- [x] [proc/spec/03-features-and-ia.md](proc/spec/03-features-and-ia.md) — `/q/analysis/[questionId]` IA 추가 + 분석 페이지 거시→미시 드릴다운 명시
- [x] [proc/spec/04-ux-flow.md](proc/spec/04-ux-flow.md) — §1.1 "거시→미시 드릴다운" 다이어그램 + advice 출처 링크
- [x] [proc/spec/06-content-data.md](proc/spec/06-content-data.md) — §4.3 `WrongReasonCode` 10종 + §4.4 `WrongAttemptDiagnosis` 스키마

## 비범위 (이번 묶음에서 안 함)

- 실제 LLM 호출 / OCR / 이미지 업로드 (FaaS 정의서 §5, §11)
- 출판사 저작권 처리·B2B 패키지 (FaaS 정의서 §12, §20)
- 교사용 dashboard / 학부모 리포트 (FaaS 정의서 §6.2~6.3)
- 오답 원인 taxonomy v1 콘텐츠 — fallback 5개로 시작, 김의연 트랙 v1 도착 시 교체
- 영어 동의어/반의어 등 과목 특화 패널 데이터 — Phase 2 이후 필요 시
- design-followup plan의 디자인 audit 캡처 / 홈 재배치 / 채도·명도 — Phase 2 이후

## 의존성과 외부 트랙

- **콘텐츠 트랙 (김의연·최선혜/선애)**: 오답 원인 taxonomy v1, 학습 블록 taxonomy v1, 샘플 문제 5개 before/after — FaaS 정의서 §13 산출물. 도착 전까지 본 plan은 fallback으로 진행.
- **백엔드/IRT 모델**: `predictedGrade` 정확도 — 현재는 mock. Phase 1.1 `depth` 자동화는 mock 등급으로 충분.
- **저작권 검토**: 실제 콘텐츠 들어오는 시점에 FaaS 정의서 §12 원칙 확인.

## 성공 기준 (이 plan 한정)

advice §10 한 줄 요약을 코드로 옮긴 상태:

1. `/q/analysis` 한 화면 안에서 "최근 오답 원인 Top 3"와 "다시 봐야 할 문제 카드"가 보인다.
2. 카드 클릭이 미시 학습 허브(`/q/infinity/explain/[sku]`)로 이어진다.
3. 미시 허브가 학생 등급에 따라 다른 깊이로 자동 펼쳐진다.
4. 미시 허브에서 "코치 더 묻기 / 이 유형으로 무한풀기 / 복습 큐 등록"이 한 화면에서 닫힌다.
5. Playwright `qa-question-hub.mjs` 13개 이상 assertion pass.

## 진행 순서 제안

1. ~~**D1·D4 결정**~~ ✅ 완료 (2026-05-12) — D1=A `/q/analysis/[questionId]`, D4=B FaaS §8.1 10종
2. **Phase 0** (taxonomy + 분석 진입점) — PR 1
3. **Phase 1.0** (컴포넌트 추출 chore) — PR 2 (작고 리스크 낮음, 먼저 머지)
4. **Phase 1.1~1.4** (신규 라우트 + depth + hero + 우측 패널 + redirect) — PR 3
5. **Phase 2** (흐름 닫기 — 무한풀기/오답노트/다음 학습) — PR 4
6. **Phase 3** (검증·SSOT) — PR 5
7. 이후 design-followup plan으로 복귀

design-followup plan의 §2 audit 캡처 하네스만은 본 plan과 병렬 가능 — 콘텐츠 변경 전후 비교용으로 오히려 먼저 찍어두면 좋음.
