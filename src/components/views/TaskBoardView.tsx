'use client';

import React, { useState } from 'react';
import { Task, UseCase, User, TaskStatus } from '@/types';
import { 
  Plus, 
  Clock, 
  AlertOctagon, 
  GitPullRequest, 
  Palette, 
  Check, 
  ShieldCheck, 
  ShieldAlert, 
  Archive,
  ExternalLink,
  Lock
} from 'lucide-react';

interface TaskBoardViewProps {
  tasks: Task[];
  useCases: UseCase[];
  users: User[];
  currentUser: User;
  onUpdateTaskStatus: (taskId: string, newStatus: TaskStatus, blockerNote?: string) => void;
  onOpenAddTaskModal: () => void;
  onOpenBlockerModal: (task: Task) => void;
  onOpenCheckPrModal: (task: Task) => void;
  onArchiveCompletedTasks: () => void;
}

export const TaskBoardView: React.FC<TaskBoardViewProps> = ({
  tasks,
  useCases,
  users,
  currentUser,
  onUpdateTaskStatus,
  onOpenAddTaskModal,
  onOpenBlockerModal,
  onOpenCheckPrModal,
  onArchiveCompletedTasks,
}) => {
  const [onlyMyTasks, setOnlyMyTasks] = useState(false);
  const [selectedUserFilter, setSelectedUserFilter] = useState<string>('ALL');
  const [isConfirmArchiveOpen, setIsConfirmArchiveOpen] = useState(false);
  const [mentorOnlyNotice, setMentorOnlyNotice] = useState<string | null>(null);

  const userMap = new Map(users.map((u) => [u.id, u]));
  const useCaseMap = new Map(useCases.map((uc) => [uc.id, uc]));
  const now = new Date();

  // Filter tasks (Only unarchived tasks for current active sprint board!)
  const activeTasks = tasks.filter((t) => !t.isArchived);

  const displayedTasks = activeTasks.filter((t) => {
    if (onlyMyTasks && t.assigneeId !== currentUser.id) return false;
    if (selectedUserFilter !== 'ALL' && t.assigneeId !== selectedUserFilter) return false;
    return true;
  });

  const doneCount = displayedTasks.filter((t) => t.status === 'DONE').length;

  const handleStatusChange = (task: Task, newStatus: TaskStatus) => {
    // Rule 1: Only Mentor can approve to DONE
    if (newStatus === 'DONE' && currentUser.role !== 'MENTOR') {
      setMentorOnlyNotice('Otorisasi Ditolak: Hanya Mentor (Lead) yang dapat menyetujui tugas selesai (Done). Silakan ajukan ke "Review Mentor" terlebih dahulu.');
      setTimeout(() => setMentorOnlyNotice(null), 4000);
      return;
    }

    // Rule 2: Moving to REVIEW requires a GitHub PR Link
    if (newStatus === 'REVIEW' && !task.githubPrUrl) {
      onOpenCheckPrModal(task);
      return;
    }

    // Rule 3: Moving to BLOCKED opens Blocker Modal
    if (newStatus === 'BLOCKED') {
      onOpenBlockerModal(task);
      return;
    }

    // Rule 4: Moving away from BLOCKED to IN_PROGRESS or REVIEW or DONE clears active blocker
    onUpdateTaskStatus(task.id, newStatus);
  };

  const columns: { id: TaskStatus; title: string; count: number; color: string }[] = [
    {
      id: 'TODO',
      title: 'To Do',
      count: displayedTasks.filter((t) => t.status === 'TODO').length,
      color: 'bg-slate-100 text-slate-700',
    },
    {
      id: 'IN_PROGRESS',
      title: 'Sedang Dikerjakan',
      count: displayedTasks.filter((t) => t.status === 'IN_PROGRESS' || t.status === 'BLOCKED').length,
      color: 'bg-sky-100 text-sky-800',
    },
    {
      id: 'REVIEW',
      title: 'Butuh Review Mentor',
      count: displayedTasks.filter((t) => t.status === 'REVIEW').length,
      color: 'bg-amber-100 text-amber-800',
    },
    {
      id: 'DONE',
      title: 'Selesai (Approved)',
      count: doneCount,
      color: 'bg-emerald-100 text-emerald-800',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Alert Banner for Mentor-Only Action */}
      {mentorOnlyNotice && (
        <div className="bg-amber-50 border border-amber-300 text-amber-900 px-4 py-3 rounded-2xl text-xs flex items-center justify-between shadow-sm animate-in fade-in">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-amber-600 shrink-0" />
            <span>{mentorOnlyNotice}</span>
          </div>
          <button onClick={() => setMentorOnlyNotice(null)} className="font-bold text-amber-700 hover:text-amber-900">
            Tutup
          </button>
        </div>
      )}

      {/* Top Filter & Calm Action Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3 shadow-sm">
        
        {/* Left: Focus Toggle & Team Filter */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setOnlyMyTasks(!onlyMyTasks)}
            className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
              onlyMyTasks
                ? 'bg-slate-900 border-slate-900 text-white shadow-sm'
                : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
            }`}
          >
            <span>Fokus Tugas Saya</span>
            {onlyMyTasks && <Check className="w-3.5 h-3.5" />}
          </button>

          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <span>Filter Tim:</span>
            <select
              aria-label="Filter berdasarkan anggota tim"
              value={selectedUserFilter}
              onChange={(e) => setSelectedUserFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-slate-800 text-xs py-1 px-2 rounded-lg cursor-pointer"
            >
              <option value="ALL">Semua Anggota</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {doneCount > 0 && (
            <button
              onClick={() => setIsConfirmArchiveOpen(true)}
              title="Arsipkan tugas selesai setelah diekspor ke Obsidian"
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-xl transition-all"
            >
              <Archive className="w-3.5 h-3.5 text-slate-500" />
              <span>Arsipkan Selesai ({doneCount})</span>
            </button>
          )}

          <button
            onClick={onOpenAddTaskModal}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl transition-all shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Tugas</span>
          </button>
        </div>

      </div>

      {/* 4-Column Calm Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {columns.map((col) => {
          const colTasks = displayedTasks.filter((t) => {
            if (col.id === 'IN_PROGRESS') {
              return t.status === 'IN_PROGRESS' || t.status === 'BLOCKED';
            }
            return t.status === col.id;
          });

          return (
            <div key={col.id} className="flex flex-col bg-slate-100/70 rounded-2xl p-3.5 min-h-[500px] border border-slate-200/60">
              
              {/* Column Header */}
              <div className="flex items-center justify-between px-1 mb-3">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-xs text-slate-800 tracking-tight">{col.title}</h3>
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${col.color}`}>
                    {colTasks.length}
                  </span>
                </div>
              </div>

              {/* Cards Container */}
              <div className="space-y-3 flex-1 overflow-y-auto">
                {colTasks.length === 0 ? (
                  <div className="h-32 border-2 border-dashed border-slate-200 rounded-xl flex items-center justify-center text-xs text-slate-400">
                    Tidak ada tugas
                  </div>
                ) : (
                  colTasks.map((task) => {
                    const assignee = userMap.get(task.assigneeId);
                    const useCase = useCaseMap.get(task.useCaseId);

                    // Check Stale (>48h)
                    const diffHours = (now.getTime() - new Date(task.lastUpdatedAt).getTime()) / (1000 * 3600);
                    const isStale = task.status === 'IN_PROGRESS' && diffHours >= 48;

                    return (
                      <div
                        key={task.id}
                        className={`bg-white rounded-xl p-4 border transition-all shadow-sm hover:shadow-md hover:border-slate-300 ${
                          task.status === 'BLOCKED'
                            ? 'border-rose-300 bg-rose-50/20'
                            : 'border-slate-200/80'
                        }`}
                      >
                        {/* Use Case Reference Tag */}
                        {useCase && (
                          <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                            <span>{useCase.code}</span>
                            <span>•</span>
                            <span className="truncate max-w-[150px]">{useCase.title}</span>
                          </div>
                        )}

                        {/* Title */}
                        <h4 className="font-semibold text-xs text-slate-900 leading-snug mb-2">
                          {task.title}
                        </h4>

                        {/* Endpoint or UI Spec Badge */}
                        {task.type === 'ENDPOINT' && task.endpointSpec && (
                          <div className="font-mono text-[10px] bg-slate-100 text-slate-700 px-2 py-1 rounded-md mb-2.5 inline-block">
                            <span className="font-bold text-sky-700 mr-1">{task.endpointSpec.method}</span>
                            <span>{task.endpointSpec.route}</span>
                          </div>
                        )}

                        {task.type === 'UI_SLICING' && (
                          <div className="text-[10px] font-semibold text-indigo-700 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-md mb-2.5 inline-flex items-center gap-1">
                            <Palette className="w-3 h-3" />
                            <span>UI Slicing</span>
                          </div>
                        )}

                        {/* Blocker Alert Banner */}
                        {task.status === 'BLOCKED' && (
                          <div className="bg-rose-50 border border-rose-200 text-rose-800 text-[11px] p-2 rounded-lg mb-2 flex items-start gap-1.5">
                            <AlertOctagon className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />
                            <div>
                              <span className="font-bold">Terkendala:</span> {task.blockerNote}
                            </div>
                          </div>
                        )}

                        {/* Stale Warning Indicator */}
                        {isStale && (
                          <div className="text-[10px] text-orange-700 bg-orange-50 border border-orange-200 px-2 py-0.5 rounded flex items-center gap-1 mb-2">
                            <Clock className="w-3 h-3" />
                            <span>Tidak ada update &gt;{Math.round(diffHours)} jam</span>
                          </div>
                        )}

                        {/* Pull Request & Guardrail Trigger (Connected Directly on the Card!) */}
                        <div className="pt-1 pb-2 border-t border-slate-100 my-1 flex flex-wrap items-center justify-between gap-1 text-[11px]">
                          {task.githubPrUrl ? (
                            <div className="flex items-center gap-1.5">
                              <a
                                href={task.githubPrUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 font-mono text-[10px] text-slate-600 hover:text-sky-600 bg-slate-100 px-1.5 py-0.5 rounded"
                              >
                                <GitPullRequest className="w-3 h-3 text-purple-600" />
                                <span>PR #{task.prNumber || 'Lihat'}</span>
                                <ExternalLink className="w-2.5 h-2.5 text-slate-400" />
                              </a>

                              {task.integrityCheck?.status === 'WARNING' && (
                                <button
                                  onClick={() => onOpenCheckPrModal(task)}
                                  className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-rose-700 bg-rose-50 border border-rose-200 px-1.5 py-0.5 rounded hover:bg-rose-100"
                                >
                                  <ShieldAlert className="w-3 h-3 text-rose-600" />
                                  <span>AI-Diff Alert</span>
                                </button>
                              )}

                              {task.integrityCheck?.status === 'PASSED' && (
                                <span className="inline-flex items-center gap-0.5 text-[10px] font-medium text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                                  <span>Guardrail OK</span>
                                </span>
                              )}
                            </div>
                          ) : (
                            <button
                              onClick={() => onOpenCheckPrModal(task)}
                              className="text-[11px] text-purple-700 hover:text-purple-800 font-medium inline-flex items-center gap-1"
                            >
                              <GitPullRequest className="w-3 h-3 text-purple-600" />
                              <span>+ Tautkan PR GitHub</span>
                            </button>
                          )}

                          {task.githubPrUrl && (
                            <button
                              onClick={() => onOpenCheckPrModal(task)}
                              className="text-[10px] text-slate-400 hover:text-slate-600 underline"
                            >
                              Uji Ulang
                            </button>
                          )}
                        </div>

                        {/* Card Footer: Assignee & Move Status */}
                        <div className="flex items-center justify-between pt-1 text-xs">
                          
                          {/* Assignee */}
                          <div className="flex items-center gap-1.5 text-slate-600">
                            <span className="text-sm">{assignee?.avatar || '👤'}</span>
                            <span className="text-[11px] font-medium truncate max-w-[90px]">
                              {assignee?.name.split(' ')[0] || 'Unassigned'}
                            </span>
                          </div>

                          {/* Quick Status Select with Role Enforcement */}
                          <select
                            aria-label={`Pindahkan status untuk ${task.title}`}
                            value={task.status}
                            onChange={(e) => handleStatusChange(task, e.target.value as TaskStatus)}
                            className="text-[11px] font-semibold py-1 px-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 cursor-pointer hover:bg-slate-100"
                          >
                            <option value="TODO">To Do</option>
                            <option value="IN_PROGRESS">In Progress</option>
                            <option value="BLOCKED">🚨 Blocked</option>
                            <option value="REVIEW">Review Mentor</option>
                            <option value="DONE" disabled={currentUser.role !== 'MENTOR'}>
                              {currentUser.role === 'MENTOR' ? '✅ Done (Approve)' : '🔒 Done (Hanya Mentor)'}
                            </option>
                          </select>

                        </div>

                      </div>
                    );
                  })
                )}
              </div>

            </div>
          );
        })}
      </div>

      {/* Confirmation Modal: Archive Done Tasks */}
      {isConfirmArchiveOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-xl border border-slate-200">
            <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center">
              <Archive className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-slate-900">Arsipkan Tugas yang Selesai?</h4>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Tindakan ini akan membersihkan kolom <strong>Done ({doneCount} tugas)</strong> dari papan agar siap memulai sprint baru. Data tetap tersimpan aman di database dan catatan Obsidian kamu.
              </p>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setIsConfirmArchiveOpen(false)}
                className="px-3.5 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  onArchiveCompletedTasks();
                  setIsConfirmArchiveOpen(false);
                }}
                className="px-3.5 py-1.5 text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white rounded-xl shadow-sm"
              >
                Ya, Arsipkan
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
