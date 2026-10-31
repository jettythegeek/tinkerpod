import React from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import {
  APPROVED_FX10_FLAME_IDLE_PNG,
  APPROVED_PIP_SLEEPY_PNG,
} from '../../assets/approvedAssets';
import { TpIcon, TpIconName } from '../../components/TpIcon';
import { useTheme } from '../../theme';
import { KidBottomNav, KidNavTab } from './components/KidBottomNav';

export interface RewardBadgeItem {
  readonly slug: string;
  readonly name: string;
  readonly icon: TpIconName;
  readonly earned: boolean;
  readonly color: string;
}

export interface RewardsScreenProps {
  readonly xp?: number;
  readonly nextLevelXp?: number;
  readonly coins?: number;
  readonly gems?: number;
  readonly level?: number;
  readonly title?: string;
  readonly nextTitle?: string;
  readonly streakDays?: number;
  readonly streakPaused?: boolean;
  readonly badges?: readonly RewardBadgeItem[];
  readonly onWakeJetty?: () => void;
  readonly onSelectTab?: (tab: KidNavTab) => void;
}

export const DEFAULT_REWARD_BADGES: readonly RewardBadgeItem[] = [
  { slug: 'first-run', name: 'First Run', icon: 'rocket', earned: true, color: '#F59E0B' },
  { slug: '7-day-fire', name: '7-Day Fire', icon: 'flame', earned: true, color: '#EF4444' },
  { slug: 'loop-master', name: 'Loop Master', icon: 'repeat', earned: true, color: '#7C3AED' },
  { slug: 'bug-hunter', name: 'Bug Hunter', icon: 'bug', earned: true, color: '#00BFAE' },
  { slug: 'game-maker', name: 'Game Maker', icon: 'gamepad-2', earned: true, color: '#2563EB' },
  { slug: 'locked-1', name: '10-Day Streak', icon: 'lock', earned: false, color: '#E2E8F0' },
  { slug: 'locked-2', name: 'Quiz Ace', icon: 'lock', earned: false, color: '#E2E8F0' },
  { slug: 'locked-3', name: 'Pod Finisher', icon: 'lock', earned: false, color: '#E2E8F0' },
];

