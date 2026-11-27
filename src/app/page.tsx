'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Project, 
  Milestone, 
  UseCase, 
  Task, 
  User, 
  TaskStatus, 
  TaskType, 
  HttpMethod
} from '@/types';
import {
  INITIAL_PROJECTS,
  INITIAL_MILESTONES,
  INITIAL_USE_CASES,
  INITIAL_TASKS,
  INITIAL_USERS,
} from '@/lib/initial-data';
import { Header, NavTab } from '@/components/Header';
import { TaskBoardView } from '@/components/views/TaskBoardView';
import { UseCaseView } from '@/components/views/UseCaseView';
import { GuardrailView } from '@/components/views/GuardrailView';
import { ObsidianView } from '@/components/views/ObsidianView';
import { AddUseCaseModal } from '@/components/Modals/AddUseCaseModal';
import { AddTaskModal } from '@/components/Modals/AddTaskModal';
import { CheckPrModal } from '@/components/Modals/CheckPrModal';
import { BlockerModal } from '@/components/Modals/BlockerModal';
import { generateObsidianWeeklyMarkdown } from '@/lib/obsidian-exporter';
import { Loader2, AlertTriangle } from 'lucide-react';

export default function HomePage() {
  const router = useRouter();
  const [isAuthChecking, setIsAuthChecking] = useState(true);

  const [currentTab, setCurrentTab] = useState<NavTab>('board');

  const [projects, setProjects] = useState<Project[]>(INITIAL_PROJECTS);
  const [milestones, setMilestones] = useState<Milestone[]>(INITIAL_MILESTONES);
  const [useCases, setUseCases] = useState<UseCase[]>(INITIAL_USE_CASES);
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [currentUser, setCurrentUser] = useState<User>(INITIAL_USERS[0]);

  // Sync state
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncedTime, setLastSyncedTime] = useState<Date>(new Date());
  const [dbError, setDbError] = useState<string | null>(null);

  // Check user authentication session on mount
  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          if (data.authenticated && data.user) {
            setCurrentUser(data.user);
            setIsAuthChecking(false);
            return;
          }
        }
        // If not authenticated, redirect to login
        router.push('/login');
      } catch {
        router.push('/login');
      }
    }
    checkAuth();
  }, [router]);

  // Modals state
  const [isAddUseCaseModalOpen, setIsAddUseCaseModalOpen] = useState(false);
  const [editingUseCase, setEditingUseCase] = useState<UseCase | null>(null);
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [selectedUseCaseIdForTask, setSelectedUseCaseIdForTask] = useState<string>('');
  
  const [isCheckPrModalOpen, setIsCheckPrModalOpen] = useState(false);
  const [selectedTaskForPr, setSelectedTaskForPr] = useState<Task | null>(null);

  const [isBlockerModalOpen, setIsBlockerModalOpen] = useState(false);
  const [selectedTaskForBlocker, setSelectedTaskForBlocker] = useState<Task | null>(null);

  const activeProject = projects[0] || INITIAL_PROJECTS[0];
  const activeMilestone = milestones[0] || INITIAL_MILESTONES[0];

  // Fetch / Sync Data function
  const fetchData = useCallback(async (isSilent = false) => {
    if (!isSilent) setIsSyncing(true);
    try {
      const res = await fetch('/api/data');
      if (res.status === 401) {
        router.push('/login');
        return;
      }
      if (res.ok) {
        const data = await res.json();
        setDbError(data.dbError || null);
        if (data.projects?.length) setProjects(data.projects);
        if (data.milestones?.length) setMilestones(data.milestones);
        if (data.useCases?.length) setUseCases(data.useCases);
        if (data.tasks) setTasks(data.tasks);
        if (data.users?.length) setUsers(data.users);
        setLastSyncedTime(new Date());
      }
    } catch (err) {
      console.warn('Sync failed, using existing store:', err);
    } finally {
      if (!isSilent) setIsSyncing(false);
    }
  }, [router]);

  // Fetch initial data only after session verification passes
  useEffect(() => {
    if (!isAuthChecking) {
      fetchData();
    }
  }, [isAuthChecking, fetchData]);

  // Enforce Mentor-only access for Obsidian tab
  useEffect(() => {
    if (currentUser.role !== 'MENTOR' && currentTab === 'obsidian') {
      setCurrentTab('board');
    }
  }, [currentUser, currentTab]);

  // Auto-polling interval every 20 seconds if window is visible
  useEffect(() => {
    if (isAuthChecking) return;
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        fetchData(true);
      }
    }, 20000);
    return () => clearInterval(interval);
  }, [isAuthChecking, fetchData]);

  // Update Task Status
  const handleUpdateTaskStatus = async (taskId: string, newStatus: TaskStatus, blockerNote?: string) => {
    const patch: Partial<Task> = {
      status: newStatus,
      lastUpdatedAt: new Date().toISOString(),
    };

    if (newStatus === 'BLOCKED') {
      if (blockerNote !== undefined) patch.blockerNote = blockerNote;
    } else {
      // If moving away from BLOCKED to IN_PROGRESS, REVIEW, or DONE, clear the blocker note
      patch.blockerNote = undefined;
    }

    if (newStatus === 'DONE') {
      patch.reviewedAt = new Date().toISOString();
    }

    const previousTasks = tasks;
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, ...patch } : t))
    );

    try {
      const res = await fetch('/api/tasks', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: taskId, ...patch }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setTasks(previousTasks);
        alert(`Gagal memperbarui status tugas: ${data.error || 'Terjadi kesalahan pada server'}`);
      }
    } catch (err: any) {
      console.error('Failed to sync task status to backend:', err);
      setTasks(previousTasks);
      alert(`Terjadi kesalahan jaringan saat memperbarui status: ${err.message}`);
    }
  };

  // Add or Update Use Case
  const handleSaveUseCase = async (
    useCaseData: {
      milestoneId: string;
      code: string;
      title: string;
      businessGoal: string;
      figmaUrl?: string;
    },
    editingUseCaseId?: string
  ) => {
    try {
      const isEdit = Boolean(editingUseCaseId);
      const res = await fetch('/api/use-cases', {
        method: isEdit ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(
          isEdit ? { id: editingUseCaseId, ...useCaseData } : useCaseData
        ),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        alert(`Gagal menyimpan Use Case: ${data.error || 'Terjadi kesalahan pada server'}`);
        return;
      }
      if (data.useCase) {
        if (isEdit) {
          setUseCases((prev) =>
            prev.map((u) => (u.id === editingUseCaseId ? data.useCase : u))
          );
        } else {
          setUseCases((prev) => [...prev, data.useCase]);
        }
      }
    } catch (err: any) {
      console.error('Failed to save use case:', err);
      alert(`Terjadi kesalahan jaringan saat menyimpan Use Case: ${err.message}`);
    }
  };

  // Delete Use Case (Mentor Only)
  const handleDeleteUseCase = async (useCaseId: string) => {
    const previousUseCases = useCases;
    const previousTasks = tasks;
    setUseCases((prev) => prev.filter((u) => u.id !== useCaseId));
    setTasks((prev) => prev.filter((t) => t.useCaseId !== useCaseId));

    try {
      const res = await fetch(`/api/use-cases?id=${encodeURIComponent(useCaseId)}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setUseCases(previousUseCases);
        setTasks(previousTasks);
        alert(`Gagal menghapus Use Case: ${data.error || 'Terjadi kesalahan pada server'}`);
      }
    } catch (err: any) {
      console.error('Failed to delete use case:', err);
      setUseCases(previousUseCases);
      setTasks(previousTasks);
      alert(`Terjadi kesalahan jaringan saat menghapus Use Case: ${err.message}`);
    }
  };

  // Add or Edit Task
  const handleSaveTask = async (
    taskData: {
      useCaseId?: string | null;
      title: string;
      type: TaskType;
      endpointSpec?: { method: HttpMethod; route: string };
      assigneeId: string;
    },
    editingTaskId?: string
  ) => {
    try {
      const isEdit = Boolean(editingTaskId);
      const res = await fetch('/api/tasks', {
        method: isEdit ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(
          isEdit ? { id: editingTaskId, ...taskData } : taskData
        ),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        alert(`Gagal menyimpan tugas: ${data.error || 'Terjadi kesalahan pada server'}`);
        return;
      }
      if (data.task) {
        if (isEdit) {
          setTasks((prev) =>
            prev.map((t) => (t.id === editingTaskId ? data.task : t))
          );
        } else {
          setTasks((prev) => [...prev, data.task]);
        }
      }
    } catch (err: any) {
      console.error('Failed to save task:', err);
      alert(`Terjadi kesalahan jaringan: ${err.message}`);
    }
  };

  // Delete Task (Mentor Only)
  const handleDeleteTask = async (taskId: string) => {
    const previousTasks = tasks;
    setTasks((prev) => prev.filter((t) => t.id !== taskId));

    try {
      const res = await fetch(`/api/tasks?id=${encodeURIComponent(taskId)}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setTasks(previousTasks);
        alert(`Gagal menghapus tugas: ${data.error || 'Terjadi kesalahan pada server'}`);
      }
    } catch (err: any) {
      console.error('Failed to delete task:', err);
      setTasks(previousTasks);
      alert(`Terjadi kesalahan jaringan saat menghapus tugas: ${err.message}`);
    }
  };

  // Archive Completed Tasks (Sprint Cutoff)
  const handleArchiveCompletedTasks = async () => {
    const previousTasks = tasks;
    setTasks((prev) =>
      prev.map((t) => (t.status === 'DONE' ? { ...t, isArchived: true } : t))
    );

    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'ARCHIVE_COMPLETED' }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setTasks(previousTasks);
        alert(`Gagal mengarsipkan tugas: ${data.error || 'Terjadi kesalahan pada server'}`);
      }
    } catch (err: any) {
      console.error('Failed to archive completed tasks on backend:', err);
      setTasks(previousTasks);
      alert(`Terjadi kesalahan jaringan saat mengarsipkan tugas: ${err.message}`);
    }
  };

  // Update Protected Files (Persisted to Supabase)
  const handleUpdateProtectedFiles = async (files: string[]) => {
    const previousProjects = projects;
    setProjects((prev) =>
      prev.map((p) => (p.id === activeProject.id ? { ...p, protectedFiles: files } : p))
    );

    try {
      const res = await fetch('/api/projects', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId: activeProject.id, protectedFiles: files }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setProjects(previousProjects);
        alert(`Gagal menyimpan daftar file terproteksi: ${data.error || 'Terjadi kesalahan pada server'}`);
      }
    } catch (err: any) {
      console.error('Failed to update protected files:', err);
      setProjects(previousProjects);
      alert(`Terjadi kesalahan jaringan saat menyimpan file terproteksi: ${err.message}`);
    }
  };

  // PR Checked Callback (Uses exact server-updated task so UI never desyncs from DB)
  const handlePrChecked = (taskId: string, updatedTask: Task | null) => {
    if (!updatedTask) return;
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? updatedTask : t))
    );
  };

  // Generate live markdown for Obsidian view
  const liveObsidianMarkdown = generateObsidianWeeklyMarkdown({
    project: activeProject,
    milestone: activeMilestone,
    useCases,
    tasks,
    users,
  });

  if (isAuthChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-sm shadow-sm animate-pulse">
            M
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Loader2 className="w-4 h-4 animate-spin text-slate-600" />
            <span>Memverifikasi sesi tim...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 selection:bg-slate-900 selection:text-white">
      
      {/* Calm Header Navigation with Live Sync */}
      <Header
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        currentUser={currentUser}
        projectName={activeProject.name}
        isSyncing={isSyncing}
        onManualSync={() => fetchData(false)}
        lastSyncedText={`Sinkron: ${lastSyncedTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}`}
      />

      {/* Main Content Area based on Selected Tab */}
      <main className="flex-1">
        {dbError && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
            <div className="bg-rose-50 border border-rose-200 text-rose-900 rounded-xl px-4 py-3 text-xs flex items-start gap-2.5 shadow-xs">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Koneksi Database Supabase Bermasalah:</span>{' '}
                <span>{dbError}</span>
                <span className="block text-[11px] text-rose-700 mt-0.5">
                  Data yang tampil sementara menggunakan cache/fallback lokal sampai izin database Supabase diperbaiki.
                </span>
              </div>
            </div>
          </div>
        )}
        {currentTab === 'board' && (
          <TaskBoardView
            tasks={tasks}
            useCases={useCases}
            users={users}
            currentUser={currentUser}
            onUpdateTaskStatus={handleUpdateTaskStatus}
            onOpenAddTaskModal={() => {
              setEditingTask(null);
              setSelectedUseCaseIdForTask('');
              setIsAddTaskModalOpen(true);
            }}
            onEditTask={(task) => {
              setEditingTask(task);
              setSelectedUseCaseIdForTask(task.useCaseId || '');
              setIsAddTaskModalOpen(true);
            }}
            onDeleteTask={handleDeleteTask}
            onOpenBlockerModal={(task) => {
              setSelectedTaskForBlocker(task);
              setIsBlockerModalOpen(true);
            }}
            onOpenCheckPrModal={(task) => {
              setSelectedTaskForPr(task);
              setIsCheckPrModalOpen(true);
            }}
            onArchiveCompletedTasks={handleArchiveCompletedTasks}
          />
        )}

        {currentTab === 'usecases' && (
          <UseCaseView
            useCases={useCases}
            tasks={tasks}
            users={users}
            isMentor={currentUser.role === 'MENTOR'}
            onOpenAddUseCaseModal={() => {
              setEditingUseCase(null);
              setIsAddUseCaseModalOpen(true);
            }}
            onEditUseCase={(uc) => {
              setEditingUseCase(uc);
              setIsAddUseCaseModalOpen(true);
            }}
            onDeleteUseCase={handleDeleteUseCase}
            onOpenAddTaskModal={(ucId) => {
              setEditingTask(null);
              setSelectedUseCaseIdForTask(ucId);
              setIsAddTaskModalOpen(true);
            }}
          />
        )}

        {currentTab === 'guardrail' && (
          <GuardrailView
            project={activeProject}
            isMentor={currentUser.role === 'MENTOR'}
            onUpdateProtectedFiles={handleUpdateProtectedFiles}
          />
        )}

        {currentTab === 'obsidian' && (
          <ObsidianView
            markdownContent={liveObsidianMarkdown}
          />
        )}
      </main>

      {/* Subtle Footer */}
      <footer className="border-t border-slate-200 bg-white py-4 px-6 text-center text-xs text-slate-400">
        Majastic Sentry — Calm Workspace for Developers & Project Manager
      </footer>

      {/* Modals */}
      <AddUseCaseModal
        isOpen={isAddUseCaseModalOpen}
        onClose={() => {
          setIsAddUseCaseModalOpen(false);
          setEditingUseCase(null);
        }}
        milestoneId={activeMilestone.id}
        editingUseCase={editingUseCase}
        onAddUseCase={handleSaveUseCase}
      />

      <AddTaskModal
        isOpen={isAddTaskModalOpen}
        onClose={() => {
          setIsAddTaskModalOpen(false);
          setEditingTask(null);
        }}
        useCases={useCases}
        initialUseCaseId={selectedUseCaseIdForTask || undefined}
        editingTask={editingTask}
        users={users}
        onAddTask={handleSaveTask}
      />

      <CheckPrModal
        isOpen={isCheckPrModalOpen}
        onClose={() => {
          setIsCheckPrModalOpen(false);
          setSelectedTaskForPr(null);
        }}
        repo={activeProject?.githubRepo || 'TefaMajastic/epkl-core'}
        task={selectedTaskForPr}
        onPrChecked={handlePrChecked}
      />

      <BlockerModal
        isOpen={isBlockerModalOpen}
        onClose={() => {
          setIsBlockerModalOpen(false);
          setSelectedTaskForBlocker(null);
        }}
        task={selectedTaskForBlocker}
        onSubmitBlocker={(taskId, blockerNote) => {
          handleUpdateTaskStatus(taskId, 'BLOCKED', blockerNote);
        }}
      />

    </div>
  );
}
