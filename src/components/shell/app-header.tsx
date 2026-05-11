'use client';

import Link from 'next/link';
import { Bell, Search, Flame, User as UserIcon, LogOut } from 'lucide-react';
import { toast } from 'sonner';
import { PullimLogo } from '@/components/brand/logo';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent,
  DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator,
  DropdownMenuGroup,
} from '@/components/ui/dropdown-menu';
import { currentPersona } from '@/lib/mock';
import { MobileDrawer } from './mobile-drawer';

/**
 * 상단 헤더 — 풀림 Q 단일 도메인.
 * 좌: 햄버거(모바일) + 로고
 * 우: 스트릭 + 검색 + 알림 + 프로필
 */
export function AppHeader() {
  return (
    <header className="bg-card/85 sticky top-0 z-30 border-b backdrop-blur-md">
      <div className="flex h-14 items-center gap-2 px-3 md:px-4">
        <MobileDrawer />

        <Link href="/q" className="flex items-center gap-1.5 shrink-0">
          <PullimLogo size={22} />
          <span className="text-pullim-slate-400 hidden text-[10px] font-bold uppercase md:inline">
            Q
          </span>
        </Link>

        <div className="ml-auto flex items-center gap-1">
          <Badge
            variant="secondary"
            className="bg-pullim-blue-50 text-pullim-blue-700 border-pullim-blue-100 hidden gap-1 sm:inline-flex"
          >
            <Flame className="h-3.5 w-3.5" />
            {currentPersona.streakDays}일째
          </Badge>
          <button
            aria-label="검색"
            className="hover:bg-pullim-slate-100 relative inline-flex h-9 w-9 items-center justify-center rounded-lg"
            title="검색 (⌘ K)"
          >
            <Search className="h-5 w-5" />
          </button>
          <button
            aria-label="알림"
            className="hover:bg-pullim-slate-100 relative inline-flex h-9 w-9 items-center justify-center rounded-lg"
          >
            <Bell className="h-5 w-5" />
            <span className="bg-pullim-danger absolute top-1.5 right-1.5 inline-block h-2 w-2 rounded-full" />
          </button>
          <ProfileMenu />
        </div>
      </div>
    </header>
  );
}

function ProfileMenu() {
  function handleLogout() {
    toast.info('로그아웃 (데모)', {
      description: '데모 환경이라 실제 로그아웃은 동작하지 않아요.',
      duration: 3000,
    });
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label="프로필 메뉴 열기"
        className="bg-pullim-blue-600 hover:bg-pullim-blue-700 hover:ring-pullim-blue-200 ml-1 inline-flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white transition-all hover:ring-2 focus-visible:ring-pullim-blue-300 focus-visible:ring-2 outline-none"
      >
        {currentPersona.name[0]}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-52">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="px-2 py-1.5">
            <div className="text-pullim-slate-900 text-sm font-bold">{currentPersona.name}</div>
            <div className="text-pullim-slate-500 text-[11px] font-normal">
              {currentPersona.grade} · {currentPersona.school}
            </div>
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem className="p-0">
            <Link href="/me" className="flex w-full items-center gap-1.5 px-2 py-1.5 text-sm">
              <UserIcon className="h-4 w-4" />
              내 정보
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={handleLogout}
            variant="destructive"
            className="gap-1.5 px-2 py-1.5 text-sm"
          >
            <LogOut className="h-4 w-4" />
            로그아웃
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
