import React, { useCallback, useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useVideoPlayer, VideoView } from 'expo-video';
import { extractApiErrorMessage } from '../../api/client';
import {
  fetchLessonDetail,
  isOfflineError,
  LessonDetailDto,
  LessonProgressDto,
  updateLessonProgress,
} from '../../api/learningApi';
import { TpButton, TpCard, TpErrorBanner } from '../../components/DesignSystem';
import { PipIdleSvg } from '../../pip';
import { useTheme } from '../../theme';
import { useAuth } from '../auth/AuthContext';
import { LearningScreenState } from './components/LearningScreenState';

export interface LessonDetailScreenProps {
  readonly lessonId?: string;
  readonly initialLesson?: LessonDetailDto | null;
  readonly screenState?: 'loading' | 'empty' | 'error' | 'offline';
  readonly errorMessage?: string;
  readonly autoFetch?: boolean;
  readonly onBack?: () => void;
  readonly onStartQuiz?: (quizId: string, lessonId: string) => void;
}

export const DEFAULT_DEMO_LESSON: LessonDetailDto = {
  id: '01J0000000000000000LESSON2',
  slug: 'repeat-and-count',
  lesson_number: 2,
  title: 'Repeat and Count',
  summary: 'Teach Captain Jetty to repeat actions without typing the same code ten times.',
  body: "In this lesson, Captain Jetty shows how Python's `for i in range(n):` loop repeats commands cleanly and accurately.",
  learning_objectives: [
    'Understand why loops save time',
    'Write a simple repeat block',
    'Count from 1 to 10 with a loop',
    'Fix a loop that runs one too many times',
  ],
  thumbnail_asset: 'design/assets/pip/pip-idle.svg',
  intro_video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
  intro_video_duration_seconds: 80,
  duration_minutes: 8,
  difficulty: 'Beginner',
  steps_count: 5,
  completion_mode: 'quiz_pass',
  required_watch_percent: 80,
  is_demo: true,
  rewards_preview: {
    xp: 50,
    coins: 15,
    gems: 1,
  },
  world: {
    id: '01J00000000000000000WORLD4',
    world_number: 4,
    title: 'Loops Valley',
    icon: 'repeat',
  },
  module: {
    id: '01J0000000000000000MODULE4',
    title: 'Loops Valley',
  },
  progress: {
    resume_position_seconds: 0,
    watch_percent: 0,
    manual_completed: false,
    quiz_passed: false,
    is_completed: false,
    completed_at: null,
  },
  quizzes: [
    {
      id: '01J000000000000000000QUIZ1',
      title: 'Repeat and Count: range() Quiz',
      description: 'Check how Python range() loops count numbers.',
      pass_mark_percent: 75,
      max_attempts: 3,
      questions_count: 4,
      is_demo: true,
    },
  ],
  projects: [],
  attachments: [],
};

function formatDurationMmSs(totalSeconds: number): string {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const mins = Math.floor(safe / 60);
  const secs = safe % 60;
  return `${mins}:${secs < 10 ? `0${secs}` : secs}`;
}

