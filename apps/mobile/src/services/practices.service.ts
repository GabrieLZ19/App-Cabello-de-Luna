import { Platform } from "react-native";
import { fetchClient } from "./config";

export interface EvidenceData {
  id: string;
  photoBeforeUrl: string;
  photoAfterUrl: string;
  videoOptionalUrl?: string | null;
  technicalSheetText?: string;
  createdAt: string;
}

export interface FeedbackData {
  id: string;
  statusResult: string;
  comments: string;
  instructor?: {
    fullName: string;
  };
  reviewedAt: string;
}

export interface CutData {
  id: string;
  cutNumber: number;
  lunarPhase?: string;
  status: "PENDING" | "IN_REVIEW" | "APPROVED" | "CORRECTION_REQUIRED";
  submittedAt?: string;
  evidence?: EvidenceData;
  feedbacks?: FeedbackData[];
}

export interface PracticalModelData {
  id: string;
  modelNumber: number;
  modelName: string;
  lunarPhaseAssigned?: string;
  status: string;
  cuts: CutData[];
}

export async function getStudentPractices(
  token: string,
): Promise<PracticalModelData[]> {
  return fetchClient<PracticalModelData[]>(
    "/practices/my-cuts",
    { method: "GET" },
    token,
  );
}

export async function uploadCutEvidenceWithFiles(
  data: {
    modelName: string;
    modelNumber: number;
    cutNumber: number;
    lunarPhase: string;
    photoBeforeBase64: string;
    photoAfterBase64: string;
    technicalSheetText: string;
    videoOptionalBase64?: string;
    videoMimeType?: string;
  },
  token: string,
) {
  return fetchClient(
    "/practices/submit",
    {
      method: "POST",
      body: JSON.stringify(data),
    },
    token,
  );
}
