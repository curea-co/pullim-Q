# 풀림 Q 디자인 Audit — 정식 산출물

발견 일자: 2026-05-11 ad-hoc audit
정리 일자: 2026-05-12 (이 문서)
plan: [proc/plan/2026-05-12_q-design-followup.md](../../plan/2026-05-12_q-design-followup.md) §2

## 목적
2026-05-11 ad-hoc audit으로 finding 10건을 뽑고 fix PR 4개(#5, #8, #9, #10)를 냈지만, **재현 가능한 캡처·문서가 없었음**. 후속 작업자가 동일 기준으로 비교·검증할 수 있도록 캡처와 finding 표를 한 폴더에 묶는다.

## 🔗 advice 트랙과의 관계
이 audit은 **디자인 polish 트랙**이며, advice 트랙([proc/plan/2026-05-12_question-hub-foundation.md](../../plan/2026-05-12_question-hub-foundation.md))과는 **다른 갈래**다. advice 트랙은 콘텐츠 IA / 미시 학습 허브 구현(PR #17·#18)에 집중하고, 이 audit은 그 위에서 시각·접근성·일관성 폴리시(PR #5·#8·#9·#10)에 집중. 두 트랙은 같은 페이지(`/q/analysis`, `/q/analysis/[sku]`)를 만지지만 관심사가 다르다.

advice 명세 위반 fix(다음 학습 6장, 오늘의 복습 경로 블록)는 별도 plan [2026-05-12_advice-alignment-correction.md](../../plan/2026-05-12_advice-alignment-correction.md)에서 진행 — 이 audit research가 그 보정을 일으킨 결과물(머지된 PR 사이의 advice 정합 gap 검출).

## 캡처 인벤토리
[scripts/qa-design-capture.mjs](../../../scripts/qa-design-capture.mjs) 로 자동 생성 — 6 페이지 × 2 viewport = 12장 [captures/](./captures/).

| 페이지 | 라우트 | desktop | mobile |
|---|---|---|---|
| 홈 | `/q` | [home-desktop.png](./captures/home-desktop.png) | [home-mobile.png](./captures/home-mobile.png) |
| 풀이 | `/q/infinity/solve` | [solve-desktop.png](./captures/solve-desktop.png) | [solve-mobile.png](./captures/solve-mobile.png) |
| 분석 거시 | `/q/analysis` | [analysis-desktop.png](./captures/analysis-desktop.png) | [analysis-mobile.png](./captures/analysis-mobile.png) |
| 복습 | `/q/review` | [review-desktop.png](./captures/review-desktop.png) | [review-mobile.png](./captures/review-mobile.png) |
| 오답 정복 | `/q/review/conquer` | [conquer-desktop.png](./captures/conquer-desktop.png) | [conquer-mobile.png](./captures/conquer-mobile.png) |
| 기억 단일 | `/q/review/memory/m2` | [memory-desktop.png](./captures/memory-desktop.png) | [memory-mobile.png](./captures/memory-mobile.png) |

재실행: `bun dev` (port 3031) 띄운 상태에서 `node scripts/qa-design-capture.mjs`. 12/12 ok 시 exit 0.

## Finding 표 (plan §2.2 canonical numbering)

| # | 영역 | 발견 사항 | 심각도 | 상태 | 닫은 PR / 비고 |
|---|---|---|---|---|---|
| F-1 | 브랜드 카피 | "풀림 스터디" 잔존, "풀림 Q" 브랜딩 미통일 | High | ✅ 닫음 | [PR #5](https://github.com/curea-co/pullim-Q/pull/5) (commit `bad7da0`) |
| F-2 | 레이아웃 밀도 | 모바일 카드 간 여백 과다 / 정보 밀도 낮음 (홈·복습·풀이) | Med | 🟡 부분 | §3 홈 재배치([PR #20](https://github.com/curea-co/pullim-Q/pull/20))에서 일부 흡수. 나머지는 별도 plan |
| F-3 | 시맨틱 | h2/h3 시각 위계 역전, TimelineHeading h2 abuse | High | ✅ 닫음 | [PR #8](https://github.com/curea-co/pullim-Q/pull/8) (commit `d9033c3` — 메시지엔 "F-1"로 표기) |
| F-4 | 모바일 UX | `/q/review` KPI 밴드 4-row 수직 스택 → 2×2 grid 필요 | Med | ✅ 닫음 | [PR #9](https://github.com/curea-co/pullim-Q/pull/9) (commit `96a2a78`) |
| F-5 | 톤·시각 | banner/chip accent 평면화 — KPI 4번째 lemon ink 등 미적용 | Med | ✅ 닫음 | [PR #9](https://github.com/curea-co/pullim-Q/pull/9) (commit `96a2a78`, "F-10"으로 표기) |
| F-6 | 터치 타깃 | 모바일 헤더/햄버거/홈 CTA 터치 영역 44px 미달 | High | ✅ 닫음 | [PR #10](https://github.com/curea-co/pullim-Q/pull/10) (commit `4843c84`, "F-2"로 표기) |
| F-7 | 카피 톤 | T2 / Scope L3 등 전문용어 그대로 노출 (디자인 후 보강) | Low | 🟠 미닫힘 | 차순위 — 별도 plan 필요 |
| F-8 | 외부 도구 | Next.js dev portal toast가 디자인으로 오인된 사례 — false positive | n/a | ✅ 닫음 | [PR #10](https://github.com/curea-co/pullim-Q/pull/10) commit 메시지에서 명시적 false positive 처리 |
| F-9 | 카피 톤 | TOC 한/영 혼재 ("Pattern Family" vs "패턴 친척") | Low | 🟠 미닫힘 | 차순위 — `04-ux-flow.md` 정리 시 함께 |
| F-10 | 카피 통일 | "12-섹션" vs "12섹션" vs "12 섹션" 표기 혼용 | Med | ✅ 닫음 | [PR #8](https://github.com/curea-co/pullim-Q/pull/8) (commit `d9033c3`, "F-3"으로 표기) |

**상위 5 fix** (완료 기준 충족) — F-1·F-3·F-4·F-6·F-10. 모두 머지 또는 머지 대기.

### Numbering 메모 (커밋 메시지 ↔ plan canonical)
ad-hoc audit 시점의 F-* 번호와 plan §2.2 canonical numbering이 다름. 충돌 매핑:
- commit "F-1 헤딩 시맨틱" = plan **F-3**
- commit "F-3 12-섹션 카피" = plan **F-10**
- commit "F-2 터치 타깃" = plan **F-6**
- commit "F-5 retry 진행 바" / "F-10 KPI accent" = plan **F-5** (둘 다 톤 영역으로 합침)

이후 audit은 plan canonical만 사용하기로 결정. 이번 정리 후 커밋 메시지 numbering은 freeze.

## PR 머지 상태 (2026-05-12 캡처 시점)
- ✅ [PR #5](https://github.com/curea-co/pullim-Q/pull/5) — F-1 머지 완료
- ✅ [PR #8](https://github.com/curea-co/pullim-Q/pull/8) — F-3 + F-10 머지 완료
- 🟡 [PR #9](https://github.com/curea-co/pullim-Q/pull/9) — F-4 + F-5 머지 대기 (state: OPEN)
- 🟡 [PR #10](https://github.com/curea-co/pullim-Q/pull/10) — F-6 + F-8 머지 대기 (state: OPEN)

→ 권장: PR #9·#10은 차주 머지 큐에 올려 대기. 충돌 위험 낮음(F-2/F-6은 격리된 컴포넌트 변경).

## 미닫힘 finding 후속 처리
| # | 다음 작업 |
|---|---|
| F-2 (밀도) | §3 홈 재배치 외 영역 — solve / review / conquer 카드 밀도 점검. 별도 plan 작성 시점 미정 |
| F-7 (전문용어) | T2/Scope 카피 정리 → `07-branding.md` 마이크로카피 가이드에 흡수 |
| F-9 (TOC 한/영) | `04-ux-flow.md` 다이어그램 + UI TOC 라벨 일관 정리 |

## SSOT 통합 (이 audit이 흡수된 곳)
- `04-ux-flow.md` — 헤딩 시맨틱 정상화 후 cross-app timeline 흐름 갱신 (PR #8 부수)
- `08-design-system.md` §4 (Radius) — 별도 R값 plan으로 분리 (PR #11)
- `proc/research/2026-05-12_design-audit/` — 이 폴더가 finding 원본·캡처 영구 보관처
