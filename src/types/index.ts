export type Role = 'MENTOR' | 'FULLSTACK' | 'UI_FE' | 'BUSINESS';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar: string;
  tag?: string; // e.g. "Lead", "Fullstack Pemula", "SMK Intern", "UI Designer"
}

export interface Project {
  id: string;
  name: string;
  slug: string;
  description: string;
  githubRepo: string; // e.g. "majastic/sistem-sekolah"
  protectedFiles: string[];
  createdAt: string;
}

export type SdlcType = 'AGILE_SPRINT' | 'WATERFALL_PHASE';

export interface Milestone {
  id: string;
  projectId: string;
  title: string; // e.g. "Sprint 14 - Auth & Profil" or "Fase 1 - Core Services"
  sdlcType: SdlcType;
  startDate: string;
  endDate: string;
  status: 'ACTIVE' | 'COMPLETED';
}

export interface UseCase {
  id: string;
  milestoneId: string;
  code: string; // e.g. "UC-01"
  title: string;
  businessGoal: string;
  figmaUrl?: string;
  createdAt: string;
}

export type TaskType = 'ENDPOINT' | 'UI_SLICING' | 'GENERAL';
export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'BLOCKED' | 'REVIEW' | 'DONE';
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

export interface IntegrityCheckResult {
  status: 'PASSED' | 'WARNING' | 'FAILED' | 'PENDING';
  violatedFiles: string[];
  checkedAt: string;
  message: string;
}

export interface Task {
  id: string;
  useCaseId: string;
  title: string;
  type: TaskType;
  endpointSpec?: {
    method: HttpMethod;
    route: string;
  };
  assigneeId: string;
  status: TaskStatus;
  blockerNote?: string;
  githubPrUrl?: string;
  prNumber?: number;
  integrityCheck?: IntegrityCheckResult;
  lastUpdatedAt: string; // ISO string
  reviewedAt?: string;
  createdAt: string;
}
