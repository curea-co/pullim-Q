# 풀림 클래스봇 — 기능 명세서 (Feature Spec)

> **버전** v1.0 · 2026-04-30
> **목적** 다음 작업 시 "이 기능을 수정하려면 어디를 봐야 하나"를 1분 내에 찾을 수 있도록 한 기능 = 한 행으로 인덱싱.
> **참조 짝** `storyboard.md` (스크린샷 + 화면 설명)
> **변경 절차** 클래스봇 도메인 락인 작업 시 이 표의 "수정 진입점" 컬럼만 보면 됨.

---

## 사용 방법

각 기능은 다음 6 컬럼:

1. **기능 ID** — `CB-S-01` (학생) / `CB-T-01` (교사) 형식. 새 기능 추가 시 다음 번호.
2. **기능명** — 사용자가 인지하는 이름.
3. **라우트** — 학생/교사 URL.
4. **수정 진입점** — 페이지 파일·컴포넌트·mock 키 (편집 시작 위치).
5. **인터랙션 / AC** — 무엇을 누르면 무엇이 일어나는가.
6. **향후 변경 후보** — 알려진 확장 지점.

데이터 의존이 있으면 `Mock 의존` 행을 추가.

---

## CB-S — 학생 화면

### CB-S-01 · 내 클래스봇 홈

| | |
|---|---|
| 라우트 | `/classbot` |
| 페이지 | `app/(student)/classbot/page.tsx` |
| 핵심 컴포넌트 | `MyBotsStrip`·`PrimaryAssignmentCard`·`AssignmentRow`·`QuickEntry`·`Mini` (모두 같은 파일) |
| 외부 컴포넌트 | `LiveQuizCard` (`components/classbot/live-quiz-card.tsx`) · `FlywheelNote` |
| Mock 의존 | `getMyBots()`·`studentAssignments`·`classRoster`·`currentPersona`·`scopeMeta` |
| 인터랙션 | 봇 카드 클릭 → `/classbot/chat` · Primary CTA 클릭 → `solveHref` (Q 도메인) · 빠른 진입 3개(대화/리플레이/봇 찾기🔒) |
| AC | 라이브 봇은 LIVE pulse + lemon ring · 가장 급한 과제가 hero (D-day 우선) · 모니터링 안내 한 줄 노출 |
| 향후 변경 | 봇 클릭 시 `/classbot/[botId]/chat` 봇별 분리 · Primary 선택 알고리즘 (지금 첫 번째) |

### CB-S-02 · 봇 대화

| | |
|---|---|
| 라우트 | `/classbot/chat` |
| 페이지 | `app/(student)/classbot/chat/page.tsx` (use client) |
| 핵심 컴포넌트 | `ChatPanel` (key={bot.id} 패턴 — 봇 전환 시 state reset) · `Bubble`·`PendingBubble` |
| Mock 의존 | `getMyBots()`·`scopeMeta`·`classbotChatGreeting`·`classbotQuickPrompts`·`pickClassbotReply` (lib/mock/phase1.ts) |
| 인터랙션 | 봇 chip 클릭 → 봇 전환 + 채팅 리셋 · 빠른 질문 chip 클릭 → 자동 send · 입력 + 전송 → 900ms 후 봇 응답 |
| AC | 봇 전환 시 인사말이 봇별 다름 (`greetingFor(bot)`) · Scope 배지·Tier 표시 · 모니터링 알림 노출 |
| 향후 변경 | 봇별 응답 풀 분리 (현재 모든 봇이 같은 `pickClassbotReply` 사용) · 채팅 이력 저장 |

### CB-S-03 · 리플레이 리스트

| | |
|---|---|
| 라우트 | `/classbot/replay` |
| 페이지 | `app/(student)/classbot/replay/page.tsx` (use client) |
| 핵심 컴포넌트 | `FilterChip`·`ContinueWatching`·`LatestHero`·`ReplayRow`·`HeroStat`·`Mini` |
| Mock 의존 | `getSentReplays()`·`classBots`·`formatReplayTime` |
| 인터랙션 | 봇 chip 필터 → 리스트 갱신 · 리플레이 카드 클릭 → `/classbot/replay/[id]` |
| AC | 학생은 sent 리플레이만 봄 (processing/review 제외) · 진도 1초~끝 사이는 "이어 보기" hero · 진도 0이면 "방금 끝난 수업" hero · 시청 상태 3종 (완료/보는 중/안 봄) |
| 향후 변경 | 시청 진도 실제 저장 (현재 mock의 watchProgress 정적) · 정렬 옵션 |

