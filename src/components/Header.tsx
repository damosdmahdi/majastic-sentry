'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { User } from '@/types';
import { 
  Kanban, 
  Target, 
  ShieldAlert, 
  FileText, 
  RotateCw, 
  Menu, 
  X,
  LogOut,
  ChevronDown
} from 'lucide-react';

export type NavTab = 'board' | 'usecases' | 'guardrail' | 'obsidian';

interface HeaderProps {
  currentTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  currentUser: User;
  projectName: string;
  isSyncing: boolean;
  onManualSync: () => void;
  lastSyncedText: string;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onTabChange,
  currentUser,
  projectName,
  isSyncing,
  onManualSync,
  lastSyncedText,
}) => {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const handleTabClick = (tab: NavTab) => {
    onTabChange(tab);
    setMobileMenuOpen(false);
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
      router.refresh();
    } catch {
      router.push('/login');
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Header Bar (Never Collides, Highly Adaptive) */}
        <div className="flex items-center justify-between h-16 gap-3">
          
          {/* Left: Brand & Status */}
          <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
            <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-sm shadow-sm shrink-0">
              M
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="font-bold text-slate-900 text-sm tracking-tight truncate">Majastic Sentry</span>
                <span 
                  title={projectName}
                  className="hidden sm:inline-block text-[10px] font-medium text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded truncate max-w-[130px] md:max-w-[180px]"
                >
                  {projectName}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mt-0.5">
                <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${isSyncing ? 'bg-amber-500 animate-ping' : 'bg-emerald-500'}`} />
                <span className="truncate">{lastSyncedText}</span>
                <button
                  onClick={onManualSync}
                  title="Sinkronisasi data sekarang"
                  className="p-0.5 hover:text-slate-600 rounded transition-colors"
                >
                  <RotateCw className={`w-2.5 h-2.5 ${isSyncing ? 'animate-spin text-sky-600' : ''}`} />
                </button>
              </div>
            </div>
          </div>

          {/* Center: Desktop Navigation Tabs (Hidden on < lg to prevent collisions) */}
          <nav className="hidden lg:flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl shrink-0">
            <button
              onClick={() => handleTabClick('board')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                currentTab === 'board'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Kanban className="w-3.5 h-3.5 shrink-0" />
              <span>Papan Tugas</span>
            </button>

            <button
              onClick={() => handleTabClick('usecases')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                currentTab === 'usecases'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Target className="w-3.5 h-3.5 shrink-0" />
              <span>Use Case & Bisnis</span>
            </button>

            <button
              onClick={() => handleTabClick('guardrail')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                currentTab === 'guardrail'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
              <span>Guardrail PR</span>
            </button>

            {/* Obsidian Tab (Mentor Only) */}
            {currentUser.role === 'MENTOR' && (
              <button
                onClick={() => handleTabClick('obsidian')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  currentTab === 'obsidian'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-purple-700 hover:text-purple-900 hover:bg-purple-50'
                }`}
              >
                <FileText className="w-3.5 h-3.5 shrink-0" />
                <span>Tarik ke Obsidian</span>
                <span className="text-[9px] bg-purple-700/50 text-purple-200 px-1 rounded font-mono">Lead</span>
              </button>
            )}
          </nav>

          {/* Right: Authenticated User Badge & Logout */}
          <div className="flex items-center gap-2 shrink-0">
            
            {/* User Profile Pill with Switcher/Logout Dropdown */}
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 text-xs font-medium py-1 px-2.5 rounded-xl cursor-pointer transition-colors max-w-[170px] sm:max-w-[220px]"
              >
                <span className="text-sm shrink-0">{currentUser.avatar}</span>
                <span className="truncate">{currentUser.name.split(' ')[0]}</span>
                <span className="hidden sm:inline text-[10px] text-slate-400 bg-white px-1 rounded border border-slate-200">
                  {currentUser.tag || currentUser.role}
                </span>
                <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${userDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* User Dropdown Menu */}
              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-60 bg-white border border-slate-200 rounded-2xl shadow-xl p-2.5 z-50 text-xs space-y-2 animate-in fade-in duration-100">
                  <div className="px-2 py-1.5 border-b border-slate-100 pb-2">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xl">{currentUser.avatar}</span>
                      <div className="min-w-0">
                        <p className="font-semibold text-slate-900 truncate">{currentUser.name}</p>
                        <p className="text-[10px] text-slate-400 truncate">{currentUser.email}</p>
                      </div>
                    </div>
                    <div className="inline-flex items-center gap-1 mt-1 text-[10px] font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                      <span>Peran:</span>
                      <span className="font-semibold text-slate-800">{currentUser.tag || currentUser.role}</span>
                    </div>
                  </div>

                  {/* Logout Button */}
                  <div>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-3 py-2 text-rose-600 hover:bg-rose-50 rounded-xl flex items-center gap-2 font-medium transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Keluar (Logout)</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Hamburger Toggle (Visible on < lg) */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
              aria-label="Buka menu navigasi"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

          </div>

        </div>

        {/* Horizontal Scrollable Tab Bar for Tablet & Mobile (Visible on < lg screens) */}
        <div className="lg:hidden flex items-center gap-1.5 overflow-x-auto py-2 border-t border-slate-100 scrollbar-none text-xs -mx-4 px-4 sm:-mx-6 sm:px-6">
          <button
            onClick={() => handleTabClick('board')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg font-semibold shrink-0 transition-all ${
              currentTab === 'board'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600'
            }`}
          >
            <Kanban className="w-3 h-3" />
            <span>Papan Tugas</span>
          </button>

          <button
            onClick={() => handleTabClick('usecases')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg font-semibold shrink-0 transition-all ${
              currentTab === 'usecases'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600'
            }`}
          >
            <Target className="w-3 h-3" />
            <span>Use Case</span>
          </button>

          <button
            onClick={() => handleTabClick('guardrail')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg font-semibold shrink-0 transition-all ${
              currentTab === 'guardrail'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600'
            }`}
          >
            <ShieldAlert className="w-3 h-3" />
            <span>Guardrail PR</span>
          </button>

          {currentUser.role === 'MENTOR' && (
            <button
              onClick={() => handleTabClick('obsidian')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg font-semibold shrink-0 transition-all ${
                currentTab === 'obsidian'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'bg-purple-50 text-purple-700'
              }`}
            >
              <FileText className="w-3 h-3" />
              <span>Tarik ke Obsidian</span>
            </button>
          )}
        </div>

      </div>

      {/* Mobile Drawer (When Hamburger is clicked) */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-slate-200 px-4 py-3 space-y-2 animate-in slide-in-from-top-2 duration-150 shadow-lg">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-2">
            Proyek Aktif: {projectName}
          </div>
          <div className="space-y-1">
            <button
              onClick={() => handleTabClick('board')}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-left ${
                currentTab === 'board' ? 'bg-slate-100 text-slate-900' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Kanban className="w-4 h-4 text-slate-500" />
              <span>Papan Tugas Kanban</span>
            </button>

            <button
              onClick={() => handleTabClick('usecases')}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-left ${
                currentTab === 'usecases' ? 'bg-slate-100 text-slate-900' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Target className="w-4 h-4 text-slate-500" />
              <span>Penyelarasan Use Case & Figma</span>
            </button>

            <button
              onClick={() => handleTabClick('guardrail')}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-left ${
                currentTab === 'guardrail' ? 'bg-slate-100 text-slate-900' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <ShieldAlert className="w-4 h-4 text-slate-500" />
              <span>Guardrail PR & Diagnostik GitHub</span>
            </button>

            {currentUser.role === 'MENTOR' && (
              <button
                onClick={() => handleTabClick('obsidian')}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-left ${
                  currentTab === 'obsidian' ? 'bg-purple-100 text-purple-900' : 'text-purple-700 hover:bg-purple-50'
                }`}
              >
                <FileText className="w-4 h-4 text-purple-600" />
                <span>Tarik ke Obsidian (.md)</span>
              </button>
            )}

            <div className="pt-2 border-t border-slate-100">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl"
              >
                <LogOut className="w-4 h-4" />
                <span>Keluar dari Aplikasi</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </header>
  );
};
