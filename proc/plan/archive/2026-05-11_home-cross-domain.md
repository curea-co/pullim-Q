# 풀림 Q 홈 — 크로스 도메인 진입 인지

## 목표
`/q` 홈에 Studio↔Q↔Store 양 경로를 자연 노출. 기존 6블록 유지, "오늘 풀이 큐" 뒤에 `풀림에서 더 가져오기` 슬롯 1개 추가. referrer(`?from=studio|store`)를 인식해 진입 컨텍스트 카드 + 반대 경로 카드 2개를 좌우로 노출.

## 작업 항목

### 1. referrer 인식 인프라
- [x] [src/lib/mock/referrer.ts](src/lib/mock/referrer.ts) 신규 — `ReferrerKind`('studio'|'store'|'direct'), `ReferrerMeta` 유니온, `getReferrer(searchParams)` (URL > sessionStorage > localStorage > direct 순)
- [x] [src/lib/mock/domains.ts](src/lib/mock/domains.ts) 확장 — `PULLIM_DOMAINS.studio`·`store` (name + external href)
- [x] [src/lib/mock/index.ts](src/lib/mock/index.ts) barrel export 갱신

### 2. 외부 도메인 placeholder 라우트
- [x] `src/app/(student)/q/external/studio/page.tsx` — "곧 열려요" stub
- [x] `src/app/(student)/q/external/store/page.tsx` — 동일

### 3. 슬롯 컴포넌트
- [x] `src/components/q-hub/cross-domain-slot.tsx` 신규 — 컨테이너 + `TimelineHeading`("풀림에서 더 가져오기")
- [x] 같은 파일 내 `EntryContextCard` — referrer별 카피 분기 (studio-self / studio-teacher / store-owned / store-trial / direct-curation)
- [x] 같은 파일 내 `CrossDomainHintCard` — 반대 경로 안내, `target="_blank"` + `rel="noopener noreferrer"` + `ExternalLink` 아이콘

### 4. `/q` 홈 통합
- [x] [src/app/(student)/q/page.tsx](src/app/(student)/q/page.tsx)에 `<CrossDomainSlot />` 끼우기 — `<TodayQueueSection />` 뒤, `<ThisWeekSection />` 앞
- [x] sessionStorage 접근 부분만 클라이언트 컴포넌트로 분리 (`'use client'`)
- [x] direct 진입 시 좌우 동등 노출 + localStorage `recentReferrers` 기반 정렬

### 5. 마이크로카피 (07-branding 톤)
- [x] 슬롯 헤더: "풀림에서 더 가져오기 — 새 문제도, 좋은 책도 풀러 와요"
- [x] 5개 referrer 시나리오별 EntryContextCard 카피 (자작/교사발신/구매/체험/direct)
- [x] 반대 경로 카드 카피 2종 (→Store / →Studio)
- [x] "구매" → "사기", "생성" → "만들기" — 한자어 정책 적용

### 6. 검증
- [x] `bunx tsc --noEmit && bun run lint && bun run build`
- [x] 5개 URL 시각 확인:
  - [x] `/q` (direct)
  - [x] `/q?from=studio` (자작)
  - [x] `/q?from=studio&kit=teacher&teacher=김수학` (교사 발신)
  - [x] `/q?from=store&product=pk-2026-math-mock1` (구매자)
  - [x] `/q?from=store&mode=trial&product=pk-2026-math-mock1` (체험)

## 비범위 (이번에 안 함)
- Studio/Store 실제 페이지·기능 (별도 도메인)
- 카트·결제, 교사 dashboard, 결과 자동 전달 파이프라인
- 부모/교사 RBAC 분기 — 학생만 대상
- 신규 콘텐츠 미리보기 (썸네일 카드), 주간 큐레이션 로테이션 — 차순위
- 푸시·이메일 알림

## SSOT 통합 (구현 후)
구현 완료 후 `/update-spec`으로 다음 SSOT에 흡수:
- `02-product-definition.md` — Studio·Store와 Q의 관계
- `03-features-and-ia.md` — Q 홈 IA에 cross-domain 슬롯 추가
- `04-ux-flow.md` — 진입 출처 인식 플로우
- `06-content-data.md` — referrer mock seed, PULLIM_DOMAINS
- `07-branding.md` — 외부 도메인 카피 톤
- `08-design-system.md` — 진입 컨텍스트 카드 토큰
