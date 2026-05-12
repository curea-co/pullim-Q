# 브랜드 카피 정리 — "풀림 스터디" → "풀림 Q"

## 목표
배포 링크 임베딩(OG/Twitter Card)·브라우저 탭·SSoT 문서에서 "풀림 스터디"로 노출되는 카피를 "풀림 Q"로 일괄 교체. 풀림 Q는 단일 도메인 워크스페이스이므로 "스터디"라는 상위 브랜드명은 노출되면 안 됨.

## 작업 항목

### 1. Metadata · 임베딩 (Must)
- [x] [src/app/layout.tsx](src/app/layout.tsx) `metadata.title` — "풀림 스터디 — AI 학습 파트너" → "풀림 Q — 문제 풀이·해설·오답·유사문항"
- [x] [src/app/layout.tsx](src/app/layout.tsx) `metadata.description` — 풀림 Q 가치 제안으로 재작성 ("내 실력에 맞는 문제 + AI 해설 + 오답 자동 정복 + 유사 문항")
- [x] [src/app/layout.tsx](src/app/layout.tsx) `metadata.applicationName` — "풀림 Q"
- [x] [src/app/layout.tsx](src/app/layout.tsx) `metadata.openGraph` 명시 추가 — title·description·siteName·locale·type
- [x] [src/app/layout.tsx](src/app/layout.tsx) `metadata.twitter` 명시 추가 — card='summary_large_image', title·description

### 2. OG 이미지 (Should)
- [x] 정적 OG 이미지 (`public/og-image.png` 또는 `app/opengraph-image.tsx`) — "풀림 Q" 로고 + 한 줄 슬로건. 1200×630
- [x] `metadata.openGraph.images` 연결

### 3. SSoT spec 본문 정리
- [x] [02-product-definition.md](proc/spec/02-product-definition.md) — 3축 다이어그램에서 "풀림 스터디" 박스 제거 또는 Q-only로 단순화
- [x] [03-features-and-ia.md](proc/spec/03-features-and-ia.md) — "풀림 스터디 14개 기능" 표 → Q 기능만 유지
- [x] [07-branding.md](proc/spec/07-branding.md) — 스터디룸 등 비-Q 도메인 라벨 제거
- [x] [10-roadmap.md](proc/spec/10-roadmap.md) — "Phase 1: 풀림 스터디" 등 표현 정리
- [x] [00-index.md](proc/spec/00-index.md) — pullim-study-* 참조 정리
- [x] [01-ai-instruction.md](proc/spec/01-ai-instruction.md) — pullim-study-screens 출처 표기 정리
- [x] [09-tech-stack.md](proc/spec/09-tech-stack.md) — 동일

### 4. README · 패키지 메타 (Could)
- [x] [package.json](package.json) `name`: `web` → `pullim-q-web` (선택)
- [x] README가 있다면 갱신 (현재 없음 — 추가는 비범위)

### 5. 검증
- [x] `bunx tsc --noEmit && bun run lint && bun run build`
- [x] Vercel 배포 후 OG 디버거(https://developers.facebook.com/tools/debug/, https://cards-dev.twitter.com/validator)로 미리보기 확인
- [x] 브라우저 탭 제목·즐겨찾기·홈 화면 추가 시 표시명 확인

## 비범위 (이번에 안 함)
- `input/docs-archive/` 옛 마스터 문서 (read-only, 정책 결정 후 별도 사안)
- src/ 코드 주석·변수명 내 "study" 잔재 (자동 영향 없음, 별도 sweep)
- 풀림 모회사 브랜딩 정책 (Studio·Store·Q 통합 브랜드 가이드 — 별도)
- 도메인 호스트 / DNS 변경

## SSOT 통합 (구현 후)
구현 완료 후 `/update-spec`으로 다음 SSOT에 흡수:
- `07-branding.md` — 단일 브랜드명 "풀림 Q" 확정, OG 카피 가이드 추가
- `10-roadmap.md` — Phase 표기에서 "스터디" 라벨 제거
