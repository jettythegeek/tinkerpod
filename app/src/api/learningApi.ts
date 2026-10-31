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

export type TitleValue =
  | string
  | {
      readonly slug: string;
      readonly name: string;
      readonly min_level?: number;
    }
  | null
  | undefined;

export function resolveTitleName(value: TitleValue, fallback: string): string {
  if (!value) {
    return fallback;
  }
  if (typeof value === 'string') {
    return value;
  }
  return value.name || fallback;
}

export interface RewardStreakSnapshotDto {
  readonly current_streak: number;
  readonly best_streak: number;
  readonly status: 'active' | 'grace' | 'streak_paused' | string;
  readonly is_paused: boolean;
  readonly last_active_date: string | null;
  readonly grace_days_used: number;
  readonly grace_days_allowed: number;
  readonly timezone: string;
  readonly message: string | null;
}

export interface RewardTitleLadderEntryDto {
  readonly slug: string;
  readonly name: string;
  readonly min_level: number;
  readonly unlocked: boolean;
  readonly is_current: boolean;
}

export interface RewardBadgeDto {
  readonly id?: string;
  readonly slug: string;
  readonly name: string;
  readonly description: string | null;
  readonly icon: string;
  readonly color: string;
  readonly condition_type?: string;
  readonly condition_value?: number;
  readonly is_earned?: boolean;
  readonly earned_at?: string | null;
}

export type RewardPresentationTier = 'small' | 'level_up' | 'badge' | 'streak' | 'big';

export interface RewardResultDto {
  readonly ledger_entries: readonly {
    readonly id: string;
    readonly currency: 'xp' | 'coins' | 'gems' | string;
    readonly amount: number;
    readonly source_type: string;
    readonly source_id: string;
    readonly rule_version: number;
    readonly idempotency_key: string;
  }[];
  readonly totals: {
    readonly xp: number;
    readonly coins: number;
    readonly gems: number;
  };
  readonly level_change: {
    readonly previous_level: number;
    readonly current_level: number;
    readonly leveled_up: boolean;
  };
  readonly new_badges: readonly RewardBadgeDto[];
  readonly streak_change: {
    readonly previous_streak: number;
    readonly current_streak: number;
    readonly best_streak: number;
    readonly incremented: boolean;
    readonly status: string;
    readonly last_active_date: string | null;
    readonly grace_days_used: number;
    readonly message: string | null;
  } | null;
  readonly current_title: {
    readonly slug: string;
    readonly name: string;
  } | null;
  readonly next_title: {
    readonly slug: string;
    readonly name: string;
    readonly min_level: number;
  } | null;
  readonly new_title: {
    readonly slug: string;
    readonly name: string;
  } | null;
  readonly presentation_tier: RewardPresentationTier;
  readonly was_replayed: boolean;
}

export interface KidRewardsHudDto {
  readonly xp: number;
  readonly coins: number;
  readonly gems: number;
  readonly level: number;
  readonly current_level_xp: number;
  readonly next_level_xp: number | null;
  readonly xp_in_level: number;
  readonly xp_for_next_level: number;
  readonly progress_percent: number;
  readonly title: TitleValue;
  readonly next_title: TitleValue;
  readonly title_ladder: readonly RewardTitleLadderEntryDto[];
  readonly streak: RewardStreakSnapshotDto;
}

export interface KidRewardsData {
  readonly rewards: KidRewardsHudDto;
}

export interface KidProfileSummaryDto extends KidRewardsHudDto {
  readonly stats: {
    readonly streak_days: number;
    readonly best_streak_days: number;
    readonly total_xp: number;
    readonly coins: number;
    readonly gems: number;
    readonly level: number;
    readonly badges_earned_count: number;
    readonly badges_total_count: number;
  };
  readonly badges: {
    readonly earned_count: number;
    readonly total_count: number;
    readonly earned: readonly RewardBadgeDto[];
    readonly locked: readonly RewardBadgeDto[];
    readonly all: readonly RewardBadgeDto[];
  };
}

