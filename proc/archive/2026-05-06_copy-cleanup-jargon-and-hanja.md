# 2026-05-06 카피 정리 — 학술 기호 + 한자어

> **상태**: ✅ 완료 (Q 도메인 1차, 2026-05-07)
> **명세 권위**: [07-branding.md § 5.2](../spec/07-branding.md) (학술 기호), [§ 6](../spec/07-branding.md) (한자어 정책)
> **리서치 권위**: [proc/research/2026-05-06_hanja-vocabulary-ux-policy.md](../research/2026-05-06_hanja-vocabulary-ux-policy.md)
> **트리거 사건**: 학생 UI 표면에 `θ` 직접 노출 + "잔존" 등 어려운 한자어 사용으로 고등학생 인지 부담 발생
> **분류**: **풀림 Q 도메인 락인으로 1차 처리** (theta 회귀 5건 모두 Q 도메인). 다른 도메인에서 한자어가 발견되면 **도메인별로 분할**.
>
> **적용 요약 (2026-05-07)**
> - **Phase 1 — theta/IRT 노출 처리**: 9개 파일 · 노출 21건 교체. 변수명·타입명·JSDoc 코멘트는 그대로 유지.
> - **Phase 2.1 — 한자어 교체**: 6건 ("잔존" → "남은 기억" 5건 across `q/review/page.tsx` × 3, `memory/review-formats.tsx`, `memory/forgetting-curve-chart.tsx` × 2 / "임박" → "코앞" 1건 in `q/page.tsx`)
> - **Phase 2.2 — 다른 도메인 발견 (편집 안 함)**: 플래너 2건(reports page + planner mock), 공유 shell nav-config 1건, shell flywheel JSDoc 1건(코멘트라 비노출). 도메인별 후속 plan 필요.
> - **학습 콘텐츠 미손상**: `lib/mock/infinity.ts`의 `statement`/`explanation` 무손상 confirmed.
> - **tsc**: 0 에러
> - **라이브 검증**: `/q/review` "30일 남은 기억 32%" + "남은 기억 N%" 노출 확인, `/q/analysis/diagnose` θ/IRT/σ 노출 0건 확인.

## 목표

§ 5.2 학술 기호·약어와 § 6.2 한자어 교체 표를 학생 UI 표면에 일괄 적용. **UI 카피 vs 학습 콘텐츠** 경계선을 흐리지 않는다 — 문항·해설은 **건드리지 않음**.

## 작업 항목

### Phase 1: 학술 기호 노출 정리 (§ 5.2)

#### Step 1.1: 회귀 점검 5건 수정 ✓

- [x] **`src/app/(student)/q/analysis/diagnose/page.tsx`** — 10건 처리: "θ 능력치 갱신" → "실력 점수 갱신", "θ 추정 정확도" → "실력 점수 추정/정확도", "IRT 적응형/추정" → "맞춤 진단/맞춤", "표준오차 (SE)" 제거, "θ·등급·단원 마스터리" → "실력 점수·등급·단원 정복도", toast description 등
- [x] **`src/app/(student)/q/page.tsx`** — 1건: "예상 θ +${...}" → "예상 실력 점수 +${...}". 기존 "실력 {exam.thetaBefore.toFixed(2)} → ..." 패턴은 그대로 보존
- [x] **`src/app/(student)/q/analysis/ability/page.tsx`** — 1건: title "(IRT θ)" 부연 제거
- [x] **`src/app/(student)/q/analysis/onboarding/page.tsx`** — 5건: "θ 추정/T2 IRT/θ 영웅 카드/실시간 θ 갱신/표준정규 IRT 추정/예상 효과 +0.18 θ" 모두 한국어로
- [x] **`src/app/(student)/page.tsx`** — 1건: flywheel "분석 θ" → "실력 점수"

#### Step 1.2: 추가 grep — IRT/σ/마스터리 노출 ✓

- [x] grep 실행 후 학생 UI 노출 추가 발견 4파일 처리:
  - `src/app/(student)/q/infinity/onboarding/page.tsx` (1건): "θ 0.35 → 0.42" → "실력 점수 0.35 → 0.42"
  - `src/app/(student)/q/infinity/exam-result/page.tsx` (2건): "θ 변동" → "실력 점수 변동", flywheel "분석 θ" → "실력 점수"
  - `src/components/study-index/{ability-hero,growth-trend,prescription-list,mastery-heatmap}.tsx` (5건)
  - `src/components/infinity/solve-session-picker.tsx` (1건): "IRT가 내 실력에" → "AI가 내 실력에"
  - `src/lib/mock/coach.ts` (2건), `src/lib/mock/phase1.ts` (1건): UI 노출 description 카피
- [x] 변수명·타입명 (`thetaBefore`, `thetaTrend`, `expectedThetaGain`, `LeitnerCard`, `BoxFill` 등)은 그대로 유지 — § 5.2는 학생 UI 노출에만 적용

### Phase 2: 한자어 교체 (§ 6.2)

#### Step 2.1: Q 도메인 한자어 grep + 교체 ✓

