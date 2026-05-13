# 기억장치 재학습 라우트 — `/q/review/memory/[id]`

## 목표
`/q/review` 우선 큐의 `memoryQueue` 항목(개념·단어·이론 카드)도 클릭 시 단일 재학습 화면으로 이동할 수 있게 한다. 현재는 SKU가 없어 `?kind=retry` 라우트 재사용 불가 — 메모리 도메인 자체 라우트가 필요.

## 작업 항목

### 1. MemoryItem 모델 점검
- [x] [src/lib/mock/memory.ts](src/lib/mock/memory.ts) `MemoryItem` 타입에 `prompt`, `answer`, `hint?`, `mnemonic?` 필드 추가
- [x] mock seed 7개 항목 모두 학습 콘텐츠 채움 (지수함수·관계대명사·뉴턴 2법칙·접속사·ε-δ·ambiguous·정규분포 표준화)
- `visual?` 필드는 비범위로 보류 (텍스트 콘텐츠로 충분)

### 2. 라우트 신설
- [x] [src/app/(student)/q/review/memory/[id]/page.tsx](src/app/(student)/q/review/memory/[id]/page.tsx) — 단일 카드 학습 화면 (client component, async params unwrap via `use()`)
- [x] 3-phase 상태: `front` (prompt + 힌트 토글 + "답 보기") → `back` (answer + mnemonic + "기억나요"/"안 나요") → `result` (retention 변화 + 다음 복습 + 복귀 링크)
- [x] [src/lib/store/memory-store.ts](src/lib/store/memory-store.ts) 신규 zustand store `useMemoryStore`. action `applyResult(id, remembered)` 가 `{prevRetention, newRetention, prevNextHours, newNextHours, remembered, isMastered}` 반환
- SRS 전이 규칙: 기억나요 → retention +0.15(상한 1.0), nextReview ×2(base 24h); 안 나요 → retention −0.25(하한 0), nextReview 1h. 마스터 임박: remembered + retention ≥ 0.85.

### 3. 우선 큐 연결
- [x] [src/app/(student)/q/review/page.tsx](src/app/(student)/q/review/page.tsx) `QueueRow` memory kind도 `<Link href={/q/review/memory/${id}}>`로
- [x] 시각 일관성: leitner "다시 풀기" 배지와 같은 위치에 "기억 학습" 배지 (Brain 아이콘)
- [x] `useMemoryStore` 구독으로 retention/큐 즉시 갱신

### 4. 마이크로카피
- [x] 앞면 토글: "답 보기" / 뒤에 "기억나요" / "안 나요"
- [x] 결과 헤더: "마스터 도달!" / "기억 강화 완료" / "한 번 더 만나요" 3분기
- [x] toast: "기억 N% → M%" + 다음 복습 시간

### 5. 검증
- [x] `bunx tsc --noEmit && bun run lint && bun run build` 전부 exit 0
- [x] Playwright [scripts/qa-memory-retry.mjs](scripts/qa-memory-retry.mjs) **13/13 pass**:
  - 초기 retention 일치 (m2 71%, m4 43%)
  - 시나리오 A: m2 기억나요 → 71% → 86% (mastered), nextReview 2일 → /q/review 큐 이탈 정상
  - 시나리오 B: m4 안 나요 → 43% → 18%, nextReview 1h → /q/review 18% 갱신 반영
  - 시나리오 C: 잘못된 id → "찾을 수 없는 학습 항목" 안내 카드

## 비범위
- 음성·이미지 카드 (텍스트만)
- 자동 복습 알림 (푸시/이메일)
- SRS 알고리즘 정교화 — leitner-mutable-mock plan과 별도지만 mock 가변화 컨벤션은 공유
- 학습 콘텐츠 자동 생성

## SSOT 통합 (구현 후)
- `03-features-and-ia.md` — 기억장치 IA에 단일 카드 학습 화면 추가
- `04-ux-flow.md` — 큐 → 카드 학습 → 결과 플로우
- `06-content-data.md` — MemoryItem 필드 확장
