import React, { useCallback, useEffect, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { extractApiErrorMessage } from '../../api/client';
import {
  fetchKidHome,
  isOfflineError,
  KidHomeData,
  PodSummaryDto,
} from '../../api/learningApi';
import {
  APPROVED_LESSON_LOOPS_ASSET,
  APPROVED_MASCOT_CHEERING_ASSET,
  APPROVED_MASCOT_SLEEPY_ASSET,
  resolveApprovedAvatar,
} from '../../assets/approvedAssets';
import { TpIcon } from '../../components/TpIcon';
import { useTheme } from '../../theme';
import { useAuth } from '../auth/AuthContext';
import { KidBottomNav, KidNavTab } from './components/KidBottomNav';
import { LearningScreenState } from './components/LearningScreenState';
import { getGamificationStub } from './gamificationStub';

export interface KidHomeScreenProps {
  readonly initialData?: KidHomeData | null;
  readonly screenState?: 'loading' | 'empty' | 'error' | 'offline';
  readonly errorMessage?: string;
  readonly autoFetch?: boolean;
  readonly onOpenJourneyMap?: (podId?: string) => void;
  readonly onOpenLesson?: (lessonId: string) => void;
  readonly onSelectTab?: (tab: KidNavTab) => void;
}

const DEFAULT_DEMO_HOME: KidHomeData = {
  child: {
    id: '01J000000000000000000CHILD',
    public_id: '01J000000000000000000CHILD',
    first_name: 'Amara',
    username: 'amara_codes',
    avatar: 'av1.png',
    age_band: 'junior',
    theme_flag: 'junior',
  },
  gamification: {
    xp: 680,
    next_level_xp: 1000,
    level: 4,
    title: 'Jango-Jango',
    next_title: 'Level 5',
    coins: 420,
    gems: 18,
    stars: 24,
    streak_days: 7,
    missions: [],
  },
  continue_lesson: {
    id: '01J0000000000000000LESSON2',
    slug: 'repeat-and-count',
    lesson_number: 2,
    position_in_world: 2,
    total_in_world: 5,
    title: 'Loops: Repeat & Count',
    summary: 'Teach Captain Jetty to repeat actions without typing the same code ten times.',
    thumbnail_asset: null,
    duration_minutes: 8,
    difficulty: 'Beginner',
    steps_count: 5,
    state: 'now',
    is_completed: false,
    watch_percent: 45,
    resume_position_seconds: 32,
    world_id: '01J00000000000000000WORLD4',
    world_number: 2,
    world_title: 'Loops Valley',
  },
  continue_project: {
    id: '01J0000000000000000PROJECT',
    title: 'Space Dodger — Collision Loop',
    language: 'python',
    progress_percent: 78,
  },
  pods: [
    {
      id: '01J0000000000000000000POD1',
      slug: 'coding-pod',
      title: 'Coding Pod',
      icon: 'code-xml',
      is_demo: true,
      cleared_worlds_count: 3,
      total_worlds_count: 6,
    },
  ],
};

export function KidHomeScreen({
  initialData,
  screenState,
  errorMessage,
  autoFetch,
  onOpenJourneyMap,
  onOpenLesson,
  onSelectTab,
}: KidHomeScreenProps = {}): React.JSX.Element {
  const { mode, tokens } = useTheme();
  const { kidProfile: child, token } = useAuth();
  const stub = getGamificationStub();

  const shouldFetch = autoFetch ?? Boolean(token && initialData === undefined && !screenState);

  const [homeData, setHomeData] = useState<KidHomeData | null>(
    initialData !== undefined ? initialData : DEFAULT_DEMO_HOME,
  );
  const [status, setStatus] = useState<'idle' | 'loading' | 'empty' | 'error' | 'offline'>(
    screenState ?? (shouldFetch ? 'loading' : 'idle'),
  );
  const [errorText, setErrorText] = useState<string | undefined>(errorMessage);

  const loadHome = useCallback(async () => {
    setStatus('loading');
    setErrorText(undefined);
    try {
      const res = await fetchKidHome();
      if (!res.data || res.data.pods.length === 0) {
        setHomeData(res.data ?? null);
        setStatus('empty');
      } else {
        setHomeData(res.data);
        setStatus('idle');
      }
    } catch (err) {
      setErrorText(extractApiErrorMessage(err, 'Could not load your learning home.'));
      setStatus(isOfflineError(err) ? 'offline' : 'error');
    }
  }, []);

  useEffect(() => {
    if (screenState) {
      setStatus(screenState);
      return;
    }
    if (shouldFetch) {
      void loadHome();
    }
  }, [loadHome, screenState, shouldFetch]);

  if (status === 'loading' || status === 'empty' || status === 'error' || status === 'offline') {
    return (
      <LearningScreenState
        state={status}
        message={errorText}
        onRetry={() => {
          void loadHome();
        }}
      />
    );
  }

  const data = homeData ?? DEFAULT_DEMO_HOME;
  const activeChild = child ?? data.child;
  const isSenior = mode === 'senior' || activeChild.theme_flag === 'senior';
  const displayName = activeChild.first_name || (isSenior ? 'Tunde' : 'Amara');
  const avatarSource = resolveApprovedAvatar(activeChild.avatar || 'av1.png');

  const gamification = data.gamification ?? {
    xp: stub.xp,
    next_level_xp: stub.nextLevelXp,
    level: stub.level,
    title: stub.title,
    next_title: stub.nextTitle,
    coins: stub.coins,
    gems: stub.gems,
    stars: stub.stars,
    streak_days: stub.streakDays,
    missions: [],
  };

  const pods: readonly PodSummaryDto[] = data.pods ?? [];
  const primaryPod: PodSummaryDto | undefined = pods[0];
  const continueLesson = data.continue_lesson ?? DEFAULT_DEMO_HOME.continue_lesson!;
  const nextLevelXp = Math.max(1, gamification.next_level_xp || 1000);
  const xpProgressPct = Math.min(100, Math.round((gamification.xp / nextLevelXp) * 100));
  const xpToNext = Math.max(0, nextLevelXp - gamification.xp);

  const handleNavSelect = (tab: KidNavTab): void => {
    if (onSelectTab) {
      onSelectTab(tab);
      return;
    }
    if (tab === 'learn') {
      onOpenJourneyMap?.(primaryPod?.id);
    }
  };

  if (isSenior) {
    return (
      <View testID="kid-home-screen" style={[styles.screen, styles.screenSenior]}>
        <ScrollView contentContainerStyle={styles.seniorScrollContent}>
          {/* Senior Header (10-teen-home.png) */}
          <View testID="kid-home-senior-header" style={styles.seniorHeaderRow}>
            <View>
              <Text style={[styles.seniorWelcomeMeta, { fontFamily: tokens.fonts.bold }]}>
                Welcome back
              </Text>
              <Text
                testID="kid-home-greeting"
                style={[styles.seniorGreetingName, { fontFamily: tokens.fonts.black }]}
              >
                {displayName}
              </Text>
            </View>
            <View style={styles.seniorChipsRow}>
              <View testID="kid-hud-coins-chip" style={styles.chipCoinLight}>
                <TpIcon name="coin" size={14} color="#92400E" />
                <Text style={[styles.chipCoinLightText, { fontFamily: tokens.fonts.extrabold }]}>
                  {gamification.coins}
                </Text>
              </View>
              <View testID="kid-hud-gems-chip" style={styles.chipGemLight}>
                <TpIcon name="gem" size={14} color="#0F766E" />
                <Text style={[styles.chipGemLightText, { fontFamily: tokens.fonts.extrabold }]}>
                  {gamification.gems}
                </Text>
              </View>
            </View>
          </View>

          {/* Senior Rank & XP Banner */}
          <View testID="senior-xp-stub-banner" style={styles.seniorXpBanner}>
            <View style={styles.seniorXpHeader}>
              <View>
                <Text style={[styles.seniorRankEyebrow, { fontFamily: tokens.fonts.extrabold }]}>
                  RANK · LEVEL {gamification.level}
                </Text>
                <Text style={[styles.seniorRankTitle, { fontFamily: tokens.fonts.black }]}>
                  {gamification.title ?? 'Code Dragon'}
                </Text>
              </View>
              <View testID="kid-hud-xp-chip" style={styles.seniorXpChip}>
                <TpIcon name="xp" size={14} color={tokens.colors.kidPurple} />
                <Text style={[styles.seniorXpChipText, { fontFamily: tokens.fonts.extrabold }]}>
                  {gamification.xp} XP
                </Text>
              </View>
            </View>
            <View style={styles.seniorProgressTrack}>
              <View style={[styles.seniorProgressFill, { width: `${xpProgressPct}%` }]} />
            </View>
            <Text style={[styles.seniorProgressCaption, { fontFamily: tokens.fonts.bold }]}>
              {gamification.xp} / {nextLevelXp} XP to Level {gamification.level + 1} —{' '}
              {gamification.next_title ?? 'Design Jango'}
            </Text>
          </View>

          {/* Streak Paused Card with mascot-sleepy.png and Kind Wording (Hard Rule 6) */}
          <View testID="kid-home-streak-card" style={styles.seniorStreakCard}>
            <Image
              testID="kid-home-mascot-sleepy"
              source={APPROVED_MASCOT_SLEEPY_ASSET}
              accessibilityLabel="Captain Jetty resting"
              style={styles.seniorSleepyMascot}
              resizeMode="contain"
            />
            <View style={styles.seniorStreakTextWrap}>
              <Text style={[styles.seniorStreakTitle, { fontFamily: tokens.fonts.black }]}>
                Streak paused — no stress
              </Text>
              <Text
                testID="kid-home-streak-kind-copy"
                style={[styles.seniorStreakSub, { fontFamily: tokens.fonts.bold }]}
              >
                Captain Jetty kept your spot warm! Do one lesson today to start a new streak.
              </Text>
            </View>
            <Pressable
              testID="kid-home-wake-jetty-button"
              accessibilityRole="button"
              onPress={() => onOpenLesson?.(continueLesson.id)}
              style={styles.wakeJettyBtn}
            >
              <Text style={[styles.wakeJettyBtnText, { fontFamily: tokens.fonts.black }]}>
                Wake Jetty
              </Text>
            </Pressable>
          </View>

          {/* Continue Building Card */}
          <Text style={[styles.sectionHeading, { fontFamily: tokens.fonts.black }]}>
            Continue building
          </Text>
          <View testID="senior-continue-card" style={styles.seniorContinueCard}>
            <View style={styles.seniorContinueRow}>
              <View style={styles.seniorGameIconWrap}>
                <TpIcon name="gamepad-2" size={26} color={tokens.colors.surface} />
              </View>
              <View style={styles.seniorContinueMetaWrap}>
                <Text style={[styles.seniorContinueEyebrow, { fontFamily: tokens.fonts.extrabold }]}>
                  PYTHON · MODULE 3
                </Text>
                <Text style={[styles.seniorContinueTitle, { fontFamily: tokens.fonts.black }]}>
                  {data.continue_project?.title ?? continueLesson.title}
                </Text>
                <View style={styles.seniorMiniTrack}>
                  <View
                    style={[
                      styles.seniorMiniFill,
                      {
                        width: `${data.continue_project?.progress_percent ?? 78}%`,
                      },
                    ]}
                  />
                </View>
              </View>
            </View>
            <View style={styles.seniorContinueActions}>
              <Pressable
                testID="kid-home-continue-btn"
                accessibilityRole="button"
                onPress={() => onOpenLesson?.(continueLesson.id)}
                style={styles.seniorResumeBtn}
              >
                <Text style={[styles.seniorResumeBtnText, { fontFamily: tokens.fonts.extrabold }]}>
                  Resume
                </Text>
              </Pressable>
              <Pressable
                testID="kid-home-open-map-btn"
                accessibilityRole="button"
                accessibilityLabel="Share or view map"
                onPress={() => onOpenJourneyMap?.(primaryPod?.id)}
                style={styles.seniorShareBtn}
              >
                <TpIcon name="share-2" size={16} color={tokens.colors.ink} />
              </Pressable>
            </View>
          </View>

          {/* Today's Missions */}
          <View style={styles.sectionHeaderRow}>
            <Text style={[styles.sectionHeading, { fontFamily: tokens.fonts.black }]}>
              Today&apos;s missions
            </Text>
            <Text style={[styles.sectionCountMeta, { fontFamily: tokens.fonts.extrabold }]}>
              1 / 3
            </Text>
          </View>
          <View style={styles.missionsCard}>
            <View style={styles.missionRow}>
              <View style={styles.missionCheckDone}>
                <TpIcon name="check" size={12} color="#FFFFFF" />
              </View>
              <Text style={[styles.missionDoneText, { fontFamily: tokens.fonts.bold }]}>
                Review 1 quiz card
              </Text>
              <Text style={[styles.missionDoneStatus, { fontFamily: tokens.fonts.extrabold }]}>
                Done
              </Text>
            </View>
            <View style={[styles.missionRow, styles.missionRowBorder]}>
              <View style={styles.missionCheckOpen} />
              <Text style={[styles.missionOpenText, { fontFamily: tokens.fonts.bold }]}>
                Push 1 commit to Space Dodger
              </Text>
              <View style={styles.missionRewardChip}>
                <TpIcon name="xp" size={12} color={tokens.colors.kidPurple} />
                <Text style={[styles.missionRewardXpText, { fontFamily: tokens.fonts.extrabold }]}>
                  +60
                </Text>
              </View>
            </View>
            <View style={[styles.missionRow, styles.missionRowBorder]}>
              <View style={styles.missionCheckOpen} />
              <Text style={[styles.missionOpenText, { fontFamily: tokens.fonts.bold }]}>
                Win 1 quick match
              </Text>
              <View style={styles.missionRewardCoinChip}>
                <TpIcon name="coin" size={12} color="#92400E" />
                <Text style={[styles.missionRewardCoinText, { fontFamily: tokens.fonts.extrabold }]}>
                  +30
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>

        <KidBottomNav
          activeTab="home"
          onSelectTab={handleNavSelect}
          onNavigateLearn={() => onOpenJourneyMap?.(primaryPod?.id)}
        />
      </View>
    );
  }

  return (
    <View testID="kid-home-screen" style={styles.screen}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Junior Purple Header matching 01-kid-home.png */}
        <View testID="kid-home-junior-header" style={styles.heroHeader}>
          <View style={styles.heroTopRow}>
            <View style={styles.heroIdentityRow}>
              <View style={styles.avatarRing}>
                {avatarSource ? (
                  <Image
                    testID="kid-home-avatar"
                    source={avatarSource}
                    accessibilityLabel={`${displayName} avatar`}
                    style={styles.avatarImage}
                  />
                ) : null}
              </View>
              <View>
                <Text style={[styles.goodMorningText, { fontFamily: tokens.fonts.bold }]}>
                  Good morning
                </Text>
                <Text
                  testID="kid-home-greeting"
                  style={[styles.greetingTitle, { fontFamily: tokens.fonts.black }]}
                >
                  Hi, {displayName}!
                </Text>
              </View>
            </View>

            <Pressable
              testID="kid-home-bell-button"
              accessibilityRole="button"
              accessibilityLabel="Notifications"
              style={styles.bellButton}
            >
              <TpIcon name="bell" size={20} color="#FFFFFF" />
              <View style={styles.bellBadgeDot} />
            </Pressable>
          </View>

          {/* Streak, Coin & Gem Chips */}
          <View style={styles.hudChipsRow}>
            <View testID="kid-hud-streak-chip" style={styles.hudGlassChip}>
              <TpIcon name="flame" size={14} color="#FDE68A" />
              <Text style={[styles.hudGlassChipText, { fontFamily: tokens.fonts.extrabold }]}>
                {gamification.streak_days} days
              </Text>
            </View>
            <View testID="kid-hud-coins-chip" style={styles.hudGlassChip}>
              <TpIcon name="coin" size={14} color="#FDE68A" />
              <Text style={[styles.hudGlassChipText, { fontFamily: tokens.fonts.extrabold }]}>
                {gamification.coins}
              </Text>
            </View>
            <View testID="kid-hud-gems-chip" style={styles.hudGlassChip}>
              <TpIcon name="gem" size={14} color="#99F6E4" />
              <Text style={[styles.hudGlassChipText, { fontFamily: tokens.fonts.extrabold }]}>
                {gamification.gems}
              </Text>
            </View>
          </View>

          {/* Level Card with mascot-cheering.png */}
          <View testID="kid-home-level-card" style={styles.levelCard}>
            <View style={styles.levelCardLeft}>
              <View style={styles.levelPillRow}>
                <View style={styles.levelPill}>
                  <Text style={[styles.levelPillText, { fontFamily: tokens.fonts.black }]}>
                    Level {gamification.level}
                  </Text>
                </View>
                <Text style={[styles.levelTitleText, { fontFamily: tokens.fonts.black }]}>
                  {gamification.title ?? 'Jango-Jango'}
                </Text>
              </View>
              <View style={styles.levelProgressTrack}>
                <View style={[styles.levelProgressFill, { width: `${xpProgressPct}%` }]} />
              </View>
              <View style={styles.levelStatsRow}>
                <Text
                  testID="kid-hud-xp-chip"
                  style={[styles.levelStatsBold, { fontFamily: tokens.fonts.extrabold }]}
                >
                  {gamification.xp} / {nextLevelXp} XP
                </Text>
                <Text style={[styles.levelStatsMuted, { fontFamily: tokens.fonts.bold }]}>
                  {xpToNext} XP to Level {gamification.level + 1}
                </Text>
              </View>
            </View>

            <Image
              testID="kid-home-mascot-cheering"
              source={APPROVED_MASCOT_CHEERING_ASSET}
              accessibilityLabel="Captain Jetty cheering"
              style={styles.mascotCheeringImage}
              resizeMode="contain"
            />
          </View>
        </View>

        <View style={styles.bodyPadding}>
          {/* Continue Where You Left Off Card with lesson-loops.jpg */}
          <View style={styles.sectionHeaderRow}>
            <Text style={[styles.sectionHeading, { fontFamily: tokens.fonts.black }]}>
              Continue where you left off
            </Text>
            <Pressable
              testID="kid-home-open-map-btn"
              accessibilityRole="button"
              onPress={() => onOpenJourneyMap?.(primaryPod?.id)}
            >
              <Text style={[styles.seeMapLink, { fontFamily: tokens.fonts.extrabold }]}>
                See map
              </Text>
            </Pressable>
          </View>

          <View testID="junior-continue-card" style={styles.continueCard}>
            <Image
              testID="kid-home-continue-thumb"
              source={APPROVED_LESSON_LOOPS_ASSET}
              accessibilityLabel={continueLesson.title}
              style={styles.continueThumb}
              resizeMode="cover"
            />
            <View style={styles.continueBody}>
              <Text style={[styles.continueEyebrow, { fontFamily: tokens.fonts.extrabold }]}>
                {(primaryPod?.title ?? 'CODING POD').toUpperCase()} · WORLD{' '}
                {continueLesson.world_number}
              </Text>
              <Text style={[styles.continueTitle, { fontFamily: tokens.fonts.black }]}>
                {continueLesson.title}
              </Text>
              <View style={styles.continueProgressRow}>
                <View style={styles.continueProgressTrack}>
                  <View
                    style={[
                      styles.continueProgressFill,
                      {
                        width: `${
                          continueLesson.is_completed
                            ? 100
                            : Math.max(30, continueLesson.watch_percent)
                        }%`,
                      },
                    ]}
                  />
                </View>
                <Text style={[styles.continueStepText, { fontFamily: tokens.fonts.extrabold }]}>
                  Lesson {continueLesson.position_in_world} of {continueLesson.total_in_world}
                </Text>
              </View>
            </View>
            <Pressable
              testID="kid-home-continue-btn"
              accessibilityRole="button"
              accessibilityLabel={`Continue ${continueLesson.title}`}
              onPress={() => onOpenLesson?.(continueLesson.id)}
              style={styles.continuePlayCircle}
            >
              <TpIcon name="play" size={18} color="#FFFFFF" fill="#FFFFFF" />
            </Pressable>
          </View>

          {/* Daily Missions */}
          <View style={styles.sectionHeaderRow}>
            <Text style={[styles.sectionHeading, { fontFamily: tokens.fonts.black }]}>
              Daily Missions
            </Text>
            <Text style={[styles.sectionCountPurple, { fontFamily: tokens.fonts.extrabold }]}>
              1 of 3 done
            </Text>
          </View>

          <View style={styles.missionsCard}>
            <View style={styles.missionRow}>
              <View style={styles.missionCheckDone}>
                <TpIcon name="check" size={14} color="#FFFFFF" />
              </View>
              <View style={styles.missionTextCol}>
                <Text style={[styles.missionDoneText, { fontFamily: tokens.fonts.extrabold }]}>
                  Log in today
                </Text>
                <Text style={[styles.missionClaimedSub, { fontFamily: tokens.fonts.bold }]}>
                  Claimed +20 XP
                </Text>
              </View>
              <View style={styles.missionDoneChip}>
                <Text style={[styles.missionDoneChipText, { fontFamily: tokens.fonts.extrabold }]}>
                  Done
                </Text>
              </View>
            </View>

            <View style={[styles.missionRow, styles.missionRowBorder]}>
              <View style={styles.missionIconGold}>
                <TpIcon name="xp" size={16} color="#92400E" />
              </View>
              <View style={styles.missionTextCol}>
                <Text style={[styles.missionOpenText, { fontFamily: tokens.fonts.extrabold }]}>
                  Finish 1 lesson
                </Text>
                <View style={styles.missionMiniTrack}>
                  <View style={[styles.missionMiniFill, { width: '60%' }]} />
                </View>
              </View>
              <View style={styles.missionRewardCoinChip}>
                <TpIcon name="coin" size={12} color="#92400E" />
                <Text style={[styles.missionRewardCoinText, { fontFamily: tokens.fonts.extrabold }]}>
                  +25
                </Text>
              </View>
            </View>

            <View style={[styles.missionRow, styles.missionRowBorder]}>
              <View style={styles.missionIconTeal}>
                <TpIcon name="gem" size={16} color="#0F766E" />
              </View>
              <View style={styles.missionTextCol}>
                <Text style={[styles.missionOpenText, { fontFamily: tokens.fonts.extrabold }]}>
                  Score 100% on a quiz
                </Text>
                <Text style={[styles.missionClaimedSub, { fontFamily: tokens.fonts.bold }]}>
                  Bonus gem reward
                </Text>
              </View>
              <View style={styles.missionRewardGemChip}>
                <TpIcon name="gem" size={12} color="#0F766E" />
                <Text style={[styles.missionRewardGemText, { fontFamily: tokens.fonts.extrabold }]}>
                  +2
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      <KidBottomNav
        activeTab="home"
        onSelectTab={handleNavSelect}
        onNavigateLearn={() => onOpenJourneyMap?.(primaryPod?.id)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#FAF8FF',
  },
  screenSenior: {
    backgroundColor: '#F1F5F9',
  },
  scrollContent: {
    paddingBottom: 24,
  },
  seniorScrollContent: {
    padding: 16,
    paddingBottom: 24,
  },
  heroHeader: {
    backgroundColor: '#6B2FD6',
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 18,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  heroIdentityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  avatarRing: {
    width: 46,
    height: 46,
    borderRadius: 23,
    padding: 2,
    backgroundColor: '#FFB700',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarImage: {
    width: 42,
    height: 42,
    borderRadius: 21,
  },
  goodMorningText: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.75)',
  },
  greetingTitle: {
    fontSize: 20,
    color: '#FFFFFF',
  },
  bellButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  bellBadgeDot: {
    position: 'absolute',
    top: 7,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#F97316',
    borderWidth: 1.5,
    borderColor: '#6B2FD6',
  },
  hudChipsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  hudGlassChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderRadius: 9999,
    paddingHorizontal: 11,
    paddingVertical: 5,
  },
  hudGlassChipText: {
    fontSize: 12,
    color: '#FFFFFF',
  },
  levelCard: {
    marginTop: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  levelCardLeft: {
    flex: 1,
  },
  levelPillRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  levelPill: {
    backgroundColor: '#EDE9FE',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 9999,
  },
  levelPillText: {
    fontSize: 11,
    color: '#6B2FD6',
  },
  levelTitleText: {
    fontSize: 13,
    color: '#0F172A',
  },
  levelProgressTrack: {
    height: 10,
    borderRadius: 9999,
    backgroundColor: '#EEF2FF',
    marginTop: 7,
    overflow: 'hidden',
  },
  levelProgressFill: {
    height: '100%',
    borderRadius: 9999,
    backgroundColor: '#7C3AED',
  },
  levelStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  levelStatsBold: {
    fontSize: 10,
    color: '#64748B',
  },
  levelStatsMuted: {
    fontSize: 10,
    color: '#64748B',
  },
  mascotCheeringImage: {
    width: 68,
    height: 68,
  },
  bodyPadding: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
    marginTop: 6,
  },
  sectionHeading: {
    fontSize: 15,
    color: '#0F172A',
  },
  seeMapLink: {
    fontSize: 12,
    color: '#6B2FD6',
  },
  sectionCountPurple: {
    fontSize: 11,
    color: '#6B2FD6',
  },
  sectionCountMeta: {
    fontSize: 12,
    color: '#64748B',
  },
  continueCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 12,
    borderWidth: 1,
    borderColor: '#EEF2FF',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  continueThumb: {
    width: 72,
    height: 72,
    borderRadius: 14,
  },
  continueBody: {
    flex: 1,
  },
  continueEyebrow: {
    fontSize: 10,
    color: '#6B2FD6',
    letterSpacing: 0.4,
  },
  continueTitle: {
    fontSize: 15,
    color: '#0F172A',
    marginTop: 1,
  },
  continueProgressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 6,
  },
  continueProgressTrack: {
    flex: 1,
    height: 8,
    borderRadius: 9999,
    backgroundColor: '#EEF2FF',
    overflow: 'hidden',
  },
  continueProgressFill: {
    height: '100%',
    borderRadius: 9999,
    backgroundColor: '#FFB700',
  },
  continueStepText: {
    fontSize: 11,
    color: '#64748B',
  },
  continuePlayCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#6B2FD6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  missionsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 10,
    borderWidth: 1,
    borderColor: '#EEF2FF',
    marginBottom: 12,
  },
  missionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 7,
    paddingHorizontal: 4,
  },
  missionRowBorder: {
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  missionCheckDone: {
    width: 30,
    height: 30,
    borderRadius: 10,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
  },
  missionCheckOpen: {
    width: 22,
    height: 22,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: '#CBD5E1',
  },
  missionIconGold: {
    width: 30,
    height: 30,
    borderRadius: 10,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  missionIconTeal: {
    width: 30,
    height: 30,
    borderRadius: 10,
    backgroundColor: '#CCFBF1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  missionTextCol: {
    flex: 1,
  },
  missionDoneText: {
    fontSize: 13,
    color: '#64748B',
    textDecorationLine: 'line-through',
    flex: 1,
  },
  missionOpenText: {
    fontSize: 13,
    color: '#0F172A',
    flex: 1,
  },
  missionClaimedSub: {
    fontSize: 10,
    color: '#64748B',
  },
  missionMiniTrack: {
    height: 6,
    borderRadius: 9999,
    backgroundColor: '#EEF2FF',
    marginTop: 4,
    overflow: 'hidden',
  },
  missionMiniFill: {
    height: '100%',
    backgroundColor: '#FFB700',
  },
  missionDoneChip: {
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 9999,
  },
  missionDoneChipText: {
    fontSize: 11,
    color: '#065F46',
  },
  missionDoneStatus: {
    fontSize: 11,
    color: '#10B981',
  },
  missionRewardChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#EDE9FE',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 9999,
  },
  missionRewardXpText: {
    fontSize: 11,
    color: '#6B2FD6',
  },
  missionRewardCoinChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 9999,
  },
  missionRewardCoinText: {
    fontSize: 11,
    color: '#92400E',
  },
  missionRewardGemChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#CCFBF1',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 9999,
  },
  missionRewardGemText: {
    fontSize: 11,
    color: '#0F766E',
  },
  seniorHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  seniorWelcomeMeta: {
    fontSize: 11,
    color: '#64748B',
  },
  seniorGreetingName: {
    fontSize: 20,
    color: '#0F172A',
  },
  seniorChipsRow: {
    flexDirection: 'row',
    gap: 6,
  },
  chipCoinLight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 9999,
  },
  chipCoinLightText: {
    fontSize: 12,
    color: '#92400E',
  },
  chipGemLight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#CCFBF1',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 9999,
  },
  chipGemLightText: {
    fontSize: 12,
    color: '#0F766E',
  },
  seniorXpBanner: {
    backgroundColor: '#1E1B4B',
    borderRadius: 18,
    padding: 14,
    marginBottom: 10,
  },
  seniorXpHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  seniorRankEyebrow: {
    fontSize: 10,
    color: '#A5B4FC',
    letterSpacing: 0.6,
  },
  seniorRankTitle: {
    fontSize: 18,
    color: '#FFFFFF',
  },
  seniorXpChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EDE9FE',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 9999,
  },
  seniorXpChipText: {
    fontSize: 12,
    color: '#6B2FD6',
  },
  seniorProgressTrack: {
    height: 8,
    borderRadius: 9999,
    backgroundColor: 'rgba(255,255,255,0.12)',
    marginTop: 10,
    overflow: 'hidden',
  },
  seniorProgressFill: {
    height: '100%',
    backgroundColor: '#00BFAE',
  },
  seniorProgressCaption: {
    fontSize: 11,
    color: '#A5B4FC',
    marginTop: 4,
  },
  seniorStreakCard: {
    backgroundColor: '#FEF3C7',
    borderWidth: 1.5,
    borderColor: '#FDE68A',
    borderRadius: 16,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  seniorSleepyMascot: {
    width: 48,
    height: 48,
  },
  seniorStreakTextWrap: {
    flex: 1,
  },
  seniorStreakTitle: {
    fontSize: 12,
    color: '#78350F',
  },
  seniorStreakSub: {
    fontSize: 11,
    color: '#92400E',
    marginTop: 2,
  },
  wakeJettyBtn: {
    backgroundColor: '#FFB700',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 10,
  },
  wakeJettyBtnText: {
    fontSize: 11,
    color: '#0F172A',
  },
  seniorContinueCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 12,
    marginTop: 6,
  },
  seniorContinueRow: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  seniorGameIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#6B2FD6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  seniorContinueMetaWrap: {
    flex: 1,
  },
  seniorContinueEyebrow: {
    fontSize: 10,
    color: '#6B2FD6',
  },
  seniorContinueTitle: {
    fontSize: 14,
    color: '#0F172A',
  },
  seniorMiniTrack: {
    height: 6,
    borderRadius: 9999,
    backgroundColor: '#E2E8F0',
    marginTop: 6,
    overflow: 'hidden',
  },
  seniorMiniFill: {
    height: '100%',
    backgroundColor: '#6B2FD6',
  },
  seniorContinueActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
  },
  seniorResumeBtn: {
    flex: 1,
    backgroundColor: '#6B2FD6',
    borderRadius: 12,
    paddingVertical: 9,
    alignItems: 'center',
  },
  seniorResumeBtnText: {
    fontSize: 12,
    color: '#FFFFFF',
  },
  seniorShareBtn: {
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
