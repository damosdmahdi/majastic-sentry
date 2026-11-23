'use client';

import React from 'react';
import { User, Project, Milestone } from '@/types';
import { 
  ShieldCheck, 
  Download, 
  Sliders, 
  GitBranch, 
  Layers, 
  Sparkles,
  ExternalLink
} from 'lucide-react';

interface HeaderProps {
  currentUser: User;
  onSwitchUser: (user: User) => void;
  users: User[];
  project: Project;
  milestone: Milestone;
  onOpenObsidianModal: () => void;
  onOpenSettingsModal: () => void;
  onOpenAddUseCaseModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  onSwitchUser,
  users,
  project,
  milestone,
  onOpenObsidianModal,
  onOpenSettingsModal,
  onOpenAddUseCaseModal,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          
          {/* Logo & Project Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-sky-500/20">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-lg text-slate-900 tracking-tight">Majastic Sentry</h1>
                <span className="text-[10px] font-semibold bg-sky-100 text-sky-800 px-2 py-0.5 rounded-full border border-sky-200">
                  Internal Core
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                <span className="font-medium text-slate-700">{project.name}</span>
                <span>•</span>
                <span className="inline-flex items-center gap-1 font-mono text-[11px] text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
                  <GitBranch className="w-3 h-3 text-slate-400" />
                  {project.githubRepo}
                </span>
                <span>•</span>
                <span className="inline-flex items-center gap-1 text-indigo-700 font-medium">
                  <Layers className="w-3 h-3" />
                  {milestone.title} ({milestone.sdlcType === 'AGILE_SPRINT' ? 'Scrum' : 'Waterfall'})
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons & Role Switcher */}
          <div className="flex flex-wrap items-center gap-2.5">
            
            {/* Role / Current User Switcher for Testing & Mentoring */}
            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
              <span className="text-slate-400 pl-2 text-[11px] font-medium hidden sm:inline">Role Simulasi:</span>
              <select
                aria-label="Pilih Role Simulasi"
                value={currentUser.id}
                onChange={(e) => {
                  const target = users.find((u) => u.id === e.target.value);
                  if (target) onSwitchUser(target);
                }}
                className="bg-white border-0 text-slate-800 font-semibold py-1 px-2.5 rounded-lg shadow-sm focus:ring-2 focus:ring-sky-500 cursor-pointer text-xs"
              >
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.avatar} {u.name} ({u.tag || u.role})
                  </option>
                ))}
              </select>
            </div>

            {/* Protected Files & Guardrail Config */}
            <button
              onClick={onOpenSettingsModal}
              title="Konfigurasi File Dilindungi & Guardrail"
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 hover:border-slate-400 transition-all shadow-sm"
            >
              <Sliders className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden md:inline">Protected Files</span>
            </button>

            {/* Download Weekly Obsidian Markdown Button */}
            <button
              onClick={onOpenObsidianModal}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 rounded-xl shadow-sm shadow-purple-500/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Tarik ke Obsidian</span>
              <span className="bg-purple-800/60 text-[10px] px-1.5 py-0.2 rounded text-purple-200 font-mono">.md</span>
            </button>

            {/* Add Use Case Button (Mentor / PM / Business only) */}
            {(currentUser.role === 'MENTOR' || currentUser.role === 'BUSINESS') && (
              <button
                onClick={onOpenAddUseCaseModal}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-xl shadow-sm shadow-sky-500/25 transition-all"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>+ Use Case</span>
              </button>
            )}

          </div>

        </div>
      </div>
    </header>
  );
};
