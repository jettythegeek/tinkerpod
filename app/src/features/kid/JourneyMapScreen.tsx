import React, { useCallback, useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { extractApiErrorMessage } from '../../api/client';
import {
  fetchJourneyMap,
  isOfflineError,
  JourneyWorldDto,
  PodJourneyMapDto,
} from '../../api/learningApi';
import { TpButton, TpCard } from '../../components/DesignSystem';
import { PipIdleSvg } from '../../pip';
import { useTheme } from '../../theme';
import { useAuth } from '../auth/AuthContext';
import { KidBottomNav } from './components/KidBottomNav';
import { LearningScreenState } from './components/LearningScreenState';
import { getGamificationStub } from './gamificationStub';

export interface JourneyMapScreenProps {
  readonly podId?: string;
  readonly initialPod?: PodJourneyMapDto | null;
  readonly screenState?: 'loading' | 'empty' | 'error' | 'offline';
  readonly errorMessage?: string;
  readonly autoFetch?: boolean;
  readonly onBack?: () => void;
  readonly onNavigateHome?: () => void;
  readonly onOpenLesson?: (lessonId: string) => void;
}

const DEFAULT_DEMO_POD_MAP: PodJourneyMapDto = {
  id: '01J0000000000000000000POD1',
  slug: 'coding-pod',
  title: 'Coding Pod',
  description: 'Learn logic, functions, loops, and game building step by step.',
  icon: 'laptop-code',
  is_demo: true,
  cleared_worlds_count: 3,
  total_worlds_count: 6,
  current_world: null,
  current_lesson: {
    id: '01J0000000000000000LESSON2',
    slug: 'repeat-and-count',
    lesson_number: 2,
    position_in_world: 2,
    total_in_world: 5,
    title: 'Repeat and Count',
    summary: 'Teach Captain Jetty to repeat actions without typing the same code ten times.',
    thumbnail_asset: null,
    duration_minutes: 8,
    difficulty: 'Beginner',
    steps_count: 5,
    state: 'now',
    is_completed: false,
    watch_percent: 40,
    resume_position_seconds: 32,
    world_id: '01J00000000000000000WORLD4',
    world_number: 4,
    world_title: 'Loops Valley',
  },
  worlds: [
    {
      id: '01J00000000000000000WORLD1',
      slug: 'welcome-island',
      world_number: 1,
      title: 'Welcome Island',
      description: 'Meet Captain Jetty and run your first commands.',
      icon: 'island',
      map_x: 112,
      map_y: 830,
      state: 'done',
      completed_lessons_count: 4,
      total_lessons_count: 4,
      lessons: [],
    },
    {
      id: '01J00000000000000000WORLD2',
      slug: 'logic-land',
      world_number: 2,
      title: 'Logic Land',
      description: 'Make smart choices with if and else blocks.',
      icon: 'puzzle',
      map_x: 274,
      map_y: 690,
      state: 'done',
      completed_lessons_count: 4,
      total_lessons_count: 4,
      lessons: [],
    },
    {
      id: '01J00000000000000000WORLD3',
      slug: 'functions-forest',
      world_number: 3,
      title: 'Functions Forest',
      description: 'Bundle reusable commands into neat functions.',
      icon: 'trees',
      map_x: 108,
      map_y: 550,
      state: 'done',
      completed_lessons_count: 4,
      total_lessons_count: 4,
      lessons: [],
    },
    {
      id: '01J00000000000000000WORLD4',
      slug: 'loops-valley',
      world_number: 4,
      title: 'Loops Valley',
      description: 'Repeat actions and count with Python loops.',
      icon: 'repeat',
      map_x: 266,
      map_y: 410,
      state: 'now',
      completed_lessons_count: 1,
      total_lessons_count: 5,
      lessons: [
        {
          id: '01J0000000000000000LESSON1',
          slug: 'meet-the-loop',
          lesson_number: 1,
          position_in_world: 1,
          total_in_world: 5,
          title: 'Meet the Loop',
          summary: 'Discover why coders use loops.',
          thumbnail_asset: null,
          duration_minutes: 6,
          difficulty: 'Beginner',
          steps_count: 4,
          state: 'done',
          is_completed: true,
          watch_percent: 100,
          resume_position_seconds: 60,
          world_id: '01J00000000000000000WORLD4',
          world_number: 4,
          world_title: 'Loops Valley',
        },
        {
          id: '01J0000000000000000LESSON2',
          slug: 'repeat-and-count',
          lesson_number: 2,
          position_in_world: 2,
          total_in_world: 5,
          title: 'Repeat and Count',
          summary: 'Teach Captain Jetty to repeat actions without typing the same code ten times.',
          thumbnail_asset: null,
          duration_minutes: 8,
          difficulty: 'Beginner',
          steps_count: 5,
          state: 'now',
          is_completed: false,
          watch_percent: 40,
          resume_position_seconds: 32,
          world_id: '01J00000000000000000WORLD4',
          world_number: 4,
          world_title: 'Loops Valley',
        },
      ],
    },
    {
      id: '01J00000000000000000WORLD5',
      slug: 'game-builder',
      world_number: 5,
      title: 'Game Builder',
      description: 'Combine loops and logic into playable mini-games.',
      icon: 'gamepad',
      map_x: 114,
      map_y: 265,
      state: 'lock',
      completed_lessons_count: 0,
      total_lessons_count: 5,
      lessons: [],
    },
    {
      id: '01J00000000000000000WORLD6',
      slug: 'project-lab',
      world_number: 6,
      title: 'Project Lab',
      description: 'Build and share your own flagship coding creation.',
      icon: 'flask',
      map_x: 222,
      map_y: 120,
      state: 'lock',
      completed_lessons_count: 0,
      total_lessons_count: 5,
      lessons: [],
    },
  ],
};

export function JourneyMapScreen({
  podId,
  initialPod,
  screenState,
  errorMessage,
  autoFetch,
  onBack,
  onNavigateHome,
  onOpenLesson,
}: JourneyMapScreenProps = {}): React.JSX.Element {
  const { tokens, reducedMotion } = useTheme();
  const { token } = useAuth();
  const gamification = getGamificationStub();

  const shouldFetch = autoFetch ?? Boolean(token && initialPod === undefined && !screenState);

  const [pod, setPod] = useState<PodJourneyMapDto | null>(
    initialPod !== undefined ? initialPod : DEFAULT_DEMO_POD_MAP,
  );
  const [status, setStatus] = useState<'idle' | 'loading' | 'empty' | 'error' | 'offline'>(
    screenState ?? (shouldFetch ? 'loading' : 'idle'),
  );
  const [errorText, setErrorText] = useState<string | undefined>(errorMessage);

  const loadJourneyMap = useCallback(async () => {
    setStatus('loading');
    setErrorText(undefined);
    try {
      const res = await fetchJourneyMap(podId);
      if (!res.data.pod || res.data.pod.worlds.length === 0) {
        setPod(null);
        setStatus('empty');
      } else {
        setPod(res.data.pod);
        setStatus('idle');
      }
    } catch (err) {
      setErrorText(extractApiErrorMessage(err, 'Could not load the Journey Map.'));
      setStatus(isOfflineError(err) ? 'offline' : 'error');
    }
  }, [podId]);

  useEffect(() => {
    if (screenState) {
      setStatus(screenState);
      return;
    }
    if (shouldFetch) {
      void loadJourneyMap();
    }
  }, [loadJourneyMap, screenState, shouldFetch]);

  if (status === 'loading' || status === 'empty' || status === 'error' || status === 'offline') {
    return (
      <LearningScreenState
        state={status}
        message={errorText}
        onRetry={() => {
          void loadJourneyMap();
        }}
        onBack={onBack}
      />
    );
  }

  const activePod = pod ?? DEFAULT_DEMO_POD_MAP;
  // Display worlds top-to-bottom from highest world_number (#6) to lowest (#1) like 02-journey-map.png
  const orderedWorlds: readonly JourneyWorldDto[] = [...activePod.worlds].sort(
    (a, b) => b.world_number - a.world_number,
  );
  const currentLesson = activePod.current_lesson;

  return (
    <View testID="journey-map-screen" style={[styles.root, { backgroundColor: '#DDF6F2' }]}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <Pressable
          testID="journey-map-back-btn"
          accessibilityRole="button"
          accessibilityLabel="Back"
          onPress={onBack ?? onNavigateHome}
          style={styles.backBtn}
        >
          <Text style={[styles.backBtnText, { fontFamily: tokens.fonts.black }]}>←</Text>
        </Pressable>
        <View style={styles.topTitleBox}>
          <Text
            style={[
              styles.topTitle,
              { color: tokens.colors.ink, fontFamily: tokens.fonts.black },
            ]}
          >
            {activePod.title}
          </Text>
          <Text style={[styles.topSub, { fontFamily: tokens.fonts.bold }]}>
            {activePod.cleared_worlds_count} of {activePod.total_worlds_count} worlds cleared
          </Text>
        </View>
        <View style={styles.starChip} testID="journey-map-stars-stub">
          <Text style={[styles.starChipText, { fontFamily: tokens.fonts.extrabold }]}>
            ★ {gamification.stars}
          </Text>
        </View>
      </View>

      {/* Winding Map Nodes */}
      <ScrollView
        contentContainerStyle={styles.mapScroll}
        testID="journey-map-worlds-scroll"
      >
        {orderedWorlds.map((world, idx) => {
          const isLeft = idx % 2 === 1;
          const isDone = world.state === 'done';
          const isNow = world.state === 'now';
          const isLocked = world.state === 'lock';

          const nodeBg = isDone
            ? tokens.colors.teal
            : isNow
              ? tokens.colors.accents.amber
              : '#CBD5E1';

          const firstPlayableLesson =
            world.lessons.find((l) => l.state === 'now') ?? world.lessons[0];

          return (
            <View
              key={world.id}
              testID={`world-node-${world.slug}`}
              style={[
                styles.worldRow,
                { justifyContent: isLeft ? 'flex-start' : 'flex-end' },
              ]}
            >
              <Pressable
                disabled={isLocked}
                accessibilityRole="button"
                accessibilityLabel={`World ${world.world_number}: ${world.title} (${world.state})`}
                accessibilityState={{ disabled: isLocked }}
                onPress={() => {
                  if (!isLocked && firstPlayableLesson && onOpenLesson) {
                    onOpenLesson(firstPlayableLesson.id);
                  } else if (!isLocked && currentLesson && onOpenLesson) {
                    onOpenLesson(currentLesson.id);
                  }
                }}
                style={styles.worldNodeWrap}
              >
                {isNow ? (
                  <View style={styles.mascotPin}>
                    <PipIdleSvg size={64} reducedMotion={reducedMotion} />
                  </View>
                ) : null}

                <View
                  style={[
                    styles.worldCircle,
                    {
                      backgroundColor: nodeBg,
                      borderColor: '#FFFFFF',
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.worldCircleText,
                      {
                        color: isDone ? '#FFFFFF' : isNow ? tokens.colors.ink : '#64748B',
                        fontFamily: tokens.fonts.black,
                      },
                    ]}
                  >
                    {isDone ? '✓' : isLocked ? '🔒' : `${world.world_number}`}
                  </Text>
                </View>

                <View
                  style={[
                    styles.worldLabelPill,
                    {
                      backgroundColor: isNow ? tokens.colors.ink : '#FFFFFF',
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.worldLabelText,
                      {
                        color: isNow ? '#FFFFFF' : isLocked ? '#94A3B8' : tokens.colors.ink,
                        fontFamily: tokens.fonts.extrabold,
                      },
                    ]}
                  >
                    {world.world_number} · {world.title}
                  </Text>
                </View>
              </Pressable>
            </View>
          );
        })}
      </ScrollView>

      {/* Bottom Active Lesson Sheet */}
      {currentLesson ? (
        <View style={styles.bottomSheetWrap}>
          <TpCard style={styles.bottomSheetCard} testID="journey-map-current-lesson-sheet">
            <View style={styles.sheetRow}>
              <View style={styles.sheetTextCol}>
                <Text
                  style={[
                    styles.sheetOverline,
                    { color: tokens.colors.buttonTeal, fontFamily: tokens.fonts.extrabold },
                  ]}
                >
                  WORLD {currentLesson.world_number} · LESSON {currentLesson.position_in_world} OF{' '}
                  {currentLesson.total_in_world}
                </Text>
                <Text
                  style={[
                    styles.sheetTitle,
                    { color: tokens.colors.ink, fontFamily: tokens.fonts.black },
                  ]}
                >
                  {currentLesson.world_title} — {currentLesson.title}
                </Text>
              </View>
              <View style={styles.sheetActionBox}>
                <TpButton
                  testID="journey-map-continue-btn"
                  label="Continue"
                  variant="teal"
                  onPress={() => onOpenLesson?.(currentLesson.id)}
                />
              </View>
            </View>
          </TpCard>
        </View>
      ) : null}

      <KidBottomNav
        activeTab="learn"
        onNavigateHome={() => onNavigateHome?.()}
        onNavigateLearn={() => {}}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  backBtnText: {
    fontSize: 18,
    color: '#0F172A',
  },
  topTitleBox: {
    flex: 1,
  },
  topTitle: {
    fontSize: 18,
  },
  topSub: {
    fontSize: 12,
    color: '#475569',
  },
  starChip: {
    backgroundColor: '#FFFFFF',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  starChipText: {
    fontSize: 13,
    color: '#0F172A',
  },
  mapScroll: {
    paddingHorizontal: 28,
    paddingVertical: 18,
    gap: 24,
  },
  worldRow: {
    flexDirection: 'row',
    width: '100%',
  },
  worldNodeWrap: {
    alignItems: 'center',
    gap: 6,
  },
  mascotPin: {
    marginBottom: -8,
  },
  worldCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  worldCircleText: {
    fontSize: 22,
  },
  worldLabelPill: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 999,
  },
  worldLabelText: {
    fontSize: 12,
  },
  bottomSheetWrap: {
    paddingHorizontal: 16,
    paddingBottom: 10,
  },
  bottomSheetCard: {
    padding: 14,
  },
  sheetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  sheetTextCol: {
    flex: 1,
    gap: 2,
  },
  sheetOverline: {
    fontSize: 11,
    letterSpacing: 0.5,
  },
  sheetTitle: {
    fontSize: 15,
  },
  sheetActionBox: {
    width: 126,
  },
});