- [x] grep 실행 → 발견 사례 모두 § 6.2 교체안 적용
- [x] **잔존 → 남은 기억 (5건)**:
  - `src/app/(student)/q/review/page.tsx` × 3 (KPI "30일 남은 기억", 큐 행 "남은 기억 N%", forgetting 카드 헤딩)
  - `src/components/memory/review-formats.tsx` (효과 배지 "남은 기억 +N%")
  - `src/components/memory/forgetting-curve-chart.tsx` × 2 (Area name "내 남은 기억", Insight 라벨)
- [x] **임박 → 코앞 (1건)**: `src/app/(student)/q/page.tsx` "마스터 임박" → "마스터 코앞"
- [x] 학습 콘텐츠 (`lib/mock/infinity.ts` 의 `statement`/`explanation`) 무손상 — § 6.1 경계 준수

#### Step 2.2: 다른 도메인 grep + 분할 결정 ✓

- [x] grep 실행 결과 (편집 안 함, 보고만):
- [x] 도메인별 발견 사례를 본 plan 진행 추적 표에 기록 → 후속 plan 필요 항목:
  - **플래너**: 2건 발견 → 후속 락인 plan 필요 (`2026-05-XX_copy-cleanup-planner.md`)
  - **공유 shell**: 1건 발견 (`nav-config.ts`) → 후속 글로벌 plan 필요
  - 클래스봇·라이브러리·기타 도메인: 0건 (false positive만)

### Phase 3: 불필요 텍스트·컴포넌트 절감 (§ 6.3)

본 plan에서 다루지 않음 (디자인 리뷰 필요).

- [ ] 1차 카피 정리 후 풀림 Q 페이지별로 § 6.3 항목 점검 plan 생성 여부 결정 — **후속 작업**

### Phase 4: 검증 ✓

- [x] **§ 6.5 1차 검수 질문 통과**: 수정한 카피마다 "고등학생이 한 번 읽고 의미가 잡히는가" self-check 통과
- [x] after 라이브 검증: `/q/review` 진입 시 "30일 남은 기억 32%" + 큐 행 "남은 기억 N%" 노출 확인. `/q/analysis/diagnose` θ/IRT/σ 노출 0건 확인 (rendered text grep). 캡처: [output/live-shots/review-cta-after.png](../../output/live-shots/review-cta-after.png)
- [x] 라이브 서버 콘솔 에러 0건
- [x] 학습 콘텐츠 무손상 — `lib/mock/infinity.ts` 의 `statement`/`explanation` git diff에서 변경 없음 confirmed

### Phase 5: 명세 갱신

- [ ] [07-branding.md § 5.2](../spec/07-branding.md) "회귀 점검 대상 (2026-05-06 시점)" 5건 처리 완료 표기 — **후속 작업** (선택, 명세 명확성 보강)
- [ ] § 6.2 표에 추가 발견된 한자어 (현 시점 없음) 행 추가 — 추후 발견 시

## 진행 추적 표

| 도메인 | theta/IRT 노출 | 한자어 발견 수 | 처리 결과 |
|---|---|---|---|
| 풀림 Q | 21건 (회귀 5건 + 추가 grep 16건) | 6건 (잔존 5건 + 임박 1건) | ✅ 본 plan에서 처리 완료 |
| 풀림 플래너 | 2건 (`reports/page.tsx`, `lib/mock/planner.ts`) | 0건 | 🟡 후속 plan 필요 (`2026-05-XX_copy-cleanup-planner.md`) |
| 풀림 클래스봇 | 0건 | 0건 | — |
| 풀림 라이브러리 | 0건 | 0건 | — |
| 공유 (shell) | 1건 (`nav-config.ts`, 1건 JSDoc 코멘트는 비노출) | 0건 | 🟡 후속 plan 필요 (글로벌 작업) |
| 공유 (study) | 0건 | 0건 | — |

## 범위 외

- **학습 콘텐츠**(`lib/mock/` 문항·해설·교과서 인용) — § 6.1 경계 준수, 임의 평탄화 금지
- **§ 6.4 콘텐츠 한자어 툴팁 기능** — 향후 plan으로 별도 검토
- **§ 6.3 불필요 텍스트·컴포넌트 절감** — 디자인 리뷰 필요해 페이지별 별도 plan
- **오버플로 베이스** — [별도 plan](2026-05-06_overflow-base-components.md)
- **버튼 어포던스** — [별도 plan](2026-05-06_button-affordance-q-domain.md)

## 비고

### 변수명 vs UI 카피 구분

`const [thetaBefore] = useState(0.42)` 같은 **변수명/코드 식별자**는 변경하지 않는다 — 명세 § 5.2는 "학생 UI 노출"에만 적용. 코드 가독성과 IRT 도메인 정합 유지가 우선.

### 컨벤션

- 커밋 메시지: `fix(q): theta → 실력 점수 per 07 § 5.2`, `fix(q): 잔존 → 기억 per 07 § 6.2`
- 한 PR당 1 phase 권장. Phase 1(theta 5건) → Phase 2.1(Q 한자어) → Phase 2.2(grep + 분할 결정) 순.
