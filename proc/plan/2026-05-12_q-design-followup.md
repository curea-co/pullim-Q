# 풀림 Q 디자인 후속 — 오늘(2026-05-12) 작업 묶음

## 목표
어제 14:30에 약속했지만 정식 산출물이 빠졌던 디자인 audit 정리 + 사용자 여정 기반 홈 재배치 + 색 톤(채도/명도) 조정을 묶어 마감한다. 같은 날 진행한 기억장치 라우트와 R값 디자인 시스템은 별도 plan/PR로 이미 처리됨 — 이 문서에서는 상태만 체크.

## 작업 항목

### 1. 기억장치 재학습 라우트 — `/q/review/memory/[id]` (선행 완료)
- [x] 별도 plan: [proc/plan/2026-05-11_memory-retry-route.md](proc/plan/2026-05-11_memory-retry-route.md) 전 항목 완료
- [x] PR #7 [feat/q-memory-retry-route](https://github.com/curea-co/pullim-Q/pull/7) 머지 (2026-05-12 02:03Z)
- [x] [scripts/qa-memory-retry.mjs](scripts/qa-memory-retry.mjs) Playwright 회귀 13/13 pass
- 비고: `MemoryItem`에 `prompt/answer/hint?/mnemonic?` 추가, 우선 큐 `<Link>` 연결, `useMemoryStore` 도입 — 모두 머지됨

