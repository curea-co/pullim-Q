# 풀림 Q — /q/review/memory 단일 학습 화면 밀도 개선

> **출처**: [proc/plan/2026-05-18_q-ux-audit-important-nit-sweep.md](2026-05-18_q-ux-audit-important-nit-sweep.md) §1 I5 분리
> **연관 audit 항목**: [proc/research/2026-05-14_ux-audit/findings.md](../research/2026-05-14_ux-audit/findings.md) Important 5번
> **게이트키퍼**: G4 (UI 톤·정보 hierarchy 변경)
> **연관 daily-rollup**: [2026-05-22_daily-rollup.md](2026-05-22_daily-rollup.md) §6

## 0. 진행 현황 (2026-05-22)

- [ ] 1단계 — Front 카드 헤더에 진행 표시(전체 N개 중 K번째) 추가
- [ ] 2단계 — Front/Back 카드 하단에 다음 카드 미리보기 1줄
- [ ] 3단계 — Result 카드에서 "다음 카드로 이동" CTA (다음 미리보기 라벨 미리 노출 → Result 닫기 후 동선 단축)

## 1. 배경 / 문제 정의

[src/app/(student)/q/review/memory/[id]/page.tsx](../../src/app/\(student\)/q/review/memory/%5Bid%5D/page.tsx) 는 단일 카드 (Front → Back → Result) 한 장만 보여주는 풀스크린 구조. 학생 시점에서 **"지금 몇 번째인지 / 다음에 뭐가 오는지" 모름** → 첫 화면이 비어 보이고 학습 페이스 잡기 어려움.

**구체 문제**:
- Front phase: `prompt` + `hint button` + `답 보기 CTA` 만 — 카드 위치(K/N) 부재
- Back phase: `prompt` + `answer` + `mnemonic?` + `기억나요/안 나요 2-btn` — 다음 카드 단서 0
- Result phase: 통계 + `복습 큐로 돌아가기` 단일 CTA — 다음 카드 진입까지 (1) 큐 페이지 진입 (2) 큐에서 다음 카드 클릭 = 2-tap. 큐 길면 다음 카드 위치 인지 비용도

**개선 방향**:
1. Front 카드 헤더에 "전체 N개 중 K번째" 한 줄 — sweep plan §1 I5 명시
2. Front/Back 카드 하단에 "다음: <라벨>" 1줄 미리보기 — 학습 페이스 가시화
3. Result 카드 "다음 카드로 바로 가기" CTA — 큐 우회 동선

## 2. 가정 (반드시 통과)

| 항목 | 가정값 | 설계 함의 |
|---|---|---|
| 단일 카드 진입 동선 | `/q/review` → 큐 카드 클릭 → `/q/review/memory/[id]` | 큐 정렬 = K/N 계산 기준 |
| 큐 정렬 기준 | `dueItems()` (망각 곡선 임계점 이전 + due 순) | `useMemoryStore.dueItems().findIndex(id)` 로 K |
| "다음 카드" 정의 | 큐에서 현재 카드 다음 위치 — 큐 끝이면 미리보기 미노출 | overflow 처리 명시 |
| 미리보기 정보량 | `next.label` 1줄 — `source` 라벨까지 노출은 노이즈 | 라벨 truncate 시 정렬 깨지지 않게 |
| 모바일 360 폭 | 미리보기 1줄에 라벨 길어지면 `line-clamp-1` | 가로 overflow 방지 |
| Result CTA 분기 | 다음 카드 없으면 "복습 큐로 돌아가기" 단일 CTA 유지 | 분기 1턴 |

## 3. 단계 분할

### 3.1 1단계 — 진행 표시 헤더

- `useMemoryStore.dueItems()` 에서 현재 `id` 위치 → `{ index, total }` 계산 (큐 비어있으면 fallback)
- `PageHeader.eyebrow` 텍스트를 `풀림 기억장치 · 단일 학습` → `풀림 기억장치 · ${index + 1}/${total}` 또는 `description` 끝에 `· ${index + 1}/${total}번째` 추가
- 큐 외부 진입(URL 직접) 시 `total = 0` 분기 — `index` 미노출 fallback

