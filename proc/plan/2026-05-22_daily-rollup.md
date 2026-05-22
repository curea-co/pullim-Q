# 2026-05-22 일일 작업 roll-up

> **출처**: [daily_outcome/2026-05-22.md](../../daily_outcome/2026-05-22.md) 09:30 약속 6건 (5-21 전량 미진입 carry-over)
> **활성 게이트키퍼**: G1 / G3 / G4
> **선행 carry-over plan**: [2026-05-18_q-ux-audit-important-nit-sweep.md](2026-05-18_q-ux-audit-important-nit-sweep.md) · [2026-05-20_mobile-ai-1st-class-entry.md](2026-05-20_mobile-ai-1st-class-entry.md)

## 목표

5-21 6건 전량 미진입 → 오늘 6건 동시 압축. **룰 C 발동 PR 2건(N2·mobile-ai-1st-class) 선행** 으로 G1·G4 단답 의존 차단 해제, **I4·codex-review.yml** 오전 병행, **I5 plan·단답 채널 점검**은 오후 마감. CONVENTION §6.E `.github/workflows/` 적용 여부 결정도 codex-review.yml 처리와 함께 EOD까지.

## 작업 항목

### 1. codex-review.yml M 상태 처리 + §6.E 적용 범위 명시
- [ ] [.github/workflows/codex-review.yml](../../.github/workflows/codex-review.yml) M 상태 해소 — diff 내용(pull_request_target 패턴 + head SHA 명시 체크아웃 + JSON 스키마 인라인 검증 + artifact upload + base.sha 직접 사용) 는 Codex 3차 리뷰 반영 보안 개선이라 commit 채택
- [ ] `chore/q-codex-review-yml-3rd-pass` branch → PR(base=dev) — `.github/workflows/` 가 §6.E 명시 목록에 미포함이라 §6.E 후속 정정 동봉 1줄
- [ ] [daily_outcome/CONVENTION.md](../../daily_outcome/CONVENTION.md) §6.E How to apply 목록에 `.github/workflows/` 추가 — "CI/CD 워크플로 자체도 인프라" 사유 1줄

### 2. UX audit I4 — /q/analysis 모바일 hero viewport 압축
- [ ] [src/components/analysis/diagnosis-hero.tsx](../../src/components/analysis/diagnosis-hero.tsx) `StatChip` `<li>` padding `p-2.5` → `p-2` + 데이터 소스 라인(L34-37) 압축 — `최근 N문항·N분·N일 전` 1줄 + " + 지난 7일" 부분 별도 라인으로 분리하지 않고 한 줄 압축 유지
- [ ] `feat/q-ux-audit-i4-analysis-hero-mobile` branch → PR(base=dev)
- [ ] 모바일 360 캡처 회귀 — `bun dev`(포트 3031) + browser DevTools 360 viewport 또는 `scripts/qa-audit-2026-05-14.mjs` 재사용
- [ ] sweep plan [2026-05-18_q-ux-audit-important-nit-sweep.md](2026-05-18_q-ux-audit-important-nit-sweep.md) §0 I4 [x] 마감 + §5 결정 로그 backfill

### 3. UX audit N2 — G1 8일차 룰 C 발동, D-day 임계값 잠정 락인
- [ ] [src/app/(student)/q/page.tsx](../../src/app/\(student\)/q/page.tsx) D-day 렌더링부 (L96 `DDayHero` + L392 `UpcomingSection`) — D-7 이내 `text-pullim-warn`, D-3 이내 `text-pullim-danger`, 그 외 기존 `text-pullim-blue-700` / `text-pullim-slate-600` 유지. 분기 helper 1개 `ddayTone(dday)` 로 두 곳 공유
- [ ] `feat/q-ux-audit-n2-dday-rule-c-lockin` branch → PR(base=dev). 본문에 "G1 8일차 룰 C 발동, 잠정 락인 = D-7 warn / D-3 danger" 명시
- [ ] sweep plan §0 N2 [x] 마감 + §5 결정 로그에 "2026-05-22 — G1 8일차 룰 C 발동, D-7 warn / D-3 danger 잠정 락인. PR #<번호> 머지" 추가
- [ ] mock persona `examDate: '2026-06-04'` 기준 오늘(2026-05-22) D-13 → 평시 톤. 회귀 캡처는 일시적 examDate 변조 또는 helper 단위 검증

