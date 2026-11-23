'use client';

import React from 'react';
import { UseCase, Task, User, TaskStatus, HttpMethod } from '@/types';
import { 
  ExternalLink, 
  Plus, 
  GitPullRequest, 
  AlertTriangle, 
  Check, 
  Clock, 
  CheckCircle2, 
  AlertOctagon,
  Code2,
  Palette,
  ShieldCheck,
  ShieldAlert,
  HelpCircle,
  Sparkles
} from 'lucide-react';

interface UseCaseBoardProps {
  useCases: UseCase[];
  tasks: Task[];
  users: User[];
  currentUser: User;
  onUpdateTaskStatus: (taskId: string, newStatus: TaskStatus, blockerNote?: string) => void;
  onOpenCheckPrModal: (task: Task) => void;
  onOpenAddTaskModal: (useCaseId: string) => void;
  onOpenBlockerModal: (task: Task) => void;
}

export const UseCaseBoard: React.FC<UseCaseBoardProps> = ({
  useCases,
  tasks,
  users,
  currentUser,
  onUpdateTaskStatus,
  onOpenCheckPrModal,
  onOpenAddTaskModal,
  onOpenBlockerModal,
}) => {
  const userMap = new Map(users.map((u) => [u.id, u]));
  const now = new Date();

  const getMethodBadgeClass = (method?: HttpMethod) => {
    switch (method) {
      case 'GET':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'POST':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'PUT':
      case 'PATCH':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'DELETE':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const getStatusBadge = (status: TaskStatus) => {
    switch (status) {
      case 'TODO':
        return { label: 'To Do', color: 'bg-slate-100 text-slate-700 border-slate-200' };
      case 'IN_PROGRESS':
        return { label: 'In Progress', color: 'bg-sky-100 text-sky-800 border-sky-200' };
      case 'BLOCKED':
        return { label: 'Blocked', color: 'bg-rose-100 text-rose-800 border-rose-200' };
      case 'REVIEW':
        return { label: 'Review Mentor', color: 'bg-amber-100 text-amber-800 border-amber-200' };
      case 'DONE':
        return { label: 'Done', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' };
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {useCases.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-slate-200">
          <p className="text-slate-500 text-sm">Belum ada Use Case untuk milestone ini.</p>
        </div>
      ) : (
        useCases.map((uc) => {
          const ucTasks = tasks.filter((t) => t.useCaseId === uc.id);
          const doneCount = ucTasks.filter((t) => t.status === 'DONE').length;
          const isAllDone = ucTasks.length > 0 && doneCount === ucTasks.length;

          return (
            <div
              key={uc.id}
              className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden hover:border-slate-300 transition-all"
            >
              {/* Use Case Header */}
              <div className="bg-gradient-to-r from-slate-50 via-white to-slate-50 border-b border-slate-200 px-5 py-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  
                  {/* Left: Code, Title, Done Badge */}
                  <div className="flex items-start sm:items-center gap-3">
                    <span className="font-mono text-xs font-bold bg-slate-900 text-white px-2.5 py-1 rounded-lg shadow-sm">
                      {uc.code}
                    </span>
                    <div>
                      <h2 className="font-bold text-base text-slate-900 tracking-tight flex items-center gap-2">
                        {uc.title}
                        {isAllDone && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3" />
                            Completed
                          </span>
                        )}
                      </h2>
                    </div>
                  </div>

                  {/* Right: Actions & Links */}
                  <div className="flex items-center gap-2">
                    {/* Figma Link */}
                    {uc.figmaUrl && (
                      <a
                        href={uc.figmaUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-medium text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 px-3 py-1.5 rounded-lg transition-colors"
                      >
                        <Palette className="w-3.5 h-3.5" />
                        <span>Figma Design</span>
                        <ExternalLink className="w-3 h-3 text-purple-400" />
                      </a>
                    )}

                    {/* Add Subtask Button */}
                    <button
                      onClick={() => onOpenAddTaskModal(uc.id)}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-sky-700 bg-sky-50 hover:bg-sky-100 border border-sky-200 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Tambah Tugas</span>
                    </button>
                  </div>
                </div>

                {/* Business Goal Callout */}
                <div className="mt-3 bg-amber-50/60 border border-amber-200/80 rounded-xl px-3.5 py-2 text-xs text-amber-900 flex items-start gap-2">
                  <span className="font-semibold text-amber-800 shrink-0">🎯 Target Bisnis:</span>
                  <p className="text-slate-700 leading-relaxed">{uc.businessGoal}</p>
                </div>
              </div>

              {/* Tasks List inside Use Case */}
              <div className="divide-y divide-slate-100">
                {ucTasks.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-400">
                    Belum ada tugas di dalam Use Case ini. Klik "+ Tambah Tugas" untuk menugaskan developer atau UI/FE.
                  </div>
                ) : (
                  ucTasks.map((task) => {
                    const assignee = userMap.get(task.assigneeId);
                    const statusInfo = getStatusBadge(task.status);
                    
                    // Stale detection (>48h)
                    const diffHours = (now.getTime() - new Date(task.lastUpdatedAt).getTime()) / (1000 * 3600);
                    const isStale = task.status === 'IN_PROGRESS' && diffHours >= 48;

                    return (
                      <div
                        key={task.id}
                        className={`p-4 sm:px-5 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors ${
                          task.status === 'BLOCKED' ? 'bg-rose-50/30' : isStale ? 'bg-orange-50/20' : 'hover:bg-slate-50/60'
                        }`}
                      >
                        {/* Task Info & Badges */}
                        <div className="flex-1 space-y-2">
                          <div className="flex flex-wrap items-center gap-2">
                            
                            {/* Type Badge */}
                            {task.type === 'ENDPOINT' && task.endpointSpec ? (
                              <span className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold">
                                <span className={`px-2 py-0.5 rounded border text-[11px] ${getMethodBadgeClass(task.endpointSpec.method)}`}>
                                  {task.endpointSpec.method}
                                </span>
                                <span className="text-slate-800 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                                  {task.endpointSpec.route}
                                </span>
                              </span>
                            ) : task.type === 'UI_SLICING' ? (
                              <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 px-2.5 py-0.5 rounded-full">
                                <Palette className="w-3 h-3" />
                                UI Slicing
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200 px-2 py-0.5 rounded-full">
                                General Task
                              </span>
                            )}

                            {/* Stale Warning Badge */}
                            {isStale && (
                              <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-orange-100 text-orange-800 border border-orange-200 px-2 py-0.5 rounded-full animate-pulse">
                                <Clock className="w-3 h-3" />
                                Stale &gt;{Math.round(diffHours)}j
                              </span>
                            )}

                            {/* Guardrail Check Badge */}
                            {task.integrityCheck?.status === 'WARNING' && (
                              <button
                                onClick={() => onOpenCheckPrModal(task)}
                                className="inline-flex items-center gap-1 text-[11px] font-semibold bg-purple-100 text-purple-900 border border-purple-300 px-2.5 py-0.5 rounded-full hover:bg-purple-200 transition-colors"
                              >
                                <ShieldAlert className="w-3 h-3 text-purple-600" />
                                <span>AI-Diff Alert ({task.integrityCheck.violatedFiles.length})</span>
                              </button>
                            )}

                            {task.integrityCheck?.status === 'PASSED' && (
                              <span className="inline-flex items-center gap-1 text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full">
                                <ShieldCheck className="w-3 h-3" />
                                Guardrail OK
                              </span>
                            )}
                          </div>

                          {/* Task Title */}
                          <div className="font-semibold text-sm text-slate-800">
                            {task.title}
                          </div>

                          {/* Blocker Alert Banner if Blocked */}
                          {task.status === 'BLOCKED' && task.blockerNote && (
                            <div className="bg-rose-100/80 border border-rose-300/80 rounded-lg p-2.5 text-xs text-rose-900 flex items-start gap-2">
                              <AlertOctagon className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                              <div>
                                <span className="font-bold">Kendala / Blocker:</span> {task.blockerNote}
                              </div>
                            </div>
                          )}

                          {/* Meta: Assignee & GitHub PR */}
                          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 pt-1">
                            {/* Assignee Avatar */}
                            <div className="flex items-center gap-1.5 font-medium text-slate-700">
                              <span className="text-base">{assignee?.avatar || '👤'}</span>
                              <span>{assignee?.name || 'Unassigned'}</span>
                              {assignee?.tag && (
                                <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded font-normal">
                                  {assignee.tag}
                                </span>
                              )}
                            </div>

                            <span>•</span>

                            {/* GitHub PR Link & Checker Trigger */}
                            {task.githubPrUrl ? (
                              <div className="flex items-center gap-2">
                                <a
                                  href={task.githubPrUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex items-center gap-1 text-slate-700 hover:text-sky-600 font-mono text-[11px] bg-slate-100 hover:bg-slate-200 px-2 py-0.5 rounded transition-colors"
                                >
                                  <GitPullRequest className="w-3 h-3 text-purple-600" />
                                  <span>PR #{task.prNumber || 'Check'}</span>
                                  <ExternalLink className="w-2.5 h-2.5 text-slate-400" />
                                </a>

                                <button
                                  onClick={() => onOpenCheckPrModal(task)}
                                  className="text-[11px] text-sky-600 hover:text-sky-700 font-medium underline"
                                >
                                  Cek Integritas
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => onOpenCheckPrModal(task)}
                                className="inline-flex items-center gap-1 text-[11px] text-slate-500 hover:text-sky-600"
                              >
                                <GitPullRequest className="w-3 h-3" />
                                <span>+ Tautkan PR GitHub</span>
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Task Status Dropdown & Action Controls */}
                        <div className="flex items-center gap-3 shrink-0 self-start md:self-center">
                          <div className="flex flex-col items-end gap-1">
                            <span className="text-[10px] text-slate-400 font-medium">Ubah Status:</span>
                            <select
                              aria-label={`Ubah status untuk ${task.title}`}
                              value={task.status}
                              onChange={(e) => {
                                const newStatus = e.target.value as TaskStatus;
                                if (newStatus === 'BLOCKED') {
                                  onOpenBlockerModal(task);
                                } else {
                                  onUpdateTaskStatus(task.id, newStatus);
                                }
                              }}
                              className={`text-xs font-semibold px-3 py-1.5 rounded-xl border shadow-sm cursor-pointer transition-colors focus:ring-2 focus:ring-sky-500 ${statusInfo.color}`}
                            >
                              <option value="TODO">To Do</option>
                              <option value="IN_PROGRESS">In Progress</option>
                              <option value="BLOCKED">🚨 Blocked (Minta Bantuan)</option>
                              <option value="REVIEW">⏳ Butuh Review Mentor</option>
                              <option value="DONE">✅ Done (Approved)</option>
                            </select>
                          </div>
                        </div>

                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
};
