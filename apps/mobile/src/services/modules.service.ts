import { fetchClient } from './config';

export interface GlossaryItem {
  term: string;
  definition: string;
}

export interface PracticalCase {
  title: string;
  description: string;
  questions: string[];
}

export interface PracticalActivity {
  title: string;
  instructions: string;
}

export interface QuestionItem {
  id: string;
  text: string;
  options: string[];
  correctAnswerIndex: number;
  explanation?: string;
}

export interface EvaluationItem {
  id: string;
  title: string;
  passingScore: number;
  totalQuestions: number;
  isFinalExam?: boolean;
  questions?: QuestionItem[];
}

export interface ChapterItem {
  id: number;
  title: string;
  timestamp: string;
  status: 'completed' | 'active' | 'locked';
  content: string;
}

export interface TheoreticalModule {
  id: string;
  month: number;
  week: number;
  title: string;
  description?: string;
  videoUrl?: string;
  summaryText?: string;
  totalDurationMinutes?: number;
  level?: string;
  instructorName?: string;
  contentMarkdown?: string;
  objectivesJson?: string[];
  competenciesJson?: string[];
  glossaryJson?: GlossaryItem[];
  practicalCaseJson?: PracticalCase;
  practicalActivityJson?: PracticalActivity;
  chaptersJson?: ChapterItem[];
  moduleName?: string;
  introductionText?: string;
  keyConceptsJson?: string[];
  conclusionText?: string;
  bibliographyJson?: string[];
  avatar?: {
    id: string;
    name: string;
    specialty?: string;
    avatarVideoUrl?: string;
    isMarianaClone?: boolean;
  };
  status?: 'PUBLISHED' | 'DRAFT' | 'INACTIVE';
  releaseDate?: string | null;
  progressStatus?: 'LOCKED' | 'AVAILABLE' | 'IN_PROGRESS' | 'COMPLETED';
  evaluations?: EvaluationItem[];
}

export interface QuizResult {
  message: string;
  attemptId: string;
  score: number;
  passingScore: number;
  passed: boolean;
  correctAnswers: number;
  totalQuestions: number;
  unlockedModule?: {
    id?: string;
    title?: string;
    month?: number;
    week?: number;
  } | null;
  badge?: {
    title: string;
    description: string;
    alreadyOwned?: boolean;
  } | null;
  phaseChanged?: boolean;
  newPhase?: string;
}

let cachedModules: TheoreticalModule[] | null = null;

export async function getTheoreticalModules(token: string, forceRefresh = false): Promise<TheoreticalModule[]> {
  if (cachedModules && !forceRefresh) {
    return cachedModules;
  }
  const data = await fetchClient<TheoreticalModule[]>('/modules/theory', { method: 'GET' }, token);
  const now = Date.now();
  const publishedData = (data || []).filter((m) => {
    if (m.status !== 'PUBLISHED') return false;
    if (!m.releaseDate) return true;
    return new Date(m.releaseDate).getTime() <= now;
  });
  cachedModules = publishedData;
  return publishedData;
}

export async function getModuleById(moduleId: string, token: string): Promise<TheoreticalModule> {
  return fetchClient<TheoreticalModule>(`/modules/theory/${moduleId}`, { method: 'GET' }, token);
}

export async function submitQuiz(
  evaluationId: string,
  answers: number[],
  token: string
): Promise<QuizResult> {
  return fetchClient<QuizResult>(
    `/modules/theory/evaluations/${evaluationId}/submit`,
    {
      method: 'POST',
      body: JSON.stringify({ answers }),
    },
    token
  );
}
