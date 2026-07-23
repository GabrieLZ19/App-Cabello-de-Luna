import { fetchClient } from './config';

export interface EvidenceData {
  id: string;
  photoBeforeUrl: string;
  photoAfterUrl: string;
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
  status: 'PENDING' | 'IN_REVIEW' | 'APPROVED' | 'CORRECTION_REQUIRED';
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

export async function getStudentPractices(token: string): Promise<PracticalModelData[]> {
  return fetchClient<PracticalModelData[]>('/practices/my-cuts', { method: 'GET' }, token);
}

export async function submitCutEvidence(
  data: {
    modelName: string;
    modelNumber: number;
    cutNumber: number;
    lunarPhase: string;
    photoBeforeUrl: string;
    photoAfterUrl: string;
    technicalSheetText: string;
  },
  token: string
): Promise<CutData> {
  return fetchClient<CutData>(
    '/practices/submit',
    {
      method: 'POST',
      body: JSON.stringify(data),
    },
    token
  );
}
