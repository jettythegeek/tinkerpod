import React, { useCallback, useEffect, useState } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { extractApiErrorMessage } from '../../api/client';
import {
  fetchJourneyMap,
  isOfflineError,
  JourneyWorldDto,
  PodJourneyMapDto,
} from '../../api/learningApi';
import {
  APPROVED_ADVENTURE_NGODO_ASSET,
  APPROVED_EMPTY_NO_TOURNAMENTS_PNG,
  APPROVED_JOURNEY_MAP_BG_ASSET,
  APPROVED_MASCOT_HAPPY_ASSET,
  APPROVED_PIP_SURPRISED_PNG,
} from '../../assets/approvedAssets';
import { TpIcon, TpIconName } from '../../components/TpIcon';
import { useTheme } from '../../theme';
import { useAuth } from '../auth/AuthContext';
import { KidBottomNav, KidNavTab } from './components/KidBottomNav';
import { LearningScreenState } from './components/LearningScreenState';
import { getGamificationStub } from './gamificationStub';

export type LearnHubSection = 'journey' | 'missions' | 'compete';

export interface JourneyMapScreenProps {
  readonly podId?: string;
  readonly initialPod?: PodJourneyMapDto | null;
  readonly initialSection?: LearnHubSection;
  readonly initialShowMissionDetail?: boolean;
  readonly screenState?: 'loading' | 'empty' | 'error' | 'offline';
  readonly errorMessage?: string;
  readonly autoFetch?: boolean;
  readonly onBack?: () => void;
  readonly onNavigateHome?: () => void;
  readonly onOpenLesson?: (lessonId: string) => void;
  readonly onSelectTab?: (tab: KidNavTab) => void;
}

export const DEFAULT_DEMO_POD_MAP: PodJourneyMapDto = {
  id: '01J0000000000000000000POD1',
  slug: 'coding-pod',
  title: 'Coding Pod',
  description: 'Learn logic, functions, loops, and game building step by step.',
  icon: 'code-xml',
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
      title: 'Python Lagoon',
      description: 'Meet Captain Jetty and run your first commands.',
      icon: 'tree-palm',
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
      title: 'If-Else Reef',
      description: 'Make smart choices with if and else blocks.',
      icon: 'git-branch',
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
      title: 'Variables Jungle',
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
      title: 'Game Island',
      description: 'Combine loops and logic into playable mini-games.',
      icon: 'gamepad-2',
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
      title: 'Data Lab',
      description: 'Build and share your own flagship coding creation.',
      icon: 'flask-conical',
      map_x: 222,
      map_y: 120,
      state: 'lock',
      completed_lessons_count: 0,
      total_lessons_count: 5,
      lessons: [],
    },
  ],
};

function resolveWorldIcon(world: JourneyWorldDto): TpIconName {
  switch (world.world_number) {
    case 1:
      return 'tree-palm';
    case 2:
      return 'git-branch';
    case 3:
      return 'trees';
    case 4:
      return 'repeat';
    case 5:
      return 'gamepad-2';
    case 6:
      return 'flask-conical';
    default:
      return 'repeat';
  }
}

