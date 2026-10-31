import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SvgXml } from 'react-native-svg';
import { WebView } from 'react-native-webview';
import { createAudioPlayer } from 'expo-audio';
import * as Haptics from 'expo-haptics';

import {
  resolveTitleName,
  RewardPresentationTier,
  RewardResultDto,
} from '../api/learningApi';
import {
  APPROVED_FX01_AUDIO_ASSET,
  APPROVED_FX01_SVG,
  APPROVED_FX02_AUDIO_ASSET,
  APPROVED_FX02_SVG,
  APPROVED_FX05_AUDIO_ASSET,
  APPROVED_FX05_SVG,
  APPROVED_FX06_STATIC_SVG,
  APPROVED_FX06_SVG,
  APPROVED_FX07_STATIC_SVG,
  APPROVED_FX07_SVG,
  APPROVED_FX08_MOTION,
  APPROVED_FX08_STATIC_SVG,
  APPROVED_FX08_SVG,
  APPROVED_FX_CUES,
  APPROVED_PIP_CELEBRATE_MOTION,
  APPROVED_PIP_CELEBRATE_STATIC_SVG,
  APPROVED_PIP_CELEBRATE_SVG,
  APPROVED_PIP_SLEEPY_MOTION,
  APPROVED_PIP_SLEEPY_STATIC_SVG,
  APPROVED_PIP_SLEEPY_SVG,
  APPROVED_PIP_SLEEPY_WAKE_STATIC_SVG,
  APPROVED_UI_BADGE_EARNED_AUDIO_ASSET,
  APPROVED_UI_SUCCESS_SMALL_AUDIO_ASSET,
} from '../assets/approvedAssets';
import { TpIcon } from '../components/TpIcon';
import { useTheme } from '../theme';
import { StreakFlameIdle } from './StreakFlameIdle';

export const KIND_STREAK_PAUSED_COPY =
  'Captain Jetty kept your spot warm! Do one lesson today to start a new streak.';

export interface RewardCelebrationModalProps {
  readonly rewardResult?: RewardResultDto | null;
  readonly tierOverride?: RewardPresentationTier;
  readonly streakPaused?: boolean;
  readonly visible?: boolean;
  readonly muted?: boolean;
  readonly reducedMotion?: boolean;
  readonly reducedEffects?: boolean;
  readonly onDismiss?: () => void;
  readonly onWakeJetty?: () => void;
}

export const CELEBRATION_TIER_CUES = {
  small: APPROVED_FX_CUES['fx01-xp-coins'],
  level_up: APPROVED_FX_CUES['fx02-level-up'],
  streak: APPROVED_FX_CUES['fx05-streak-mission'],
  badge: APPROVED_FX_CUES['fx08-badge-reveal'],
  big: APPROVED_FX_CUES['fx06-confetti-burst'],
} as const;

export const CELEBRATION_MOTION_SPECS = {
  badge: APPROVED_FX08_MOTION,
  pipCelebrate: APPROVED_PIP_CELEBRATE_MOTION,
  pipSleepy: APPROVED_PIP_SLEEPY_MOTION,
} as const;

function sanitizeMascotCopy(xml: string): string {
  return xml.replace(/\bPip\b/g, 'Captain Jetty');
}

function freezeSvgAnimations(xml: string): string {
  const sanitized = sanitizeMascotCopy(xml);
  const staticStyle =
    '*, *::before, *::after { animation: none !important; transition: none !important; opacity: 1 !important; }';
  if (sanitized.includes('</style>')) {
    return sanitized.replace('</style>', `${staticStyle}\n</style>`);
  }
  return sanitized;
}

