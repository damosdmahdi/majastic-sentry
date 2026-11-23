'use client';

import React from 'react';
import { UseCase, Task, User } from '@/types';
import { 
  Target, 
  Palette, 
  ExternalLink, 
  Plus, 
  Code2, 
  CheckCircle2, 
  Layers,
  ArrowRight
} from 'lucide-react';

interface UseCaseViewProps {
  useCases: UseCase[];
  tasks: Task[];
  users: User[];
  onOpenAddUseCaseModal: () => void;
  onOpenAddTaskModal: (useCaseId: string) => void;
}

export const UseCaseView: React.FC<UseCaseViewProps> = ({
  useCases,
  tasks,
  users,
  onOpenAddUseCaseModal,
  onOpenAddTaskModal,
}) => {
  const userMap = new Map(users.map((u) => [u.id, u]));

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Intro Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">Penyelarasan Use Case & Desain</h2>
          <p className="text-xs text-slate-500 mt-1">
            Menghubungkan target bisnis, desain Figma dari tim UI, dan modul endpoint developer agar tidak terjadi bias informasi.
          </p>
        </div>
        <button
          onClick={onOpenAddUseCaseModal}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl transition-all shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>+ Use Case Baru</span>
        </button>
      </div>

      {/* Use Cases Cards */}
      <div className="space-y-6">
        {useCases.map((uc) => {
          const ucTasks = tasks.filter((t) => t.useCaseId === uc.id);
          const doneTasks = ucTasks.filter((t) => t.status === 'DONE').length;
          const isComplete = ucTasks.length > 0 && doneTasks === ucTasks.length;

          return (
            <div
              key={uc.id}
              className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5 hover:border-slate-300 transition-all"
            >
              {/* Card Header */}
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold bg-slate-100 text-slate-800 px-2.5 py-0.5 rounded-lg border border-slate-200">
                      {uc.code}
                    </span>
                    <h3 className="font-bold text-base text-slate-900">{uc.title}</h3>
                    {isComplete && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                        <CheckCircle2 className="w-3 h-3" />
                        Selesai
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-400">
                    Progres: {doneTasks} dari {ucTasks.length} tugas teknis selesai
                  </div>
                </div>

                {/* Figma Design Link */}
                {uc.figmaUrl ? (
                  <a
                    href={uc.figmaUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 rounded-xl text-xs font-medium transition-colors self-start"
                  >
                    <Palette className="w-3.5 h-3.5" />
                    <span>Buka Frame Figma</span>
                    <ExternalLink className="w-3 h-3 text-purple-400" />
                  </a>
                ) : (
                  <span className="text-xs text-slate-400 italic">Desain Figma belum ditautkan</span>
                )}
              </div>

              {/* Business Goal Box */}
              <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-4 text-xs">
                <span className="font-bold text-amber-900 block mb-1">🎯 Kebutuhan & Nilai Bisnis:</span>
                <p className="text-slate-700 leading-relaxed">{uc.businessGoal}</p>
              </div>

              {/* Sub-tasks / Endpoint Contracts */}
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                  <span>Modul Teknis & Endpoint Terkait:</span>
                  <button
                    onClick={() => onOpenAddTaskModal(uc.id)}
                    className="text-sky-600 hover:text-sky-700 font-medium inline-flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Tambah Endpoint/Slicing</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {ucTasks.map((t) => {
                    const assignee = userMap.get(t.assigneeId);
                    return (
                      <div
                        key={t.id}
                        className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center justify-between text-xs"
                      >
                        <div className="space-y-1">
                          <div className="font-semibold text-slate-800">{t.title}</div>
                          {t.type === 'ENDPOINT' && t.endpointSpec ? (
                            <span className="font-mono text-[10px] text-slate-600 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                              <span className="font-bold text-sky-700">{t.endpointSpec.method}</span> {t.endpointSpec.route}
                            </span>
                          ) : (
                            <span className="text-[10px] text-indigo-700 font-medium">UI Slicing</span>
                          )}
                        </div>
                        <div className="text-right">
                          <span className="text-[11px] font-medium text-slate-500 block">
                            {assignee?.name.split(' ')[0]}
                          </span>
                          <span className={`text-[10px] font-semibold ${t.status === 'DONE' ? 'text-emerald-600' : 'text-slate-600'}`}>
                            {t.status}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
};
