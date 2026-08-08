import { apiRequest } from "./apiClient";

export interface StudentProgressResponse {
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
    modules: Array<{
      id: string;
      title: string;
      month: number;
      week: number;
      status: string;
      released: boolean;
      completedAt?: string | null;
    }>;
  };
  practice: {
    approvedCuts: number;
    totalCuts: number;
    percent: number;
    models: Array<{
      id: string;
      modelNumber: number;
      modelName: string;
      status: string;
      cuts: Array<{
        id: string;
        cutNumber: number;
        status: string;
        evidence?: {
          photoBeforeUrl: string;
          photoAfterUrl: string;
          videoOptionalUrl?: string | null;
          technicalSheetText: string;
        } | null;
      }>;
    }>;
  };
  currentModule: { id: string; title: string } | null;
}

export async function getStudentProgress(
  studentId: string,
): Promise<StudentProgressResponse> {
  const res = await apiRequest(`/progress/students/${studentId}`, {
    method: "GET",
  });
  if (!res.ok) {
    throw new Error("No se pudo obtener el progreso del alumno.");
  }
  return res.json();
}
