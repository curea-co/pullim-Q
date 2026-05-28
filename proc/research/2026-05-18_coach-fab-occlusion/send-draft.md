# G4 PM 송부 draft — CoachFab 모바일 점유 사후 합의

> **작성**: 2026-05-19 (3일차)
> **수신**: G4 (UI 톤·정보 hierarchy 게이트키퍼)
> **결정 요청 기한**: 2026-05-20 EOD (4일차 진입 차단)
> **참고 자료**: [measurements.md](measurements.md) · `captures/` 18장 · [PR #50](https://github.com/curea-co/pullim-Q/pull/50)

---

## 1. 상황 요약 (3줄)

- 2026-05-18: CoachFab 모바일 점유 문제에 **안2 (44×44 icon-only) 채택 + PR #50 머지** 완료
- 안1 (BottomNav 5번째 슬롯 통합 + FAB 데스크탑 전용) 도 측정에서 더 우월(점유 0px²) — 그러나 BottomNav 4탭 구조 변경 비용으로 안2 우선
- **G4 사후 합의 미수신 3일차** — 합의 도착 시: 안2 유지 / 안1 revert 결정 분기

## 2. 안1 vs 안2 — 측정 데이터 (mobile 360×740)

| 항목 | 안1 (BottomNav 통합) | 안2 (44×44 icon-only, **shipped**) | 차이 |
|---|---:|---:|---:|
| 가린 픽셀 평균 (6 라우트) | 0 px² | 2288 px² | +2288 px² |
| viewport 점유율 | 0.00% | 0.86% | +0.86%p |
| 라벨 텍스트 가시성 (모바일) | n/a (BottomNav 슬롯) | 없음 (icon-only) | 손실 |
| 접근성 보완 | n/a | `aria-label="풀림 AI에게 질문하기"` | 같음 |
| 데스크탑 (`md:` ≥768px) | 라벨 pill 유지 | 라벨 pill 유지 | 동일 |
| 진입 동선 변경 | BottomNav 4→5탭 (구조) | 위치·디자인 동일, 사이즈만 축소 | 안1 비용 큼 |

> **원본 viewport 6238 px²(2.34%) → 안2 2288 px²(0.86%) = -63%**, 그러나 안1은 모바일 점유 자체를 0으로.

## 3. 안1/안2 트레이드오프

### 안1 (BottomNav 통합)
- ✅ 모바일 점유 0px² — 마지막 카드 CTA 가림 없음
- ✅ AI 진입점이 BottomNav 1탭으로 승격 → 모바일 AI 1st-class 동선
- ❌ BottomNav 4→5탭 구조 변경 — nav-config·BottomNav 컴포넌트 재설계
- ❌ 데스크탑/모바일 FAB 분기 처리 (`md:hidden` + BottomNav `md:hidden`)
- ❌ 별도 plan 필요 — "모바일 AI 1st-class 진입점" plan 분리 명시 (PR #50 body)

### 안2 (44×44 icon-only, **shipped**)
- ✅ 라벨 텍스트만 hide, 위치·디자인 동일 — 점진 변경
- ✅ 데스크탑 라벨 pill 유지 — 진입 동선 일관
- ✅ `aria-label` 으로 접근성 라벨 손실 보완
- ⚠️ 점유 -63%, 0은 아님 — 마지막 카드 우측 일부 여전히 가림
- ⚠️ "AI에게 묻기" 텍스트 라벨이 모바일에서 사라져 어포던스 약화 가능

## 4. 사후 합의 요청 — 3택

**A. 안2 유지 (현 shipped, default)**
- PR #50 그대로, plan §5 결정 로그 backfill만
- 합의 근거: -63% 충분, 구조 변경 비용 회피

**B. 안1 전환 (revert + 신규 PR)**
- PR #50 revert + BottomNav 5탭 재설계 신규 plan 진입
- 합의 근거: 0 점유 + AI 1st-class 우선

**C. 단계 분리 — 안2 유지 + 안1 별도 plan 본격 진입**
- 안2 단기 유지 + "모바일 AI 1st-class 진입점" plan 본격 (PR #50 body에 이미 분리 언급)
- 합의 근거: 안2가 점진 개선이라면 안1은 더 큰 그림. 두 결정 분리.

> **추천 (Q PM 의견)**: **C** — 안2의 -63%는 단기 가치, 안1은 BottomNav 구조까지 다루는 별도 작업으로 분리되어 있어 두 결정을 묶지 않는 게 단답 chain 부담을 낮춤.

## 5. 결정 회신 요청

다음 중 하나로 응답:

```
G4 결정: [A / B / C]
근거: <1~2줄>
부가 조건: <있으면, 없으면 생략>
```

회신 도착 시:
- A → plan §5 결정 로그 backfill + 본 송부 마감
- B → PR #50 revert PR 생성 + 신규 안1 plan 진입
- C → plan §5 결정 로그 + "모바일 AI 1st-class 진입점" plan 신규 생성

## 6. 회신 미도착 시 처리

- 2026-05-20 EOD까지 미수신 시: **룰 C 발동 후보 추가** (G4 게이트도 5일 이월 임계 적용)
- daily_outcome 2026-05-20 §5 블로커에 명시

## 7. AI 자율 처리 결과 (2026-05-20)

PM 위임 사항 (2026-05-20 09:30 카운터파트 대답: "G4 결정사항, 자의로 해석해서 판단내려") 에 따라 **G4 회신 도착 전 잠정 락인 C** 적용. G4 회신 도착 시 본 락인은 무효화.

**잠정 락인 — 안 C (Q PM 추천안)**:
- 안2 (44×44 icon-only) 단기 유지 — `src/components/coach/coach-fab.tsx` 변경 없음
- "모바일 AI 1st-class 진입점" 별도 plan 신규 진입 — [proc/archive/2026-05-20_mobile-ai-1st-class-entry.md](../../archive/2026-05-20_mobile-ai-1st-class-entry.md) (2026-05-22 1단계 stub PR #85 머지 후 archive)
- G4 회신 도착 시: A 회신이면 신규 plan 보류, B 회신이면 신규 plan 즉시 진입 + 안2 revert PR, C 회신이면 본 락인 그대로 정식 합의화

**룰 C 발동 후보 등록**:
- G4 단답 6일차(2026-05-15 ~ 2026-05-20) — 룰 C 임계(2회 이월) 초과
- daily_outcome 2026-05-20 §3 carry-over에 본 PR 송부 + 잠정 락인 명시
- 본 락인 자체가 G4 게이트 룰 C 1차 발동 사례 (review-priority 룰 C와 동일 패턴)
