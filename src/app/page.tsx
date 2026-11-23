'use client';

import React, { useState, useEffect } from 'react';
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
import { Header } from '@/components/Header';
import { MetricsBar } from '@/components/MetricsBar';
import { UseCaseBoard } from '@/components/UseCaseBoard';
import { ObsidianPreviewModal } from '@/components/Modals/ObsidianPreviewModal';
import { ProtectedFilesModal } from '@/components/Modals/ProtectedFilesModal';
import { AddUseCaseModal } from '@/components/Modals/AddUseCaseModal';
import { AddTaskModal } from '@/components/Modals/AddTaskModal';
import { CheckPrModal } from '@/components/Modals/CheckPrModal';
import { BlockerModal } from '@/components/Modals/BlockerModal';
import { generateObsidianWeeklyMarkdown } from '@/lib/obsidian-exporter';

export default function HomePage() {
  const [projects, setProjects] = useState<Project[]>(INITIAL_PROJECTS);
  const [milestones, setMilestones] = useState<Milestone[]>(INITIAL_MILESTONES);
  const [useCases, setUseCases] = useState<UseCase[]>(INITIAL_USE_CASES);
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [currentUser, setCurrentUser] = useState<User>(INITIAL_USERS[0]); // Default to Mentor (Damos)
  
  const [activeFilter, setActiveFilter] = useState<string>('ALL');

  // Modals state
  const [isObsidianModalOpen, setIsObsidianModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isAddUseCaseModalOpen, setIsAddUseCaseModalOpen] = useState(false);
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
  const [selectedUseCaseIdForTask, setSelectedUseCaseIdForTask] = useState<string>('');
  const [isCheckPrModalOpen, setIsCheckPrModalOpen] = useState(false);
  const [selectedTaskForPr, setSelectedTaskForPr] = useState<Task | null>(null);
  const [isBlockerModalOpen, setIsBlockerModalOpen] = useState(false);
  const [selectedTaskForBlocker, setSelectedTaskForBlocker] = useState<Task | null>(null);

  const activeProject = projects[0];
  const activeMilestone = milestones[0];

  // Fetch initial data from server API on mount if available
  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch('/api/data');
        if (res.ok) {
          const data = await res.json();
          if (data.projects?.length) setProjects(data.projects);
          if (data.milestones?.length) setMilestones(data.milestones);
          if (data.useCases?.length) setUseCases(data.useCases);
          if (data.tasks?.length) setTasks(data.tasks);
          if (data.users?.length) setUsers(data.users);
        }
      } catch (err) {
        console.warn('Using client-side fallback store:', err);
      }
    }
    loadData();
  }, []);

  // Update Task Status
  const handleUpdateTaskStatus = async (taskId: string, newStatus: TaskStatus, blockerNote?: string) => {
    const patch: Partial<Task> = {
      status: newStatus,
      lastUpdatedAt: new Date().toISOString(),
    };
    if (blockerNote !== undefined) {
      patch.blockerNote = blockerNote;
    }
    if (newStatus === 'DONE') {
      patch.reviewedAt = new Date().toISOString();
    }

    // Optimistic UI update
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

  // Update Protected Files
  const handleUpdateProtectedFiles = (files: string[]) => {
    setProjects((prev) =>
      prev.map((p) => (p.id === activeProject.id ? { ...p, protectedFiles: files } : p))
    );
  };

  // PR Checked
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
              integrityCheck: result,
              lastUpdatedAt: new Date().toISOString(),
            }
          : t
      )
    );
  };

  // Filter tasks based on activeFilter
  const now = new Date();
  const filteredTasks = tasks.filter((t) => {
    if (activeFilter === 'ALL') return true;
    if (activeFilter === 'MY_TASKS') return t.assigneeId === currentUser.id;
    if (activeFilter === 'REVIEW') return t.status === 'REVIEW';
    if (activeFilter === 'BLOCKED') return t.status === 'BLOCKED';
    if (activeFilter === 'STALE') {
      const diffHours = (now.getTime() - new Date(t.lastUpdatedAt).getTime()) / (1000 * 3600);
      return t.status === 'IN_PROGRESS' && diffHours >= 48;
    }
    if (activeFilter === 'GUARDRAIL') {
      return t.integrityCheck?.status === 'WARNING' || t.integrityCheck?.status === 'FAILED';
    }
    return true;
  });

  // Generate live markdown for modal preview
  const liveObsidianMarkdown = generateObsidianWeeklyMarkdown({
    project: activeProject,
    milestone: activeMilestone,
    useCases,
    tasks,
    users,
  });

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      
      {/* Navigation Header */}
      <Header
        currentUser={currentUser}
        onSwitchUser={setCurrentUser}
        users={users}
        project={activeProject}
        milestone={activeMilestone}
        onOpenObsidianModal={() => setIsObsidianModalOpen(true)}
        onOpenSettingsModal={() => setIsSettingsModalOpen(true)}
        onOpenAddUseCaseModal={() => setIsAddUseCaseModalOpen(true)}
      />

      {/* Metrics & Filter Bar */}
      <MetricsBar
        tasks={tasks}
        currentUser={currentUser}
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
      />

      {/* Main Board */}
      <main className="flex-1">
        <UseCaseBoard
          useCases={useCases}
          tasks={filteredTasks}
          users={users}
          currentUser={currentUser}
          onUpdateTaskStatus={handleUpdateTaskStatus}
          onOpenCheckPrModal={(task) => {
            setSelectedTaskForPr(task);
            setIsCheckPrModalOpen(true);
          }}
          onOpenAddTaskModal={(ucId) => {
            setSelectedUseCaseIdForTask(ucId);
            setIsAddTaskModalOpen(true);
          }}
          onOpenBlockerModal={(task) => {
            setSelectedTaskForBlocker(task);
            setIsBlockerModalOpen(true);
          }}
        />
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-4 px-6 text-center text-xs text-slate-500">
        <p>Majastic Sentry — In-House Team Platform & Obsidian Knowledge Pipeline</p>
      </footer>

      {/* Modals */}
      <ObsidianPreviewModal
        isOpen={isObsidianModalOpen}
        onClose={() => setIsObsidianModalOpen(false)}
        markdownContent={liveObsidianMarkdown}
      />

      <ProtectedFilesModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        project={activeProject}
        onUpdateProtectedFiles={handleUpdateProtectedFiles}
      />

      <AddUseCaseModal
        isOpen={isAddUseCaseModalOpen}
        onClose={() => setIsAddUseCaseModalOpen(false)}
        milestoneId={activeMilestone.id}
        onAddUseCase={handleAddUseCase}
      />

      <AddTaskModal
        isOpen={isAddTaskModalOpen}
        onClose={() => setIsAddTaskModalOpen(false)}
        useCaseId={selectedUseCaseIdForTask}
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
