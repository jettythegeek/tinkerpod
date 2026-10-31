import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { TpButton, TpCard } from '../../../components/DesignSystem';
import { PipIdleSvg } from '../../../pip';
import { useTheme } from '../../../theme';

export interface LearningScreenStateProps {
  readonly state: 'loading' | 'empty' | 'error' | 'offline';
  readonly title?: string;
  readonly message?: string;
  readonly onRetry?: () => void;
  readonly onBack?: () => void;
  readonly testID?: string;
}

export function LearningScreenState({
  state,
  title,
  message,
  onRetry,
  onBack,
  testID,
}: LearningScreenStateProps): React.JSX.Element {
  const { tokens, reducedMotion } = useTheme();

  if (state === 'loading') {
    return (
      <View
        testID={testID ?? 'learning-state-loading'}
        style={[styles.container, { backgroundColor: tokens.colors.bg }]}
      >
        <ActivityIndicator size="large" color={tokens.colors.buttonTeal} />
        <Text
          style={[
            styles.title,
            { color: tokens.colors.ink, fontFamily: tokens.fonts.extrabold },
          ]}
        >
          {title ?? 'Loading your learning adventure…'}
        </Text>
      </View>
    );
  }

  const resolvedTitle = (() => {
    if (title) {
      return title;
    }
    switch (state) {
      case 'offline':
        return 'You look offline right now';
      case 'empty':
        return 'Nothing here yet!';
      case 'error':
      default:
        return 'Could not load this screen';
    }
  })();

  const resolvedMessage = (() => {
    if (message) {
      return message;
    }
    switch (state) {
      case 'offline':
        return 'Captain Jetty could not reach TinkerPod. Check your internet connection and try again.';
      case 'empty':
        return 'Captain Jetty is getting new lessons ready for this pod.';
      case 'error':
      default:
        return 'Something went wrong while loading. Please try again.';
    }
  })();

  return (
    <View
      testID={testID ?? `learning-state-${state}`}
      style={[styles.container, { backgroundColor: tokens.colors.bg }]}
    >
      <TpCard style={styles.card}>
        <PipIdleSvg size={112} reducedMotion={reducedMotion} />
        <Text
          style={[
            styles.title,
            { color: tokens.colors.ink, fontFamily: tokens.fonts.black },
          ]}
        >
          {resolvedTitle}
        </Text>
        <Text
          style={[
            styles.body,
            { color: '#64748B', fontFamily: tokens.fonts.bold },
          ]}
        >
          {resolvedMessage}
        </Text>
        {onRetry ? (
          <TpButton
            testID="learning-state-retry-btn"
            label="Try Again"
            variant="teal"
            onPress={onRetry}
          />
        ) : null}
        {onBack ? (
          <TpButton
            testID="learning-state-back-btn"
            label="Go Back"
            variant="ghost"
            onPress={onBack}
          />
        ) : null}
      </TpCard>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    gap: 14,
  },
  card: {
    maxWidth: 400,
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    textAlign: 'center',
  },
  body: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
});
