import { Project, Milestone, UseCase, Task, User } from '@/types';
import {
  INITIAL_PROJECTS,
  INITIAL_MILESTONES,
  INITIAL_USE_CASES,
  INITIAL_TASKS,
  INITIAL_USERS,
} from './initial-data';

// Singleton in-memory store for server runtime (fast, zero external DB dependencies for instant setup)
// Can be backed by Supabase / PostgreSQL by simply configuring DATABASE_URL or Supabase client!

interface GlobalStore {
  projects: Project[];
  milestones: Milestone[];
  useCases: UseCase[];
  tasks: Task[];
  users: User[];
}

declare global {
  // eslint-disable-next-line no-var
  var __majasticStore: GlobalStore | undefined;
}

function getStore(): GlobalStore {
  if (!global.__majasticStore) {
    global.__majasticStore = {
      projects: [...INITIAL_PROJECTS],
      milestones: [...INITIAL_MILESTONES],
      useCases: [...INITIAL_USE_CASES],
      tasks: [...INITIAL_TASKS],
      users: [...INITIAL_USERS],
    };
  }
  return global.__majasticStore;
}

export const db = {
  getProjects: () => getStore().projects,
  getMilestones: () => getStore().milestones,
  getUseCases: () => getStore().useCases,
  getTasks: () => getStore().tasks,
  getUsers: () => getStore().users,

  addUseCase: (useCase: UseCase) => {
    const store = getStore();
    store.useCases.push(useCase);
    return useCase;
  },

  addTask: (task: Task) => {
    const store = getStore();
    store.tasks.push(task);
    return task;
  },

  updateTask: (taskId: string, patch: Partial<Task>) => {
    const store = getStore();
    const index = store.tasks.findIndex((t) => t.id === taskId);
    if (index === -1) return null;
    store.tasks[index] = {
      ...store.tasks[index],
      ...patch,
      lastUpdatedAt: new Date().toISOString(),
    };
    return store.tasks[index];
  },

  updateProjectProtectedFiles: (projectId: string, files: string[]) => {
    const store = getStore();
    const proj = store.projects.find((p) => p.id === projectId);
    if (proj) {
      proj.protectedFiles = files;
    }
    return proj;
  },
};
