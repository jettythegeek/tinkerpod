import React, { useCallback, useEffect, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import {
  fetchKidProfile,
  KidProfileFullData,
  resolveTitleName,
} from '../../api/learningApi';
import { APPROVED_GIRL_CUTOUT_ASSET } from '../../assets/approvedAssets';
import { TpIcon, TpIconName } from '../../components/TpIcon';
import { useTheme } from '../../theme';
import { useAuth } from '../auth/AuthContext';
import { KidBottomNav, KidNavTab } from './components/KidBottomNav';
import { DEFAULT_REWARD_BADGES, RewardBadgeItem } from './RewardsScreen';

export interface TitleLadderStep {
  readonly slug: string;
  readonly name: string;
  readonly minLevel: number;
  readonly status: 'earned' | 'current' | 'locked';
}

export interface KidProfileScreenProps {
  readonly firstName?: string;
  readonly ageBand?: string;
  readonly level?: number;
  readonly title?: string;
  readonly nextTitle?: string;
  readonly streakDays?: number;
  readonly lessonsCompleted?: number;
  readonly totalXp?: number;
  readonly nextLevelXp?: number;
  readonly badgesEarnedCount?: number;
  readonly titleLadder?: readonly TitleLadderStep[];
  readonly badges?: readonly RewardBadgeItem[];
  readonly autoFetch?: boolean;
  readonly onSelectTab?: (tab: KidNavTab) => void;
}

export const DEFAULT_TITLE_LADDER: readonly TitleLadderStep[] = [
  { slug: 'cody-coda', name: 'Cody Coda', minLevel: 1, status: 'earned' },
  { slug: 'jango-jango', name: 'Jango-Jango', minLevel: 3, status: 'current' },
  { slug: 'design-sultan', name: 'Design Sultan', minLevel: 6, status: 'locked' },
  { slug: 'odogwu', name: 'Odogwu', minLevel: 10, status: 'locked' },
];

export function KidProfileScreen({
  firstName,
  ageBand,
  level,
  title,
  nextTitle,
  streakDays,
  lessonsCompleted = 24,
  totalXp,
  nextLevelXp,
  badgesEarnedCount,
  titleLadder,
  badges,
  autoFetch,
  onSelectTab,
}: KidProfileScreenProps = {}): React.JSX.Element {
  const { tokens } = useTheme();
  const { kidProfile: child, token } = useAuth();
  const [liveData, setLiveData] = useState<KidProfileFullData | null>(null);

  const shouldFetch = autoFetch ?? Boolean(token && totalXp === undefined);

  const loadProfile = useCallback(async () => {
    try {
      const res = await fetchKidProfile();
      if (res.data?.profile) {
        setLiveData(res.data);
      }
    } catch {
      // Fall back to props / demo values if offline
    }
  }, []);

  useEffect(() => {
    if (shouldFetch) {
      void loadProfile();
    }
  }, [loadProfile, shouldFetch]);

  const liveProfile = liveData?.profile;
  const resolvedFirstName =
    firstName ?? liveData?.child?.first_name ?? child?.first_name ?? 'Amara';
  const resolvedAgeBand =
    ageBand ?? liveData?.child?.age_band ?? child?.age_band ?? '8–11';
  const resolvedLevel = level ?? liveProfile?.level ?? 4;
  const resolvedTitle =
    title ?? (liveProfile ? resolveTitleName(liveProfile.title, 'Cody Coda') : 'Jango-Jango');
  const resolvedNextTitle =
    nextTitle ??
    (liveProfile ? resolveTitleName(liveProfile.next_title, 'Odogwu') : 'Design Sultan');
  const resolvedStreakDays =
    streakDays ?? liveProfile?.stats.streak_days ?? 7;
  const resolvedTotalXp = totalXp ?? liveProfile?.stats.total_xp ?? 680;
  const resolvedNextLevelXp =
    nextLevelXp ?? liveProfile?.next_level_xp ?? (liveProfile ? liveProfile.current_level_xp + 100 : 1000);
  const xpProgressPct =
    liveProfile && totalXp === undefined
      ? liveProfile.progress_percent
      : Math.min(100, Math.round((resolvedTotalXp / Math.max(1, resolvedNextLevelXp)) * 100));

  const resolvedBadges: readonly RewardBadgeItem[] =
    badges ??
    (liveProfile?.badges.all
      ? liveProfile.badges.all.map((b) => ({
          slug: b.slug,
          name: b.name,
          icon: (b.icon as TpIconName) || 'trophy',
          earned: Boolean(b.is_earned),
          color: b.color || '#7C3AED',
        }))
      : DEFAULT_REWARD_BADGES.slice(0, 6));

  const resolvedBadgesEarnedCount =
    badgesEarnedCount ??
    liveProfile?.badges.earned_count ??
    resolvedBadges.filter((b) => b.earned).length;
  const resolvedBadgesTotalCount =
    liveProfile?.badges.total_count ?? Math.max(resolvedBadges.length, 12);

  const resolvedLadder: readonly TitleLadderStep[] =
    titleLadder ??
    (liveProfile?.title_ladder
      ? liveProfile.title_ladder.slice(0, 4).map((step) => ({
          slug: step.slug,
          name: step.name,
          minLevel: step.min_level,
          status: step.is_current
            ? 'current'
            : step.unlocked
              ? 'earned'
              : 'locked',
        }))
      : DEFAULT_TITLE_LADDER);

  return (
    <View testID="kid-profile-screen" style={styles.root}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Purple Profile Hero matching 07-profile.png */}
        <View style={styles.heroHeader}>
          <View style={styles.heroTopRow}>
            <Text style={[styles.heroScreenTitle, { fontFamily: tokens.fonts.black }]}>
              My Profile
            </Text>
            <Pressable
              testID="kid-profile-settings-btn"
              accessibilityRole="button"
              accessibilityLabel="Settings"
              style={styles.settingsBtn}
            >
              <TpIcon name="settings" size={18} color="#FFFFFF" />
            </Pressable>
          </View>

          <View style={styles.heroIdentityRow}>
            <View style={styles.portraitRing}>
              <Image
                testID="kid-profile-girl-cutout"
                source={APPROVED_GIRL_CUTOUT_ASSET}
                accessibilityLabel={`${resolvedFirstName} portrait`}
                style={styles.portraitImage}
                resizeMode="cover"
              />
            </View>
            <View style={styles.identityTextCol}>
              <View style={styles.titleGoldChip}>
                <TpIcon name="crown" size={12} color="#0F172A" />
                <Text style={[styles.titleGoldChipText, { fontFamily: tokens.fonts.black }]}>
                  {resolvedTitle}
                </Text>
              </View>
              <Text
                testID="kid-profile-display-name"
                style={[styles.displayName, { fontFamily: tokens.fonts.black }]}
              >
                {resolvedFirstName}
              </Text>
              <View style={styles.metaChipsRow}>
                <View style={styles.metaGlassChip}>
                  <Text style={[styles.metaGlassChipText, { fontFamily: tokens.fonts.extrabold }]}>
                    Level {resolvedLevel}
                  </Text>
                </View>
                <View style={styles.metaGlassChip}>
                  <Text style={[styles.metaGlassChipText, { fontFamily: tokens.fonts.extrabold }]}>
                    Ages {resolvedAgeBand}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.bodyPadding}>
          {/* 4 Stats Row */}
          <View testID="kid-profile-stats-row" style={styles.statsGrid}>
            <View style={styles.statCard}>
              <TpIcon name="flame" size={20} color="#F97316" />
              <Text style={[styles.statNumber, { fontFamily: tokens.fonts.black }]}>
                {resolvedStreakDays}d
              </Text>
              <Text style={[styles.statLabel, { fontFamily: tokens.fonts.bold }]}>
                Streak
              </Text>
            </View>
            <View style={styles.statCard}>
              <TpIcon name="check" size={20} color="#10B981" />
              <Text style={[styles.statNumber, { fontFamily: tokens.fonts.black }]}>
                {lessonsCompleted}
              </Text>
              <Text style={[styles.statLabel, { fontFamily: tokens.fonts.bold }]}>
                Lessons
              </Text>
            </View>
            <View style={styles.statCard}>
              <TpIcon name="xp" size={20} color="#6B2FD6" />
              <Text style={[styles.statNumber, { fontFamily: tokens.fonts.black }]}>
                {resolvedTotalXp}
              </Text>
              <Text style={[styles.statLabel, { fontFamily: tokens.fonts.bold }]}>
                Total XP
              </Text>
            </View>
            <View style={styles.statCard}>
              <TpIcon name="trophy" size={20} color="#D97706" />
              <Text style={[styles.statNumber, { fontFamily: tokens.fonts.black }]}>
                {resolvedBadgesEarnedCount}
              </Text>
              <Text style={[styles.statLabel, { fontFamily: tokens.fonts.bold }]}>
                Badges
              </Text>
            </View>
          </View>

          {/* Title Ladder */}
          <View testID="kid-profile-title-ladder" style={styles.ladderCard}>
            <View style={styles.ladderHeaderRow}>
              <Text style={[styles.sectionHeading, { fontFamily: tokens.fonts.black }]}>
                Title ladder
              </Text>
              <Text style={[styles.ladderNextText, { fontFamily: tokens.fonts.extrabold }]}>
                Next: {resolvedNextTitle}
              </Text>
            </View>
            <View testID="kid-profile-xp-bar" style={styles.xpBarTrack}>
              <View style={[styles.xpBarFill, { width: `${xpProgressPct}%` }]} />
            </View>
            <View style={styles.ladderRow}>
              {resolvedLadder.map((step) => {
                const isEarned = step.status === 'earned';
                const isCurrent = step.status === 'current';
                return (
                  <View
                    key={step.slug}
                    testID={`title-ladder-${step.slug}`}
                    style={[
                      styles.ladderStepBox,
                      isEarned
                        ? styles.ladderStepEarned
                        : isCurrent
                          ? styles.ladderStepCurrent
                          : styles.ladderStepLocked,
                    ]}
                  >
                    <Text
                      style={[
                        styles.ladderStepText,
                        {
                          color: isEarned
                            ? '#065F46'
                            : isCurrent
                              ? '#FFFFFF'
                              : '#64748B',
                          fontFamily: tokens.fonts.extrabold,
                        },
                      ]}
                    >
                      {step.name}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>

          {/* Badges */}
          <View style={styles.ladderHeaderRow}>
            <Text style={[styles.sectionHeading, { fontFamily: tokens.fonts.black }]}>
              Badges
            </Text>
            <Text style={[styles.ladderNextText, { fontFamily: tokens.fonts.extrabold }]}>
              {resolvedBadgesEarnedCount} of {resolvedBadgesTotalCount} earned
            </Text>
          </View>

          <View testID="kid-profile-badges-grid" style={styles.badgesGrid}>
            {resolvedBadges.map((badge) => (
              <View
                key={badge.slug}
                style={[
                  styles.badgeCol,
                  !badge.earned ? styles.badgeColLocked : null,
                ]}
              >
                <View
                  style={[
                    styles.badgeHex,
                    { backgroundColor: badge.earned ? badge.color : '#E2E8F0' },
                  ]}
                >
                  <TpIcon
                    name={badge.earned ? badge.icon : 'lock'}
                    size={22}
                    color={badge.earned ? '#FFFFFF' : '#64748B'}
                  />
                </View>
                <Text
                  style={[
                    styles.badgeName,
                    {
                      color: badge.earned ? '#0F172A' : '#64748B',
                      fontFamily: tokens.fonts.extrabold,
                    },
                  ]}
                >
                  {badge.name}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      <KidBottomNav activeTab="me" onSelectTab={onSelectTab} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#FAF8FF',
  },
  scrollContent: {
    paddingBottom: 24,
  },
  heroHeader: {
    backgroundColor: '#6B2FD6',
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 22,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  heroScreenTitle: {
    fontSize: 16,
    color: '#FFFFFF',
  },
  settingsBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroIdentityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginTop: 12,
  },
  portraitRing: {
    width: 84,
    height: 84,
    borderRadius: 42,
    padding: 3,
    backgroundColor: '#FFB700',
    overflow: 'hidden',
  },
  portraitImage: {
    width: '100%',
    height: '100%',
    borderRadius: 39,
    backgroundColor: '#FDE68A',
  },
  identityTextCol: {
    flex: 1,
    gap: 4,
  },
  titleGoldChip: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFB700',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 9999,
  },
  titleGoldChipText: {
    fontSize: 11,
    color: '#0F172A',
  },
  displayName: {
    fontSize: 22,
    color: '#FFFFFF',
  },
  metaChipsRow: {
    flexDirection: 'row',
    gap: 6,
  },
  metaGlassChip: {
    backgroundColor: 'rgba(255,255,255,0.18)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 9999,
  },
  metaGlassChipText: {
    fontSize: 11,
    color: '#FFFFFF',
  },
  bodyPadding: {
    paddingHorizontal: 16,
    paddingTop: 14,
    gap: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EEF2FF',
  },
  statNumber: {
    fontSize: 16,
    color: '#0F172A',
    marginTop: 2,
  },
  statLabel: {
    fontSize: 10,
    color: '#64748B',
  },
  ladderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 12,
    borderWidth: 1,
    borderColor: '#EEF2FF',
    gap: 8,
  },
  ladderHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionHeading: {
    fontSize: 14,
    color: '#0F172A',
  },
  ladderNextText: {
    fontSize: 11,
    color: '#6B2FD6',
  },
  xpBarTrack: {
    height: 6,
    borderRadius: 9999,
    backgroundColor: '#EEF2FF',
    overflow: 'hidden',
  },
  xpBarFill: {
    height: '100%',
    borderRadius: 9999,
    backgroundColor: '#6B2FD6',
  },
  ladderRow: {
    flexDirection: 'row',
    gap: 6,
  },
  ladderStepBox: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 7,
    paddingHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ladderStepEarned: {
    backgroundColor: '#D1FAE5',
  },
  ladderStepCurrent: {
    backgroundColor: '#6B2FD6',
  },
  ladderStepLocked: {
    backgroundColor: '#F1F5F9',
  },
  ladderStepText: {
    fontSize: 10,
    textAlign: 'center',
  },
  badgesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 12,
  },
  badgeCol: {
    width: '31%',
    alignItems: 'center',
    gap: 4,
  },
  badgeColLocked: {
    opacity: 0.5,
  },
  badgeHex: {
    width: 60,
    height: 60,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeName: {
    fontSize: 11,
    textAlign: 'center',
  },
});
