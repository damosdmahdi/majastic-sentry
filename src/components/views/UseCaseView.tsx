'use client';

import React, { useState } from 'react';
import { UseCase, Task, User } from '@/types';
import { 
  Palette, 
  ExternalLink, 
  Plus, 
  CheckCircle2, 
  Archive,
  Pencil,
  Trash2
} from 'lucide-react';

interface UseCaseViewProps {
  useCases: UseCase[];
  tasks: Task[]; // Receives all tasks (including historical/archived ones)
  users: User[];
  isMentor: boolean;
  onOpenAddUseCaseModal: () => void;
  onEditUseCase: (useCase: UseCase) => void;
  onDeleteUseCase: (useCaseId: string) => void;
  onOpenAddTaskModal: (useCaseId: string) => void;
}

export const UseCaseView: React.FC<UseCaseViewProps> = ({
  useCases,
  tasks,
  users,
  isMentor,
  onOpenAddUseCaseModal,
  onEditUseCase,
  onDeleteUseCase,
  onOpenAddTaskModal,
}) => {
  const userMap = new Map(users.map((u) => [u.id, u]));
  const [ucToDelete, setUcToDelete] = useState<UseCase | null>(null);

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
        {useCases.length === 0 ? (
          <div className="bg-white rounded-2xl border-2 border-dashed border-slate-200 p-10 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 mx-auto flex items-center justify-center font-bold text-lg">
              🎯
            </div>
            <h3 className="font-bold text-sm text-slate-800">Belum Ada Use Case</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Hubungkan target bisnis, modul endpoint, dan frame Figma tim Anda dengan membuat Use Case pertama.
            </p>
            <button
              onClick={onOpenAddUseCaseModal}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl transition-all shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>+ Buat Use Case Pertama</span>
            </button>
          </div>
        ) : (
          useCases.map((uc) => {
            // Calculates progress across ALL tasks for this Use Case (persisted even when archived from Kanban!)
          const ucTasks = tasks.filter((t) => t.useCaseId === uc.id);
          const doneTasks = ucTasks.filter((t) => t.status === 'DONE').length;
          const isComplete = ucTasks.length > 0 && doneTasks === ucTasks.length;
          const percent = ucTasks.length > 0 ? Math.round((doneTasks / ucTasks.length) * 100) : 0;

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
                        100% Selesai
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-400">
                    Progres Keseluruhan: {doneTasks} dari {ucTasks.length} tugas teknis selesai ({percent}%)
                  </div>
                </div>

                {/* Figma Design Link & Actions */}
                <div className="flex items-center gap-2 self-start flex-wrap">
                  {uc.figmaUrl ? (
                    <a
                      href={uc.figmaUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 rounded-xl text-xs font-medium transition-colors"
                    >
                      <Palette className="w-3.5 h-3.5" />
                      <span>Buka Frame Figma</span>
                      <ExternalLink className="w-3 h-3 text-purple-400" />
                    </a>
                  ) : (
                    <span className="text-xs text-slate-400 italic">Desain Figma belum ditautkan</span>
                  )}

                  <button
                    type="button"
                    onClick={() => onEditUseCase(uc)}
                    title="Edit Use Case / Tautan Figma"
                    className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg border border-transparent hover:border-slate-200 transition-colors"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>

                  {isMentor && (
                    <button
                      type="button"
                      onClick={() => setUcToDelete(uc)}
                      title="Hapus Use Case"
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg border border-transparent hover:border-rose-200 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
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
                          <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                            <span>{t.title}</span>
                            {t.isArchived && (
                              <span className="inline-flex items-center gap-0.5 text-[9px] text-slate-400 bg-slate-200 px-1 rounded">
                                <Archive className="w-2.5 h-2.5" />
                                Arsip
                              </span>
                            )}
                          </div>
                          {t.type === 'ENDPOINT' && t.endpointSpec ? (
                            <span className="font-mono text-[10px] text-slate-600 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                              <span className="font-bold text-sky-700">{t.endpointSpec.method}</span> {t.endpointSpec.route}
                            </span>
                          ) : t.type === 'UI_SLICING' ? (
                            <span className="text-[10px] text-indigo-700 font-medium">UI Slicing</span>
                          ) : (
                            <span className="text-[10px] text-slate-600 font-medium">Tugas Umum</span>
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
        }))}
      </div>

      {/* Confirmation Modal: Delete Use Case (Mentor Only) */}
      {ucToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 sm:p-6 space-y-4 shadow-xl border border-slate-200">
            <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center">
              <Trash2 className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-slate-900">Hapus Use Case {ucToDelete.code}?</h4>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Use Case <strong>&ldquo;{ucToDelete.title}&rdquo;</strong> (beserta tugas yang terikat padanya) akan dihapus permanen dari database Supabase.
              </p>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setUcToDelete(null)}
                className="px-3.5 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  onDeleteUseCase(ucToDelete.id);
                  setUcToDelete(null);
                }}
                className="px-3.5 py-2 text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-xs"
              >
                Ya, Hapus Permanen
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
