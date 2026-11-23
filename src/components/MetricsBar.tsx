'use client';

import React from 'react';
import { Task, User } from '@/types';
import { 
  CheckCircle2, 
  Clock, 
  AlertOctagon, 
  ShieldAlert, 
  Hourglass,
  Filter,
  CheckCheck
} from 'lucide-react';

interface MetricsBarProps {
  tasks: Task[];
  currentUser: User;
  activeFilter: string;
  onFilterChange: (filter: string) => void;
}

export const MetricsBar: React.FC<MetricsBarProps> = ({
  tasks,
  currentUser,
  activeFilter,
  onFilterChange,
}) => {
  const now = new Date();

  const total = tasks.length;
  const done = tasks.filter((t) => t.status === 'DONE').length;
  const review = tasks.filter((t) => t.status === 'REVIEW').length;
  const blocked = tasks.filter((t) => t.status === 'BLOCKED').length;
  const inProgress = tasks.filter((t) => t.status === 'IN_PROGRESS').length;

  // Stale tasks: In progress > 48h
  const stale = tasks.filter((t) => {
    if (t.status !== 'IN_PROGRESS') return false;
    const diffHours = (now.getTime() - new Date(t.lastUpdatedAt).getTime()) / (1000 * 3600);
    return diffHours >= 48;
  }).length;

  // Guardrail warnings (AI over-writes on protected files)
  const guardrailAlerts = tasks.filter(
    (t) => t.integrityCheck?.status === 'WARNING' || t.integrityCheck?.status === 'FAILED'
  ).length;

  const percentDone = total > 0 ? Math.round((done / total) * 100) : 0;

  return (
    <div className="bg-white border-b border-slate-200 py-3 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        
        {/* KPI Mini Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 flex-1">
          
          {/* Progress */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-2.5">
            <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
              <span>Progres Sprint</span>
              <span className="font-bold text-sky-600">{percentDone}%</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-1.5 mt-2 overflow-hidden">
              <div 
                className="bg-sky-600 h-1.5 rounded-full transition-all duration-500" 
                style={{ width: `${percentDone}%` }} 
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1.5">{done} dari {total} tugas selesai</p>
          </div>

          {/* Review Mentor */}
          <div 
            onClick={() => onFilterChange('REVIEW')}
            className={`border rounded-xl p-2.5 cursor-pointer transition-all ${
              review > 0 ? 'bg-amber-50/60 border-amber-200 hover:border-amber-400' : 'bg-slate-50 border-slate-200/80'
            }`}
          >
            <div className="flex items-center justify-between text-xs font-medium text-slate-600">
              <span>Review Mentor</span>
              <Clock className={`w-3.5 h-3.5 ${review > 0 ? 'text-amber-600' : 'text-slate-400'}`} />
            </div>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-lg font-bold text-slate-900">{review}</span>
              <span className="text-[11px] text-slate-500">tugas</span>
            </div>
            <p className="text-[10px] text-amber-700 font-medium mt-0.5">Siap diuji mentor</p>
          </div>

          {/* Blockers */}
          <div 
            onClick={() => onFilterChange('BLOCKED')}
            className={`border rounded-xl p-2.5 cursor-pointer transition-all ${
              blocked > 0 ? 'bg-rose-50/70 border-rose-200 hover:border-rose-400' : 'bg-slate-50 border-slate-200/80'
            }`}
          >
            <div className="flex items-center justify-between text-xs font-medium text-slate-600">
              <span>Blocker Aktif</span>
              <AlertOctagon className={`w-3.5 h-3.5 ${blocked > 0 ? 'text-rose-600' : 'text-slate-400'}`} />
            </div>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-lg font-bold text-rose-700">{blocked}</span>
              <span className="text-[11px] text-slate-500">tugas</span>
            </div>
            <p className="text-[10px] text-rose-600 font-medium mt-0.5">Butuh bantuan PM</p>
          </div>

          {/* Stale Tasks (>48h) */}
          <div 
            onClick={() => onFilterChange('STALE')}
            className={`border rounded-xl p-2.5 cursor-pointer transition-all ${
              stale > 0 ? 'bg-orange-50/60 border-orange-200 hover:border-orange-400' : 'bg-slate-50 border-slate-200/80'
            }`}
          >
            <div className="flex items-center justify-between text-xs font-medium text-slate-600">
              <span>Stale (&gt;48j)</span>
              <Hourglass className={`w-3.5 h-3.5 ${stale > 0 ? 'text-orange-600' : 'text-slate-400'}`} />
            </div>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-lg font-bold text-orange-700">{stale}</span>
              <span className="text-[11px] text-slate-500">tugas</span>
            </div>
            <p className="text-[10px] text-orange-600 font-medium mt-0.5">Potensi silent blocker</p>
          </div>

          {/* Guardrail Alert */}
          <div 
            onClick={() => onFilterChange('GUARDRAIL')}
            className={`border rounded-xl p-2.5 cursor-pointer transition-all ${
              guardrailAlerts > 0 ? 'bg-purple-50/70 border-purple-200 hover:border-purple-400' : 'bg-slate-50 border-slate-200/80'
            }`}
          >
            <div className="flex items-center justify-between text-xs font-medium text-slate-600">
              <span>AI-Diff Alert</span>
              <ShieldAlert className={`w-3.5 h-3.5 ${guardrailAlerts > 0 ? 'text-purple-600' : 'text-slate-400'}`} />
            </div>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-lg font-bold text-purple-700">{guardrailAlerts}</span>
              <span className="text-[11px] text-slate-500">peringatan</span>
            </div>
            <p className="text-[10px] text-purple-600 font-medium mt-0.5">Protected file tersentuh</p>
          </div>

        </div>

        {/* Quick Filter Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 text-xs">
          <div className="flex items-center gap-1 text-slate-400 mr-1 text-[11px] font-medium">
            <Filter className="w-3.5 h-3.5" />
            <span>Filter:</span>
          </div>

          <button
            onClick={() => onFilterChange('ALL')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              activeFilter === 'ALL'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Semua
          </button>

          <button
            onClick={() => onFilterChange('MY_TASKS')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1 ${
              activeFilter === 'MY_TASKS'
                ? 'bg-sky-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <span>Tugas Saya</span>
            <span className="text-[10px] opacity-80 font-normal">({currentUser.name.split(' ')[0]})</span>
          </button>

          <button
            onClick={() => onFilterChange('REVIEW')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              activeFilter === 'REVIEW'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Review ({review})
          </button>

          <button
            onClick={() => onFilterChange('BLOCKED')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              activeFilter === 'BLOCKED'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Blocker ({blocked})
          </button>

          <button
            onClick={() => onFilterChange('STALE')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              activeFilter === 'STALE'
                ? 'bg-orange-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Stale ({stale})
          </button>
        </div>

      </div>
    </div>
  );
};
