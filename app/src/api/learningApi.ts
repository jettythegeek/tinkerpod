import axios from 'axios';
import { KidProfileDto } from './authApi';
import { apiClient, ApiEnvelope } from './client';

export type JourneyNodeState = 'done' | 'now' | 'lock';

export interface JourneyLessonSummaryDto {
  readonly id: string;
  readonly slug: string;
  readonly lesson_number: number;
  readonly position_in_world: number;
  readonly total_in_world: number;
  readonly title: string;
  readonly summary: string | null;
  readonly thumbnail_asset: string | null;
  readonly duration_minutes: number;
  readonly difficulty: string;
  readonly steps_count: number;
  readonly state: JourneyNodeState;
  readonly is_completed: boolean;
  readonly watch_percent: number;
  readonly resume_position_seconds: number;
  readonly world_id: string;
  readonly world_number: number;
  readonly world_title: string;
}

export interface JourneyWorldDto {
  readonly id: string;
  readonly slug: string;
  readonly world_number: number;
  readonly title: string;
  readonly description: string | null;
  readonly icon: string | null;
  readonly map_x: number;
  readonly map_y: number;
  readonly state: JourneyNodeState;
  readonly completed_lessons_count: number;
  readonly total_lessons_count: number;
  readonly lessons: readonly JourneyLessonSummaryDto[];
}

export interface PodSummaryDto {
  readonly id: string;
  readonly slug: string;
  readonly title: string;
  readonly icon: string | null;
  readonly is_demo: boolean;
  readonly cleared_worlds_count: number;
  readonly total_worlds_count: number;
}

export interface PodJourneyMapDto extends PodSummaryDto {
  readonly description: string | null;
  readonly current_world: JourneyWorldDto | null;
  readonly current_lesson: JourneyLessonSummaryDto | null;
  readonly worlds: readonly JourneyWorldDto[];
}

export interface KidHomeData {
  readonly child: KidProfileDto;
  readonly gamification: {
    readonly xp: number;
    readonly next_level_xp: number;
    readonly level: number;
    readonly title: string | null;
    readonly next_title: string | null;
    readonly coins: number;
    readonly gems: number;
    readonly stars: number;
    readonly streak_days: number;
    readonly missions: readonly unknown[];
  };
  readonly continue_lesson: JourneyLessonSummaryDto | null;
  readonly continue_project: {
    readonly id: string;
    readonly title: string;
    readonly language: string;
    readonly progress_percent?: number;
  } | null;
  readonly pods: readonly PodSummaryDto[];
}

export interface JourneyMapData {
  readonly pod: PodJourneyMapDto | null;
  readonly pods: readonly PodJourneyMapDto[];
}

export interface LessonProgressDto {
  readonly resume_position_seconds: number;
  readonly watch_percent: number;
  readonly manual_completed: boolean;
  readonly quiz_passed: boolean;
  readonly is_completed: boolean;
  readonly completed_at: string | null;
}

export interface LessonQuizSummaryDto {
  readonly id: string;
  readonly title: string;
  readonly description: string | null;
  readonly pass_mark_percent: number;
  readonly max_attempts: number;
  readonly questions_count: number;
  readonly is_demo: boolean;
}

export interface LessonProjectSummaryDto {
  readonly id: string;
  readonly title: string;
  readonly description: string | null;
  readonly language: string;
  readonly steps_count: number;
  readonly is_demo: boolean;
}

export interface LessonAttachmentDto {
  readonly id: string;
  readonly title: string;
  readonly filename: string;
  readonly mime_type: string;
  readonly size_bytes: number;
}

export interface LessonDetailDto {
  readonly id: string;
  readonly slug: string;
  readonly lesson_number: number;
  readonly title: string;
  readonly summary: string | null;
  readonly body: string | null;
  readonly learning_objectives: readonly string[];
  readonly thumbnail_asset: string | null;
  readonly intro_video_url: string | null;
  readonly intro_video_duration_seconds: number;
  readonly duration_minutes: number;
  readonly difficulty: string;
  readonly steps_count: number;
  readonly completion_mode: 'manual' | 'watch_percent' | 'quiz_pass';
  readonly required_watch_percent: number;
  readonly is_demo: boolean;
  readonly rewards_preview: {
    readonly xp: number;
    readonly coins: number;
    readonly gems: number;
  };
  readonly world: {
    readonly id: string;
    readonly world_number: number;
    readonly title: string;
    readonly icon: string | null;
  } | null;
  readonly module: {
    readonly id: string;
    readonly title: string;
  } | null;
  readonly progress: LessonProgressDto;
  readonly quizzes: readonly LessonQuizSummaryDto[];
  readonly projects: readonly LessonProjectSummaryDto[];
  readonly attachments: readonly LessonAttachmentDto[];
}

export interface LessonDetailData {
  readonly lesson: LessonDetailDto;
}

export interface UpdateLessonProgressPayload {
  readonly resume_position_seconds?: number;
  readonly watch_percent?: number;
  readonly mark_complete?: boolean;
  readonly idempotency_key?: string;
}

export interface UpdateLessonProgressData {
  readonly lesson_id: string;
  readonly completion_mode: string;
  readonly newly_completed: boolean;
  readonly progress: LessonProgressDto;
}

export interface QuizOptionDto {
  readonly id: string;
  readonly option_key: string;
  readonly label: string;
  readonly sort_order: number;
}

export interface QuizQuestionDto {
  readonly id: string;
  readonly question_number: number;
  readonly prompt: string;
  readonly code_snippet: string | null;
  readonly hint: string | null;
  readonly points: number;
  readonly options: readonly QuizOptionDto[];
}

