# UX Audit — 2026-05-14 사후 (오늘 머지 10 PR)

> 캡처: [captures/](captures/) — 15 라우트 × desktop 1280·mobile 360 = 30장
> 코드 검토: [src/components/shell/leave-guard.tsx](../../../src/components/shell/leave-guard.tsx), [src/components/conqueror/conquer-intro-dialog.tsx](../../../src/components/conqueror/conquer-intro-dialog.tsx), [src/components/shell/coach-fab.tsx](../../../src/components/shell/coach-fab.tsx) 외

## 우선순위 요약

| 심각도 | 건수 | 분류 |
|---|---|---|
| 🚨 Critical (기능 결함) | 3 | LeaveGuard popstate 사이클, CoachFab 모바일 점유, Dialog trigger 회피 |
| 🟡 Important (UX/접근성) | 5 | 색 신호 오용, 마커 가시성, 영문 카피, 모바일 hero 비중, 빈 화면 |
| 🟢 Nit (polish) | 4 | 영문 라벨, D-day 색, SKU 무게, trend 색 신호 |
| 📋 Open (디자인 결정) | 2 | 외부 도메인 placeholder, F-2 G1 판단 |

---

## 🚨 Critical

### C1. CoachFab 모바일 — 마지막 viewport 콘텐츠 점유

**증상**: 모바일 360 viewport 에서 `coach-fab.tsx` 의 `fixed right-4 bottom-20` (= BottomNav 60px 위) FAB이 **거의 모든 학생 라우트의 마지막 카드/리스트 우측 절반**을 가린다.

확인된 라우트 (캡처 기반):
- `/q` — "스튜디오 가보기 ↗" CTA 가림 (스토어/스튜디오 카드)
- `/q/infinity` — 최근 풀이 마지막 행 가림
- `/q/analysis` — 메타 4차원 두 번째 행 가림
- `/q/review` — 큐 2번 카드 우측 가림
- `/q/analysis/diagnose` — "시작하기 / 분석 홈으로" 두 버튼 사이 가림
- `/q/onboarding` — 1단계 카드 우측 가림

