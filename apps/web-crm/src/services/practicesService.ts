import { apiRequest } from "./apiClient";

export interface PendingCut {
  id: string;
  cutNumber: number;
  lunarPhase: string;
  submittedAt: string;
  evidence?: {
    id: string;
    photoBeforeUrl: string;
    photoAfterUrl: string;
    videoOptionalUrl?: string | null;
    technicalSheetText: string;
    createdAt: string;
  };
  model: {
    id: string;
    modelName: string;
    modelNumber: number;
    user: {
      id: string;
      fullName: string;
      email: string;
    };
  };
}

export async function getPendingCutsForReview(): Promise<PendingCut[]> {
  const res = await apiRequest("/practices/pending-reviews", {
    method: "GET",
  });

  if (!res.ok) {
    throw new Error("No se pudieron obtener las prácticas pendientes.");
  }

  return res.json();
}

export async function reviewCut(
  cutId: string,
  statusResult: "APPROVED" | "CORRECTION_REQUIRED",
  comments: string,
) {
  const res = await apiRequest(`/practices/review/${cutId}`, {
    method: "POST",
    body: JSON.stringify({ statusResult, comments }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || "Error al registrar la evaluación.");
  }

  return res.json();
}