### 3.2 2단계 — 다음 카드 미리보기

- Front / Back 카드 하단(`section` 닫기 직전) `nextItem` 있을 때만 미리보기 박스 — `border-dashed`, `text-pullim-slate-500`, `다음: ${nextItem.label}` `line-clamp-1`
- `next = dueItems()[index + 1]` 없으면 미리보기 생략

### 3.3 3단계 — Result "다음 카드로" CTA

- `ResultCard` 의 단일 `복습 큐로 돌아가기` CTA를 분기:
  - `nextItem` 있음 → 우측 CTA "다음 카드 →" (primary), 좌측 "복습 큐" (secondary)
  - `nextItem` 없음 → 기존 단일 CTA 유지

## 4. 컴포넌트·파일 변경

- [src/app/(student)/q/review/memory/[id]/page.tsx](../../src/app/\(student\)/q/review/memory/%5Bid%5D/page.tsx)
  - `useMemoryStore` 에서 `dueItems` 추가 호출
  - `index` / `total` / `nextItem` 계산 (Hook 또는 page 본문)
  - `PageHeader.description` 에 위치 정보 추가
  - `FrontCard` / `BackCard` 시그니처에 `nextLabel?: string` 추가 + 미리보기 박스
  - `ResultCard` 시그니처에 `nextHref?: string` + `nextLabel?: string` 추가 + 분기 CTA

## 5. 검증

- **정적**: `bunx tsc --noEmit && bun run lint && bun run build`
- **시각·동작 (라이브)**: `bun dev`(포트 3031) → `/q/review/memory/<id>` 진입:
  - Front 헤더에 `K/N번째` 노출
  - `K < N - 1` 일 때 Front/Back 하단에 `다음: <라벨>` 박스 노출
  - `K === N - 1` (큐 끝) 일 때 미리보기 미노출
  - Result `기억나요` 누르면 다음 카드 CTA 노출 (큐 끝이면 단일 CTA fallback)
  - 모바일 360 viewport에서 미리보기 라벨 가로 overflow 없음

## 6. 비범위 (별도 plan)

- 단일 카드 전체 풀스크린 구조 자체 변경 (예: 큐 슬라이드형 UI)
- 큐 우선순위 알고리즘 변경 (`dueItems()` 정렬 로직)
- Result phase 통계 시각화 강화

## 7. 위험과 완화

- **위험**: `dueItems()` 호출이 매 렌더마다 — store 셀렉터 비용
  - 완화: `useMemoryStore((s) => s.dueItems())` 직접 호출 가능 확인. 큐 길이 ≤30 가정 시 무시 가능
- **위험**: URL 직접 진입 시 큐 컨텍스트 부재 → `index = -1` → "0/N번째" 노출 오류
  - 완화: `index === -1` → 위치 정보 자체 미노출 fallback
- **위험**: 모바일 360에서 미리보기 + 미리보기 라벨이 카드 하단 여백 줄여 답 보기 CTA 가시성 영향
  - 완화: 미리보기 박스 `mt-2`, `text-[10px]`, `py-1.5` 정도 — 최소 footprint. 단일 카드 sweep 단계에서 캡처 회귀로 검증

## 8. AI 우선 위임

- `dueItems()` / `index` / `nextItem` 계산 로직 초안
- Front/Back/Result 미리보기·분기 CTA diff 초안 (1파일 ≤40줄)
- 모바일 360 캡처 회귀 — `scripts/qa-audit-2026-05-14.mjs` 패턴 차용해 `/q/review/memory/<id>` 단일 카드 3 phase 캡처

## 9. 결정 로그

- 2026-05-22 — sweep plan §1 I5 분리. I5 자체 plan 신설 후 단계 분할 + 분기 정의. 본 plan §0 단계별 진입 결정은 G4 첫 단답 또는 룰 C 패턴 진입 시점에 합의.
