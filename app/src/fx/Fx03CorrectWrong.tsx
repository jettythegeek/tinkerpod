import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { createAudioPlayer } from 'expo-audio';
import * as Haptics from 'expo-haptics';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, Path } from 'react-native-svg';
import { APPROVED_FX03_AUDIO_ASSET } from '../assets/approvedAssets';
import { useTheme } from '../theme';

/**
 * Approved timings from `design/fx/src/cues.json` (`fx03-correct-wrong`)
 * and `design/motion/moods.json` (`happy` on `correct`, `sad` on `wrong`).
 */
export const FX03_TIMINGS = {
  totalDurationMs: 2200,
  whooshCueMs: 100,
  sparkleCueMs: 250,
  boopCueMs: 1200,
  happyMoodDurationMs: 1400,
  sadMoodDurationMs: 1600,
} as const;

export interface Fx03CorrectWrongProps {
  readonly variant: 'correct' | 'wrong';
  readonly explanation?: string | null;
  readonly muted?: boolean;
  readonly reducedMotion?: boolean;
  readonly testID?: string;
}

export function Fx03CorrectWrong({
  variant,
  explanation,
  muted: mutedProp,
  reducedMotion: reducedMotionProp,
  testID = 'fx03-banner',
}: Fx03CorrectWrongProps): React.JSX.Element {
  const { tokens, muted: themeMuted, reducedMotion: themeReducedMotion, reducedEffects } =
    useTheme();

  const isMuted = mutedProp ?? themeMuted;
  const isReducedMotion = reducedMotionProp ?? (themeReducedMotion || reducedEffects);

  const translateX = useSharedValue(0);
  const scale = useSharedValue(1);

  useEffect(() => {
    if (!isMuted) {
      try {
        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch {
        // Ignore haptics errors in unsupported environments
      }

      try {
        const player = createAudioPlayer(APPROVED_FX03_AUDIO_ASSET);
        player.play();
      } catch {
        // Ignore audio errors in headless test environments
      }
    }
  }, [isMuted, variant]);

  useEffect(() => {
    if (isReducedMotion) {
      cancelAnimation(translateX);
      cancelAnimation(scale);
      translateX.value = 0;
      scale.value = 1;
      return;
    }

    if (variant === 'correct') {
      translateX.value = 0;
      scale.value = withSequence(
        withTiming(1.04, {
          duration: FX03_TIMINGS.sparkleCueMs,
          easing: Easing.inOut(Easing.sin),
        }),
        withTiming(1, {
          duration: FX03_TIMINGS.happyMoodDurationMs - FX03_TIMINGS.sparkleCueMs,
          easing: Easing.inOut(Easing.sin),
        }),
      );
    } else {
      scale.value = 1;
      translateX.value = withSequence(
        withTiming(-10, { duration: 70 }),
        withTiming(10, { duration: 70 }),
        withTiming(-8, { duration: 70 }),
        withTiming(8, { duration: 70 }),
        withTiming(-4, { duration: 70 }),
        withTiming(0, { duration: 70 }),
      );
    }

    return () => {
      cancelAnimation(translateX);
      cancelAnimation(scale);
    };
  }, [isReducedMotion, scale, translateX, variant]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }, { scale: scale.value }],
  }));

  const isCorrect = variant === 'correct';
  const cardBg = isCorrect ? '#ECFEF6' : '#FFF8EB';
  const cardBorder = isCorrect ? tokens.colors.success : tokens.colors.accents.amber;
  const headingColor = isCorrect ? '#15803D' : '#B45309';
  const subColor = isCorrect ? '#166534' : '#92400E';

  const headingText = isCorrect ? 'Correct!' : 'Not quite. Try again!';
  const subtitleText = isCorrect
    ? 'Captain Jetty is proud of you'
    : 'Let’s look at the hint and try once more.';

  return (
    <Animated.View
      testID={testID}
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
      accessibilityLabel={`${headingText} ${subtitleText}`}
      style={[
        styles.card,
        {
          backgroundColor: cardBg,
          borderColor: cardBorder,
        },
        animatedStyle,
      ]}
    >
      <View
        testID={isReducedMotion ? 'fx03-still-frame' : 'fx03-animated-frame'}
        style={styles.row}
      >
        {/* Icon geometry from design/fx/svg/fx03-correct-wrong.svg */}
        <Svg width={44} height={44} viewBox="0 0 44 44">
          {isCorrect ? (
            <>
              <Circle cx="22" cy="22" r="22" fill="#63C132" />
              <Path
                d="M13 22.5 L19.5 29 L31 16"
                fill="none"
                stroke="#FFFFFF"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </>
          ) : (
            <>
              <Circle cx="22" cy="22" r="22" fill="#FFB700" />
              <Path
                d="M22 12 L22 24"
                stroke="#0F172A"
                strokeWidth="4"
                strokeLinecap="round"
              />
              <Circle cx="22" cy="31" r="2.5" fill="#0F172A" />
            </>
          )}
        </Svg>

        <View style={styles.textCol}>
          <Text
            testID="fx03-heading"
            style={[
              styles.heading,
              {
                color: headingColor,
                fontFamily: tokens.fonts.black,
              },
            ]}
          >
            {headingText}
          </Text>
          <Text
            testID="fx03-subtitle"
            style={[
              styles.subtitle,
              {
                color: subColor,
                fontFamily: tokens.fonts.bold,
              },
            ]}
          >
            {subtitleText}
          </Text>
          {explanation ? (
            <Text
              testID="fx03-explanation"
              style={[
                styles.explanation,
                {
                  color: tokens.colors.ink,
                  fontFamily: tokens.fonts.bold,
                },
              ]}
            >
              {explanation}
            </Text>
          ) : null}
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    borderRadius: 20,
    borderWidth: 2.5,
    padding: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  textCol: {
    flex: 1,
    gap: 2,
  },
  heading: {
    fontSize: 18,
  },
  subtitle: {
    fontSize: 13,
  },
  explanation: {
    fontSize: 13,
    lineHeight: 19,
    marginTop: 6,
  },
});