### CB-S-04 · 리플레이 플레이어

| | |
|---|---|
| 라우트 | `/classbot/replay/[id]` |
| 페이지 | `app/(student)/classbot/replay/[id]/page.tsx` (server, generateStaticParams from getSentReplays) |
| 핵심 컴포넌트 | `ReplayPlayer` (`components/classbot/replay-player.tsx`, use client) |
| 내부 sub | `PlayerSurface`·`KeyTakeaways`·`TranscriptStream`·`SpeakerBadge`·`FocusHeatmap`·`BookmarksPanel`·`TeacherQuestionsPanel`·`PrivacyNote` |
| Mock 의존 | `studentReplays.find(id)`·`formatReplayTime`·`segmentMeta` (지역) |
| 인터랙션 | ▶/❚❚ → 100ms 틱 (speed × 0.1) · ±10초 / 1x~2x / 스크러버 클릭 / 마커 클릭 / 트랜스크립트 라인 클릭 / 히트맵 빈 클릭 → seek · 북마크 추가/클릭 / 선생님 질문 composer 전송 |
| AC | 본인 활동 마커는 큰 아이콘, 다른 활동은 작은 dot · 트랜스크립트 현재 라인 자동 가운데 스크롤 + lemon ring · 자막 카드는 현재 발화자 라인 1개 · 시청 진도가 있으면 그 위치에서 시작 |
| 향후 변경 | 실제 음성·영상 임베드 (현재 시간 시뮬레이션만) · 가린 라인 처리 (현재 모든 transcript 노출) · 북마크 영구 저장 |

### CB-S-05 · 봇 찾기 (locked)

| | |
|---|---|
| 라우트 | `/classbot/discover` |
| 페이지 | `app/(student)/classbot/discover/page.tsx` |
| 상태 | locked future placeholder · nav-config의 `locked: true` |
| 미래 컨텐츠 | EBS·EDWITH 인강 / 대학·기관 / 공교육 공유 봇 |
| 향후 변경 | v2 출시 시 페이지 통째로 교체 + nav-config locked 해제 |

---

## CB-T — 교사 화면

### CB-T-01 · 내 클래스봇 (라이브 운영)

| | |
|---|---|
| 라우트 | `/teacher/classbot` |
| 페이지 | `app/(teacher)/teacher/classbot/page.tsx` |
| 핵심 컴포넌트 | `ClassKpiBar`·`ScopeControl`·`StudentRoster`·`LiveFeedPanel`·`QuizLauncher`·`DispatchedAssignments` (마지막은 같은 파일) |
| Mock 의존 | `myClassBot`·`classRoster`·`liveFeed`·`currentQuiz`·`studentAssignments`·`classKpis`·`scopeMeta` |
| 인터랙션 | "수업 종료 → 리플레이 생성" → `/teacher/replay/rp_004` · Scope L1~L5 변경 (감사 로그) · "새 과제" + 행별 "다시 발사" · 위기 신호 1:1 상담 CTA |
| AC | 라이브 진행 중 봇 1개 운영 가정 · 학생 명단 활동 히트맵 5분 단위 6칸 · 봇 질문 피드 5개 · 즉석 퀴즈 응답 분포 막대 |
| 향후 변경 | 멀티봇 운영 (`classBots[]` 전체 운영) · "수업 종료" 실제 동작 (현재 link만) |

### CB-T-02 · 봇 빌더 (8단계)

