import { fetchClient } from "./config";

export type ModuleProgressStatus =
  | "LOCKED"
  | "AVAILABLE"
  | "IN_PROGRESS"
  | "COMPLETED";

export interface ProgressModuleState {
  id: string;
  title: string;
  month: number;
  week: number;
  order: number;
  releaseDate?: string | null;
  released: boolean;
  status: ModuleProgressStatus;
  theorySecondsSpent: number;
  activitySecondsSpent: number;
  completedAt?: string | null;
  isFinalExam?: boolean;
}

export interface StudentProgress {
  userId: string;
  fullName?: string;
  email?: string;
  currentPhase: "THEORY" | "PRACTICE" | "GRADUATED";
  courseMonth: number;
  totalMonths: number;
  theory: {
    completed: number;
    total: number;
    percent: number;
    modules: ProgressModuleState[];
  };
  practice: {
    approvedCuts: number;
    totalCuts: number;
    percent: number;
    models: unknown[];
  };
  currentModule: ProgressModuleState | null;
}

export async function getMyProgress(token: string): Promise<StudentProgress> {
  return fetchClient<StudentProgress>("/progress/me", { method: "GET" }, token);
}

export async function getMyBadges(token: string) {
  return fetchClient("/progress/badges/me", { method: "GET" }, token);
}

export async function startModuleProgress(moduleId: string, token: string) {
  return fetchClient(
    `/progress/modules/${moduleId}/start`,
    { method: "POST" },
    token,
  );
}

export async function recordModuleTime(
  moduleId: string,
  data: { theorySeconds?: number; activitySeconds?: number },
  token: string,
) {
  return fetchClient(
    `/progress/modules/${moduleId}/time`,
    {
      method: "POST",
      body: JSON.stringify(data),
    },
    token,
  );
}