### 2. 디자인 Audit — 정식 산출물 보완
어제 ad-hoc audit으로 F-1 ~ F-10 finding을 뽑고 fix PR(#8/#9/#10)을 냈지만, **캡처·재현 가능한 research 폴더가 없다**. 후속 작업자(또는 미래의 나)가 동일 기준으로 비교할 수 있도록 산출물만 따로 정리.

#### 2.1 캡처 하네스
- [ ] [scripts/qa-design-capture.mjs](scripts/qa-design-capture.mjs) 신설 — Playwright로 6 페이지 × desktop(1280) / mobile(390) = **12 캡처**
  - 홈 `/q`
  - 풀이 `/q/infinity/solve`
  - 해설 `/q/infinity/solve` 의 정답 제출 후 상태 (또는 `/q/analysis`)
  - 복습 `/q/review`
  - 오답 `/q/review/conqueror` (또는 SKU retry 경로)
  - 기억 `/q/review/memory/m2`
- [ ] 저장 경로: `proc/research/2026-05-12_design-audit/captures/{page}-{viewport}.png`
- [ ] 기존 [scripts/qa-memory-retry.mjs](scripts/qa-memory-retry.mjs)의 Playwright bootstrap 재사용 (port 3031)

#### 2.2 finding 정리 문서
- [ ] [proc/research/2026-05-12_design-audit/README.md](proc/research/2026-05-12_design-audit/README.md) — 발견 사항 F-1 ~ F-10 표(상태·심각도·PR 링크), 발견 당시 캡처와 fix 후 캡처를 같이 묶음
- [ ] 닫힌 finding: F-1(브랜드 통일), F-3(헤딩 시맨틱), F-4(KPI 모바일), F-5(banner chip 톤), F-6(터치타깃 44px), F-8(false positive — Next.js dev portal), F-10("12-섹션" 카피)
- [ ] 미닫힘 finding: F-2(레이아웃 밀도), F-7(T2/Scope L3 전문용어), F-9(TOC 한/영 혼재) → §3·§4에서 일부 다루거나 별도 차순위

#### 2.3 PR 상태 — 정보용
- [x] PR #8 [feat/q-audit-typography](https://github.com/curea-co/pullim-Q/pull/8) (PR A — 헤딩·카피) 머지 완료
- [ ] PR #9 [feat/q-audit-ux-clarity](https://github.com/curea-co/pullim-Q/pull/9) (PR B — UX 명확화 F-4·F-5·F-10) 머지 대기
- [ ] PR #10 [feat/q-audit-mobile-polish](https://github.com/curea-co/pullim-Q/pull/10) (PR C — 모바일 폴리시 F-2·F-6) 머지 대기

### 3. 사용자 여정 기반 홈 재배치
홈은 referrer 슬롯(PR #4)까지 들어왔지만, 전체 섹션 순서·간격은 "오늘 풀이 큐 → 크로스 도메인 → 이번 주 → ..." 식의 큐 중심 흐름이 그대로. Studio→Q→Store 사용자 여정을 더 자연스럽게 안내하도록 재배치.

#### 3.1 정보 구조 재검토
- [ ] 현행 6블록 ([src/app/(student)/q/page.tsx](src/app/(student)/q/page.tsx)) 인벤토리: HeroBanner / NowSection / TodayQueueSection / CrossDomainSlot / ThisWeekSection / RecentSection (실제 명칭은 코드 확인)
- [ ] referrer 시나리오 5종(studio-self / studio-teacher / store-owned / store-trial / direct)별 "다음 한 걸음" 우선순위 정리

#### 3.2 섹션 순서·간격 조정
- [ ] 진입 직후 컨텍스트(referrer EntryContextCard) 가시성 강화 — 첫 스크롤 안에 들어오도록
- [ ] 큐 vs 둘러보기(크로스 도메인) 비율 검토 — 모바일 한 화면에서 둘 다 단서 보이는지
- [ ] section 간 여백 통일 (`space-y-6` / `space-y-8` 혼재 정리)

#### 3.3 마이크로카피 다듬기
- [ ] HeroBanner / TimeMarker 카피가 PR #8 헤딩 정리 결과(`text-base` 승격, eyebrow는 `<p text-sm>`)와 일치하는지 확인
- [ ] "오늘 풀이 큐" / "이번 주" / "최근" 헤더가 같은 톤(시간 축)으로 묶여 읽히는지

### 4. 색상 톤 — 채도/명도만 조정
색상(hue) 자체는 그대로 두고, [proc/spec/07-branding.md](proc/spec/07-branding.md) 팔레트의 **채도·명도**를 손봐 가독성·위계 강화.

#### 4.1 현황 점검
- [ ] `--pullim-blue-*`, `--pullim-slate-*`, `--pullim-warn*`, `--pullim-success*`, `--pullim-danger*` 토큰을 [src/app/globals.css](src/app/globals.css) 에서 추출
- [ ] 실제 사용 빈도 `grep -rn "text-pullim-\|bg-pullim-\|border-pullim-" src/ | sort | uniq -c | sort -rn` 으로 톤별 호출 수 측정

#### 4.2 조정안 (코드 변경 없이 먼저 문서화)
- [ ] [proc/spec/08-design-system.md](proc/spec/08-design-system.md) §3 (Color)에 "현재 채도·명도 vs 제안" 표 추가
- [ ] 우선 후보: `pullim-blue-50` 너무 옅음 → 명도 95 → 93, `pullim-warn-bg` 채도가 강함 → 채도 −15 식으로 후보안만
- [ ] 후속 PR에서 실제 토큰값 조정 (이번 plan에서는 결정만)

### 5. R값(반경) 디자인 시스템 (선행 완료)
- [x] PR #11 [feat/q-design-system-radius](https://github.com/curea-co/pullim-Q/pull/11) — [proc/spec/08-design-system.md](proc/spec/08-design-system.md) §4 전면 개편 (보수: 코드 무변경, 가이드만)
- [x] grep 통계 기반 시맨틱 매핑 (`rounded-2xl` 67회 → 섹션 카드, `rounded-xl` 98회 → CTA·인터랙티브 카드 등)
- [x] xl(20px) > 2xl(18px) 위계 역전 known 이슈로 명시
- 후속(별도 PR 후보): xl/2xl 역전 해소, `--radius-card` / `--radius-button` 시맨틱 alias 토큰 신설

### 6. 검증
- [ ] §2 캡처 하네스: `bun dev` (port 3031) 띄운 상태에서 `node scripts/qa-design-capture.mjs` exit 0 + 12장 캡처 생성
- [ ] §3·§4 코드 변경분은 별도 PR에서 `bunx tsc --noEmit && bun run lint && bun run build`
- [ ] §3 변경 후 [scripts/qa-memory-retry.mjs](scripts/qa-memory-retry.mjs) / [scripts/qa-leitner-retry.mjs](scripts/qa-leitner-retry.mjs) 재실행 — 홈 구조 바뀌어도 회귀 없는지

## 비범위
- 새로운 색상 hue 도입 (채도/명도만)
- referrer 슬롯 자체 재설계 (PR #4 결과물 유지)
- studio·store 외부 도메인 실제 라우팅 (placeholder 유지)
- 신규 페이지·기능 추가
- 디자인 토큰 코드 변경 — 이번엔 문서화·결정까지만

## SSOT 통합 (구현 후)
- `08-design-system.md` §3 Color — 채도/명도 조정 결정 흡수
- `04-ux-flow.md` — 홈 재배치 후 진입 시나리오 5종 흐름 갱신
- `proc/research/2026-05-12_design-audit/` — finding 원본·캡처는 research로 영구 보관

## 진행 순서 제안
1. §2 캡처 하네스 + research 폴더 (audit 산출물 마감)
2. §3.1·§3.2 홈 재배치 (캡처 기반 before/after 비교 가능)
3. §4.1·§4.2 채도/명도 조사 (홈 재배치 끝나면 변경 영향 적음)
4. §6 검증·머지
