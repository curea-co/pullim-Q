# 풀림 Q 유사문항 · 오답 재풀이 UX 보강

## 목표
"문제 풀이 → 해설 → 오답 → 유사문항" 4축 중 끊겨 있는 **유사문항 도달 경로**와 **오답 단일 재풀이 경로**를 잇는다. 데이터(`solveDeck`, `errorPatterns`)는 이미 존재하므로 라우트·CTA·카드 UI만 추가.

## 작업 항목

### 1. 단일 문제 재풀이 라우트
- [x] [solve/page.tsx](src/app/(student)/q/infinity/solve/page.tsx)에 `?kind=retry&sku=<id>` 분기 추가 — 해당 SKU 한 문제만 큐로 구성 (URL은 기존 `kind=free|weak`와 통일)
- [x] retry 모드일 때 [SolveSessionBar](src/components/infinity/solve-session-bar.tsx)에 "오답 다시 풀기 — <패턴>" 라벨 표시
- [ ] 정답 처리 시 leitnerCards 박스 이동 시뮬레이션 — mock이 정적이라 보류

### 2. 오답 카드 → 재풀이 연결
- [x] [review/page.tsx](src/app/(student)/q/review/page.tsx) 우선 복습 큐 leitner row 전체를 `<Link>`로 감싸고 "다시 풀기" CTA 표시
- [ ] memoryQueue 항목은 SKU가 없어 retry CTA 미적용 — 별도 메모리 재학습 라우트가 필요 (비범위)
- [x] 패턴 단위 정복은 기존 `/conquer` 유지, 단일 재풀이와 병행 노출

### 3. 유사문항 추천 CTA (풀이 직후)
- [x] [solve/page.tsx](src/app/(student)/q/infinity/solve/page.tsx)의 AnswerFeedback 영역에 "유사 패턴 N문항 더 풀기" 버튼 추가
- [x] 클릭 시 `/q/infinity/solve?kind=weak&pattern=<patternName>` 로 이동 (기존 `handlePickWeak` 흐름 재사용)
- [x] 오답일 때는 강조 톤(빨강 계열), 정답일 때는 보조 톤으로 표시

### 4. 해설 Pattern Family 섹션 SKU 카드화
- [x] [sections.tsx](src/components/infinity/explain/sections.tsx) `RelatedCard`를 `<Link>` 카드로 변경 (기존 텍스트만 → 클릭 가능)
- [x] 카드 클릭 시 `/q/infinity/solve?kind=retry&sku=...` (단일 풀이 라우트 재사용)
- [x] `data.family`는 explain content가 미리 큐레이션 (현재 SKU는 원본 데이터에서 이미 제외됨)
- [ ] `solveDeck` 자동 필터링은 보류 — 현재는 ExplainContent가 직접 family 큐레이션 (mock 레벨에서 충분)

### 5. 해설 → 유사문항 단원 회귀 CTA
- [x] [explain/[sku]/page.tsx](src/app/(student)/q/infinity/explain/[sku]/page.tsx) 하단에 "이 패턴으로 더 풀기" 고정 CTA
- [x] `/q/infinity/solve?kind=weak&pattern=<patternName>` 로 연결

### 6. 정적 검증
- [x] `bunx tsc --noEmit` — 통과
- [x] `bun run lint` — 수정 파일 0건 (기존 DesignCanvas/history 경고만 잔존)
- [x] `bun run build` — 통과 (모든 라우트 정적 생성 확인)

## 비범위 (이번에 안 함)
- 진단(analysis) → 추천 문제 자동 연결
- 백엔드/실제 API 연동 (mock 레벨에서만 처리)
- Leitner 박스 이동 알고리즘 정교화
