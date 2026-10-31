import React, { useEffect, useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SvgXml } from 'react-native-svg';
import { WebView } from 'react-native-webview';
import { createAudioPlayer } from 'expo-audio';
import * as Haptics from 'expo-haptics';

import {
  APPROVED_FX03_AUDIO_ASSET,
  APPROVED_FX03_SVG,
  APPROVED_FX_CUES,
} from '../assets/approvedAssets';
import { useTheme } from '../theme';

export type Fx03Variant = 'correct' | 'wrong' | 'try_again';

export interface Fx03CorrectWrongProps {
  readonly variant: Fx03Variant;
  readonly visible?: boolean;
  readonly muted?: boolean;
  readonly reducedMotion?: boolean;
  readonly reducedEffects?: boolean;
  readonly feedbackText?: string;
  readonly explanation?: string | null;
}

export const FX03_CUES = APPROVED_FX_CUES.fx03_correct_wrong;

export function buildFx03SvgXml(variant: Fx03Variant, isStatic: boolean): string {
  const sanitized = APPROVED_FX03_SVG.replace(/Pip is proud of you/g, 'Captain Jetty is proud of you');
  const isCorrect = variant === 'correct';
  const variantCss = isCorrect
    ? '#f3-B { display: none !important; }'
    : '#f3-A { display: none !important; } #f3-B { animation-delay: 0s !important; opacity: 1 !important; }';
  const staticCss = isStatic
    ? '*, *::before, *::after { animation: none !important; transition: none !important; } #f3-check, #f3-ring, #f3-txtA, #f3-txtB, #f3-B { opacity: 1 !important; stroke-dashoffset: 0 !important; }'
    : '';

  return sanitized.replace('</style>', `${variantCss}\n${staticCss}\n</style>`);
}

export function Fx03CorrectWrong({
  variant,
  visible = true,
  muted: mutedProp,
  reducedMotion: reducedMotionProp,
  reducedEffects: reducedEffectsProp,
  feedbackText,
  explanation,
}: Fx03CorrectWrongProps): React.JSX.Element | null {
  const theme = useTheme();
  const muted = mutedProp ?? theme.muted;
  const reducedMotion = reducedMotionProp ?? theme.reducedMotion;
  const reducedEffects = reducedEffectsProp ?? theme.reducedEffects;
  const { tokens } = theme;

  const isStatic = reducedMotion || reducedEffects;
  const svgXml = useMemo(() => buildFx03SvgXml(variant, isStatic), [variant, isStatic]);

  const htmlDocument = useMemo(
    () =>
      `<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no"/><style>html,body{margin:0;padding:0;background:transparent;overflow:hidden;display:flex;align-items:center;justify-content:center;width:100%;height:100%;}svg{width:100%;height:100%;}</style></head><body>${svgXml}</body></html>`,
    [svgXml],
  );

  useEffect(() => {
    if (!visible || muted) {
      return;
    }

    let player: ReturnType<typeof createAudioPlayer> | null = null;

    try {
      player = createAudioPlayer(APPROVED_FX03_AUDIO_ASSET);
      player.play();
    } catch {
      // Ignore audio playback errors in headless test environments
    }

    if (!reducedMotion && !reducedEffects) {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }

    return () => {
      try {
        player?.remove();
      } catch {
        // Ignore cleanup errors
      }
    };
  }, [visible, variant, muted, reducedMotion, reducedEffects]);

  if (!visible) {
    return null;
  }

  const isCorrect = variant === 'correct';
  const primaryTitle = feedbackText ?? (isCorrect ? 'Correct!' : 'Not quite. Try again!');

  return (
    <View
      testID={`fx03-${variant}`}
      accessibilityRole="alert"
      accessibilityLabel={`${primaryTitle}${isCorrect ? ' Captain Jetty is proud of you.' : ''}${explanation ? ` ${explanation}` : ''}`}
      style={[
        styles.container,
        isCorrect ? styles.containerCorrect : styles.containerTryAgain,
      ]}
    >
      <View
        testID={isStatic ? 'fx03-still-frame' : 'fx03-animated-frame'}
        style={styles.artworkWrap}
        pointerEvents="none"
      >
        {isStatic ? (
          <SvgXml xml={svgXml} width={88} height={88} />
        ) : (
          <WebView
            originWhitelist={['*']}
            source={{ html: htmlDocument }}
            style={styles.transparentWebView}
            scrollEnabled={false}
            pointerEvents="none"
          />
        )}
      </View>

      <View style={styles.textWrap}>
        <Text
          testID="fx03-feedback-title"
          style={[
            styles.title,
            { fontFamily: tokens.fonts.black },
            isCorrect ? styles.titleCorrect : styles.titleTryAgain,
          ]}
        >
          {primaryTitle}
        </Text>
        {isCorrect ? (
          <Text
            style={[
              styles.subtitle,
              { fontFamily: tokens.fonts.bold, color: '#065F46' },
            ]}
          >
            Captain Jetty is proud of you
          </Text>
        ) : null}
        {explanation ? (
          <Text
            testID="fx03-explanation"
            style={[
              styles.explanation,
              { fontFamily: tokens.fonts.semibold, color: tokens.colors.ink },
            ]}
          >
            {explanation}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 18,
    borderWidth: 2,
    marginVertical: 6,
  },
  containerCorrect: {
    backgroundColor: '#ECFDF5',
    borderColor: '#10B981',
  },
  containerTryAgain: {
    backgroundColor: '#FFFBEB',
    borderColor: '#FFB700',
  },
  artworkWrap: {
    width: 88,
    height: 88,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  transparentWebView: {
    width: 88,
    height: 88,
    backgroundColor: 'transparent',
  },
  textWrap: {
    flex: 1,
  },
  title: {
    fontSize: 16,
  },
  subtitle: {
    fontSize: 13,
    marginTop: 1,
  },
  titleCorrect: {
    color: '#065F46',
  },
  titleTryAgain: {
    color: '#92400E',
  },
  explanation: {
    fontSize: 13,
    marginTop: 4,
  },
});