| | |
|---|---|
| 라우트 | `/teacher/builder` |
| 페이지 | `app/(teacher)/teacher/builder/page.tsx` |
| 핵심 컴포넌트 | `StepIndicator` (`components/builder/step-indicator.tsx`)·`StepContent` (`components/builder/step-content.tsx`) |
| Mock 의존 | `BuilderState` (`components/builder/builder-types.ts`) |
| 8단계 | ① 정체성 ② 목소리 ③ 교안 ④ 수업방식 ⑤ Scope ⑥ 평가 ⑦ 안전 ⑧ 배포 |
| AC | 점프 가능 · 임시저장 · Step 6 루브릭 합 100% 검증 · Step 8에서 반 선택 → 학생 enrollment 생성 |
| 향후 변경 | 배포 단계가 실제로 `studentEnrollments[]`에 추가하도록 (현재 mock 정적) |

### CB-T-03 · 실시간 수업 (멀티 봇)

| | |
|---|---|
| 라우트 | `/teacher/live` |
| 페이지 | `app/(teacher)/teacher/live/page.tsx` |
| 핵심 컴포넌트 | `LiveSessionCard`·`UpcomingRow`·`EndedRow`·`Kpi` (모두 같은 파일) |
| Mock 의존 | `liveSessions`·`classRoster.alert`·`classKpis`·`scopeMeta` |
| 인터랙션 | LIVE 카드 → `/teacher/classbot` · 종료 행 → `/teacher/replay/{rp_id}` (검토) · 즉시 개입 CTA → Wee센터 연결 |
| AC | 라이브·예정·종료 3 분류 · 알림 카운트 표시 · 멀티 봇 KPI 합산 |
| 향후 변경 | 봇별 라이브 입장 (현재 모든 LIVE 카드가 `/teacher/classbot`로 가서 봇 구분 없음) |

### CB-T-04 · 즉석 퀴즈

| | |
|---|---|
| 라우트 | `/teacher/quiz` |
| 페이지 | `app/(teacher)/teacher/quiz/page.tsx` |
| 핵심 컴포넌트 | `QuickAction` (같은 파일) |
| Mock 의존 | `quizHistory`·`quizDrafts`·`currentQuiz`·`classKpis`·`aiTierMeta` |
| 인터랙션 | 주제 입력 + 난이도 select + 생성 버튼 (mock) · 추천 chip 클릭 (mock) · "지금 종료" CTA · 행 클릭 (현재 동작 없음) |
| AC | 진행 중 퀴즈 실시간 분포 · 오답 클러스터 코멘트 · 이력 카드 종류·Tier·정답률 |
| 향후 변경 | 실제 퀴즈 생성 동작 · 응답 상세 분포 페이지 |

### CB-T-05 · 리포트 센터

| | |
|---|---|
| 라우트 | `/teacher/reports` |
| 페이지 | `app/(teacher)/teacher/reports/page.tsx` (use client) |
| 핵심 컴포넌트 | `ReportCard` |
| Mock 의존 | `reports[6]` (`ReportSummary`·`ReportKind`) |
| 인터랙션 | 종류 필터 chip 7개 (전체 + 6종) · 위기 신호 카드 우선 · "상세 보기" / "승인·발송" 액션 |
| AC | 6종 = realtime / lesson-end / student / period / class / parent · 상태 4종 = pending-approval / approved / sent / draft · KPI 4개·요약 |
| 향후 변경 | 상세 보기 페이지 · 학부모 BIZ 메시지 발송 실제 동작 · 8 KPI 전체 |

### CB-T-06 · 채점 허브

| | |
|---|---|
| 라우트 | `/teacher/grading` |
| 페이지 | `app/(teacher)/teacher/grading/page.tsx` (use client) |
| 핵심 컴포넌트 | `GradingDetail`·`Stat` |
| Mock 의존 | `gradingQueue[6]` (`GradingItem`)·`gradingStats`·`aiTierMeta`·`statusMeta` (지역) |
| 인터랙션 | 큐 행 클릭 → 우측 상세 swap · 상세에서 승인 / 수정 / 다음 학생 액션 · 변경률 임계 초과 시 루브릭 재학습 제안 |
| AC | T1 즉시 채점·T2 서술형 초안·T3 상위/하위 분석 · 루브릭 항목별 점수 + 가중치 · 위기 신호 표시 |
| 향후 변경 | 점수·코멘트 실제 편집 폼 · 루브릭 재학습 동작 · 다음 학생 자동 이동 |

### CB-T-07 · 템플릿 마켓

