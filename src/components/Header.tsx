'use client';

import React from 'react';
import { User } from '@/types';
import { 
  ShieldCheck, 
  Kanban, 
  Target, 
  ShieldAlert, 
  FileText,
  UserCheck
} from 'lucide-react';

export type NavTab = 'board' | 'usecases' | 'guardrail' | 'obsidian';

interface HeaderProps {
  currentTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  currentUser: User;
  onSwitchUser: (user: User) => void;
  users: User[];
  projectName: string;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onTabChange,
  currentUser,
  onSwitchUser,
  users,
  projectName,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo Brand */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-sm shadow-sm">
              M
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 text-sm tracking-tight">Majastic Sentry</span>
                <span className="text-[10px] font-medium text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                  {projectName}
                </span>
              </div>
            </div>
          </div>

          {/* Clean Navigation Tabs */}
          <nav className="flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl">
            <button
              onClick={() => onTabChange('board')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                currentTab === 'board'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Kanban className="w-3.5 h-3.5" />
              <span>Papan Tugas</span>
            </button>

            <button
              onClick={() => onTabChange('usecases')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                currentTab === 'usecases'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Target className="w-3.5 h-3.5" />
              <span>Use Case & Bisnis</span>
            </button>

            <button
              onClick={() => onTabChange('guardrail')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                currentTab === 'guardrail'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Guardrail PR</span>
            </button>

            <button
              onClick={() => onTabChange('obsidian')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                currentTab === 'obsidian'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-purple-700 hover:text-purple-900 hover:bg-purple-50'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Tarik ke Obsidian</span>
            </button>
          </nav>

          {/* User Role Selector */}
          <div className="flex items-center gap-2">
            <span className="text-slate-400 text-xs hidden sm:inline">Masuk sebagai:</span>
            <select
              aria-label="Pilih Akun Simulasi"
              value={currentUser.id}
              onChange={(e) => {
                const target = users.find((u) => u.id === e.target.value);
                if (target) onSwitchUser(target);
              }}
              className="bg-slate-50 border border-slate-200 text-slate-800 text-xs font-medium py-1.5 px-2.5 rounded-xl cursor-pointer hover:bg-slate-100 focus:ring-2 focus:ring-slate-400"
            >
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.avatar} {u.name} ({u.tag || u.role})
                </option>
              ))}
            </select>
          </div>

        </div>
      </div>
    </header>
  );
};
