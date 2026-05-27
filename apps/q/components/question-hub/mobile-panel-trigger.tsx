'use client';

import { useState } from 'react';
import { BookOpen } from 'lucide-react';
import {
  Sheet, SheetContent, SheetTitle, SheetHeader, SheetTrigger,
} from '@/components/ui/sheet';
import { type ExplainContent } from '@/lib/mock';
import { LearningMaterialsPanel } from './learning-materials-panel';

/**
 * 모바일 전용 — 학습 재료 패널을 하단 Sheet로 노출.
 * 데스크탑 ≥ lg 에서는 sticky 사이드 패널이 본문 옆에 보이므로 트리거는 hidden.
 */
export function MobilePanelTrigger({
  data,
  sku,
}: {
  data: ExplainContent;
  sku: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        className="bg-pullim-blue-600 hover:bg-pullim-blue-700 shadow-pullim-accent fixed right-4 bottom-20 z-30 inline-flex items-center gap-1.5 rounded-full px-4 py-2.5 text-sm font-bold text-white transition-colors lg:hidden"
        aria-label="학습 재료 보기"
      >
        <BookOpen className="h-4 w-4" />
        학습 재료
      </SheetTrigger>
      <SheetContent side="right" className="w-[90vw] max-w-sm overflow-y-auto p-4">
        <SheetHeader className="mb-3 p-0">
          <SheetTitle className="text-pullim-slate-900 text-base font-bold tracking-tight">
            학습 재료
          </SheetTitle>
        </SheetHeader>
        <LearningMaterialsPanel data={data} sku={sku} layout="flat" />
      </SheetContent>
    </Sheet>
  );
}