| | |
|---|---|
| 라우트 | `/teacher/templates` |
| 페이지 | `app/(teacher)/teacher/templates/page.tsx` (use client) |
| 핵심 컴포넌트 | `TemplateCard`·`Stat`·`FilterChip` (지역) |
| Mock 의존 | `templates[6]`·`myTemplateUploads[3]`·`kindMeta` (지역) |
| 인터랙션 | 둘러보기/내 템플릿 탭 토글 · 종류 chip 필터 (전체·봇·교안·퀴즈) · 검색 input (mock) · "가져오기" / "등록" CTA |
| AC | 무료/유료 표시 · 공식 검수 마크 · 평점·다운로드·하이라이트 3개 · 7:3 정산 |
| 향후 변경 | 검색 실제 동작 · 가져오기 → 봇 빌더 prefill · 정산 페이지 |

### CB-T-08 · 봇 설정 (8탭)

| | |
|---|---|
| 라우트 | `/teacher/settings` |
| 페이지 | `app/(teacher)/teacher/settings/page.tsx` (use client) |
| 핵심 컴포넌트 | 8개 Pane 함수 (`IdentityPane`·`VoicePane`·`CurriculumPane`·`TeachingPane`·`ScopePane`·`EvaluationPane`·`SafetyPane`·`IntegrationPane`)·`Field`·`Toggle`·`StatusBadge` |
| Mock 의존 | `botSettings` (`BotSettingsState`)·`scopeMeta` |
| 인터랙션 | 좌측 탭 클릭 → 우측 콘텐츠 swap (lg sticky) · 폼 항목 (현재 mock — 변경 비저장) · "저장" CTA |
| AC | 8 카테고리 + 마지막 변경 메타 · Scope·Voice 동의·연동 상태 시각화 |
| 향후 변경 | 저장 실제 동작 · 음성 복제 wizard · 시간대별 자동 Scope 스위치 add/remove |

### CB-T-09 · 수업 리플레이 큐

| | |
|---|---|
| 라우트 | `/teacher/replay` |
| 페이지 | `app/(teacher)/teacher/replay/page.tsx` |
| 핵심 컴포넌트 | `ProcessingCard`·`ReviewCard`·`SentCard`·`Mini` (모두 같은 파일) |
| Mock 의존 | `studentReplays`·`Replay.status` (`processing`/`review`/`sent`) |
| 인터랙션 | 검토 카드 → `/teacher/replay/{id}` (review 상태) · 발송됨 카드 → `/teacher/replay/{id}` (sent 상태) · 처리 중 카드는 disabled |
| AC | 자동 생성 안내 · 처리 중 progress 바 · 검토 대기 강조 (warn border) · 발송됨 시청 통계 |
| 향후 변경 | 자동 status 전환 (90초 타이머) · 처리 중 카드 클릭 시 진행 상세 |

### CB-T-10 · 리플레이 검토/편집

| | |
|---|---|
| 라우트 | `/teacher/replay/[id]` |
| 페이지 | `app/(teacher)/teacher/replay/[id]/page.tsx` (server) |
| 핵심 컴포넌트 | `ReplayReview` (`components/classbot/replay-review.tsx`, use client) |
| 내부 sub | `StatusBadge`·`ProcessingPane`·`ProcessStep`·`ReviewBanner`·`KeyTakeawaysEditor`·`KeyTakeawaysReadOnly`·`TranscriptVisibility`·`TranscriptReadOnly`·`SegmentsPreview`·`FocusHeatmapPreview`·`SentBanner`·`ViewerStatsPane`·`Stat`·`ApproveBar` |
| Mock 의존 | `studentReplays.find(id)` (`Replay`·`ReplayStatus`·`ReplayViewerStats`) |
| 상태 분기 | processing → ProcessingPane / review → 편집 폼 + ApproveBar / sent → 시청 통계 + read-only |
| 인터랙션 | 핵심 메시지 textarea 편집 · 트랜스크립트 라인 클릭 → 노출 토글 · "학생에게 발송" CTA → status local 'sent' 전환 |
| AC | 핵심 메시지 3/3 채워야 발송 활성 · 가린 라인은 학생에게 안 감 (read-only 페이지에서 노출된 라인만 표시) · 시청 통계 6 KPI |
| 향후 변경 | 발송 실제 동작 · 라인 토글 영구 저장 · 발송 후 다시 편집 가능 여부 |