export function RewardsScreen({
  xp = 680,
  nextLevelXp = 1000,
  coins = 420,
  gems = 18,
  level = 4,
  title = 'Jango-Jango',
  nextTitle = 'Eze Code',
  streakDays = 7,
  streakPaused = false,
  badges = DEFAULT_REWARD_BADGES,
  onWakeJetty,
  onSelectTab,
}: RewardsScreenProps = {}): React.JSX.Element {
  const { tokens } = useTheme();
  const safeNextXp = Math.max(1, nextLevelXp);
  const progressPct = Math.min(100, Math.round((xp / safeNextXp) * 100));
  const earnedCount = badges.filter((b) => b.earned).length;

  return (
    <View testID="rewards-screen" style={styles.root}>
      {/* Purple Header (44-rewards.png & 45-rewards-streak-paused.png) */}
      <View style={styles.header}>
        <View style={styles.headerTopRow}>
          <View>
            <Text style={[styles.headerEyebrow, { fontFamily: tokens.fonts.extrabold }]}>
              LEVEL · STREAK · BADGES
            </Text>
            <Text style={[styles.headerTitle, { fontFamily: tokens.fonts.black }]}>
              Rewards
            </Text>
          </View>
          <View style={styles.headerChipsRow}>
            <View testID="rewards-coins-chip" style={styles.headerGlassChip}>
              <TpIcon name="coin" size={13} color="#FDE68A" />
              <Text style={[styles.headerGlassChipText, { fontFamily: tokens.fonts.extrabold }]}>
                {coins}
              </Text>
            </View>
            <View testID="rewards-gems-chip" style={styles.headerGlassChip}>
              <TpIcon name="gem" size={13} color="#99F6E4" />
              <Text style={[styles.headerGlassChipText, { fontFamily: tokens.fonts.extrabold }]}>
                {gems}
              </Text>
            </View>
          </View>
        </View>

        {/* Level + Naija Title Card */}
        <View testID="rewards-level-card" style={styles.levelCard}>
          <View style={styles.levelBadgeBox}>
            <Text style={[styles.levelBadgeEyebrow, { fontFamily: tokens.fonts.extrabold }]}>
              LVL
            </Text>
            <Text style={[styles.levelBadgeNumber, { fontFamily: tokens.fonts.black }]}>
              {level}
            </Text>
          </View>
          <View style={styles.levelCardBody}>
            <View style={styles.naijaTitleChip}>
              <TpIcon name="crown" size={12} color="#92400E" />
              <Text style={[styles.naijaTitleText, { fontFamily: tokens.fonts.black }]}>
                {title}
              </Text>
            </View>
            <View style={styles.levelProgressTrack}>
              <View style={[styles.levelProgressFill, { width: `${progressPct}%` }]} />
            </View>
            <View style={styles.levelProgressMetaRow}>
              <Text style={[styles.levelMetaText, { fontFamily: tokens.fonts.extrabold }]}>
                {xp} / {safeNextXp} XP
              </Text>
              <Text style={[styles.levelMetaPurple, { fontFamily: tokens.fonts.extrabold }]}>
                Next: {nextTitle} →
              </Text>
            </View>
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.bodyScroll}>
        {/* Streak Card: Active (44) vs Paused (45) */}
        {streakPaused ? (
          <View testID="rewards-streak-paused-card" style={styles.streakPausedCard}>
            <View style={styles.streakPausedTop}>
              <Image
                testID="rewards-pip-sleepy"
                source={APPROVED_PIP_SLEEPY_PNG}
                accessibilityLabel="Captain Jetty sleeping"
                style={styles.streakMascotImage}
                resizeMode="contain"
              />
              <View style={styles.streakTextCol}>
                <Text style={[styles.streakPausedTitle, { fontFamily: tokens.fonts.black }]}>
                  Streak paused — Captain Jetty is napping
                </Text>
                <Text style={[styles.streakPausedSub, { fontFamily: tokens.fonts.bold }]}>
                  Captain Jetty kept your spot warm! Your {streakDays} days are safe — do one
                  lesson today to start a new streak.
                </Text>
              </View>
            </View>

            <View style={styles.weekDaysRow}>
              {(['M', 'T', 'W', 'T', 'F', 'S', 'S'] as const).map((dayLabel, idx) => {
                const isDone = idx < 4;
                const isToday = idx === 4;
                return (
                  <View key={`${dayLabel}-${idx}`} style={styles.dayCol}>
                    <View
                      style={[
                        styles.dayCircle,
                        isDone
                          ? styles.dayCircleDone
                          : isToday
                            ? styles.dayCirclePausedToday
                            : styles.dayCircleFuture,
                      ]}
                    >
                      {isDone ? (
                        <TpIcon name="check" size={11} color="#92400E" />
                      ) : (
                        <Text style={[styles.dayCircleText, { fontFamily: tokens.fonts.extrabold }]}>
                          {isToday ? 'Zz' : '·'}
                        </Text>
                      )}
                    </View>
                    <Text style={[styles.dayLabelText, { fontFamily: tokens.fonts.extrabold }]}>
                      {isToday ? 'Today' : dayLabel}
                    </Text>
                  </View>
                );
              })}
            </View>

            <Pressable
              testID="rewards-wake-jetty-btn"
              accessibilityRole="button"
              onPress={() => {
                if (onWakeJetty) {
                  onWakeJetty();
                } else {
                  onSelectTab?.('learn');
                }
              }}
              style={styles.wakeJettyCta}
            >
              <TpIcon name="play" size={14} color="#0F172A" fill="#0F172A" />
              <Text style={[styles.wakeJettyCtaText, { fontFamily: tokens.fonts.black }]}>
                Wake Jetty · do 1 lesson
              </Text>
            </Pressable>
          </View>
        ) : (
          <View testID="rewards-streak-active-card" style={styles.streakActiveCard}>
            <View style={styles.streakActiveTop}>
              <Image
                testID="rewards-flame-idle"
                source={APPROVED_FX10_FLAME_IDLE_PNG}
                accessibilityLabel="Active streak flame"
                style={styles.streakFlameImage}
                resizeMode="contain"
              />
              <View style={styles.streakTextCol}>
                <Text style={[styles.streakActiveTitle, { fontFamily: tokens.fonts.black }]}>
                  {streakDays}-day streak · on fire!
                </Text>
                <Text style={[styles.streakActiveSub, { fontFamily: tokens.fonts.bold }]}>
                  Lagos time · 1 grace day saved if life gets busy
                </Text>
              </View>
            </View>

            <View style={styles.weekDaysRow}>
              {(['M', 'T', 'W', 'T', 'F', 'S', 'S'] as const).map((dayLabel, idx) => (
                <View key={`${dayLabel}-${idx}`} style={styles.dayCol}>
                  <View style={[styles.dayCircle, styles.dayCircleActiveFire]}>
                    <TpIcon name="check" size={11} color="#FFFFFF" />
                  </View>
                  <Text style={[styles.dayLabelActiveText, { fontFamily: tokens.fonts.extrabold }]}>
                    {idx === 6 ? 'Today' : dayLabel}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* 3 Currency Summary Tiles */}
        <View style={styles.currenciesRow}>
          <View style={styles.currencyTile}>
            <TpIcon name="xp" size={20} color="#6B2FD6" />
            <Text style={[styles.currencyTileValue, { fontFamily: tokens.fonts.black }]}>
              {xp}
            </Text>
            <Text style={[styles.currencyTileLabel, { fontFamily: tokens.fonts.extrabold }]}>
              Total XP
            </Text>
          </View>
          <View style={styles.currencyTile}>
            <TpIcon name="coin" size={20} color="#D97706" />
            <Text style={[styles.currencyTileValue, { fontFamily: tokens.fonts.black }]}>
              {coins}
            </Text>
            <Text style={[styles.currencyTileLabel, { fontFamily: tokens.fonts.extrabold }]}>
              Coins
            </Text>
          </View>
          <View style={styles.currencyTile}>
            <TpIcon name="gem" size={20} color="#0D9488" />
            <Text style={[styles.currencyTileValue, { fontFamily: tokens.fonts.black }]}>
              {gems}
            </Text>
            <Text style={[styles.currencyTileLabel, { fontFamily: tokens.fonts.extrabold }]}>
              Gems
            </Text>
          </View>
        </View>

        {/* Badges Grid */}
        <View style={styles.badgesHeaderRow}>
          <Text style={[styles.badgesHeading, { fontFamily: tokens.fonts.black }]}>
            Badges
          </Text>
          <Text style={[styles.badgesCountText, { fontFamily: tokens.fonts.extrabold }]}>
            {earnedCount} of {badges.length} earned
          </Text>
        </View>

        <View testID="rewards-badges-grid" style={styles.badgesGrid}>
          {badges.map((badge) => (
            <View
              key={badge.slug}
              testID={`reward-badge-${badge.slug}`}
              style={[
                styles.badgeItem,
                !badge.earned ? styles.badgeItemLocked : null,
              ]}
            >
              <View
                style={[
                  styles.badgeHexBox,
                  { backgroundColor: badge.earned ? badge.color : '#E2E8F0' },
                ]}
              >
                <TpIcon
                  name={badge.earned ? badge.icon : 'lock'}
                  size={20}
                  color={badge.earned ? '#FFFFFF' : '#64748B'}
                />
              </View>
              <Text
                style={[
                  styles.badgeLabel,
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
      </ScrollView>

      <KidBottomNav activeTab="rewards" onSelectTab={onSelectTab} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#FAF8FF',
  },
  header: {
    backgroundColor: '#6B2FD6',
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 16,
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerEyebrow: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.78)',
    letterSpacing: 0.6,
  },
  headerTitle: {
    fontSize: 20,
    color: '#FFFFFF',
  },
  headerChipsRow: {
    flexDirection: 'row',
    gap: 6,
  },
  headerGlassChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.18)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 9999,
  },
  headerGlassChipText: {
    fontSize: 12,
    color: '#FFFFFF',
  },
  levelCard: {
    marginTop: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  levelBadgeBox: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: '#6B2FD6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  levelBadgeEyebrow: {
    fontSize: 9,
    color: 'rgba(255,255,255,0.8)',
  },
  levelBadgeNumber: {
    fontSize: 20,
    color: '#FFFFFF',
  },
  levelCardBody: {
    flex: 1,
  },
  naijaTitleChip: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 9999,
  },
  naijaTitleText: {
    fontSize: 11,
    color: '#92400E',
  },
  levelProgressTrack: {
    height: 8,
    borderRadius: 9999,
    backgroundColor: '#EEF2FF',
    marginTop: 6,
    overflow: 'hidden',
  },
  levelProgressFill: {
    height: '100%',
    backgroundColor: '#6B2FD6',
  },
  levelProgressMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 3,
  },
  levelMetaText: {
    fontSize: 10,
    color: '#64748B',
  },
  levelMetaPurple: {
    fontSize: 10,
    color: '#6B2FD6',
  },
  bodyScroll: {
    padding: 16,
    gap: 12,
  },
  streakActiveCard: {
    backgroundColor: '#FFF7ED',
    borderRadius: 18,
    padding: 12,
    borderWidth: 1.5,
    borderColor: '#FED7AA',
  },
  streakActiveTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  streakFlameImage: {
    width: 48,
    height: 48,
  },
  streakMascotImage: {
    width: 52,
    height: 52,
  },
  streakTextCol: {
    flex: 1,
  },
  streakActiveTitle: {
    fontSize: 15,
    color: '#9A3412',
  },
  streakActiveSub: {
    fontSize: 11,
    color: '#C2410C',
    marginTop: 2,
  },
  streakPausedCard: {
    backgroundColor: '#FFFBEB',
    borderRadius: 18,
    padding: 12,
    borderWidth: 1.5,
    borderColor: '#FDE68A',
    gap: 10,
  },
  streakPausedTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  streakPausedTitle: {
    fontSize: 14,
    color: '#78350F',
  },
  streakPausedSub: {
    fontSize: 11,
    lineHeight: 15,
    color: '#92400E',
    marginTop: 2,
  },
  weekDaysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  dayCol: {
    alignItems: 'center',
    gap: 3,
  },
  dayCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayCircleActiveFire: {
    backgroundColor: '#F97316',
  },
  dayCircleDone: {
    backgroundColor: '#FDE68A',
  },
  dayCirclePausedToday: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#F59E0B',
  },
  dayCircleFuture: {
    backgroundColor: '#FEF3C7',
  },
  dayCircleText: {
    fontSize: 10,
    color: '#92400E',
  },
  dayLabelText: {
    fontSize: 9,
    color: '#92400E',
  },
  dayLabelActiveText: {
    fontSize: 9,
    color: '#9A3412',
  },
  wakeJettyCta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#FFB700',
    paddingVertical: 10,
    borderRadius: 12,
  },
  wakeJettyCtaText: {
    fontSize: 12,
    color: '#0F172A',
  },
  currenciesRow: {
    flexDirection: 'row',
    gap: 8,
  },
  currencyTile: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EEF2FF',
  },
  currencyTileValue: {
    fontSize: 16,
    color: '#0F172A',
    marginTop: 2,
  },
  currencyTileLabel: {
    fontSize: 10,
    color: '#64748B',
  },
  badgesHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  badgesHeading: {
    fontSize: 14,
    color: '#0F172A',
  },
  badgesCountText: {
    fontSize: 11,
    color: '#6B2FD6',
  },
  badgesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 12,
  },
  badgeItem: {
    width: '23%',
    alignItems: 'center',
    gap: 4,
  },
  badgeItemLocked: {
    opacity: 0.55,
  },
  badgeHexBox: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeLabel: {
    fontSize: 10,
    textAlign: 'center',
  },
});
