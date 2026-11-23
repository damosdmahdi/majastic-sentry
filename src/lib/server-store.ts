import { Project, Milestone, UseCase, Task, User } from '@/types';
import {
  INITIAL_PROJECTS,
  INITIAL_MILESTONES,
  INITIAL_USE_CASES,
  INITIAL_TASKS,
  INITIAL_USERS,
} from './initial-data';
import { getSupabaseClient } from './supabase';

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

function getLocalStore(): GlobalStore {
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
  // ==========================================
  // FETCH ALL DATA (Supports Supabase & Local)
  // ==========================================
  async getAll() {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const [usersRes, projRes, msRes, ucRes, tasksRes] = await Promise.all([
          supabase.from('users').select('*'),
          supabase.from('projects').select('*'),
          supabase.from('milestones').select('*'),
          supabase.from('use_cases').select('*'),
          supabase.from('tasks').select('*'), // Fetch all tasks including is_archived so Use Case progress remains accurate!
        ]);

        if (!usersRes.error && usersRes.data?.length) {
          return {
            users: (usersRes.data || []).map((u: any) => ({
              id: u.id,
              name: u.name,
              email: u.email,
              role: u.role,
              avatar: u.avatar,
              tag: u.tag,
            })),
            projects: (projRes.data || []).map((p: any) => ({
              id: p.id,
              name: p.name,
              slug: p.slug,
              description: p.description,
              githubRepo: p.github_repo,
              protectedFiles: p.protected_files || [],
              createdAt: p.created_at,
            })),
            milestones: (msRes.data || []).map((m: any) => ({
              id: m.id,
              projectId: m.project_id,
              title: m.title,
              sdlcType: m.sdlc_type,
              startDate: m.start_date,
              endDate: m.end_date,
              status: m.status,
            })),
            useCases: (ucRes.data || []).map((uc: any) => ({
              id: uc.id,
              milestoneId: uc.milestone_id,
              code: uc.code,
              title: uc.title,
              businessGoal: uc.business_goal,
              figmaUrl: uc.figma_url,
              createdAt: uc.created_at,
            })),
            tasks: (tasksRes.data || []).map((t: any) => ({
              id: t.id,
              useCaseId: t.use_case_id,
              title: t.title,
              type: t.type,
              endpointSpec: t.endpoint_spec,
              assigneeId: t.assignee_id,
              status: t.status,
              blockerNote: t.blocker_note,
              githubPrUrl: t.github_pr_url,
              prNumber: t.pr_number,
              integrityCheck: t.integrity_check,
              isArchived: Boolean(t.is_archived),
              lastUpdatedAt: t.last_updated_at,
              reviewedAt: t.reviewed_at,
              createdAt: t.created_at,
            })),
          };
        }
      } catch (err) {
        console.warn('Supabase query failed, falling back to local memory store:', err);
      }
    }

    // Fallback Local Memory Store
    const local = getLocalStore();
    return {
      users: local.users,
      projects: local.projects,
      milestones: local.milestones,
      useCases: local.useCases,
      tasks: local.tasks,
    };
  },

  getProjects: () => getLocalStore().projects,
  getMilestones: () => getLocalStore().milestones,
  getUseCases: () => getLocalStore().useCases,
  getTasks: () => getLocalStore().tasks,
  getUsers: () => getLocalStore().users,

  // ==========================================
  // ADD USE CASE
  // ==========================================
  async addUseCase(useCase: UseCase) {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.from('use_cases').insert({
          id: useCase.id,
          milestone_id: useCase.milestoneId,
          code: useCase.code,
          title: useCase.title,
          business_goal: useCase.businessGoal,
          figma_url: useCase.figmaUrl,
        });
      } catch (err) {
        console.warn('Supabase addUseCase failed:', err);
      }
    }

    const store = getLocalStore();
    store.useCases.push(useCase);
    return useCase;
  },

  // ==========================================
  // ADD TASK
  // ==========================================
  async addTask(task: Task) {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.from('tasks').insert({
          id: task.id,
          use_case_id: task.useCaseId,
          title: task.title,
          type: task.type,
          endpoint_spec: task.endpointSpec,
          assignee_id: task.assigneeId,
          status: task.status,
          github_pr_url: task.githubPrUrl,
          pr_number: task.prNumber,
          is_archived: false,
          last_updated_at: task.lastUpdatedAt,
        });
      } catch (err) {
        console.warn('Supabase addTask failed:', err);
      }
    }

    const store = getLocalStore();
    store.tasks.push(task);
    return task;
  },

  // ==========================================
  // UPDATE TASK
  // ==========================================
  async updateTask(taskId: string, patch: Partial<Task>) {
    const nowIso = new Date().toISOString();
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const updatePayload: any = {
          last_updated_at: nowIso,
        };
        if (patch.status) updatePayload.status = patch.status;
        if (patch.blockerNote !== undefined) updatePayload.blocker_note = patch.blockerNote;
        if (patch.githubPrUrl !== undefined) updatePayload.github_pr_url = patch.githubPrUrl;
        if (patch.prNumber !== undefined) updatePayload.pr_number = patch.prNumber;
        if (patch.integrityCheck !== undefined) updatePayload.integrity_check = patch.integrityCheck;
        if (patch.reviewedAt !== undefined) updatePayload.reviewed_at = patch.reviewedAt;
        if (patch.isArchived !== undefined) updatePayload.is_archived = patch.isArchived;

        await supabase.from('tasks').update(updatePayload).eq('id', taskId);
      } catch (err) {
        console.warn('Supabase updateTask failed:', err);
      }
    }

    const store = getLocalStore();
    const index = store.tasks.findIndex((t) => t.id === taskId);
    if (index === -1) return null;
    store.tasks[index] = {
      ...store.tasks[index],
      ...patch,
      lastUpdatedAt: nowIso,
    };
    return store.tasks[index];
  },

  // ==========================================
  // ARCHIVE COMPLETED TASKS (Sprint Cutoff)
  // ==========================================
  async archiveCompletedTasks() {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase
          .from('tasks')
          .update({ is_archived: true })
          .eq('status', 'DONE')
          .eq('is_archived', false);
      } catch (err) {
        console.warn('Supabase archiveCompletedTasks failed:', err);
      }
    }

    const store = getLocalStore();
    store.tasks.forEach((t) => {
      if (t.status === 'DONE') {
        t.isArchived = true;
      }
    });
    return true;
  },

  // ==========================================
  // UPDATE PROTECTED FILES
  // ==========================================
  async updateProjectProtectedFiles(projectId: string, files: string[]) {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.from('projects').update({ protected_files: files }).eq('id', projectId);
      } catch (err) {
        console.warn('Supabase updateProjectProtectedFiles failed:', err);
      }
    }

    const store = getLocalStore();
    const proj = store.projects.find((p) => p.id === projectId);
    if (proj) {
      proj.protectedFiles = files;
    }
    return proj;
  },
};