export interface QuizDetailDto {
  readonly id: string;
  readonly lesson_id: string | null;
  readonly title: string;
  readonly description: string | null;
  readonly pass_mark_percent: number;
  readonly max_attempts: number;
  readonly attempts_used: number;
  readonly remaining_attempts: number;
  readonly best_score_percent: number;
  readonly is_passed: boolean;
  readonly is_demo: boolean;
  readonly questions: readonly QuizQuestionDto[];
}

export interface QuizDetailData {
  readonly quiz: QuizDetailDto;
}

export interface CheckQuizAnswerPayload {
  readonly question_id: string;
  readonly option_id?: string;
  readonly option_key?: string;
}

export interface CheckQuizAnswerData {
  readonly quiz_id: string;
  readonly question_id: string;
  readonly option_id: string;
  readonly option_key: string;
  readonly is_correct: boolean;
  readonly points_awarded: number;
  readonly feedback: string;
  readonly explanation: string;
}

export interface SubmitQuizAttemptPayload {
  readonly answers: readonly {
    readonly question_id: string;
    readonly option_id?: string;
    readonly option_key?: string;
  }[];
  readonly idempotency_key?: string;
}

export interface QuizQuestionResultDto {
  readonly question_id: string;
  readonly question_number: number;
  readonly option_id: string;
  readonly option_key: string;
  readonly is_correct: boolean;
  readonly points_awarded: number;
  readonly feedback: string;
  readonly explanation: string;
}

export interface QuizAttemptResultDto {
  readonly id: string;
  readonly quiz_id: string;
  readonly attempt_number: number;
  readonly attempts_used: number;
  readonly max_attempts: number;
  readonly remaining_attempts: number;
  readonly earned_points: number;
  readonly total_points: number;
  readonly score_percent: number;
  readonly pass_mark_percent: number;
  readonly passed: boolean;
  readonly replayed: boolean;
  readonly lesson_completed: boolean;
  readonly feedback: string;
  readonly submitted_at: string | null;
  readonly results: readonly QuizQuestionResultDto[];
}

export interface SubmitQuizAttemptData {
  readonly attempt: QuizAttemptResultDto;
}

export interface SignedAttachmentUrlData {
  readonly attachment: LessonAttachmentDto;
  readonly signed_url: string;
  readonly expires_at: string;
  readonly ttl_seconds: number;
}

export function isOfflineError(error: unknown): boolean {
  if (axios.isAxiosError(error)) {
    if (error.code === 'ERR_NETWORK' || error.code === 'ECONNABORTED') {
      return true;
    }
    if (!error.response && error.request) {
      return true;
    }
  }

  if (error instanceof Error) {
    const msg = error.message.toLowerCase();
    if (msg.includes('network error') || msg.includes('offline') || msg.includes('failed to fetch')) {
      return true;
    }
  }

  return false;
}

export async function fetchKidHome(): Promise<ApiEnvelope<KidHomeData>> {
  const response = await apiClient.get<ApiEnvelope<KidHomeData>>('/kid/home');
  return response.data;
}

export async function fetchJourneyMap(podId?: string): Promise<ApiEnvelope<JourneyMapData>> {
  const url = podId ? `/kid/pods/${podId}/journey-map` : '/kid/journey-map';
  const response = await apiClient.get<ApiEnvelope<JourneyMapData>>(url);
  return response.data;
}

export async function fetchLessonDetail(
  lessonId: string,
): Promise<ApiEnvelope<LessonDetailData>> {
  const response = await apiClient.get<ApiEnvelope<LessonDetailData>>(`/kid/lessons/${lessonId}`);
  return response.data;
}

export async function updateLessonProgress(
  lessonId: string,
  payload: UpdateLessonProgressPayload,
): Promise<ApiEnvelope<UpdateLessonProgressData>> {
  const response = await apiClient.put<ApiEnvelope<UpdateLessonProgressData>>(
    `/kid/lessons/${lessonId}/progress`,
    payload,
  );
  return response.data;
}

export async function fetchQuizDetail(quizId: string): Promise<ApiEnvelope<QuizDetailData>> {
  const response = await apiClient.get<ApiEnvelope<QuizDetailData>>(`/kid/quizzes/${quizId}`);
  return response.data;
}

export async function fetchLessonQuiz(lessonId: string): Promise<ApiEnvelope<QuizDetailData>> {
  const response = await apiClient.get<ApiEnvelope<QuizDetailData>>(`/kid/lessons/${lessonId}/quiz`);
  return response.data;
}

export async function checkQuizAnswer(
  quizId: string,
  payload: CheckQuizAnswerPayload,
): Promise<ApiEnvelope<CheckQuizAnswerData>> {
  const response = await apiClient.post<ApiEnvelope<CheckQuizAnswerData>>(
    `/kid/quizzes/${quizId}/check`,
    payload,
  );
  return response.data;
}

export async function submitQuizAttempt(
  quizId: string,
  payload: SubmitQuizAttemptPayload,
): Promise<ApiEnvelope<SubmitQuizAttemptData>> {
  const response = await apiClient.post<ApiEnvelope<SubmitQuizAttemptData>>(
    `/kid/quizzes/${quizId}/attempts`,
    payload,
  );
  return response.data;
}

export async function requestAttachmentSignedUrl(
  lessonId: string,
  attachmentId: string,
): Promise<ApiEnvelope<SignedAttachmentUrlData>> {
  const response = await apiClient.post<ApiEnvelope<SignedAttachmentUrlData>>(
    `/kid/lessons/${lessonId}/attachments/${attachmentId}/signed-url`,
  );
  return response.data;
}