export function JourneyMapScreen({
  podId,
  initialPod,
  initialSection = 'journey',
  initialShowMissionDetail = false,
  screenState,
  errorMessage,
  autoFetch,
  onBack,
  onNavigateHome,
  onOpenLesson,
  onSelectTab,
}: JourneyMapScreenProps = {}): React.JSX.Element {
  const { tokens } = useTheme();
  const { token } = useAuth();
  const gamification = getGamificationStub();

  const shouldFetch = autoFetch ?? Boolean(token && initialPod === undefined && !screenState);

  const [pod, setPod] = useState<PodJourneyMapDto | null>(
    initialPod !== undefined ? initialPod : DEFAULT_DEMO_POD_MAP,
  );
  const [enrolledPods, setEnrolledPods] = useState<readonly PodJourneyMapDto[]>(
    initialPod ? [initialPod] : [DEFAULT_DEMO_POD_MAP],
  );
  const [section, setSection] = useState<LearnHubSection>(initialSection);
  const [showMissionDetail, setShowMissionDetail] = useState<boolean>(initialShowMissionDetail);
  const [status, setStatus] = useState<'idle' | 'loading' | 'empty' | 'error' | 'offline'>(
    screenState ?? (shouldFetch ? 'loading' : 'idle'),
  );
  const [errorText, setErrorText] = useState<string | undefined>(errorMessage);

  const loadJourneyMap = useCallback(async (targetPodId?: string) => {
    setStatus('loading');
    setErrorText(undefined);
    try {
      const res = await fetchJourneyMap(targetPodId ?? podId);
      if (!res.data.pod || res.data.pod.worlds.length === 0) {
        setPod(null);
        setStatus('empty');
      } else {
        setPod(res.data.pod);
        if (res.data.pods && res.data.pods.length > 0) {
          setEnrolledPods(res.data.pods);
        } else {
          setEnrolledPods([res.data.pod]);
        }
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
  const orderedWorlds: readonly JourneyWorldDto[] = [...activePod.worlds].sort(
    (a, b) => b.world_number - a.world_number,
  );
  const currentLesson = activePod.current_lesson;

  const handleCyclePod = (): void => {
    if (enrolledPods.length <= 1) {
      return;
    }
    const idx = enrolledPods.findIndex((p) => p.id === activePod.id);
    const nextPod = enrolledPods[(idx + 1) % enrolledPods.length];
    if (nextPod) {
      setPod(nextPod);
    }
  };

  // Screen 39: Mission — The Golden Gate of Codazanga
  if (showMissionDetail) {
    return (
      <View testID="mission-codazanga-view" style={styles.root}>
        <ScrollView contentContainerStyle={styles.missionDetailScroll}>
          <View style={styles.missionHeroBg}>
            <Image
              source={APPROVED_ADVENTURE_NGODO_ASSET}
              style={[StyleSheet.absoluteFill, styles.missionHeroImage]}
              resizeMode="cover"
            />
            <View style={styles.missionHeroOverlay}>
              <View style={styles.missionHeroTopRow}>
                <Pressable
                  testID="mission-detail-back-btn"
                  accessibilityRole="button"
                  accessibilityLabel="Back to Missions"
                  onPress={() => setShowMissionDetail(false)}
                  style={styles.glassCircleBtn}
                >
                  <TpIcon name="chevron-left" size={20} color="#FFFFFF" />
                </Pressable>
                <View style={styles.adventureGlassChip}>
                  <TpIcon name="target" size={13} color="#FDE68A" />
                  <Text style={[styles.adventureGlassChipText, { fontFamily: tokens.fonts.extrabold }]}>
                    Adventure · Lost Key of Ngodo
                  </Text>
                </View>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Read mission aloud"
                  style={styles.glassCircleBtn}
                >
                  <TpIcon name="volume-2" size={18} color="#FFFFFF" />
                </Pressable>
              </View>

              <View style={styles.missionHeroBottom}>
                <Text style={[styles.missionChapterEyebrow, { fontFamily: tokens.fonts.extrabold }]}>
                  CHAPTER 2 · MISSION 2 OF 4
                </Text>
                <Text style={[styles.missionHeroTitle, { fontFamily: tokens.fonts.black }]}>
                  The Golden Gate of Codazanga
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.missionDetailBody}>
            {/* Captain Jetty Story Bubble */}
            <View style={styles.storyCard}>
              <Image
                source={APPROVED_PIP_SURPRISED_PNG}
                accessibilityLabel="Captain Jetty"
                style={styles.storyMascot}
                resizeMode="contain"
              />
              <View style={styles.storyTextCol}>
                <Text style={[styles.storyHeader, { fontFamily: tokens.fonts.extrabold }]}>
                  Captain Jetty says:
                </Text>
                <Text style={[styles.storyQuote, { fontFamily: tokens.fonts.bold }]}>
                  &ldquo;The gate counts from 1 to 10 in twos. Write a for loop that prints 2, 4, 6,
                  8, 10 to open it!&rdquo;
                </Text>
              </View>
            </View>

            {/* Goal Checklist */}
            <View style={styles.goalCard}>
              <Text style={[styles.goalCardHeading, { fontFamily: tokens.fonts.black }]}>
                Mission Goals
              </Text>
              <View style={styles.goalRow}>
                <View style={styles.goalDoneBadge}>
                  <TpIcon name="check" size={12} color="#FFFFFF" />
                </View>
                <Text style={[styles.goalText, { fontFamily: tokens.fonts.bold }]}>
                  Use range(2, 11, 2) in a Python loop
                </Text>
              </View>
              <View style={styles.goalRow}>
                <View style={styles.goalNumberBadge}>
                  <Text style={[styles.goalNumberText, { fontFamily: tokens.fonts.black }]}>2</Text>
                </View>
                <Text style={[styles.goalText, { fontFamily: tokens.fonts.bold }]}>
                  Print each even number to unlock the gate
                </Text>
              </View>
            </View>

            {/* Starter Code Window */}
            <View style={styles.codeWindow}>
              <View style={styles.codeWindowHeader}>
                <View style={styles.codeDotsRow}>
                  <View style={[styles.codeDot, { backgroundColor: '#EF4444' }]} />
                  <View style={[styles.codeDot, { backgroundColor: '#F59E0B' }]} />
                  <View style={[styles.codeDot, { backgroundColor: '#10B981' }]} />
                </View>
                <Text style={[styles.codeFilename, { fontFamily: tokens.fonts.bold }]}>
                  gate_key.py
                </Text>
              </View>
              <Text style={styles.codeSnippetText}>
                {'# Open the Golden Gate\nfor n in range(2, 11, 2):\n    print(n)'}
              </Text>
            </View>

            {/* Rewards Bar */}
            <View style={styles.missionRewardsBar}>
              <Text style={[styles.missionRewardsLabel, { fontFamily: tokens.fonts.black }]}>
                Rewards
              </Text>
              <View style={styles.missionRewardsChips}>
                <View style={styles.xpChip}>
                  <TpIcon name="xp" size={12} color="#6B2FD6" />
                  <Text style={[styles.xpChipText, { fontFamily: tokens.fonts.extrabold }]}>
                    +120 XP
                  </Text>
                </View>
                <View style={styles.coinChip}>
                  <TpIcon name="coin" size={12} color="#92400E" />
                  <Text style={[styles.coinChipText, { fontFamily: tokens.fonts.extrabold }]}>
                    +50
                  </Text>
                </View>
              </View>
            </View>

            <Pressable
              testID="mission-open-code-pad-btn"
              accessibilityRole="button"
              onPress={() => {
                if (currentLesson && onOpenLesson) {
                  onOpenLesson(currentLesson.id);
                } else {
                  setShowMissionDetail(false);
                }
              }}
              style={styles.primaryGoldCta}
            >
              <TpIcon name="play" size={16} color="#0F172A" fill="#0F172A" />
              <Text style={[styles.primaryGoldCtaText, { fontFamily: tokens.fonts.black }]}>
                Open Code Pad
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </View>
    );
  }

  return (
    <View testID="journey-map-screen" style={styles.root}>
      {/* Purple Learn Hub Header (33-learn-journey.png, 38-learn-missions.png, 40-compete-coming-soon.png) */}
      <View style={styles.learnHeader}>
        <View style={styles.learnTopRow}>
          <View style={styles.learnTitleRow}>
            <Pressable
              testID="journey-map-back-btn"
              accessibilityRole="button"
              accessibilityLabel="Back"
              onPress={onBack ?? onNavigateHome}
              style={styles.backCircleBtn}
            >
              <TpIcon name="chevron-left" size={20} color="#FFFFFF" />
            </Pressable>
            <View>
              <Text style={[styles.learnEyebrow, { fontFamily: tokens.fonts.extrabold }]}>
                JOURNEY 1 · EXPLORER
              </Text>
              <Text style={[styles.learnMainTitle, { fontFamily: tokens.fonts.black }]}>
                {activePod.title}
              </Text>
              <Text style={[styles.learnSubMeta, { fontFamily: tokens.fonts.bold }]}>
                {activePod.cleared_worlds_count} of {activePod.total_worlds_count} worlds cleared
              </Text>
            </View>
          </View>

          <View style={styles.headerRightChips}>
            <Pressable
              testID="learn-pod-switcher-chip"
              accessibilityRole="button"
              accessibilityLabel={`Active pod ${activePod.title}`}
              onPress={handleCyclePod}
              style={styles.podSwitcherChip}
            >
              <TpIcon name="code-xml" size={14} color="#6B2FD6" />
              <Text style={[styles.podSwitcherText, { fontFamily: tokens.fonts.black }]}>
                {activePod.title}
              </Text>
              {enrolledPods.length > 1 ? (
                <TpIcon name="chevron-down" size={13} color="#6B2FD6" />
              ) : null}
            </Pressable>
            <View testID="journey-map-stars-stub" style={styles.starPillChip}>
              <TpIcon name="star" size={13} color="#F59E0B" fill="#F59E0B" />
              <Text style={[styles.starPillText, { fontFamily: tokens.fonts.extrabold }]}>
                {gamification.stars || 24}
              </Text>
            </View>
          </View>
        </View>

        {/* 3-Way Segmented Hub Tabs: Journey / Missions / Compete */}
        <View testID="learn-hub-segmented-tabs" style={styles.segmentedBar}>
          <Pressable
            testID="learn-tab-journey"
            accessibilityRole="tab"
            accessibilityState={{ selected: section === 'journey' }}
            onPress={() => setSection('journey')}
            style={
              section === 'journey' ? styles.segmentActive : styles.segmentInactive
            }
          >
            <TpIcon
              name="map"
              size={14}
              color={section === 'journey' ? '#6B2FD6' : 'rgba(255,255,255,0.85)'}
            />
            <Text
              style={[
                section === 'journey'
                  ? styles.segmentActiveText
                  : styles.segmentInactiveText,
                { fontFamily: tokens.fonts.extrabold },
              ]}
            >
              Journey
            </Text>
          </Pressable>

          <Pressable
            testID="learn-tab-missions"
            accessibilityRole="tab"
            accessibilityState={{ selected: section === 'missions' }}
            onPress={() => setSection('missions')}
            style={
              section === 'missions' ? styles.segmentActive : styles.segmentInactive
            }
          >
            <TpIcon
              name="target"
              size={14}
              color={section === 'missions' ? '#6B2FD6' : 'rgba(255,255,255,0.85)'}
            />
            <Text
              style={[
                section === 'missions'
                  ? styles.segmentActiveText
                  : styles.segmentInactiveText,
                { fontFamily: tokens.fonts.extrabold },
              ]}
            >
              Missions
            </Text>
          </Pressable>

          <Pressable
            testID="learn-tab-compete"
            accessibilityRole="tab"
            accessibilityState={{ selected: section === 'compete' }}
            onPress={() => setSection('compete')}
            style={
              section === 'compete' ? styles.segmentActive : styles.segmentInactive
            }
          >
            <TpIcon
              name="swords"
              size={14}
              color={section === 'compete' ? '#6B2FD6' : 'rgba(255,255,255,0.85)'}
            />
            <Text
              style={[
                section === 'compete'
                  ? styles.segmentActiveText
                  : styles.segmentInactiveText,
                { fontFamily: tokens.fonts.extrabold },
              ]}
            >
              Compete
            </Text>
          </Pressable>
        </View>
      </View>

      {/* SECTION 1: JOURNEY (02-journey-map.png & 33-learn-journey.png) */}
      {section === 'journey' ? (
        <View style={styles.mapBackground}>
          <Image
            testID="journey-map-bg"
            source={APPROVED_JOURNEY_MAP_BG_ASSET}
            style={StyleSheet.absoluteFill}
            resizeMode="cover"
          />
          <View style={styles.mapSkyTint}>
            {/* Level Progress Banner from 33-learn-journey.png */}
            <View style={styles.levelBannerWrap}>
              <View style={styles.levelBannerCard}>
                <View style={styles.levelBannerTop}>
                  <View>
                    <Text style={[styles.levelBannerEyebrow, { fontFamily: tokens.fonts.extrabold }]}>
                      LEVEL 2 OF 5 · LOOP BUILDER
                    </Text>
                    <Text style={[styles.levelBannerTitle, { fontFamily: tokens.fonts.black }]}>
                      Unit 2 of 4 · Repeat &amp; Count
                    </Text>
                  </View>
                  <View style={styles.xpPillLight}>
                    <TpIcon name="xp" size={12} color="#6B2FD6" />
                    <Text style={[styles.xpPillLightText, { fontFamily: tokens.fonts.extrabold }]}>
                      340 / 500
                    </Text>
                  </View>
                </View>
                <View style={styles.levelBannerTrack}>
                  <View style={[styles.levelBannerFill, { width: '68%' }]} />
                </View>
              </View>
            </View>

            {/* Winding World Trail */}
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
                  ? '#10B981'
                  : isNow
                    ? '#FFB700'
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
                        <Image
                          testID="journey-map-mascot-happy"
                          source={APPROVED_MASCOT_HAPPY_ASSET}
                          accessibilityLabel="Captain Jetty happy on current world"
                          style={styles.mascotHappyPin}
                          resizeMode="contain"
                        />
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
                        <TpIcon
                          name={isLocked ? 'lock' : resolveWorldIcon(world)}
                          size={26}
                          color={isDone ? '#FFFFFF' : isNow ? '#0F172A' : '#64748B'}
                        />
                        {isDone ? (
                          <View style={styles.worldDoneCheckBadge}>
                            <TpIcon name="check" size={11} color="#10B981" />
                          </View>
                        ) : null}
                      </View>

                      <View
                        style={[
                          styles.worldLabelPill,
                          {
                            backgroundColor: isNow
                              ? '#6B2FD6'
                              : 'rgba(255,255,255,0.92)',
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.worldLabelText,
                            {
                              color: isNow
                                ? '#FFFFFF'
                                : isLocked
                                  ? '#64748B'
                                  : '#0F172A',
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

            {/* Bottom Active Lesson Sheet with Stars & Play Button */}
            {currentLesson ? (
              <View style={styles.bottomSheetWrap}>
                <View
                  style={styles.bottomSheetCard}
                  testID="journey-map-current-lesson-sheet"
                >
                  <View style={styles.sheetIconBox}>
                    <TpIcon name="repeat" size={24} color="#FFFFFF" />
                  </View>
                  <View style={styles.sheetTextCol}>
                    <Text
                      style={[
                        styles.sheetOverline,
                        { fontFamily: tokens.fonts.extrabold },
                      ]}
                    >
                      WORLD {currentLesson.world_number} · LESSON{' '}
                      {currentLesson.position_in_world} OF {currentLesson.total_in_world}
                    </Text>
                    <Text
                      style={[
                        styles.sheetTitle,
                        { fontFamily: tokens.fonts.black },
                      ]}
                    >
                      {currentLesson.world_title} — {currentLesson.title}
                    </Text>
                    <View testID="journey-map-lesson-stars" style={styles.starsRow}>
                      {[1, 2, 3, 4, 5].map((starIdx) => {
                        const earned = starIdx <= currentLesson.position_in_world;
                        return (
                          <TpIcon
                            key={starIdx}
                            name="star"
                            size={13}
                            color={earned ? '#F59E0B' : '#CBD5E1'}
                            fill={earned ? '#F59E0B' : 'none'}
                          />
                        );
                      })}
                    </View>
                  </View>
                  <Pressable
                    testID="journey-map-continue-btn"
                    accessibilityRole="button"
                    accessibilityLabel="Play current lesson"
                    onPress={() => onOpenLesson?.(currentLesson.id)}
                    style={styles.sheetPlayBtn}
                  >
                    <TpIcon name="play" size={14} color="#0F172A" fill="#0F172A" />
                    <Text style={[styles.sheetPlayBtnText, { fontFamily: tokens.fonts.black }]}>
                      Play
                    </Text>
                  </Pressable>
                </View>
              </View>
            ) : null}
          </View>
        </View>
      ) : null}

      {/* SECTION 2: MISSIONS (38-learn-missions.png) */}
      {section === 'missions' ? (
        <ScrollView
          testID="learn-missions-section"
          contentContainerStyle={styles.missionsScroll}
        >
          <Text style={[styles.sectionEyebrow, { fontFamily: tokens.fonts.extrabold }]}>
            STORY SERIES · ADVENTURE 1
          </Text>
          <View style={styles.adventureCard}>
            <View style={styles.adventureCover}>
              <Image
                source={APPROVED_ADVENTURE_NGODO_ASSET}
                style={[StyleSheet.absoluteFill, styles.adventureCoverImg]}
                resizeMode="cover"
              />
              <View style={styles.adventureCoverOverlay}>
                <View style={styles.chapterChip}>
                  <Text style={[styles.chapterChipText, { fontFamily: tokens.fonts.black }]}>
                    CHAPTER 2 OF 4
                  </Text>
                </View>
                <Text style={[styles.adventureHeroTitle, { fontFamily: tokens.fonts.black }]}>
                  The Lost Key of Ngodo
                </Text>
                <Text style={[styles.adventureHeroSub, { fontFamily: tokens.fonts.bold }]}>
                  Help Captain Jetty unlock the ancient gates with Python loops.
                </Text>
              </View>
            </View>
            <View style={styles.adventureFooter}>
              <View style={styles.adventureProgressRow}>
                <View style={styles.adventureProgressTrack}>
                  <View style={[styles.adventureProgressFill, { width: '50%' }]} />
                </View>
                <Text style={[styles.adventureProgressText, { fontFamily: tokens.fonts.extrabold }]}>
                  2 / 4 missions
                </Text>
              </View>
              <Pressable
                testID="open-mission-codazanga-btn"
                accessibilityRole="button"
                onPress={() => setShowMissionDetail(true)}
                style={styles.continueStoryBtn}
              >
                <TpIcon name="play" size={14} color="#0F172A" fill="#0F172A" />
                <Text style={[styles.continueStoryBtnText, { fontFamily: tokens.fonts.black }]}>
                  Continue story · Golden Gate of Codazanga
                </Text>
              </Pressable>
            </View>
          </View>

          <Text style={[styles.sectionEyebrow, { fontFamily: tokens.fonts.extrabold }]}>
            UNLOCKED MISSIONS · LEVEL 1 CLEARED
          </Text>

          <Pressable
            testID="mission-card-codazanga"
            accessibilityRole="button"
            onPress={() => setShowMissionDetail(true)}
            style={styles.missionItemCard}
          >
            <View style={[styles.missionItemIcon, { backgroundColor: '#FEF3C7' }]}>
              <TpIcon name="target" size={22} color="#92400E" />
            </View>
            <View style={styles.missionItemBody}>
              <Text style={[styles.missionItemTitle, { fontFamily: tokens.fonts.black }]}>
                The Golden Gate of Codazanga
              </Text>
              <Text style={[styles.missionItemSub, { fontFamily: tokens.fonts.bold }]}>
                Count in twos with a for loop · 10 min
              </Text>
            </View>
            <View style={styles.xpChip}>
              <TpIcon name="xp" size={12} color="#6B2FD6" />
              <Text style={[styles.xpChipText, { fontFamily: tokens.fonts.extrabold }]}>
                +120
              </Text>
            </View>
          </Pressable>

          <View style={styles.missionItemCard}>
            <View style={[styles.missionItemIcon, { backgroundColor: '#D1FAE5' }]}>
              <TpIcon name="check" size={22} color="#065F46" />
            </View>
            <View style={styles.missionItemBody}>
              <Text style={[styles.missionItemTitle, { fontFamily: tokens.fonts.black }]}>
                Market Day Robot
              </Text>
              <Text style={[styles.missionItemSub, { fontFamily: tokens.fonts.bold }]}>
                Completed · Earned +100 XP
              </Text>
            </View>
            <View style={styles.doneBadgePill}>
              <Text style={[styles.doneBadgePillText, { fontFamily: tokens.fonts.extrabold }]}>
                Done
              </Text>
            </View>
          </View>

          <Text style={[styles.sectionEyebrow, { fontFamily: tokens.fonts.extrabold }]}>
            LOCKED · FINISH LEVEL 2 TO UNLOCK
          </Text>

          <View style={[styles.missionItemCard, { opacity: 0.65 }]}>
            <View style={[styles.missionItemIcon, { backgroundColor: '#E2E8F0' }]}>
              <TpIcon name="lock" size={20} color="#64748B" />
            </View>
            <View style={styles.missionItemBody}>
              <Text style={[styles.missionItemTitle, { fontFamily: tokens.fonts.black }]}>
                The Bridge of Loops
              </Text>
              <Text style={[styles.missionItemSub, { fontFamily: tokens.fonts.bold }]}>
                Unlocks when you finish Level 2 · Loop Builder
              </Text>
            </View>
          </View>
        </ScrollView>
      ) : null}

      {/* SECTION 3: COMPETE (40-compete-coming-soon.png) */}
      {section === 'compete' ? (
        <ScrollView
          testID="learn-compete-section"
          contentContainerStyle={styles.competeScroll}
        >
          <View style={styles.competeEmptyCard}>
            <Image
              testID="compete-empty-illustration"
              source={APPROVED_EMPTY_NO_TOURNAMENTS_PNG}
              accessibilityLabel="No tournaments yet"
              style={styles.competeEmptyImage}
              resizeMode="contain"
            />
            <Text style={[styles.competeEmptyTitle, { fontFamily: tokens.fonts.black }]}>
              Arena opens soon!
            </Text>
            <Text style={[styles.competeEmptySub, { fontFamily: tokens.fonts.bold }]}>
              Practice in Journey &amp; Missions so you&apos;re ready when competitions go live.
            </Text>
          </View>

          <Text style={[styles.sectionEyebrow, { fontFamily: tokens.fonts.extrabold }]}>
            COMING TO COMPETE
          </Text>

          <View testID="compete-card-league" style={styles.competeLockedCard}>
            <View style={[styles.competeIconBox, { backgroundColor: '#FEF3C7' }]}>
              <TpIcon name="medal" size={22} color="#92400E" />
            </View>
            <View style={styles.competeTextCol}>
              <View style={styles.competeTitleRow}>
                <Text style={[styles.competeCardTitle, { fontFamily: tokens.fonts.black }]}>
                  League
                </Text>
                <View style={styles.comingSoonPill}>
                  <TpIcon name="lock" size={10} color="#64748B" />
                  <Text style={[styles.comingSoonText, { fontFamily: tokens.fonts.extrabold }]}>
                    COMING SOON
                  </Text>
                </View>
              </View>
              <Text style={[styles.competeCardDesc, { fontFamily: tokens.fonts.bold }]}>
                Weekly pod leaderboard · climb Bronze → Odogwu tier
              </Text>
            </View>
          </View>

          <View testID="compete-card-cup" style={styles.competeLockedCard}>
            <View style={[styles.competeIconBox, { backgroundColor: '#EDE9FE' }]}>
              <TpIcon name="shield" size={22} color="#6B2FD6" />
            </View>
            <View style={styles.competeTextCol}>
              <View style={styles.competeTitleRow}>
                <Text style={[styles.competeCardTitle, { fontFamily: tokens.fonts.black }]}>
                  Cup
                </Text>
                <View style={styles.comingSoonPill}>
                  <TpIcon name="lock" size={10} color="#64748B" />
                  <Text style={[styles.comingSoonText, { fontFamily: tokens.fonts.extrabold }]}>
                    COMING SOON
                  </Text>
                </View>
              </View>
              <Text style={[styles.competeCardDesc, { fontFamily: tokens.fonts.bold }]}>
                Knockout brackets · coding &amp; design challenges
              </Text>
            </View>
          </View>

          <View testID="compete-card-world-cup" style={styles.competeLockedCard}>
            <View style={[styles.competeIconBox, { backgroundColor: '#CCFBF1' }]}>
              <TpIcon name="globe" size={22} color="#0F766E" />
            </View>
            <View style={styles.competeTextCol}>
              <View style={styles.competeTitleRow}>
                <Text style={[styles.competeCardTitle, { fontFamily: tokens.fonts.black }]}>
                  World Cup
                </Text>
                <View style={styles.comingSoonPill}>
                  <TpIcon name="lock" size={10} color="#64748B" />
                  <Text style={[styles.comingSoonText, { fontFamily: tokens.fonts.extrabold }]}>
                    COMING SOON
                  </Text>
                </View>
              </View>
              <Text style={[styles.competeCardDesc, { fontFamily: tokens.fonts.bold }]}>
                Naija vs the world · seasonal championship
              </Text>
            </View>
          </View>
        </ScrollView>
      ) : null}

      <KidBottomNav
        activeTab="learn"
        onSelectTab={onSelectTab}
        onNavigateHome={() => onNavigateHome?.()}
        onNavigateLearn={() => setSection('journey')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#FAF8FF',
  },
  learnHeader: {
    backgroundColor: '#6B2FD6',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 14,
  },
  learnTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  learnTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  backCircleBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  learnEyebrow: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.8)',
    letterSpacing: 0.5,
  },
  learnMainTitle: {
    fontSize: 19,
    color: '#FFFFFF',
  },
  learnSubMeta: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.85)',
  },
  headerRightChips: {
    alignItems: 'flex-end',
    gap: 6,
  },
  podSwitcherChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 9999,
  },
  podSwitcherText: {
    fontSize: 11,
    color: '#6B2FD6',
  },
  starPillChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 9999,
  },
  starPillText: {
    fontSize: 11,
    color: '#FFFFFF',
  },
  segmentedBar: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderRadius: 14,
    padding: 4,
    marginTop: 10,
    gap: 4,
  },
  segmentActive: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingVertical: 7,
  },
  segmentInactive: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    borderRadius: 10,
    paddingVertical: 7,
  },
  segmentActiveText: {
    fontSize: 12,
    color: '#6B2FD6',
  },
  segmentInactiveText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.9)',
  },
  mapBackground: {
    flex: 1,
  },
  mapSkyTint: {
    flex: 1,
    backgroundColor: 'rgba(186,230,253,0.28)',
  },
  levelBannerWrap: {
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  levelBannerCard: {
    backgroundColor: 'rgba(255,255,255,0.94)',
    borderRadius: 16,
    padding: 10,
    borderWidth: 1,
    borderColor: '#EEF2FF',
  },
  levelBannerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  levelBannerEyebrow: {
    fontSize: 10,
    color: '#6B2FD6',
  },
  levelBannerTitle: {
    fontSize: 13,
    color: '#0F172A',
  },
  xpPillLight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EDE9FE',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 9999,
  },
  xpPillLightText: {
    fontSize: 11,
    color: '#6B2FD6',
  },
  levelBannerTrack: {
    height: 7,
    borderRadius: 9999,
    backgroundColor: '#EEF2FF',
    marginTop: 6,
    overflow: 'hidden',
  },
  levelBannerFill: {
    height: '100%',
    backgroundColor: '#FFB700',
  },
  mapScroll: {
    paddingHorizontal: 28,
    paddingVertical: 14,
    gap: 18,
  },
  worldRow: {
    flexDirection: 'row',
    width: '100%',
  },
  worldNodeWrap: {
    alignItems: 'center',
    gap: 6,
  },
  mascotHappyPin: {
    width: 68,
    height: 68,
    marginBottom: -8,
  },
  worldCircle: {
    width: 66,
    height: 66,
    borderRadius: 33,
    borderWidth: 4,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  worldDoneCheckBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  worldLabelPill: {
    paddingHorizontal: 11,
    paddingVertical: 4,
    borderRadius: 9999,
  },
  worldLabelText: {
    fontSize: 11,
  },
  bottomSheetWrap: {
    paddingHorizontal: 14,
    paddingBottom: 10,
  },
  bottomSheetCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: '#EEF2FF',
  },
  sheetIconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#6B2FD6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetTextCol: {
    flex: 1,
    gap: 2,
  },
  sheetOverline: {
    fontSize: 10,
    color: '#6B2FD6',
    letterSpacing: 0.4,
  },
  sheetTitle: {
    fontSize: 14,
    color: '#0F172A',
  },
  starsRow: {
    flexDirection: 'row',
    gap: 3,
    marginTop: 2,
  },
  sheetPlayBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#FFB700',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
  },
  sheetPlayBtnText: {
    fontSize: 13,
    color: '#0F172A',
  },
  missionsScroll: {
    padding: 16,
    gap: 10,
  },
  sectionEyebrow: {
    fontSize: 10,
    color: '#64748B',
    letterSpacing: 0.6,
    marginTop: 4,
  },
  adventureCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#EEF2FF',
  },
  adventureCover: {
    height: 150,
    justifyContent: 'flex-end',
  },
  adventureCoverImg: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  adventureCoverOverlay: {
    backgroundColor: 'rgba(15,23,42,0.55)',
    padding: 14,
  },
  chapterChip: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFB700',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 9999,
    marginBottom: 4,
  },
  chapterChipText: {
    fontSize: 10,
    color: '#0F172A',
  },
  adventureHeroTitle: {
    fontSize: 18,
    color: '#FFFFFF',
  },
  adventureHeroSub: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 2,
  },
  adventureFooter: {
    padding: 12,
    gap: 10,
  },
  adventureProgressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  adventureProgressTrack: {
    flex: 1,
    height: 8,
    borderRadius: 9999,
    backgroundColor: '#EEF2FF',
    overflow: 'hidden',
  },
  adventureProgressFill: {
    height: '100%',
    backgroundColor: '#6B2FD6',
  },
  adventureProgressText: {
    fontSize: 11,
    color: '#64748B',
  },
  continueStoryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#FFB700',
    paddingVertical: 11,
    borderRadius: 14,
  },
  continueStoryBtnText: {
    fontSize: 13,
    color: '#0F172A',
  },
  missionItemCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#EEF2FF',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  missionItemIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  missionItemBody: {
    flex: 1,
  },
  missionItemTitle: {
    fontSize: 14,
    color: '#0F172A',
  },
  missionItemSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  xpChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#EDE9FE',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 9999,
  },
  xpChipText: {
    fontSize: 11,
    color: '#6B2FD6',
  },
  coinChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 9999,
  },
  coinChipText: {
    fontSize: 11,
    color: '#92400E',
  },
  doneBadgePill: {
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 9999,
  },
  doneBadgePillText: {
    fontSize: 11,
    color: '#065F46',
  },
  competeScroll: {
    padding: 16,
    gap: 10,
  },
  competeEmptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EEF2FF',
  },
  competeEmptyImage: {
    width: 120,
    height: 120,
  },
  competeEmptyTitle: {
    fontSize: 17,
    color: '#0F172A',
    marginTop: 6,
  },
  competeEmptySub: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 4,
  },
  competeLockedCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: '#CBD5E1',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  competeIconBox: {
    width: 46,
    height: 46,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  competeTextCol: {
    flex: 1,
  },
  competeTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  competeCardTitle: {
    fontSize: 15,
    color: '#0F172A',
  },
  comingSoonPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 9999,
  },
  comingSoonText: {
    fontSize: 9,
    color: '#64748B',
  },
  competeCardDesc: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  missionDetailScroll: {
    paddingBottom: 28,
  },
  missionHeroBg: {
    height: 200,
  },
  missionHeroImage: {
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  missionHeroOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15,23,42,0.52)',
    padding: 16,
    justifyContent: 'space-between',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  missionHeroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  glassCircleBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(15,23,42,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  adventureGlassChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(15,23,42,0.6)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 9999,
  },
  adventureGlassChipText: {
    fontSize: 11,
    color: '#FFFFFF',
  },
  missionHeroBottom: {
    gap: 2,
  },
  missionChapterEyebrow: {
    fontSize: 10,
    color: '#FDE68A',
    letterSpacing: 0.6,
  },
  missionHeroTitle: {
    fontSize: 21,
    color: '#FFFFFF',
  },
  missionDetailBody: {
    padding: 16,
    gap: 12,
  },
  storyCard: {
    backgroundColor: '#EDE9FE',
    borderRadius: 18,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  storyMascot: {
    width: 56,
    height: 56,
  },
  storyTextCol: {
    flex: 1,
  },
  storyHeader: {
    fontSize: 11,
    color: '#5B21B6',
  },
  storyQuote: {
    fontSize: 12,
    color: '#3B0764',
    marginTop: 2,
  },
  goalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#EEF2FF',
    gap: 8,
  },
  goalCardHeading: {
    fontSize: 14,
    color: '#0F172A',
  },
  goalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  goalDoneBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
  },
  goalNumberBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#EDE9FE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  goalNumberText: {
    fontSize: 11,
    color: '#6B2FD6',
  },
  goalText: {
    fontSize: 12,
    color: '#0F172A',
    flex: 1,
  },
  codeWindow: {
    backgroundColor: '#1E1B4B',
    borderRadius: 16,
    padding: 14,
  },
  codeWindowHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  codeDotsRow: {
    flexDirection: 'row',
    gap: 5,
  },
  codeDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
  },
  codeFilename: {
    fontSize: 11,
    color: '#94A3B8',
  },
  codeSnippetText: {
    fontFamily: 'monospace',
    fontSize: 13,
    lineHeight: 20,
    color: '#E2E8F0',
  },
  missionRewardsBar: {
    backgroundColor: '#FAF5FF',
    borderRadius: 14,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  missionRewardsLabel: {
    fontSize: 13,
    color: '#4C1D95',
  },
  missionRewardsChips: {
    flexDirection: 'row',
    gap: 8,
  },
  primaryGoldCta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FFB700',
    paddingVertical: 14,
    borderRadius: 16,
  },
  primaryGoldCtaText: {
    fontSize: 15,
    color: '#0F172A',
  },
});