---

## 데이터 모델 — 핵심 타입

### `ClassBot` (`lib/mock/classbot.ts`)
```ts
{
  id: string;
  name: string;            // "수학이 형"
  avatarEmoji: string;     // "🧑‍🏫"
  teacherName: string;     // "김수학 선생님"
  organization: string;    // "대치프리미엄 수학학원"
  subject: string;
  grade: string;
  tone: '정중' | '친근' | '스파르타';
  scope: ScopeLevel;       // 1~5
  isLive: boolean;
  currentLesson?: { title; chapter; startedAt; durationMin; studentCount };
  enrolledCount: number;
}
```

### `StudentEnrollment`
```ts
{
  botId: string;
  classroomId: string;
  classroomLabel: string;  // "고2 미적분 A반"
  assignedBy: string;      // "김수학 선생님"
  assignedAt: string;
  via: string;             // "대치프리미엄 수학학원"
}
```

### `Assignment`
```ts
{
  id; botId; title; scope; subject; grade;
  chapterFrom; chapterTo;        // 단원 범위 (3-Depth)
  achievementCodes: string[];
  questionCount; difficulty;
  mode: 'practice' | 'exam' | 'wrong-conquest';
  scopeOverride?: ScopeLevel;    // 시험 시 L1 강제
  source: 'teacher-assigned' | 'bot-prescribed' | 'self';
  assignedBy; assignedAt;
  dueLabel; dDay;
  completedCount; recentAccuracy;
  state: 'todo' | 'in-progress' | 'submitted' | 'overdue';
  reasonHint?;                   // 봇 처방 이유
  solveHref;                     // /q/infinity/solve?... (Q 도메인 진입)
}
```

### `Replay` + 보조 타입
```ts
type ReplayStatus = 'processing' | 'review' | 'sent';

Replay {
  id; lessonId; botId; classroom;
  title; chapter; botName;
  date; startedAt; endedAt; durationMin; participantCount;
  status: ReplayStatus;
  aiProcessedAt: string | null;
  sentAt: string | null;
  myAccuracy;
  keyTakeaways: string[];        // AI 추출 (편집 가능)
  segments: ReplaySegment[];     // 8 마커
  transcript: TranscriptLine[];  // 동기화 재생 (sec 단위)
  focusBins: number[];           // 1분 단위 50칸
  watchProgress: { lastSec; completed };
  bookmarks: ReplayBookmark[];   // 학생 저장
  teacherQuestions: ReplayTeacherQuestion[];
  viewerStats: ReplayViewerStats | null;  // sent에서만
}
```

---

## 변경 절차 (이 문서 사용법)

1. 수정할 기능을 위 표에서 찾는다 (라우트로).
2. **수정 진입점** 컬럼 = 편집 시작 위치.
3. 데이터 변경이면 **Mock 의존** 컬럼의 mock 키를 `lib/mock/classbot.ts`에서 찾는다.
4. 컴포넌트만 변경이면 **핵심 컴포넌트** 파일만 본다.
5. nav-config 항목 변경은 **공유 코드** — CLAUDE.md §3 "글로벌 작업"으로 분리 후 진행.
6. 작업 후 audit 3종 통과 확인 (`pnpm exec tsc --noEmit` · `pnpm lint` · `pnpm build`).

---

## 알려진 한계 (현재 mock 단계)

| 한계 | 설명 | 해소 시점 |
|---|---|---|
| 봇 전환 시 모든 봇이 같은 응답 | `pickClassbotReply`가 봇 무관 | 봇별 RAG 인덱스 연결 후 |
| 시청 진도 정적 | `watchProgress.lastSec`가 mock 고정 | 학생 시청 이벤트 영구 저장 |
| 발송 승인 local state | `setSentLocal(true)`만 — 새로고침 시 reset | DB 저장 |
| 시간 시뮬레이션 | 100ms 틱 — 실제 음성·영상 없음 | 음성 파일 임베드 + 동기화 |
| 단일 봇 가정 (`/teacher/classbot`) | myClassBot 하나 운영 | classBots 멀티 운영 화면 |
