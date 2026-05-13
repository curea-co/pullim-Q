# 풀림 Q — 2026-05-13 carry-over 마감

## 목표
어제(2026-05-12) EOD에서 carry-over로 명시한 3묶음을 마감 — design-followup 미닫힘 finding 3건 처리 / 색 톤 후보안 토큰 실제 적용 / question-hub-foundation 미결정 3건 의사결정. 완료 기준은 각 묶음의 plan 체크박스 100% + 회귀 통과.

방향성 출처:
- [input/docs-archive/advice/pullim_q_analysis_보완기능_제안_for_박승훈.md](../../input/docs-archive/advice/pullim_q_analysis_보완기능_제안_for_박승훈.md) (이하 "advice")
- [input/docs-archive/advice/pullim_learning_dashboard_faas_project_definition.md](../../input/docs-archive/advice/pullim_learning_dashboard_faas_project_definition.md) (이하 "FaaS 정의서")

> 거버넌스 룰 (2026-05-12 EOD 발견 → 적용): 모든 plan/코드 작업은 advice 정독 후 시작. design polish 트랙(이 plan §1·§2)과 advice/콘텐츠 IA 트랙(§3)을 같은 문서 안에서 분리 표기.

## 작업 항목

### 1. design-followup 미닫힘 finding 3건 (트랙: 디자인 polish)

[proc/plan/2026-05-12_q-design-followup.md](2026-05-12_q-design-followup.md) §2·§3에서 carry-over.

- [ ] F-2 (레이아웃 밀도) — `/q/infinity/solve` / `/q/review` / `/q/review/conquer` 모바일 카드 밀도 점검. fix PR 또는 "차주 이월 사유" 작성
- [ ] F-7 (T2/Scope L3 전문용어) — T2·Scope·L3 라벨 노출 지점 grep → 학생 카피로 치환 또는 [proc/spec/07-branding.md](../spec/07-branding.md) 마이크로카피 가이드에 흡수
- [ ] F-9 (TOC 한·영 혼재) — "Pattern Family" vs "패턴 친척" 등 TOC 라벨 통일 정책 결정 + [proc/spec/04-ux-flow.md](../spec/04-ux-flow.md) 다이어그램 반영
- [ ] 처리 결과를 [2026-05-12_q-design-followup.md](2026-05-12_q-design-followup.md) §2.2 미닫힘 줄에 `[x]` 또는 차주 이월 명시
- [ ] [proc/research/2026-05-12_design-audit/README.md](../research/2026-05-12_design-audit/README.md) finding 표 상태 갱신

### 2. 색 톤 5종 토큰 globals.css 실제 적용 (트랙: 디자인 polish)

어제 [08-design-system.md §1.7](../spec/08-design-system.md)에 결정만 박은 후보안을 실 토큰으로 반영.

- [ ] [src/app/globals.css](../../src/app/globals.css) 49–82행 — 5종 토큰 갱신
  - `pullim-blue-50`: `#EEF3FF` → L 97→93 (`#DAE3FB`)
  - `pullim-warn-bg`: `#FEF3DB` → S 95→80 (`#F8EFD6`)
  - `pullim-slate-300`: `#C4CBDA` → L 81→76
  - `pullim-success-bg`: `#E6F7EE` → S 50→38
  - `pullim-danger-bg`: `#FCE9EA` → S 80→62
- [ ] [proc/spec/08-design-system.md §1.7](../spec/08-design-system.md) 표 "제안 → 적용 완료" 상태로 갱신 + 적용 일자 명시
- [ ] [scripts/qa-design-capture.mjs](../../scripts/qa-design-capture.mjs) 재실행 — 12/12 ok 확인 + 새 캡처는 `proc/research/2026-05-13_color-tone-apply/captures-after/` 로 별도 저장
- [ ] before/after 캡처 6쌍 비교 — 12장 desktop/mobile 시각 회귀 확인
- [ ] 회귀 3종 통과: `qa-memory-retry` 13/13 · `qa-leitner-retry` 14/14 · `qa-analysis-entry` 46/46

### 3. question-hub-foundation D2/D3/D5 의사결정 (트랙: advice / 콘텐츠 IA)

[proc/plan/2026-05-12_question-hub-foundation.md](2026-05-12_question-hub-foundation.md) "미리 결정해야 할 5가지" 미결정 3건.

- [x] **D2 `predictedGrade` 재사용 — 채택** (advice 권고 일치, Phase 1.2에서 이미 구현됨, 결정만 박음)
- [x] **D3 복습 큐 push API — 데모 단계 보류, v1 백엔드 시점 재검토** (mock 단계 over-engineering 회피)
- [x] **D5 변형 문제 LLM vs 캐시 — 데모 캐시 유지, v1 백엔드 SLA 시점 재검토** (advice §8 권고 일치)
- [x] [2026-05-12_question-hub-foundation.md](2026-05-12_question-hub-foundation.md) §"미리 결정해야 할 5가지" — D2/D3/D5 `[x]` + 결정 근거 + 영향 코드 라인 명시

### 4. 검증·마감

- [ ] `bunx tsc --noEmit && bun run lint && bun run build` 통과
- [ ] §1·§2 코드 변경분에 PR 분리 — `feat/q-design-polish-finalize` (또는 §1 / §2 각각 분리) base `dev`
- [ ] §3 결정만 PR — `chore/q-hub-d2-d3-d5-decisions` base `dev`
- [ ] 머지 후 완료된 plan archive 이관 검토 — [proc/archive/](../archive/) 로

## 비범위
- 콘텐츠 파트너 트랙 (`wrongReasonCatalog` v1, 학습 블록 taxonomy v1, 샘플 문제) — 도착 대기, 도착 시 fallback 교체
- IRT/백엔드 `predictedGrade` 실측 정확도 — 도착 대기
- [2026-05-11_leitner-mutable-mock.md](2026-05-11_leitner-mutable-mock.md) 미체크 1건 / [2026-05-11_q-similar-and-retry-ux.md](2026-05-11_q-similar-and-retry-ux.md) 미체크 3건 — 별도 검토 (이번 plan 비범위)
- 색 톤 적용 후 추가 hue 도입 — 채도/명도만, hue는 그대로

## 진행 순서 제안
1. **§3 의사결정** 먼저 (코드 영향 없는 결정만, 빠름)
2. **§2 색 톤 토큰 적용** — globals.css 갱신 + 캡처 비교 + 회귀
3. **§1 미닫힘 finding** — F-2/F-7/F-9 각각 fix or 이월
4. 마감 PR 분리 (§1·§2·§3 각각) → 머지 → archive 이관

## 예상 블로커
- 색 톤 토큰 시각 검증이 정성 판단 → before/after 캡처 비교 후 대표 확인 필요 가능성
- D5 (LLM 실시간 vs 캐시) — 데모 단계에서 의사결정 의미가 약함, "v1 백엔드 시점 재검토" 결정으로 무빙 가능