### 4. mobile-ai-1st-class — G4 8일차 룰 C 발동, 1단계 stub 머지
- [ ] [src/components/shell/nav-config.ts](../../src/components/shell/nav-config.ts) `studentBottomTabs` 5번째 슬롯 추가 — `{ href: '/q/talk', label: '풀림 AI', icon: Sparkles, matchPrefix: ['/q/talk'] }`
- [ ] [src/components/shell/bottom-nav.tsx](../../src/components/shell/bottom-nav.tsx) — `GRID_COLS_BY_LENGTH` lookup 이미 5탭 대응(`grid-cols-5`) → 추가 변경 불필요, 동작만 재확인
- [ ] [src/components/shell/coach-fab.tsx](../../src/components/shell/coach-fab.tsx) 모바일 hide — 컨테이너에 `hidden md:flex` 적용 (기존 `fixed` 유지)
- [ ] `feat/q-mobile-ai-1st-class-stage-1` branch → PR(base=dev). 본문에 "G4 8일차 룰 C 발동, 1단계 stub 머지(2~3단계는 G4 회신 도착 시 재합의)" 명시
- [ ] plan [2026-05-20_mobile-ai-1st-class-entry.md](2026-05-20_mobile-ai-1st-class-entry.md) §0.1 에 "2026-05-22 G4 8일차 룰 C 발동, 1단계 stub PR #<번호> 머지" backfill

### 5. 단답 채널 자체 점검 — G1/G3/G4 9일차
- [ ] PM 직접 확인 — 단답 채널 실체(Slack DM / Discord / 카톡 등) 파악 및 G1/G3/G4 회신 누적 9일차 상태 점검
- [ ] 17:30 §3 (내일 이어서 할 일) 또는 §4 (배운 점) 에 "단답 채널 확인 결과 = <결과>" 한 줄 박음. 점검 불가 시 사유 명시

### 6. I5 plan 신설 — /q/review/memory 단일 학습 화면 밀도
- [ ] [proc/plan/2026-05-22_q-memory-single-screen-density.md](2026-05-22_q-memory-single-screen-density.md) 신설 — sweep plan §1 I5 분리 항목. 현황 분석(첫 화면 비어있음·진행 표시 부재·다음 카드 미리보기 부재) + 진행 방향(전체 N개 중 K번째 + 다음 카드 1줄 미리보기) + 단계 분할 + AI 위임 + 위험
- [ ] sweep plan §0 I5 항목을 별도 plan 링크로 마감 표시

## AI 우선 위임

- I4 padding `p-2.5` → `p-2` + 데이터 소스 라인 압축 diff 초안 (1파일 ≤8줄)
- N2 `ddayTone(dday)` helper 초안 + DDayHero / UpcomingSection 두 곳에 적용 diff (1파일 ≤15줄)
- mobile-ai-1st-class 1단계 diff — nav-config 5번째 슬롯 + coach-fab `hidden md:flex` (2~3 파일 ≤8줄)
- I5 plan 초안 — sweep plan §1 I5 분리 발췌 + 현황·방향·단계·위험 양식 채우기

## 예상 블로커

- 6건 압축 — N2·mobile-ai-1st-class 룰 C 발동 PR 머지 순서 결정 필요. 두 건 모두 단답 채널 의존 X (잠정 락인 진입 사유 충족 = §6.C·§6.E 룰 C 패턴) → 오전 병행 가능
- codex-review.yml — diff 내용은 보안 강화로 discard 손실 큼 → commit + §6.E 정정 동봉 권장. 단 `.github/workflows/` 가 §6.E 명시 목록에 미포함이라 §6.E How to apply 정정 1줄 동봉
- 단답 채널 점검 — 9일차 미수행 누적. PM 자체 액션 미실행 시 게이트 의존 결정 이월 계속 누적 위험
- 1번 codex-review.yml + 4번 mobile-ai-1st-class 둘 다 셸/인프라 영역 PR — 머지 순서·conflict 점검 필요
