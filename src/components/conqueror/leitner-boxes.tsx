import { Trophy, Check, X as XIcon } from 'lucide-react';
import { countByBox, leitnerMeta, type LeitnerBox } from '@/lib/mock';

const boxes: LeitnerBox[] = [1, 2, 3, 4, 5];

// IRT 5-step blue ramp + 마스터 BOX 5는 레몬 (Layer 1 §14.1: 색 토큰 ≤4)
const boxColor: Record<LeitnerBox, { fill: string; text: string }> = {
  1: { fill: 'bg-pullim-blue-100', text: 'text-pullim-blue-800' },
  2: { fill: 'bg-pullim-blue-200', text: 'text-pullim-blue-800' },
  3: { fill: 'bg-pullim-blue-400', text: 'text-white' },
  4: { fill: 'bg-pullim-blue-700', text: 'text-white' },
  5: { fill: 'bg-pullim-lemon',    text: 'text-pullim-lemon-ink' },
};

/**
 * Leitner 5-박스 상태판 — 각 박스에 담긴 카드 수 + 복습 주기.
 * Layer 1 §14.1: 한 화면 단일 톤 — 라이트 베이스.
 */
export function LeitnerBoxes() {
  const counts = countByBox();
  const total = Object.values(counts).reduce((a, b) => a + b, 0);

  return (
    <section className="bg-card relative overflow-hidden rounded-2xl border p-4">
      <header className="mb-3 flex items-end justify-between">
        <div>
          <p className="text-pullim-blue-600 text-[10px] font-bold tracking-wider uppercase">
            Leitner 5-box
          </p>
          <h2 className="text-pullim-slate-900 mt-0.5 text-base font-bold">박스별 오답 분포</h2>
        </div>
        <div className="text-pullim-slate-500 text-[11px]">
          전체 <strong className="text-pullim-slate-900 font-mono text-sm">{total}</strong>개 관리 중
        </div>
      </header>

      <ol className="grid grid-cols-5 gap-2">
        {boxes.map(b => {
          const meta = leitnerMeta[b];
          const count = counts[b];
          const color = boxColor[b];
          const isMaster = b === 5;
          return (
            <li key={b}>
              <div className="bg-pullim-slate-50 ring-pullim-slate-200 flex flex-col items-center rounded-xl p-2.5 text-center ring-1">
                {/* 박스 레벨 원 */}
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full font-mono text-lg font-bold ${color.fill} ${color.text}`}
                >
                  {isMaster ? <Trophy className="h-4 w-4" /> : b}
                </div>

                <div className="text-pullim-slate-900 font-mono text-xl font-bold mt-1.5">{count}</div>
                <div className="text-pullim-slate-500 text-[9px] font-semibold">
                  {meta.interval}
                </div>
                <div className="text-pullim-slate-400 mt-0.5 text-[8px] leading-tight">
                  {meta.tag}
                </div>
              </div>
            </li>
          );
        })}
      </ol>

      {/* 시각적 화살표 — emoji 제거, lucide 통일 */}
      <div className="text-pullim-slate-500 mt-2 flex items-center justify-center gap-1 text-[10px]">
        <Check className="text-pullim-success h-3 w-3" />
        <span>연속 성공 →</span>
        <span className="text-pullim-blue-700 font-bold">다음 박스</span>
        <span className="text-pullim-slate-300 mx-1">·</span>
        <XIcon className="text-pullim-danger h-3 w-3" />
        <span>실패 →</span>
        <span className="text-pullim-danger font-bold">BOX 1 복귀</span>
      </div>
    </section>
  );
}
