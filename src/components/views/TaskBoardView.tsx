'use client';

import React, { useState } from 'react';
import { Task, UseCase, User, TaskStatus, HttpMethod } from '@/types';
import { 
  Plus, 
  User as UserIcon, 
  Clock, 
  AlertOctagon, 
  CheckCircle2, 
  GitPullRequest, 
  Palette, 
  Code2,
  Filter,
  Check
} from 'lucide-react';

interface TaskBoardViewProps {
  tasks: Task[];
  useCases: UseCase[];
  users: User[];
  currentUser: User;
  onUpdateTaskStatus: (taskId: string, newStatus: TaskStatus, blockerNote?: string) => void;
  onOpenAddTaskModal: () => void;
  onOpenBlockerModal: (task: Task) => void;
}

export const TaskBoardView: React.FC<TaskBoardViewProps> = ({
  tasks,
  useCases,
  users,
  currentUser,
  onUpdateTaskStatus,
  onOpenAddTaskModal,
  onOpenBlockerModal,
}) => {
  const [onlyMyTasks, setOnlyMyTasks] = useState(false);
  const [selectedUserFilter, setSelectedUserFilter] = useState<string>('ALL');

  const userMap = new Map(users.map((u) => [u.id, u]));
  const useCaseMap = new Map(useCases.map((uc) => [uc.id, uc]));
  const now = new Date();

  // Filter tasks
  const displayedTasks = tasks.filter((t) => {
    if (onlyMyTasks && t.assigneeId !== currentUser.id) return false;
    if (selectedUserFilter !== 'ALL' && t.assigneeId !== selectedUserFilter) return false;
    return true;
  });

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
      count: displayedTasks.filter((t) => t.status === 'IN_PROGRESS').length,
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
      title: 'Selesai',
      count: displayedTasks.filter((t) => t.status === 'DONE').length,
      color: 'bg-emerald-100 text-emerald-800',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Top Filter & Calm Action Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shadow-sm">
        
        {/* Left: Focus Toggle */}
        <div className="flex items-center gap-3">
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

        {/* Right: Add Task Button */}
        <button
          onClick={onOpenAddTaskModal}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl transition-all shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Tugas Baru</span>
        </button>

      </div>

      {/* 4-Column Calm Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {columns.map((col) => {
          const colTasks = displayedTasks.filter((t) => {
            if (col.id === 'IN_PROGRESS') {
              // Both IN_PROGRESS and BLOCKED live in this column for easy handling
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

                        {/* Card Footer: Assignee & Move Status */}
                        <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                          
                          {/* Assignee */}
                          <div className="flex items-center gap-1.5 text-slate-600">
                            <span className="text-sm">{assignee?.avatar || '👤'}</span>
                            <span className="text-[11px] font-medium truncate max-w-[100px]">
                              {assignee?.name.split(' ')[0] || 'Unassigned'}
                            </span>
                          </div>

                          {/* Quick Status Select */}
                          <select
                            aria-label={`Pindahkan status untuk ${task.title}`}
                            value={task.status}
                            onChange={(e) => {
                              const newStatus = e.target.value as TaskStatus;
                              if (newStatus === 'BLOCKED') {
                                onOpenBlockerModal(task);
                              } else {
                                onUpdateTaskStatus(task.id, newStatus);
                              }
                            }}
                            className="text-[11px] font-semibold py-1 px-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 cursor-pointer hover:bg-slate-100"
                          >
                            <option value="TODO">To Do</option>
                            <option value="IN_PROGRESS">In Progress</option>
                            <option value="BLOCKED">🚨 Blocked</option>
                            <option value="REVIEW">Review</option>
                            <option value="DONE">Done</option>
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

    </div>
  );
};
