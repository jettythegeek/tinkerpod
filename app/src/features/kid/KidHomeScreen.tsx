import React, { useCallback, useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { extractApiErrorMessage } from '../../api/client';
import {
  fetchKidHome,
  isOfflineError,
  KidHomeData,
  PodSummaryDto,
} from '../../api/learningApi';
import { ApprovedAvatar, TpButton, TpCard } from '../../components/DesignSystem';
import { PipIdleSvg } from '../../pip';
import { AgeBandThemeMode, useTheme } from '../../theme';
import { useAuth } from '../auth/AuthContext';
import { KidBottomNav } from './components/KidBottomNav';
import { LearningScreenState } from './components/LearningScreenState';
import { getGamificationStub } from './gamificationStub';

export interface KidHomeScreenProps {
  readonly initialData?: KidHomeData | null;
  readonly screenState?: 'loading' | 'empty' | 'error' | 'offline';
  readonly errorMessage?: string;
  readonly autoFetch?: boolean;
  readonly onOpenJourneyMap?: (podId?: string) => void;
  readonly onOpenLesson?: (lessonId: string) => void;
}

const DEFAULT_PODS: readonly PodSummaryDto[] = [
  {
    id: '01J0000000000000000000POD1',
    slug: 'coding-pod',
    title: 'Coding',
    icon: 'laptop-code',
    is_demo: true,
    cleared_worlds_count: 3,
    total_worlds_count: 6,
  },
  {
    id: '01J0000000000000000000POD2',
    slug: 'design-pod',
    title: 'Design',
    icon: 'palette',
    is_demo: true,
    cleared_worlds_count: 1,
    total_worlds_count: 5,
  },
  {
    id: '01J0000000000000000000POD3',
    slug: 'ai-data-pod',
    title: 'AI & Data',
    icon: 'sparkles',
    is_demo: true,
    cleared_worlds_count: 0,
    total_worlds_count: 6,
  },
  {
    id: '01J0000000000000000000POD4',
    slug: 'robotics-pod',
    title: 'Robotics',
    icon: 'cpu',
    is_demo: true,
    cleared_worlds_count: 0,
    total_worlds_count: 5,
  },
];

export function KidHomeScreen({
  initialData,
  screenState,
  errorMessage,
  autoFetch,
  onOpenJourneyMap,
  onOpenLesson,
}: KidHomeScreenProps = {}): React.JSX.Element {
  const { tokens, mode, reducedMotion } = useTheme();
  const { kidProfile, token, signOut } = useAuth();

  const shouldFetch = autoFetch ?? Boolean(token && initialData === undefined && !screenState);

  const [data, setData] = useState<KidHomeData | null>(initialData ?? null);
  const [status, setStatus] = useState<'idle' | 'loading' | 'empty' | 'error' | 'offline'>(
    screenState ?? (shouldFetch ? 'loading' : 'idle'),
  );
  const [errorText, setErrorText] = useState<string | undefined>(errorMessage);

  const loadHome = useCallback(async () => {
    setStatus('loading');
    setErrorText(undefined);
    try {
      const res = await fetchKidHome();
      setData(res.data);
      if (res.data.pods.length === 0 && !res.data.continue_lesson) {
        setStatus('empty');
      } else {
        setStatus('idle');
      }
    } catch (err) {
      setErrorText(extractApiErrorMessage(err, 'Could not load your home dashboard.'));
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

  const resolvedThemeFlag: AgeBandThemeMode =
    data?.child?.theme_flag ?? kidProfile?.theme_flag ?? mode;

  const gamification = getGamificationStub();
  const childName =
    data?.child?.first_name ??
    kidProfile?.first_name ??
    (resolvedThemeFlag === 'senior' ? 'Tobi' : 'Amara');
  const childAvatar =
    data?.child?.avatar ??
    kidProfile?.avatar ??
    (resolvedThemeFlag === 'senior' ? 'av3.png' : 'av1.png');

  const continueLesson = data?.continue_lesson ?? {
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
    state: 'now' as const,
    is_completed: false,
    watch_percent: 40,
    resume_position_seconds: 32,
    world_id: '01J00000000000000000WORLD4',
    world_number: 4,
    world_title: 'Loops Valley',
  };

  const pods = data?.pods && data.pods.length > 0 ? data.pods : DEFAULT_PODS;

  if (resolvedThemeFlag === 'senior') {
    return (
      <View
        testID="kid-home-screen"
        style={[styles.root, { backgroundColor: tokens.colors.bg }]}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Senior Header (10-teen-home.png) */}
          <View style={styles.headerRow} testID="kid-home-senior-header">
            <ApprovedAvatar filename={childAvatar} size={44} />
            <View style={styles.headerTextCol}>
              <Text style={[styles.caption, { fontFamily: tokens.fonts.bold }]}>
                Welcome back
              </Text>
              <Text
                style={[
                  styles.seniorName,
                  { color: tokens.colors.ink, fontFamily: tokens.fonts.extrabold },
                ]}
              >
                {childName}
              </Text>
            </View>
            <View style={styles.statChip} testID="stub-coins-chip">
              <Text style={[styles.statText, { fontFamily: tokens.fonts.extrabold }]}>
                {gamification.coins} Coins
              </Text>
            </View>
            <View style={styles.statChip} testID="stub-gems-chip">
              <Text style={[styles.statText, { fontFamily: tokens.fonts.extrabold }]}>
                {gamification.gems} Gems
              </Text>
            </View>
          </View>

          {/* Senior XP Banner (M3 Stubbed) */}
          <View
            style={[styles.seniorXpBanner, { backgroundColor: tokens.colors.adminNavy }]}
            testID="senior-xp-stub-banner"
          >
            <View style={styles.seniorXpTop}>
              <View>
                <Text style={[styles.seniorXpOverline, { fontFamily: tokens.fonts.extrabold }]}>
                  Level {gamification.level} · {gamification.title}
                </Text>
                <Text style={[styles.seniorXpValue, { fontFamily: tokens.fonts.extrabold }]}>
                  {gamification.xp}{' '}
                  <Text style={styles.seniorXpMuted}>/ {gamification.nextLevelXp} XP</Text>
                </Text>
              </View>
              <View style={styles.seniorNextBadge}>
                <Text style={[styles.seniorNextBadgeText, { fontFamily: tokens.fonts.extrabold }]}>
                  Next: {gamification.nextTitle}
                </Text>
              </View>
            </View>
            <View style={styles.seniorXpTrack}>
              <View style={[styles.seniorXpFill, { width: '0%' }]} />
            </View>
          </View>

          {/* Encouraging Daily Check-In Card (Kid-safe wording, Captain Jetty) */}
          <View style={styles.seniorStreakCard}>
            <PipIdleSvg size={48} reducedMotion={reducedMotion} />
            <View style={styles.headerTextCol}>
              <Text
                style={[
                  styles.seniorStreakTitle,
                  { color: tokens.colors.ink, fontFamily: tokens.fonts.extrabold },
                ]}
              >
                Ready for today’s coding session
              </Text>
              <Text style={[styles.seniorStreakSub, { fontFamily: tokens.fonts.semibold }]}>
                Do one lesson today with Captain Jetty.
              </Text>
            </View>
          </View>

          {/* Continue Building Section */}
          <View style={styles.sectionHeaderRow}>
            <Text
              style={[
                styles.sectionTitle,
                { color: tokens.colors.ink, fontFamily: tokens.fonts.extrabold },
              ]}
            >
              Continue building
            </Text>
            <Pressable
              onPress={() => onOpenJourneyMap?.(pods[0]?.id)}
              accessibilityRole="button"
              accessibilityLabel="All projects"
            >
              <Text
                style={[
                  styles.sectionLink,
                  { color: tokens.colors.buttonTeal, fontFamily: tokens.fonts.bold },
                ]}
              >
                All projects
              </Text>
            </Pressable>
          </View>

          <TpCard style={styles.seniorContinueCard}>
            <View style={styles.seniorProjectRow}>
              <View style={styles.seniorProjectIcon}>
                <Text
                  style={[
                    styles.seniorProjectIconText,
                    { color: tokens.colors.accents.blue, fontFamily: tokens.fonts.black },
                  ]}
                >
                  {'</>'}
                </Text>
              </View>
              <View style={styles.headerTextCol}>
                <Text
                  style={[
                    styles.seniorProjectTitle,
                    { color: tokens.colors.ink, fontFamily: tokens.fonts.extrabold },
                  ]}
                >
                  {continueLesson.title}
                </Text>
                <Text style={[styles.caption, { fontFamily: tokens.fonts.bold }]}>
                  {continueLesson.world_title} · Lesson {continueLesson.position_in_world} of{' '}
                  {continueLesson.total_in_world} · Python
                </Text>
              </View>
            </View>

            <View style={styles.progressTrack}>
              <View
                style={[
                  styles.progressFillTeal,
                  {
                    width: `${Math.min(100, Math.max(8, continueLesson.watch_percent))}%`,
                    backgroundColor: tokens.colors.teal,
                  },
                ]}
              />
            </View>

            <View style={styles.seniorContinueActions}>
              <View style={styles.flexOne}>
                <TpButton
                  testID="kid-home-resume-lesson-btn"
                  label="Resume"
                  variant="teal"
                  onPress={() => onOpenLesson?.(continueLesson.id)}
                />
              </View>
              <View style={styles.flexOne}>
                <TpButton
                  testID="kid-home-open-map-btn"
                  label="Journey Map"
                  variant="ghost"
                  onPress={() => onOpenJourneyMap?.(pods[0]?.id)}
                />
              </View>
            </View>
          </TpCard>

          {/* Today's Missions Slot (M3 Stub) */}
          <View style={styles.sectionHeaderRow}>
            <Text
              style={[
                styles.sectionTitle,
                { color: tokens.colors.ink, fontFamily: tokens.fonts.extrabold },
              ]}
            >
              Today’s missions
            </Text>
            <Text style={[styles.caption, { fontFamily: tokens.fonts.bold }]}>
              0 of 3 · M3 preview
            </Text>
          </View>
          <TpCard style={styles.missionsStubCard} testID="missions-stub-card">
            <Text style={[styles.caption, { fontFamily: tokens.fonts.bold }]}>
              Daily missions and XP rewards unlock in Milestone M3.
            </Text>
          </TpCard>

          <TpButton
            testID="kid-sign-out-btn"
            label="Switch Profile / Sign Out"
            variant="ghost"
            onPress={() => {
              void signOut();
            }}
          />
        </ScrollView>

        <KidBottomNav
          activeTab="home"
          onNavigateHome={() => {}}
          onNavigateLearn={() => onOpenJourneyMap?.(pods[0]?.id)}
        />
      </View>
    );
  }

  // Junior Theme (Ages 5–11, 01-kid-home.png)
  return (
    <View
      testID="kid-home-screen"
      style={[styles.root, { backgroundColor: tokens.colors.bg }]}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Top Greeting Row */}
        <View style={styles.headerRow} testID="kid-home-junior-header">
          <ApprovedAvatar filename={childAvatar} size={46} />
          <View style={styles.headerTextCol}>
            <Text
              style={[
                styles.juniorGreeting,
                { color: tokens.colors.ink, fontFamily: tokens.fonts.black },
              ]}
            >
              Molo, {childName}!
            </Text>
            <Text style={[styles.caption, { fontFamily: tokens.fonts.bold }]}>
              Level {gamification.level} · {gamification.title}
            </Text>
          </View>
          <View style={styles.statChip} testID="stub-streak-chip">
            <Text style={[styles.statText, { fontFamily: tokens.fonts.extrabold }]}>
              {gamification.streakDays}d
            </Text>
          </View>
          <View style={styles.statChip} testID="stub-coins-chip">
            <Text style={[styles.statText, { fontFamily: tokens.fonts.extrabold }]}>
              {gamification.coins}
            </Text>
          </View>
        </View>

        {/* Captain Jetty Speech Bubble Card */}
        <View style={styles.mascotSpeechCard}>
          <PipIdleSvg size={70} reducedMotion={reducedMotion} />
          <View style={styles.headerTextCol}>
            <Text
              style={[
                styles.mascotSpeechTitle,
                { color: '#005A52', fontFamily: tokens.fonts.black },
              ]}
            >
              Ready for {continueLesson.world_title}?
            </Text>
            <Text
              style={[
                styles.mascotSpeechBody,
                { color: tokens.colors.ink, fontFamily: tokens.fonts.bold },
              ]}
            >
              Let’s keep exploring with Captain Jetty!
            </Text>
          </View>
        </View>

        {/* Continue Lesson Hero Card */}
        <View
          style={[styles.juniorHeroCard, { backgroundColor: tokens.colors.kidPurple }]}
          testID="junior-continue-card"
        >
          <Text style={[styles.heroOverline, { fontFamily: tokens.fonts.extrabold }]}>
            CONTINUE LESSON · WORLD {continueLesson.world_number} · LESSON{' '}
            {continueLesson.position_in_world} OF {continueLesson.total_in_world}
          </Text>
          <Text style={[styles.heroTitle, { fontFamily: tokens.fonts.black }]}>
            {continueLesson.title}
          </Text>
          <View style={styles.heroProgressRow}>
            <View style={styles.heroProgressTrack}>
              <View
                style={[
                  styles.heroProgressFill,
                  {
                    width: `${Math.min(100, Math.max(8, continueLesson.watch_percent))}%`,
                    backgroundColor: tokens.colors.accents.amber,
                  },
                ]}
              />
            </View>
            <Text style={[styles.heroProgressPct, { fontFamily: tokens.fonts.extrabold }]}>
              {continueLesson.watch_percent}%
            </Text>
          </View>
          <TpButton
            testID="kid-home-lets-go-btn"
            label="Let's go!"
            variant="yellow"
            onPress={() => onOpenLesson?.(continueLesson.id)}
          />
        </View>

        {/* Your Pods Grid */}
        <View style={styles.sectionHeaderRow}>
          <Text
            style={[
              styles.sectionTitle,
              { color: tokens.colors.ink, fontFamily: tokens.fonts.extrabold },
            ]}
          >
            Your Pods
          </Text>
          <Pressable
            testID="kid-home-see-map-link"
            accessibilityRole="button"
            accessibilityLabel="See map"
            onPress={() => onOpenJourneyMap?.(pods[0]?.id)}
          >
            <Text
              style={[
                styles.sectionLink,
                { color: tokens.colors.buttonTeal, fontFamily: tokens.fonts.extrabold },
              ]}
            >
              See map →
            </Text>
          </Pressable>
        </View>

        <View style={styles.podsGrid}>
          {pods.map((pod) => (
            <Pressable
              key={pod.id}
              testID={`pod-card-${pod.slug}`}
              accessibilityRole="button"
              accessibilityLabel={`${pod.title} Pod`}
              onPress={() => onOpenJourneyMap?.(pod.id)}
              style={[
                styles.podTile,
                {
                  backgroundColor: tokens.colors.surface,
                  borderRadius: tokens.radii.junior.md,
                },
              ]}
            >
              <View style={styles.podIconBadge}>
                <Text
                  style={[
                    styles.podIconText,
                    { color: tokens.colors.buttonTeal, fontFamily: tokens.fonts.black },
                  ]}
                >
                  {pod.title.slice(0, 2).toUpperCase()}
                </Text>
              </View>
              <View style={styles.headerTextCol}>
                <Text
                  style={[
                    styles.podTileTitle,
                    { color: tokens.colors.ink, fontFamily: tokens.fonts.extrabold },
                  ]}
                >
                  {pod.title}
                </Text>
                <Text style={[styles.podTileSub, { fontFamily: tokens.fonts.bold }]}>
                  {pod.cleared_worlds_count > 0
                    ? `${pod.cleared_worlds_count} of ${pod.total_worlds_count} worlds`
                    : 'Start'}
                </Text>
              </View>
            </Pressable>
          ))}
        </View>

        {/* Today's Missions Slot (M3 Stub) */}
        <View style={styles.sectionHeaderRow}>
          <Text
            style={[
              styles.sectionTitle,
              { color: tokens.colors.ink, fontFamily: tokens.fonts.extrabold },
            ]}
          >
            Today’s Missions
          </Text>
          <Text style={[styles.caption, { fontFamily: tokens.fonts.bold }]}>
            0 of 3 done
          </Text>
        </View>
        <TpCard style={styles.missionsStubCard} testID="missions-stub-card">
          <Text style={[styles.caption, { fontFamily: tokens.fonts.bold }]}>
            Missions and XP rewards arrive in Milestone M3.
          </Text>
        </TpCard>

        <TpButton
          testID="kid-sign-out-btn"
          label="Switch Profile / Sign Out"
          variant="ghost"
          onPress={() => {
            void signOut();
          }}
        />
      </ScrollView>

      <KidBottomNav
        activeTab="home"
        onNavigateHome={() => {}}
        onNavigateLearn={() => onOpenJourneyMap?.(pods[0]?.id)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 28,
    gap: 14,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerTextCol: {
    flex: 1,
  },
  juniorGreeting: {
    fontSize: 18,
    lineHeight: 22,
  },
  seniorName: {
    fontSize: 20,
    lineHeight: 24,
  },
  caption: {
    fontSize: 12,
    color: '#64748B',
  },
  statChip: {
    backgroundColor: '#FFFFFF',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  statText: {
    fontSize: 12,
    color: '#0F172A',
  },
  mascotSpeechCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#E6FBF8',
    borderColor: '#99F6E4',
    borderWidth: 2,
    borderRadius: 20,
    padding: 12,
  },
  mascotSpeechTitle: {
    fontSize: 14,
  },
  mascotSpeechBody: {
    fontSize: 13,
    marginTop: 2,
  },
  juniorHeroCard: {
    borderRadius: 22,
    padding: 18,
    gap: 10,
  },
  heroOverline: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.88)',
    letterSpacing: 0.6,
  },
  heroTitle: {
    fontSize: 21,
    color: '#FFFFFF',
  },
  heroProgressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  heroProgressTrack: {
    flex: 1,
    height: 10,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.25)',
    overflow: 'hidden',
  },
  heroProgressFill: {
    height: '100%',
    borderRadius: 999,
  },
  heroProgressPct: {
    fontSize: 13,
    color: '#FFFFFF',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 17,
  },
  sectionLink: {
    fontSize: 13,
  },
  podsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  podTile: {
    width: '48%',
    flexGrow: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  podIconBadge: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#E0FAF7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  podIconText: {
    fontSize: 13,
  },
  podTileTitle: {
    fontSize: 14,
  },
  podTileSub: {
    fontSize: 11,
    color: '#64748B',
  },
  missionsStubCard: {
    padding: 14,
  },
  seniorXpBanner: {
    borderRadius: 20,
    padding: 18,
    gap: 12,
  },
  seniorXpTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  seniorXpOverline: {
    fontSize: 11,
    color: '#5EEAD4',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  seniorXpValue: {
    fontSize: 22,
    color: '#FFFFFF',
    marginTop: 4,
  },
  seniorXpMuted: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.65)',
  },
  seniorNextBadge: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  seniorNextBadgeText: {
    fontSize: 12,
    color: '#FFFFFF',
  },
  seniorXpTrack: {
    height: 8,
    borderRadius: 9,
    backgroundColor: 'rgba(255,255,255,0.14)',
    overflow: 'hidden',
  },
  seniorXpFill: {
    height: '100%',
    backgroundColor: '#00BFAE',
  },
  seniorStreakCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#FFF6DB',
    borderRadius: 16,
    padding: 12,
  },
  seniorStreakTitle: {
    fontSize: 15,
  },
  seniorStreakSub: {
    fontSize: 13,
    color: '#8A5A00',
  },
  seniorContinueCard: {
    padding: 14,
    gap: 12,
  },
  seniorProjectRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  seniorProjectIcon: {
    width: 46,
    height: 46,
    borderRadius: 12,
    backgroundColor: '#EAF1FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  seniorProjectIconText: {
    fontSize: 15,
  },
  seniorProjectTitle: {
    fontSize: 16,
  },
  progressTrack: {
    height: 6,
    borderRadius: 999,
    backgroundColor: '#E2E8F0',
    overflow: 'hidden',
  },
  progressFillTeal: {
    height: '100%',
    borderRadius: 999,
  },
  seniorContinueActions: {
    flexDirection: 'row',
    gap: 10,
  },
  flexOne: {
    flex: 1,
  },
});