export function RewardCelebrationModal({
  rewardResult,
  tierOverride,
  streakPaused = false,
  visible = true,
  muted: mutedProp,
  reducedMotion: reducedMotionProp,
  reducedEffects: reducedEffectsProp,
  onDismiss,
  onWakeJetty,
}: RewardCelebrationModalProps): React.JSX.Element | null {
  const theme = useTheme();
  const muted = mutedProp ?? theme.muted;
  const reducedMotion = reducedMotionProp ?? theme.reducedMotion;
  const reducedEffects = reducedEffectsProp ?? theme.reducedEffects;
  const { tokens } = theme;

  const isStatic = reducedMotion || reducedEffects;
  const isStreakPausedView =
    streakPaused || rewardResult?.streak_change?.status === 'streak_paused';
  const [wakingUp, setWakingUp] = useState<boolean>(false);

  const tier: RewardPresentationTier =
    tierOverride ?? rewardResult?.presentation_tier ?? 'small';

  const audioAsset = useMemo((): number | null => {
    if (isStreakPausedView) {
      return null;
    }
    switch (tier) {
      case 'small':
        return APPROVED_FX01_AUDIO_ASSET;
      case 'level_up':
        return APPROVED_FX02_AUDIO_ASSET;
      case 'streak':
        return APPROVED_FX05_AUDIO_ASSET;
      case 'badge':
        return APPROVED_UI_BADGE_EARNED_AUDIO_ASSET;
      case 'big':
        return APPROVED_UI_SUCCESS_SMALL_AUDIO_ASSET;
      default:
        return APPROVED_FX01_AUDIO_ASSET;
    }
  }, [isStreakPausedView, tier]);

  useEffect(() => {
    if (!visible) {
      return;
    }

    let player: ReturnType<typeof createAudioPlayer> | null = null;

    if (!muted && audioAsset !== null) {
      try {
        player = createAudioPlayer(audioAsset);
        player.play();
      } catch {
        // Ignore audio playback errors in headless test environments
      }
    }

    if (!reducedMotion && !reducedEffects && !isStreakPausedView) {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    }

    return () => {
      try {
        player?.remove();
      } catch {
        // Ignore cleanup errors
      }
    };
  }, [audioAsset, isStreakPausedView, muted, reducedEffects, reducedMotion, visible]);

  const primarySvgXml = useMemo((): string => {
    if (isStreakPausedView) {
      if (wakingUp) {
        return sanitizeMascotCopy(APPROVED_PIP_SLEEPY_WAKE_STATIC_SVG);
      }
      return isStatic
        ? sanitizeMascotCopy(APPROVED_PIP_SLEEPY_STATIC_SVG)
        : sanitizeMascotCopy(APPROVED_PIP_SLEEPY_SVG);
    }

    switch (tier) {
      case 'small':
        return isStatic
          ? freezeSvgAnimations(APPROVED_FX01_SVG)
          : sanitizeMascotCopy(APPROVED_FX01_SVG);
      case 'level_up':
        return isStatic
          ? freezeSvgAnimations(APPROVED_FX02_SVG)
          : sanitizeMascotCopy(APPROVED_FX02_SVG);
      case 'streak':
        return isStatic
          ? freezeSvgAnimations(APPROVED_FX05_SVG)
          : sanitizeMascotCopy(APPROVED_FX05_SVG);
      case 'badge':
        return isStatic
          ? sanitizeMascotCopy(APPROVED_FX08_STATIC_SVG)
          : sanitizeMascotCopy(APPROVED_FX08_SVG);
      case 'big':
        return isStatic
          ? sanitizeMascotCopy(APPROVED_FX06_STATIC_SVG)
          : sanitizeMascotCopy(APPROVED_FX06_SVG);
      default:
        return isStatic
          ? freezeSvgAnimations(APPROVED_FX01_SVG)
          : sanitizeMascotCopy(APPROVED_FX01_SVG);
    }
  }, [isStatic, isStreakPausedView, tier, wakingUp]);

  const secondarySvgXml = useMemo((): string | null => {
    if (isStreakPausedView) {
      return null;
    }
    if (tier === 'level_up') {
      return isStatic
        ? sanitizeMascotCopy(APPROVED_PIP_CELEBRATE_STATIC_SVG)
        : sanitizeMascotCopy(APPROVED_PIP_CELEBRATE_SVG);
    }
    if (tier === 'big') {
      return isStatic
        ? sanitizeMascotCopy(APPROVED_FX07_STATIC_SVG)
        : sanitizeMascotCopy(APPROVED_FX07_SVG);
    }
    return null;
  }, [isStatic, isStreakPausedView, tier]);

  const htmlDocument = useMemo(() => {
    const combinedBody = secondarySvgXml
      ? `<div style="position:relative;width:100%;height:100%;display:flex;align-items:center;justify-content:center;">${primarySvgXml}<div style="position:absolute;bottom:4px;right:4px;width:96px;height:96px;">${secondarySvgXml}</div></div>`
      : primarySvgXml;

    return `<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no"/><style>html,body{margin:0;padding:0;background:transparent;overflow:hidden;display:flex;align-items:center;justify-content:center;width:100%;height:100%;}svg{width:100%;height:100%;}</style></head><body>${combinedBody}</body></html>`;
  }, [primarySvgXml, secondarySvgXml]);

  if (!visible) {
    return null;
  }

  const xpDelta =
    rewardResult?.ledger_entries
      .filter((e) => e.currency === 'xp')
      .reduce((acc, e) => acc + e.amount, 0) ?? 50;
  const coinsDelta =
    rewardResult?.ledger_entries
      .filter((e) => e.currency === 'coins')
      .reduce((acc, e) => acc + e.amount, 0) ?? 20;
  const gemsDelta =
    rewardResult?.ledger_entries
      .filter((e) => e.currency === 'gems')
      .reduce((acc, e) => acc + e.amount, 0) ?? 0;

  const currentLevel = rewardResult?.level_change.current_level ?? 2;
  const currentTitle = resolveTitleName(
    rewardResult?.new_title ?? rewardResult?.current_title,
    'Cody Coda',
  );
  const firstBadge = rewardResult?.new_badges[0] ?? {
    slug: 'first-steps',
    name: 'First Steps',
    description: 'Completed your very first TinkerPod lesson!',
    icon: 'footprints',
    color: '#63C132',
  };
  const streakCount = rewardResult?.streak_change?.current_streak ?? 1;

  if (isStreakPausedView && !rewardResult) {
    return (
      <View
        testID="reward-celebration-streak-paused"
        accessibilityRole="alert"
        accessibilityLabel={`Streak paused. ${KIND_STREAK_PAUSED_COPY}`}
        style={styles.overlay}
      >
        <View style={styles.card}>
          <View
            testID={
              wakingUp
                ? 'streak-paused-wake-frame'
                : isStatic
                  ? 'celebration-still-frame'
                  : 'celebration-animated-frame'
            }
            style={styles.artStage}
          >
            {isStatic || wakingUp ? (
              <SvgXml xml={primarySvgXml} width={160} height={160} />
            ) : (
              <WebView
                originWhitelist={['*']}
                source={{ html: htmlDocument }}
                style={styles.webView}
                scrollEnabled={false}
                pointerEvents="none"
              />
            )}
          </View>

          <Text style={[styles.headline, { fontFamily: tokens.fonts.black }]}>
            {wakingUp
              ? 'Captain Jetty is wide awake!'
              : 'Streak paused — Captain Jetty is napping'}
          </Text>
          <Text
            testID="streak-paused-kind-message"
            style={[styles.subcopy, { fontFamily: tokens.fonts.bold }]}
          >
            {KIND_STREAK_PAUSED_COPY}
          </Text>

          <Pressable
            testID="streak-paused-wake-btn"
            accessibilityRole="button"
            onPress={() => {
              setWakingUp(true);
              onWakeJetty?.();
            }}
            style={styles.primaryBtn}
          >
            <TpIcon name="play" size={16} color="#0F172A" fill="#0F172A" />
            <Text style={[styles.primaryBtnText, { fontFamily: tokens.fonts.black }]}>
              Wake Captain Jetty
            </Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View
      testID={`reward-celebration-${tier}`}
      accessibilityRole="alert"
      accessibilityLabel={`Celebration ${tier}. Captain Jetty celebrates your progress!`}
      style={styles.overlay}
    >
      <View style={styles.card}>
        <View
          testID={isStatic ? 'celebration-still-frame' : 'celebration-animated-frame'}
          style={styles.artStage}
        >
          {isStatic ? (
            <View style={styles.staticStageWrap}>
              <SvgXml xml={primarySvgXml} width={180} height={180} />
              {secondarySvgXml ? (
                <View testID="celebration-secondary-still" style={styles.secondaryPipCorner}>
                  <SvgXml xml={secondarySvgXml} width={72} height={72} />
                </View>
              ) : null}
            </View>
          ) : (
            <WebView
              originWhitelist={['*']}
              source={{ html: htmlDocument }}
              style={styles.webView}
              scrollEnabled={false}
              pointerEvents="none"
            />
          )}

          {tier === 'badge' ? (
            <View style={styles.badgeTitleOverlay}>
              <Text
                testID="reward-celebration-badge-name"
                style={[styles.badgeOverlayText, { fontFamily: tokens.fonts.black }]}
              >
                {firstBadge.name}
              </Text>
            </View>
          ) : null}
        </View>

        {tier === 'level_up' ? (
          <>
            <Text style={[styles.eyebrow, { fontFamily: tokens.fonts.extrabold }]}>
              LEVEL UP · CAPTAIN JETTY CHEERS!
            </Text>
            <Text style={[styles.headline, { fontFamily: tokens.fonts.black }]}>
              Level {currentLevel} · {currentTitle}
            </Text>
          </>
        ) : tier === 'badge' ? (
          <>
            <Text style={[styles.eyebrow, { fontFamily: tokens.fonts.extrabold }]}>
              NEW BADGE UNLOCKED
            </Text>
            <Text style={[styles.headline, { fontFamily: tokens.fonts.black }]}>
              {firstBadge.name}
            </Text>
            {firstBadge.description ? (
              <Text style={[styles.subcopy, { fontFamily: tokens.fonts.bold }]}>
                {firstBadge.description}
              </Text>
            ) : null}
          </>
        ) : tier === 'streak' ? (
          <>
            <View style={styles.streakRow}>
              <StreakFlameIdle
                size={28}
                reducedMotion={reducedMotion}
                reducedEffects={reducedEffects}
              />
              <Text style={[styles.headline, { fontFamily: tokens.fonts.black }]}>
                {streakCount}-Day Streak!
              </Text>
            </View>
            <Text style={[styles.subcopy, { fontFamily: tokens.fonts.bold }]}>
              {rewardResult?.streak_change?.message ??
                'Captain Jetty is cheering for your daily coding habit!'}
            </Text>
          </>
        ) : tier === 'big' ? (
          <>
            <Text style={[styles.eyebrow, { fontFamily: tokens.fonts.extrabold }]}>
              PERFECT SCORE · ODOGWU ENERGY!
            </Text>
            <Text style={[styles.headline, { fontFamily: tokens.fonts.black }]}>
              100% Quiz Ace!
            </Text>
          </>
        ) : (
          <>
            <Text style={[styles.eyebrow, { fontFamily: tokens.fonts.extrabold }]}>
              REWARD EARNED
            </Text>
            <Text style={[styles.headline, { fontFamily: tokens.fonts.black }]}>
              Nice work with Captain Jetty!
            </Text>
          </>
        )}

        {/* Awarded Currencies Row */}
        <View style={styles.rewardsChipsRow}>
          {xpDelta > 0 ? (
            <View testID="celebration-xp-chip" style={[styles.chip, styles.chipXp]}>
              <TpIcon name="xp" size={14} color="#6B2FD6" />
              <Text style={[styles.chipXpText, { fontFamily: tokens.fonts.extrabold }]}>
                +{xpDelta} XP
              </Text>
            </View>
          ) : null}
          {coinsDelta > 0 ? (
            <View testID="celebration-coins-chip" style={[styles.chip, styles.chipCoin]}>
              <TpIcon name="coin" size={14} color="#92400E" />
              <Text style={[styles.chipCoinText, { fontFamily: tokens.fonts.extrabold }]}>
                +{coinsDelta} Coins
              </Text>
            </View>
          ) : null}
          {gemsDelta > 0 ? (
            <View testID="celebration-gems-chip" style={[styles.chip, styles.chipGem]}>
              <TpIcon name="gem" size={14} color="#0F766E" />
              <Text style={[styles.chipGemText, { fontFamily: tokens.fonts.extrabold }]}>
                +{gemsDelta} Gems
              </Text>
            </View>
          ) : null}
        </View>

        <Pressable
          testID="reward-celebration-continue-btn"
          accessibilityRole="button"
          onPress={onDismiss}
          style={styles.primaryBtn}
        >
          <Text style={[styles.primaryBtnText, { fontFamily: tokens.fonts.black }]}>
            Awesome!
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    backgroundColor: 'rgba(15, 23, 42, 0.72)',
    padding: 20,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
  },
  card: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    alignItems: 'center',
    gap: 10,
  },
  artStage: {
    width: 200,
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  staticStageWrap: {
    width: 200,
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryPipCorner: {
    position: 'absolute',
    right: 4,
    bottom: 4,
  },
  webView: {
    width: 200,
    height: 200,
    backgroundColor: 'transparent',
  },
  badgeTitleOverlay: {
    position: 'absolute',
    bottom: 12,
    backgroundColor: '#6B2FD6',
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 9999,
  },
  badgeOverlayText: {
    fontSize: 13,
    color: '#FFFFFF',
  },
  eyebrow: {
    fontSize: 11,
    color: '#6B2FD6',
    letterSpacing: 0.6,
  },
  headline: {
    fontSize: 20,
    color: '#0F172A',
    textAlign: 'center',
  },
  subcopy: {
    fontSize: 13,
    color: '#475569',
    textAlign: 'center',
    lineHeight: 19,
  },
  streakRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  rewardsChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    marginTop: 4,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 9999,
  },
  chipXp: {
    backgroundColor: '#EDE9FE',
  },
  chipXpText: {
    fontSize: 13,
    color: '#6B2FD6',
  },
  chipCoin: {
    backgroundColor: '#FEF3C7',
  },
  chipCoinText: {
    fontSize: 13,
    color: '#92400E',
  },
  chipGem: {
    backgroundColor: '#CCFBF1',
  },
  chipGemText: {
    fontSize: 13,
    color: '#0F766E',
  },
  primaryBtn: {
    marginTop: 6,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FFB700',
    paddingVertical: 13,
    borderRadius: 16,
  },
  primaryBtnText: {
    fontSize: 15,
    color: '#0F172A',
  },
});
