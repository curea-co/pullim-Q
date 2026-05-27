import { Users } from 'lucide-react';
import { PageHeader } from '@/components/shell/page-header';
import { CoachHero } from '@/components/coach/coach-hero';
import { CoachChat } from '@/components/coach/coach-chat';
import { ActivityTimeline } from '@/components/coach/activity-timeline';

export default function CoachPage() {
  return (
    <div className="space-y-section">
      <PageHeader
        eyebrow={{ icon: Users, text: '풀림 코치' }}
        title="공부 전반을 봐주는 한 명의 친구"
        description="이번 주 어디부터 할지, 약점은 어디고 보강은 뭘로 할지 — 막힐 때 코치에게 물어보세요."
      />

      <CoachHero />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.5fr_1fr]">
        <CoachChat />
        <ActivityTimeline />
      </div>
    </div>
  );
}