export function LessonDetailScreen({
  lessonId,
  initialLesson,
  screenState,
  errorMessage,
  autoFetch,
  onBack,
  onStartQuiz,
}: LessonDetailScreenProps = {}): React.JSX.Element {
  const { tokens, reducedMotion, muted } = useTheme();
  const { token } = useAuth();

  const shouldFetch =
    autoFetch ?? Boolean(token && initialLesson === undefined && !screenState && lessonId);

  const [lesson, setLesson] = useState<LessonDetailDto | null>(
    initialLesson !== undefined ? initialLesson : DEFAULT_DEMO_LESSON,
  );
  const [progress, setProgress] = useState<LessonProgressDto>(
    initialLesson?.progress ?? DEFAULT_DEMO_LESSON.progress,
  );
  const [status, setStatus] = useState<'idle' | 'loading' | 'empty' | 'error' | 'offline'>(
    screenState ?? (shouldFetch ? 'loading' : 'idle'),
  );
  const [errorText, setErrorText] = useState<string | undefined>(errorMessage);
  const [actionError, setActionError] = useState<string | null>(null);
  const [showVideoPlayer, setShowVideoPlayer] = useState<boolean>(false);
  const [isSavingProgress, setIsSavingProgress] = useState<boolean>(false);

  const videoSource = lesson?.intro_video_url ?? DEFAULT_DEMO_LESSON.intro_video_url ?? '';
  const player = useVideoPlayer(videoSource, (instance) => {
    instance.loop = false;
    instance.muted = muted;
  });

  const loadLesson = useCallback(async () => {
    const targetId = lessonId ?? DEFAULT_DEMO_LESSON.id;
    setStatus('loading');
    setErrorText(undefined);
    try {
      const res = await fetchLessonDetail(targetId);
      if (!res.data.lesson) {
        setLesson(null);
        setStatus('empty');
      } else {
        setLesson(res.data.lesson);
        setProgress(res.data.lesson.progress);
        setStatus('idle');
      }
    } catch (err) {
      setErrorText(extractApiErrorMessage(err, 'Could not load this lesson.'));
      setStatus(isOfflineError(err) ? 'offline' : 'error');
    }
  }, [lessonId]);

  useEffect(() => {
    if (screenState) {
      setStatus(screenState);
      return;
    }
    if (shouldFetch) {
      void loadLesson();
    }
  }, [loadLesson, screenState, shouldFetch]);

  const handleRecordProgress = useCallback(
    async (nextResumeSeconds: number, nextWatchPercent: number, markComplete = false) => {
      const activeLesson = lesson ?? DEFAULT_DEMO_LESSON;
      setIsSavingProgress(true);
      setActionError(null);
      try {
        const res = await updateLessonProgress(activeLesson.id, {
          resume_position_seconds: nextResumeSeconds,
          watch_percent: nextWatchPercent,
          mark_complete: markComplete,
        });
        setProgress(res.data.progress);
      } catch (err) {
        setActionError(extractApiErrorMessage(err, 'Could not save lesson progress.'));
      } finally {
        setIsSavingProgress(false);
      }
    },
    [lesson],
  );

  if (status === 'loading' || status === 'empty' || status === 'error' || status === 'offline') {
    return (
      <LearningScreenState
        state={status}
        message={errorText}
        onRetry={() => {
          void loadLesson();
        }}
        onBack={onBack}
      />
    );
  }

  const activeLesson = lesson ?? DEFAULT_DEMO_LESSON;
  const primaryQuiz = activeLesson.quizzes[0] ?? null;

  return (
    <View testID="lesson-detail-screen" style={[styles.root, { backgroundColor: tokens.colors.bg }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Hero Header (03-lesson-detail.png) */}
        <View style={[styles.heroBox, { backgroundColor: tokens.colors.kidPurple }]}>
          <View style={styles.heroTopBar}>
            <Pressable
              testID="lesson-detail-back-btn"
              accessibilityRole="button"
              accessibilityLabel="Back"
              onPress={onBack}
              style={styles.heroIconBtn}
            >
              <Text style={[styles.heroIconBtnText, { fontFamily: tokens.fonts.black }]}>←</Text>
            </Pressable>
            <Text style={[styles.heroBreadcrumb, { fontFamily: tokens.fonts.extrabold }]}>
              {activeLesson.world?.title ?? 'Loops Valley'} · Lesson {activeLesson.lesson_number}
            </Text>
            <View style={styles.heroIconBtn}>
              <Text style={[styles.heroIconBtnText, { fontFamily: tokens.fonts.black }]}>
                {progress.is_completed ? '✓' : '★'}
              </Text>
            </View>
          </View>

          <View style={styles.heroStage}>
            <PipIdleSvg size={104} reducedMotion={reducedMotion} />
            <Pressable
              testID="watch-intro-btn"
              accessibilityRole="button"
              accessibilityLabel={`Watch intro ${formatDurationMmSs(activeLesson.intro_video_duration_seconds)}`}
              onPress={() => {
                setShowVideoPlayer(true);
                try {
                  if (progress.resume_position_seconds > 0) {
                    player.currentTime = progress.resume_position_seconds;
                  }
                  player.play();
                } catch {
                  // Ignore player error in test environment
                }
              }}
              style={styles.watchIntroPill}
            >
              <Text
                style={[
                  styles.watchIntroText,
                  { color: tokens.colors.ink, fontFamily: tokens.fonts.extrabold },
                ]}
              >
                ▶ Watch intro · {formatDurationMmSs(activeLesson.intro_video_duration_seconds)}
              </Text>
            </Pressable>
          </View>

          <Text style={[styles.heroTitle, { fontFamily: tokens.fonts.black }]}>
            {activeLesson.title}
          </Text>
          {activeLesson.summary ? (
            <Text style={[styles.heroSummary, { fontFamily: tokens.fonts.semibold }]}>
              {activeLesson.summary}
            </Text>
          ) : null}

          <View style={styles.metaPillsRow}>
            <View style={styles.metaPill}>
              <Text style={[styles.metaPillText, { fontFamily: tokens.fonts.extrabold }]}>
                ⏱ {activeLesson.duration_minutes} min
              </Text>
            </View>
            <View style={styles.metaPill}>
              <Text style={[styles.metaPillText, { fontFamily: tokens.fonts.extrabold }]}>
                ⚡ {activeLesson.difficulty}
              </Text>
            </View>
            <View style={styles.metaPill}>
              <Text style={[styles.metaPillText, { fontFamily: tokens.fonts.extrabold }]}>
                ▤ {activeLesson.steps_count} steps
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.bodyPadding}>
          <TpErrorBanner message={actionError} testID="lesson-progress-error" />

          {/* Resume Progress Banner */}
          {progress.watch_percent > 0 || progress.resume_position_seconds > 0 ? (
            <TpCard style={styles.resumeCard} testID="lesson-resume-banner">
              <Text
                style={[
                  styles.resumeText,
                  { color: tokens.colors.ink, fontFamily: tokens.fonts.extrabold },
                ]}
              >
                Progress saved: {progress.watch_percent}% watched · Resume at{' '}
                {formatDurationMmSs(progress.resume_position_seconds)}
              </Text>
            </TpCard>
          ) : null}

          {/* Expo Video Intro Player (M2.9) */}
          {showVideoPlayer ? (
            <TpCard style={styles.videoCard} testID="lesson-video-player-card">
              <Text
                style={[
                  styles.cardHeading,
                  { color: tokens.colors.ink, fontFamily: tokens.fonts.extrabold },
                ]}
              >
                Lesson Intro Video
              </Text>
              <VideoView
                testID="lesson-expo-video-view"
                player={player}
                style={styles.videoView}
                nativeControls
              />
              <View style={styles.videoControlsRow}>
                <View style={styles.flexOne}>
                  <TpButton
                    testID="video-progress-50-btn"
                    label="Save 50% Watched"
                    variant="ghost"
                    loading={isSavingProgress}
                    onPress={() => {
                      void handleRecordProgress(
                        Math.round(activeLesson.intro_video_duration_seconds * 0.5),
                        50,
                      );
                    }}
                  />
                </View>
                <View style={styles.flexOne}>
                  <TpButton
                    testID="video-progress-100-btn"
                    label="Finish Intro (100%)"
                    variant="teal"
                    loading={isSavingProgress}
                    onPress={() => {
                      void handleRecordProgress(
                        activeLesson.intro_video_duration_seconds,
                        100,
                      );
                    }}
                  />
                </View>
              </View>
            </TpCard>
          ) : null}

          {/* What you'll learn Card */}
          <TpCard style={styles.objectivesCard}>
            <Text
              style={[
                styles.cardHeading,
                { color: tokens.colors.ink, fontFamily: tokens.fonts.extrabold },
              ]}
            >
              What you’ll learn
            </Text>
            <View style={styles.objectivesList}>
              {activeLesson.learning_objectives.map((objective, index) => (
                <View key={`${index}-${objective}`} style={styles.objectiveRow}>
                  <View
                    style={[
                      styles.objectiveCheck,
                      { backgroundColor: tokens.colors.success },
                    ]}
                  >
                    <Text
                      style={[
                        styles.objectiveCheckText,
                        { fontFamily: tokens.fonts.black },
                      ]}
                    >
                      ✓
                    </Text>
                  </View>
                  <Text
                    style={[
                      styles.objectiveText,
                      { color: tokens.colors.ink, fontFamily: tokens.fonts.bold },
                    ]}
                  >
                    {objective}
                  </Text>
                </View>
              ))}
            </View>
          </TpCard>

          {/* Rewards Slot (M3 Stubbed Preview) */}
          <TpCard style={styles.rewardsCard} testID="lesson-rewards-preview-stub">
            <Text
              style={[
                styles.rewardsLabel,
                { color: '#64748B', fontFamily: tokens.fonts.extrabold },
              ]}
            >
              Rewards
            </Text>
            <View style={styles.rewardsChipsRow}>
              <View style={[styles.rewardChip, { backgroundColor: '#F3E8FF' }]}>
                <Text
                  style={[
                    styles.rewardChipText,
                    { color: '#6D28D9', fontFamily: tokens.fonts.black },
                  ]}
                >
                  +{activeLesson.rewards_preview.xp} XP
                </Text>
              </View>
              <View style={[styles.rewardChip, { backgroundColor: '#FEF3C7' }]}>
                <Text
                  style={[
                    styles.rewardChipText,
                    { color: '#B45309', fontFamily: tokens.fonts.black },
                  ]}
                >
                  +{activeLesson.rewards_preview.coins}
                </Text>
              </View>
              {activeLesson.rewards_preview.gems > 0 ? (
                <View style={[styles.rewardChip, { backgroundColor: '#E0F2FE' }]}>
                  <Text
                    style={[
                      styles.rewardChipText,
                      { color: '#0369A1', fontFamily: tokens.fonts.black },
                    ]}
                  >
                    +{activeLesson.rewards_preview.gems}
                  </Text>
                </View>
              ) : null}
            </View>
          </TpCard>

          {/* Primary CTA: Start Lesson / Quiz */}
          <TpButton
            testID="lesson-start-btn"
            label="Start Lesson  ▶"
            variant="teal"
            onPress={() => {
              if (primaryQuiz && onStartQuiz) {
                onStartQuiz(primaryQuiz.id, activeLesson.id);
              } else {
                void handleRecordProgress(
                  activeLesson.intro_video_duration_seconds,
                  100,
                  true,
                );
              }
            }}
          />

          {activeLesson.completion_mode === 'manual' && !progress.is_completed ? (
            <TpButton
              testID="lesson-mark-done-btn"
              label="I'm done!"
              variant="ghost"
              loading={isSavingProgress}
              onPress={() => {
                void handleRecordProgress(
                  progress.resume_position_seconds,
                  progress.watch_percent,
                  true,
                );
              }}
            />
          ) : null}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 28,
  },
  heroBox: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 22,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    gap: 10,
  },
  heroTopBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  heroIconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroIconBtnText: {
    fontSize: 16,
    color: '#FFFFFF',
  },
  heroBreadcrumb: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.9)',
  },
  heroStage: {
    height: 128,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.14)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginVertical: 4,
  },
  watchIntroPill: {
    backgroundColor: '#FFFFFF',
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  watchIntroText: {
    fontSize: 13,
  },
  heroTitle: {
    fontSize: 24,
    color: '#FFFFFF',
  },
  heroSummary: {
    fontSize: 14,
    lineHeight: 20,
    color: 'rgba(255,255,255,0.9)',
  },
  metaPillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  metaPill: {
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  metaPillText: {
    fontSize: 12,
    color: '#FFFFFF',
  },
  bodyPadding: {
    paddingHorizontal: 20,
    paddingTop: 16,
    gap: 14,
  },
  resumeCard: {
    padding: 12,
    backgroundColor: '#E6FBF8',
    borderColor: '#99F6E4',
  },
  resumeText: {
    fontSize: 13,
  },
  videoCard: {
    padding: 14,
    gap: 10,
  },
  videoView: {
    width: '100%',
    height: 180,
    borderRadius: 14,
    backgroundColor: '#0F172A',
  },
  videoControlsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  flexOne: {
    flex: 1,
  },
  objectivesCard: {
    padding: 16,
    gap: 10,
  },
  cardHeading: {
    fontSize: 16,
  },
  objectivesList: {
    gap: 10,
  },
  objectiveRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  objectiveCheck: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  objectiveCheckText: {
    fontSize: 12,
    color: '#FFFFFF',
  },
  objectiveText: {
    flex: 1,
    fontSize: 14,
  },
  rewardsCard: {
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rewardsLabel: {
    fontSize: 13,
  },
  rewardsChipsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  rewardChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  rewardChipText: {
    fontSize: 12,
  },
});
