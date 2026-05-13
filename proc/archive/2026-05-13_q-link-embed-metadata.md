# 풀림 Q — 2026-05-13 링크 임베드 메타데이터 풍부화

## 목표
Vercel 배포 링크(`https://pullim-q.vercel.app`)를 카카오톡·슬랙·트위터/X 등에 붙였을 때 노출되는 미리보기 정보를 풀림 클래스봇([/Users/curea/dev_git/pullim-classbot](file:///Users/curea/dev_git/pullim-classbot) `src/app/layout.tsx`·`manifest.ts`·`opengraph-image.tsx`·`twitter-image.tsx`) 수준으로 풍부화. 임베드 단 한 장에서 "풀림 Q가 뭐 하는 서비스이고 핵심 기능이 뭔지" 파악 가능한 상태가 완료 기준.

방향성 출처:
- 풀림 클래스봇 동등 metadata 구성 ([/Users/curea/dev_git/pullim-classbot/src/app/](file:///Users/curea/dev_git/pullim-classbot/src/app/))
- 기존 브랜드 카피 정리 커밋([bad7da0](../../src/app/opengraph-image.tsx)) — 풀림 Q 단일 도메인 워크스페이스, "풀림 스터디" 표현 금지 원칙 유지

> 거버넌스 룰: `metadataBase`는 실제 배포 도메인과 일치시킬 것. OG 이미지 푸터 도메인도 placeholder가 아닌 실 URL.

## 작업 항목

### 1. layout.tsx metadata 풍부화 (트랙: 메타데이터)

- [x] [src/app/layout.tsx](../../src/app/layout.tsx) `metadataBase: new URL('https://pullim-q.vercel.app')` 추가 — OG·Twitter 이미지 절대경로 해석 기준
- [x] `title`을 `{default, template}` 형태로 변경 — 서브페이지 자동 `%s | 풀림 Q` 적용
- [x] `keywords` 13개 추가 (풀림 Q / Pullim Q / 풀림 / 문제 풀이 / 문제풀이 LMS / AI 문제집 / AI 해설 / 오답노트 / 오답 정복 / 유사문항 / 고등학생 문제집 / 수능 대비 / 내신 대비)
- [x] `authors` / `creator` / `publisher` 추가 (`curea`)
- [x] `formatDetection` — telephone/email/address 모두 비활성
- [x] `category: 'education'` 추가
- [x] `openGraph.url: '/'` 추가 (metadataBase로 절대경로 해석)
- [x] `twitter.creator: '@curea'` 추가
- [x] `robots` — index/follow + googleBot `max-image-preview: large` / `max-snippet: -1`
- [x] description 본문 강화 — 핵심 기능 4개(맞춤 문제·12-섹션 해설·자동 정복 큐·유사문항) + 보조 기능 3개(무한 학습·코치 토크·X-Ray 분석)

### 2. manifest.ts 신규 (트랙: PWA)

- [x] [src/app/manifest.ts](../../src/app/manifest.ts) 신규 — `name` / `short_name` / `description` / `start_url` / `display: standalone` / `theme_color: #3B6FF6` / `background_color: #F4F7FE` / `categories: ['education','productivity']` / `lang: ko-KR` / `icons` (favicon.ico)
- [x] `/manifest.webmanifest` 라우트가 `application/manifest+json` 응답 확인

### 3. opengraph-image.tsx 풍부화 (트랙: 비주얼)

- [x] [src/app/opengraph-image.tsx](../../src/app/opengraph-image.tsx) 디자인 업그레이드
  - 풀림 블루 그라디언트 (`#1E50C9 → #3B6FF6 → #6B9CF8`) 유지
  - 우상단 레몬 옐로우 글로우 + 좌하단 화이트 글로우 2개 레이어
  - 상단: 로고 박스(Q 글리프) + `Pullim · Q` 라벨 + `by curea`
  - 중앙 3단 카피: 메인(풀림 Q) / 서브(문제 풀이 · 해설 · 오답 · 유사문항) / 디스크립션(핵심 가치 한 줄)
  - 하단: 옐로우 점 + 보조 기능 라인(무한 학습 · 코치 토크 · X-Ray 분석) + 도메인 풋터
- [x] 푸터 도메인 placeholder(`q.pullim.co`) → 실제 배포 도메인(`pullim-q.vercel.app`)으로 교체
- [x] `/opengraph-image` 라우트가 `200 image/png` 응답 확인

### 4. twitter-image.tsx 신규 (트랙: 비주얼)

- [x] [src/app/twitter-image.tsx](../../src/app/twitter-image.tsx) 신규 — OG 이미지 재사용 (`summary_large_image` 카드)
- [x] `/twitter-image` 라우트가 `200 image/png` 응답 확인

### 5. verify-brand-meta.mjs 항목 확장 (트랙: 검증)

기존 15 항목 + 이번 추가 메타 항목까지 자동 검증 범위 확장.

- [x] [scripts/verify-brand-meta.mjs](../../scripts/verify-brand-meta.mjs) 신규 검증 항목
  - [x] `meta[keywords]` 존재 + 풀림 Q 포함
  - [x] `meta[author]` / `meta[creator]` / `meta[publisher]` 값 `curea`
  - [x] `meta[robots]` 값 `index, follow` 포함
  - [x] `meta[og:url]` 존재 (절대 URL)
  - [x] `meta[twitter:creator]` 값 `@curea`
  - [x] `/twitter-image` GET 200 + image/png
  - [x] `/manifest.webmanifest` GET 200 + application/manifest+json + `name`에 "풀림 Q" 포함
- [x] `node scripts/verify-brand-meta.mjs` 전 항목 pass (27/27)

### 6. 검증·마감

- [x] `bunx tsc --noEmit && bun run build` 통과 (lint는 사전 존재 에러만 — 이번 변경 파일에는 0건)
- [x] dev 서버에서 `verify-brand-meta.mjs` 27/27 pass
- [x] 커밋 + PR 생성 — [PR #24](https://github.com/curea-co/pullim-Q/pull/24) `feat/q-link-embed-metadata` 머지 완료 (2026-05-13). *(사후 [x] 메모)*
- [x] PR #24 머지 후 Vercel 자동 배포 + 카카오톡 임베드 미리보기 확인 — 산출물: [proc/archive/2026-05-13_q-link-embed-deploy-retro.md](../archive/2026-05-13_q-link-embed-deploy-retro.md). *(사후 [x] 메모)*

## 비범위
- `robots.ts` / `sitemap.ts` 추가 — 풀림 Q는 데모 도메인, SEO 노출 강화는 본격 배포 시점 별도 plan
- 다국어 OG 이미지 — ko-KR 단일
- 커스텀 도메인(`q.pullim.co` 등) 연결 — 결정되면 `metadataBase` + OG 푸터 도메인만 갱신
- 파비콘/앱 아이콘 192/512 PNG 추가 — 디자인 자원 확보 후 별도 작업
- PWA `screenshots` / `shortcuts` 필드 — 본격 PWA 단계 별도 plan
