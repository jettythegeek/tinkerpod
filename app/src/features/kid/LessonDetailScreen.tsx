import React, { useCallback, useEffect, useState } from 'react';
import {
  ImageBackground,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useVideoPlayer, VideoView } from 'expo-video';

import { extractApiErrorMessage } from '../../api/client';
import {
  fetchLessonDetail,
  isOfflineError,
  LessonDetailDto,
  LessonProgressDto,
  updateLessonProgress,
} from '../../api/learningApi';
import { APPROVED_LESSON_LOOPS_ASSET } from '../../assets/approvedAssets';
import { TpButton, TpCard, TpErrorBanner } from '../../components/DesignSystem';
import { TpIcon } from '../../components/TpIcon';
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
  summary:
    'Teach Captain Jetty to repeat actions without typing the same code ten times.',
  body: "In this lesson, Captain Jetty shows how Python's `for i in range(n):` loop repeats commands cleanly and accurately.",
  learning_objectives: [
    'Understand why loops save time',
    'Write a simple repeat block',
    'Count from 1 to 10 with a loop',
    'Fix a loop that runs one too many times',
  ],
  thumbnail_asset: 'design/assets/lesson-loops.jpg',
  intro_video_url:
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
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
  const { tokens, muted } = useTheme();
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
    <View testID="lesson-detail-screen" style={styles.root}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Hero Image Header (03-lesson-detail.png with lesson-loops.jpg) */}
        <ImageBackground
          testID="lesson-detail-hero-image"
          source={APPROVED_LESSON_LOOPS_ASSET}
          style={styles.heroImageBg}
        >
          <View style={styles.heroDarkOverlay}>
            <View style={styles.heroTopBar}>
              <Pressable
                testID="lesson-detail-back-btn"
                accessibilityRole="button"
                accessibilityLabel="Back"
                onPress={onBack}
                style={styles.heroBackBtn}
              >
                <TpIcon name="chevron-left" size={20} color="#FFFFFF" />
              </Pressable>

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
                <TpIcon name="circle-play" size={14} color="#FFFFFF" />
                <Text style={[styles.watchIntroText, { fontFamily: tokens.fonts.extrabold }]}>
                  Watch intro · {formatDurationMmSs(activeLesson.intro_video_duration_seconds)}
                </Text>
              </Pressable>
            </View>
          </View>
        </ImageBackground>

        {/* Overlapping Content Card matching 03-lesson-detail.png */}
        <View style={styles.sheetContainer}>
          <View style={styles.worldChip}>
            <TpIcon name="repeat" size={13} color="#6B2FD6" />
            <Text style={[styles.worldChipText, { fontFamily: tokens.fonts.extrabold }]}>
              {(activeLesson.world?.title ?? 'LOOPS VALLEY').toUpperCase()} · LESSON{' '}
              {activeLesson.lesson_number} OF 5
            </Text>
          </View>

          <Text style={[styles.lessonTitle, { fontFamily: tokens.fonts.black }]}>
            {activeLesson.title}
          </Text>

          {activeLesson.summary ? (
            <Text style={[styles.lessonSummary, { fontFamily: tokens.fonts.bold }]}>
              {activeLesson.summary}
            </Text>
          ) : null}

          {/* Meta Chips with Lucide clock, signal, footprints */}
          <View style={styles.metaRow}>
            <View style={styles.metaChip}>
              <TpIcon name="clock" size={13} color="#475569" />
              <Text style={[styles.metaChipText, { fontFamily: tokens.fonts.extrabold }]}>
                {activeLesson.duration_minutes} min
              </Text>
            </View>
            <View style={styles.metaChip}>
              <TpIcon name="signal" size={13} color="#475569" />
              <Text style={[styles.metaChipText, { fontFamily: tokens.fonts.extrabold }]}>
                {activeLesson.difficulty}
              </Text>
            </View>
            <View style={styles.metaChip}>
              <TpIcon name="footprints" size={13} color="#475569" />
              <Text style={[styles.metaChipText, { fontFamily: tokens.fonts.extrabold }]}>
                {activeLesson.steps_count} steps
              </Text>
            </View>
          </View>

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

          {/* Expo Video Intro Player */}
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

          {/* What You'll Learn Card */}
          <View style={styles.objectivesCard}>
            <Text style={[styles.cardHeading, { fontFamily: tokens.fonts.black }]}>
              What you&apos;ll learn
            </Text>
            <View style={styles.objectivesList}>
              {activeLesson.learning_objectives.map((objective, index) => (
                <View key={`${index}-${objective}`} style={styles.objectiveRow}>
                  <View style={styles.objectiveCheck}>
                    <TpIcon name="check" size={12} color="#FFFFFF" />
                  </View>
                  <Text style={[styles.objectiveText, { fontFamily: tokens.fonts.bold }]}>
                    {objective}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* Rewards Bar */}
          <View style={styles.rewardsCard} testID="lesson-rewards-preview-stub">
            <Text style={[styles.rewardsLabel, { fontFamily: tokens.fonts.black }]}>
              Rewards
            </Text>
            <View style={styles.rewardsChipsRow}>
              <View style={[styles.rewardChip, { backgroundColor: '#EDE9FE' }]}>
                <TpIcon name="xp" size={12} color="#6B2FD6" />
                <Text style={[styles.rewardChipText, { color: '#6B2FD6', fontFamily: tokens.fonts.extrabold }]}>
                  +{activeLesson.rewards_preview.xp} XP
                </Text>
              </View>
              <View style={[styles.rewardChip, { backgroundColor: '#FEF3C7' }]}>
                <TpIcon name="coin" size={12} color="#92400E" />
                <Text style={[styles.rewardChipText, { color: '#92400E', fontFamily: tokens.fonts.extrabold }]}>
                  +{activeLesson.rewards_preview.coins}
                </Text>
              </View>
              {activeLesson.rewards_preview.gems > 0 ? (
                <View style={[styles.rewardChip, { backgroundColor: '#CCFBF1' }]}>
                  <TpIcon name="gem" size={12} color="#0F766E" />
                  <Text style={[styles.rewardChipText, { color: '#0F766E', fontFamily: tokens.fonts.extrabold }]}>
                    +{activeLesson.rewards_preview.gems}
                  </Text>
                </View>
              ) : null}
            </View>
          </View>

          {/* Start Lesson Button with Lucide arrow-right */}
          <Pressable
            testID="lesson-start-btn"
            accessibilityRole="button"
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
            style={styles.startLessonButton}
          >
            <Text style={[styles.startLessonText, { fontFamily: tokens.fonts.black }]}>
              Start Lesson
            </Text>
            <TpIcon name="arrow-right" size={18} color="#FFFFFF" />
          </Pressable>

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
    backgroundColor: '#FAF8FF',
  },
  scrollContent: {
    paddingBottom: 28,
  },
  heroImageBg: {
    height: 196,
  },
  heroDarkOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15,23,42,0.28)',
    paddingHorizontal: 16,
    paddingTop: 14,
  },
  heroTopBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  heroBackBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(15,23,42,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  watchIntroPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(15,23,42,0.62)',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 9999,
  },
  watchIntroText: {
    fontSize: 12,
    color: '#FFFFFF',
  },
  sheetContainer: {
    marginTop: -22,
    backgroundColor: '#FAF8FF',
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    paddingHorizontal: 18,
    paddingTop: 18,
    gap: 12,
  },
  worldChip: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#EDE9FE',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 9999,
  },
  worldChipText: {
    fontSize: 11,
    color: '#6B2FD6',
  },
  lessonTitle: {
    fontSize: 22,
    color: '#0F172A',
  },
  lessonSummary: {
    fontSize: 13,
    lineHeight: 19,
    color: '#64748B',
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  metaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 11,
    paddingVertical: 5,
    borderRadius: 9999,
  },
  metaChipText: {
    fontSize: 12,
    color: '#475569',
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
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: '#EEF2FF',
    gap: 10,
  },
  cardHeading: {
    fontSize: 15,
    color: '#0F172A',
  },
  objectivesList: {
    gap: 8,
  },
  objectiveRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  objectiveCheck: {
    width: 22,
    height: 22,
    borderRadius: 7,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
  },
  objectiveText: {
    flex: 1,
    fontSize: 13,
    color: '#0F172A',
  },
  rewardsCard: {
    backgroundColor: '#F5F3FF',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#DDD6FE',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rewardsLabel: {
    fontSize: 12,
    color: '#4C1D95',
  },
  rewardsChipsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  rewardChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 9999,
  },
  rewardChipText: {
    fontSize: 11,
  },
  startLessonButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#6B2FD6',
    borderRadius: 16,
    paddingVertical: 15,
    marginTop: 4,
  },
  startLessonText: {
    fontSize: 16,
    color: '#FFFFFF',
  },
});
