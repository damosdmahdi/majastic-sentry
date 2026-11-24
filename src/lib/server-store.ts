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
          const rawProjects = (projRes.data || []).map((p: any) => {
            const rawRepo = p.github_repo;
            const normalizedRepo = (!rawRepo || rawRepo === 'majastic/core-app' || rawRepo === 'damosdmahdi/majastic-sentry')
              ? (process.env.GITHUB_REPO || 'TefaMajastic/epkl-core')
              : rawRepo;
            return {
              id: p.id,
              name: p.name,
              slug: p.slug,
              description: p.description,
              githubRepo: normalizedRepo,
              protectedFiles: p.protected_files || [],
              createdAt: p.created_at,
            };
          });

          const rawMilestones = (msRes.data || []).map((m: any) => ({
            id: m.id,
            projectId: m.project_id,
            title: m.title,
            sdlcType: m.sdlc_type,
            startDate: m.start_date,
            endDate: m.end_date,
            status: m.status,
          }));

          const rawUseCases = (ucRes.data || []).map((uc: any) => ({
            id: uc.id,
            milestoneId: uc.milestone_id,
            code: uc.code,
            title: uc.title,
            businessGoal: uc.business_goal,
            figmaUrl: uc.figma_url,
            createdAt: uc.created_at,
          }));

          const rawTasks = (tasksRes.data || []).map((t: any) => ({
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
          }));

          return {
            source: 'supabase',
            users: (usersRes.data || []).map((u: any) => ({
              id: u.id,
              name: u.name,
              email: u.email,
              role: u.role,
              avatar: u.avatar,
              tag: u.tag,
              password: u.password,
            })),
            projects: rawProjects.length > 0 ? rawProjects : INITIAL_PROJECTS,
            milestones: rawMilestones.length >= INITIAL_MILESTONES.length ? rawMilestones : INITIAL_MILESTONES,
            useCases: rawUseCases.length >= INITIAL_USE_CASES.length ? rawUseCases : INITIAL_USE_CASES,
            tasks: rawTasks,
          };
        }
      } catch (err) {
        console.warn('Supabase query failed, falling back to local memory store:', err);
      }
    }

    // Fallback Local Memory Store
    const local = getLocalStore();
    return {
      source: 'fallback',
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
        // 1. Auto-ensure project exists
        await supabase.from('projects').upsert({
          id: 'proj-1',
          name: 'Majastic E-PKL (Laravel 11 + Inertia.js + Vue 3)',
          slug: 'majastic-e-pkl',
          description: 'Sistem Informasi Manajemen Praktik Kerja Lapangan (PKL) SMK berbasis Laravel 11, Inertia.js, dan Vue 3',
          github_repo: 'TefaMajastic/epkl-core',
          protected_files: [
            'app/Http/Middleware/HandleInertiaRequests.php',
            'vite.config.js',
            'vite.config.ts',
            'composer.json',
            'package.json',
            'docker-compose.yml',
            'compose.yaml',
            '.env.example',
            'bootstrap/app.php'
          ],
        }, { onConflict: 'id' });

        // 2. Auto-ensure parent milestone exists
        const matchingMs = INITIAL_MILESTONES.find((m) => m.id === useCase.milestoneId);
        if (matchingMs) {
          await supabase.from('milestones').upsert({
            id: matchingMs.id,
            project_id: matchingMs.projectId,
            title: matchingMs.title,
            sdlc_type: matchingMs.sdlcType,
            start_date: matchingMs.startDate,
            end_date: matchingMs.endDate,
            status: matchingMs.status,
          }, { onConflict: 'id' });
        }

        const { error } = await supabase.from('use_cases').insert({
          id: useCase.id,
          milestone_id: useCase.milestoneId,
          code: useCase.code,
          title: useCase.title,
          business_goal: useCase.businessGoal,
          figma_url: useCase.figmaUrl,
        });

        if (error) {
          console.error('Supabase addUseCase error:', error);
          throw new Error(`Gagal menyimpan Use Case ke Supabase: ${error.message}`);
        }
      } catch (err) {
        console.error('Supabase addUseCase exception:', err);
        throw err;
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
        // 1. Auto-ensure project exists in Supabase
        await supabase.from('projects').upsert({
          id: 'proj-1',
          name: 'Majastic E-PKL (Laravel 11 + Inertia.js + Vue 3)',
          slug: 'majastic-e-pkl',
          description: 'Sistem Informasi Manajemen Praktik Kerja Lapangan (PKL) SMK berbasis Laravel 11, Inertia.js, dan Vue 3',
          github_repo: 'TefaMajastic/epkl-core',
          protected_files: [
            'app/Http/Middleware/HandleInertiaRequests.php',
            'vite.config.js',
            'vite.config.ts',
            'composer.json',
            'package.json',
            'docker-compose.yml',
            'compose.yaml',
            '.env.example',
            'bootstrap/app.php'
          ],
        }, { onConflict: 'id' });

        // 2. Auto-ensure parent milestone & use case exist in Supabase so Foreign Key NEVER fails!
        const matchingUc = INITIAL_USE_CASES.find((u) => u.id === task.useCaseId);
        if (matchingUc) {
          const matchingMs = INITIAL_MILESTONES.find((m) => m.id === matchingUc.milestoneId);
          if (matchingMs) {
            await supabase.from('milestones').upsert({
              id: matchingMs.id,
              project_id: matchingMs.projectId,
              title: matchingMs.title,
              sdlc_type: matchingMs.sdlcType,
              start_date: matchingMs.startDate,
              end_date: matchingMs.endDate,
              status: matchingMs.status,
            }, { onConflict: 'id' });
          }

          await supabase.from('use_cases').upsert({
            id: matchingUc.id,
            milestone_id: matchingUc.milestoneId,
            code: matchingUc.code,
            title: matchingUc.title,
            business_goal: matchingUc.businessGoal,
            figma_url: matchingUc.figmaUrl,
          }, { onConflict: 'id' });
        }

        const { error } = await supabase.from('tasks').insert({
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

        if (error) {
          console.error('Supabase addTask error:', error);
          throw new Error(`Gagal menyimpan Tugas ke Supabase: ${error.message}`);
        }
      } catch (err) {
        console.error('Supabase addTask exception:', err);
        throw err;
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

        const { error } = await supabase.from('tasks').update(updatePayload).eq('id', taskId);
        if (error) {
          console.error('Supabase updateTask error:', error);
          throw new Error(`Gagal memperbarui Tugas di Supabase: ${error.message}`);
        }
      } catch (err) {
        console.error('Supabase updateTask exception:', err);
        throw err;
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
