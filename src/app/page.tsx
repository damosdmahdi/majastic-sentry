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
  HttpMethod,
  IntegrityCheckResult
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
import { Loader2 } from 'lucide-react';

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
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
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
      if (res.ok) {
        const data = await res.json();
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
  }, []);

  // Fetch initial data on mount
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Enforce Mentor-only access for Obsidian tab
  useEffect(() => {
    if (currentUser.role !== 'MENTOR' && currentTab === 'obsidian') {
      setCurrentTab('board');
    }
  }, [currentUser, currentTab]);

  // Auto-polling interval every 20 seconds if window is visible
  useEffect(() => {
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        fetchData(true);
      }
    }, 20000);
    return () => clearInterval(interval);
  }, [fetchData]);

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

    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, ...patch } : t))
    );

    try {
      await fetch('/api/tasks', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: taskId, ...patch }),
      });
    } catch (err) {
      console.error('Failed to sync task status to backend:', err);
    }
  };

  // Add Use Case
  const handleAddUseCase = async (useCaseData: {
    milestoneId: string;
    code: string;
    title: string;
    businessGoal: string;
    figmaUrl?: string;
  }) => {
    try {
      const res = await fetch('/api/use-cases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(useCaseData),
      });
      const data = await res.json();
      if (data.success && data.useCase) {
        setUseCases((prev) => [...prev, data.useCase]);
      }
    } catch (err) {
      console.error('Failed to add use case:', err);
    }
  };

  // Add Task
  const handleAddTask = async (taskData: {
    useCaseId: string;
    title: string;
    type: TaskType;
    endpointSpec?: { method: HttpMethod; route: string };
    assigneeId: string;
  }) => {
    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskData),
      });
      const data = await res.json();
      if (data.success && data.task) {
        setTasks((prev) => [...prev, data.task]);
      }
    } catch (err) {
      console.error('Failed to add task:', err);
    }
  };

  // Archive Completed Tasks (Sprint Cutoff)
  const handleArchiveCompletedTasks = async () => {
    setTasks((prev) =>
      prev.map((t) => (t.status === 'DONE' ? { ...t, isArchived: true } : t))
    );

    try {
      await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'ARCHIVE_COMPLETED' }),
      });
    } catch (err) {
      console.error('Failed to archive completed tasks on backend:', err);
    }
  };

  // Update Protected Files
  const handleUpdateProtectedFiles = (files: string[]) => {
    setProjects((prev) =>
      prev.map((p) => (p.id === activeProject.id ? { ...p, protectedFiles: files } : p))
    );
  };

  // PR Checked Callback
  const handlePrChecked = (
    taskId: string,
    prUrl: string,
    prNumber: number,
    result: IntegrityCheckResult
  ) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? {
              ...t,
              githubPrUrl: prUrl,
              prNumber,
              status: 'REVIEW', // Automatically advance to Review after PR is verified!
              integrityCheck: result,
              lastUpdatedAt: new Date().toISOString(),
            }
          : t
      )
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
        {currentTab === 'board' && (
          <TaskBoardView
            tasks={tasks}
            useCases={useCases}
            users={users}
            currentUser={currentUser}
            onUpdateTaskStatus={handleUpdateTaskStatus}
            onOpenAddTaskModal={() => {
              setSelectedUseCaseIdForTask(useCases[0]?.id || '');
              setIsAddTaskModalOpen(true);
            }}
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
            onOpenAddUseCaseModal={() => setIsAddUseCaseModalOpen(true)}
            onOpenAddTaskModal={(ucId) => {
              setSelectedUseCaseIdForTask(ucId);
              setIsAddTaskModalOpen(true);
            }}
          />
        )}

        {currentTab === 'guardrail' && (
          <GuardrailView
            project={activeProject}
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
        Majastic Sentry — Calm Workspace for Developers & Mentors
      </footer>

      {/* Modals */}
      <AddUseCaseModal
        isOpen={isAddUseCaseModalOpen}
        onClose={() => setIsAddUseCaseModalOpen(false)}
        milestoneId={activeMilestone.id}
        onAddUseCase={handleAddUseCase}
      />

      <AddTaskModal
        isOpen={isAddTaskModalOpen}
        onClose={() => setIsAddTaskModalOpen(false)}
        useCases={useCases}
        initialUseCaseId={selectedUseCaseIdForTask || useCases[0]?.id || ''}
        users={users}
        onAddTask={handleAddTask}
      />

      <CheckPrModal
        isOpen={isCheckPrModalOpen}
        onClose={() => {
          setIsCheckPrModalOpen(false);
          setSelectedTaskForPr(null);
        }}
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