export interface KidProfileFullData {
  readonly child: KidProfileDto;
  readonly profile: KidProfileSummaryDto;
}

export interface KidHomeData {
  readonly child: KidProfileDto;
  readonly gamification: {
    readonly xp: number;
    readonly next_level_xp: number;
    readonly xp_in_level?: number;
    readonly xp_for_next_level?: number;
    readonly progress_percent?: number;
    readonly level: number;
    readonly title: TitleValue;
    readonly next_title: TitleValue;
    readonly coins: number;
    readonly gems: number;
    readonly stars: number;
    readonly streak_days: number;
    readonly streak?: RewardStreakSnapshotDto;
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
  readonly reward_result?: RewardResultDto | null;
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
  readonly open_attempt_id?: string | null;
  readonly is_demo: boolean;
  readonly questions: readonly QuizQuestionDto[];
}

export interface QuizDetailData {
  readonly quiz: QuizDetailDto;
}

export interface StartQuizAttemptData {
  readonly attempt: {
    readonly id: string;
    readonly quiz_id: string;
    readonly attempt_number: number;
    readonly status: 'open' | 'submitted';
    readonly attempts_used: number;
    readonly max_attempts: number;
    readonly remaining_attempts: number;
    readonly total_points: number;
    readonly replayed: boolean;
  };
}

export interface CheckQuizAnswerPayload {
  readonly attempt_id?: string;
  readonly question_id: string;
  readonly option_id?: string;
  readonly option_key?: string;
}

export interface CheckQuizAnswerData {
  readonly attempt_id?: string;
  readonly quiz_id: string;
  readonly question_id: string;
  readonly option_id: string;
  readonly option_key: string;
  readonly is_correct: boolean;
  readonly is_first_answer?: boolean;
  readonly is_retry?: boolean;
  readonly points_awarded: number;
  readonly recorded_points?: number;
  readonly feedback: string;
  readonly explanation: string;
}

export interface SubmitQuizAttemptPayload {
  readonly action?: 'start' | 'finish';
  readonly attempt_id?: string;
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
  readonly reward_result?: RewardResultDto | null;
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

export async function fetchKidRewards(): Promise<ApiEnvelope<KidRewardsData>> {
  const response = await apiClient.get<ApiEnvelope<KidRewardsData>>('/kid/rewards');
  return response.data;
}

export async function fetchKidProfile(): Promise<ApiEnvelope<KidProfileFullData>> {
  const response = await apiClient.get<ApiEnvelope<KidProfileFullData>>('/kid/profile');
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

export async function startQuizAttempt(
  quizId: string,
  idempotencyKey?: string,
): Promise<ApiEnvelope<StartQuizAttemptData>> {
  const response = await apiClient.post<ApiEnvelope<StartQuizAttemptData>>(
    `/kid/quizzes/${quizId}/attempts`,
    idempotencyKey ? { idempotency_key: idempotencyKey } : {},
  );
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

export async function finishQuizAttempt(
  quizId: string,
  attemptId: string,
  idempotencyKey?: string,
): Promise<ApiEnvelope<SubmitQuizAttemptData>> {
  const response = await apiClient.post<ApiEnvelope<SubmitQuizAttemptData>>(
    `/kid/quizzes/${quizId}/attempts/${attemptId}/finish`,
    idempotencyKey ? { idempotency_key: idempotencyKey } : {},
  );
  return response.data;
}

export async function submitQuizAttempt(
  quizId: string,
  payload: SubmitQuizAttemptPayload,
): Promise<ApiEnvelope<SubmitQuizAttemptData>> {
  const response = await apiClient.post<ApiEnvelope<SubmitQuizAttemptData>>(
    `/kid/quizzes/${quizId}/attempts`,
    {
      action: 'finish',
      ...payload,
    },
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