[src/components/shell/coach-fab.tsx:23](../../../src/components/shell/coach-fab.tsx#L23): `fixed right-4 bottom-20 ... md:bottom-6` — 모바일은 80px, 데스크탑은 24px. 모바일 위치는 BottomNav (60px) + 16px = 콘텐츠 영역 끝에서 시작이지만, 카드 우측 padding 안으로 들어와 시각·터치 모두 충돌.

**제안**:
- 안 1: 모바일에선 BottomNav 5번째 슬롯 "코치" → "AI에게 묻기" 로 통합, FAB 자체를 `md:hidden` 인버스로 데스크탑 전용화
- 안 2: 모바일은 FAB을 icon-only (44×44, 텍스트 X)로 축소 + 우측 정렬 유지 — 점유 면적 50% 축소

→ **Plan 신설 권장**: `2026-05-14_q-coach-fab-mobile-occlusion.md`

### C2. LeaveGuardProvider popstate 사이클 + dummy stack 누적

**증상**: [src/components/shell/leave-guard.tsx:95-114](../../../src/components/shell/leave-guard.tsx#L95-L114) 의 popstate 가드 구현이 두 가지 결함:

1. **inProgress 토글마다 dummy 누적**: `useEffect` 의존성이 `inProgress` 1개 → true 진입 시마다 `pushState` 호출되지만 false 전이 시 dummy 제거 없음 → `history.length` 증가. 사용자가 풀이 페이지에 여러 번 들어왔다 나가면 history stack 이 더미로 오염됨.
2. **나가기 사이클**: 핸들러 116L `handleLeaveOrBack` 의 `__back__` 분기는 `history.back()` 호출 → 직전 위치는 솔브 페이지 자신 → 페이지 그대로 → `useEffect` 가 다시 dummy push → 학생이 진짜 뒤로갈 수 없음. **학생은 browser back 으로 솔브를 떠날 수 없는 상태가 됨.**

**제안**:
- handleLeaveOrBack 의 `__back__` 분기에서 `setInProgress(false)` 를 먼저 호출 → 그 다음 frame 에서 `history.back()`
- popstate 핸들러는 한 번 발동 후 listener 즉시 제거, 가드 종료 시 listener 추가 정리

→ **수정 필요 (코드 버그)**

### C3. ConquerIntroDialog — DialogTrigger preventDefault 회피 불완전

**증상**: [src/components/conqueror/conquer-intro-dialog.tsx:44-54](../../../src/components/conqueror/conquer-intro-dialog.tsx#L44-L54) — dismissed 상태에서 `e.preventDefault()` 후 `router.push` 호출. base-ui `DialogTrigger` 의 내부 toggle 이 controlled `open` 상태를 변경하기 전에 navigation 이 시작될지 race 가 있음.

검증 안 됨: base-ui 가 `e.defaultPrevented` 를 존중하는지 문서·코드 미확인. 만약 무시한다면, dismissed 상태에서 클릭 시 다이얼로그가 잠시 열렸다 닫히는 깜빡임 발생 가능.

**제안**: DialogTrigger 사용 안 함. 일반 `<button onClick>` 로 분기:
- dismissed → 곧장 router.push
- !dismissed → `setOpen(true)`

→ **수정 필요 (defensive)**

---

## 🟡 Important

### I1. review-conquer "연속 정답 0회" 빨강 표시

**증상**: [proc/research/2026-05-14_ux-audit/captures/review-conquer-desktop.png](captures/review-conquer-desktop.png) — 진입 직후 (0/5 문항) 에서 "연속 정답 0회" 가 **빨강** 색. 정복 모드 시작 시점에 빨강은 "실패" 신호로 읽힘. 사실은 시작 전 상태.

**제안**: 0회 → slate (중립), ≥1회 → success-bg + pullim-success. [src/app/(student)/q/review/conquer/page.tsx](../../../src/app/(student)/q/review/conquer/page.tsx) 검토.

### I2. AnalysisTwoAxis 또래 마커 가시성

**증상**: [src/components/analysis/analysis-two-axis.tsx:85-89](../../../src/components/analysis/analysis-two-axis.tsx#L85-L89) — `bg-pullim-slate-500 absolute top-1/2 h-3 w-0.5` (1px 너비). 8px 막대 위에서 1px 마커는 거의 인지 불가. 캡처 보면 분기선이 보이는 듯하지만 자세히 봐야 함.

**제안**:
- `w-0.5` → `w-1` (2px) 또는 `w-[3px]`
- 추가 `outline: 1px white` 같은 stroke 로 막대 색과 분리

### I3. infinity-solve-picker "PRACTICE / EXAM" 영문 약어

**증상**: 모드 토글 카드의 "연습 모드 **PRACTICE**" / "시험 모드 **EXAM**" 영문 강조 — 학생 친화 가이드 §11.1 위반. F-7 design-followup 에서 비슷한 영문 제거 작업 (T2·T3·Deep 등)을 했으므로 일관성 결여.

**제안**: 영문 PRACTICE/EXAM 제거 또는 한글 부제 "맞춤 문제 + AI 코치" 같은 형태로 대체. [src/components/infinity/mode-toggle.tsx](../../../src/components/infinity/mode-toggle.tsx) 검토.

### I4. /q/analysis 모바일 hero viewport 절반 점유

**증상**: [captures/analysis-mobile.png](captures/analysis-mobile.png) — DiagnosisHero (학습자 유형 + 4 stat chip 2×2) 가 viewport 740px 중 약 400px (54%) 차지. 그 아래 AnalysisTwoAxis 메타 4차원 첫 두 행만 보이고 나머지는 스크롤.

**제안**:
- 모바일에서 stat chip 4 가로 1열 (4 row) 또는 `sm:grid-cols-2` 유지하면서 chip padding `p-2.5` → `p-2`
- "데이터 소스 라인" 1줄로 묶고 학습자 유형 + 4 chip만 첫 viewport 안에 — chip 4가 카드 모양이 아닌 인라인 stat 으로 변형

### I5. /q/review/memory 단일 학습 첫 화면 비어있음

**증상**: [captures/review-memory-desktop.png](captures/review-memory-desktop.png) — 진입 시 PageHeader + 복습 큐로 돌아가기 링크 + 질문 카드 (질문/힌트보기/답보기) 외 다른 정보 0. 데스크탑 viewport 의 50% 가 빈 공간. 학생이 "다음에 뭐가 있는지" 모름.

**제안**:
- 진행 표시: "전체 N개 중 K번째 학습 중" (memory 큐 위치)
- 다음 카드 미리보기 1줄
- 또는 양옆에 같은 카드 종 미니 사이드바 (강한 시각 변화 — 후속 plan 후보)

→ **plan 후보**: `2026-05-DD_q-memory-single-screen-density.md`

---

## 🟢 Nit

### N1. AI 코치 패널 헤더 "T3 · Deep" 영문 라벨

[captures/infinity-solve-free-desktop.png](captures/infinity-solve-free-desktop.png) — 우측 패널 헤더 "AI 풀이 코치 / 풀림 튜터" 옆 "해설 빠른 응답" 라벨 OK 인데 코치 패널 자체 헤더 영역에 영문 잔재 있는지 추후 확인.

### N2. q-home "D-21" blue-700 텍스트 색

PR-A 에서 환경 텍스트로 처리됐지만 D-day 자체는 시급도 의미 운반. 시급도가 가까워질수록 warn 톤으로 바뀌는 동적 분기가 더 직관적일 수 있음 (D-7 이내 warn, D-3 이내 danger 등).

### N3. review-conquer SKU 카드 헤더 시각 무게

[captures/review-conquer-desktop.png](captures/review-conquer-desktop.png) — 문제 카드 우상단 `Q-MATH-CALC-0042` 흑색 배경 + 흰 텍스트 + monospace. 메타 정보치곤 시각 무게가 본문 (문제 텍스트) 보다 강함. `bg-slate-100 text-slate-700` 으로 톤다운 가능.

### N4. DiagnosisHero 메타 점수 trend 색 신호 없음

[src/components/analysis/diagnosis-hero.tsx:41](../../../src/components/analysis/diagnosis-hero.tsx#L41) — `sub={overallMeta.trend}` 가 "+4 (지난 7일)" 인데 색 없이 slate-500. positive (+) 이면 `text-pullim-success`, negative 이면 `text-pullim-danger` 분기 추가 권장.

---

## 📋 Open Questions

### O1. /q "풀림에서 더 가져오기" 섹션 placeholder

[captures/q-home-desktop.png](captures/q-home-desktop.png) — 두 카드 "스토어 가보기" / "스튜디오 가보기" 가 외부 도메인 진입 CTA. 풀림 Q 단독 워크스페이스에 두 도메인 미존재 (CLAUDE.md §1). 학생이 클릭하면 어디로 가는가?

[src/app/(student)/q/page.tsx](../../../src/app/(student)/q/page.tsx) `studioOutboundUrl` / `storeOutboundUrl` 같은 외부 URL 매핑이 있는지, 아니면 데드 링크인지 확인 필요.

**제안**: G1 결정 — (a) 외부 URL 명시 연결 + chip 보강 (b) 카드 자체 제거 (Q 단독 환경에서는 노이즈) (c) "곧 출시" placeholder 로 명시

### O2. F-2 모바일 카드 밀도 — G1 판단 대기

[PR #37 캡처 + 측정](https://github.com/curea-co/pullim-Q/pull/37) — `/q/review` 가 가장 빡빡 (KpiBand 4개 2×2 + 큐 행 압박). 권장 (b) 단계적 감소 대기.

→ **본 audit 이 F-2 자료를 보완**: KpiBand 4개가 모바일 360 의 viewport 1/4 차지하는 현실을 audit 캡처에서 재확인. 진행 권장.

---

## 함께 본 긍정 신호 (정상 작동)

- ✅ 섹션 간격 24px 토큰화: e2e 가드 + 시각 일관성 정상
- ✅ Hero 그라디언트 soft tonal: 텍스트 콘트라스트 (slate-900 on blue-50) 가독성 양호
- ✅ Color saturation rebalance: 강한 색이 "오답 정복하기" CTA, "정복 세트 풀기" CTA, "다음 문항" 등 행위/의미 영역에만
- ✅ 시그니처 ring 제거 후에도 번호 뱃지 (warn) + "시그니처" pill 이 충분히 강조 신호 운반
- ✅ analysis 새 두 축 시각화: peer 마커 가시성 (I2) 외에는 정보 hierarchy 와 차원 구분 좋음
- ✅ exam-result warn-bg 톤다운: 정보(73/100, +0.07)는 그대로 살아있고 시각 부담만 감소
- ✅ review-conquer mobile: 1 viewport 안에 헤더 + 문제 본문 + 보기 일부 정상 진입

---

## 다음 액션 (제안 순)

1. **C1 즉시 수정** — CoachFab 모바일 위치/존재 결정 + 코드 수정 (가장 광범위 영향)
2. **C2 즉시 수정** — LeaveGuard popstate 사이클 + dummy 정리
3. **C3 방어 수정** — ConquerIntroDialog 트리거 일반 button 화
4. **I1·I2·I3·N4** 한 묶음 polish PR — `chore/q-2026-05-14-audit-polish`
5. **I4·I5** — 별도 plan 후속
6. **O1·O2** — G1 결정 게이트
