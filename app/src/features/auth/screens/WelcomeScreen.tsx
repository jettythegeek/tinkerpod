import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { ApprovedLogo, TpButton, TpCard } from '../../../components/DesignSystem';
import { PipIdleSvg } from '../../../pip';
import { useTheme } from '../../../theme';

export interface WelcomeScreenProps {
  readonly onNavigateKidLogin: () => void;
  readonly onNavigateParentLogin: () => void;
  readonly onNavigateParentRegister: () => void;
}

export function WelcomeScreen({
  onNavigateKidLogin,
  onNavigateParentLogin,
  onNavigateParentRegister,
}: WelcomeScreenProps): React.JSX.Element {
  const {
    tokens,
    mode,
    reducedMotion,
    muted,
    setMode,
    setReducedMotion,
    setMuted,
  } = useTheme();

  return (
    <ScrollView
      style={[styles.screen, { backgroundColor: tokens.colors.bg }]}
      contentContainerStyle={styles.content}
      testID="welcome-screen"
    >
      <ApprovedLogo height={44} />

      <TpCard style={styles.heroCard}>
        <PipIdleSvg size={180} reducedMotion={reducedMotion} />
        <Text
          style={[
            styles.title,
            {
              color: tokens.colors.ink,
              fontFamily: tokens.fonts.black,
            },
          ]}
        >
          Welcome to TinkerPod!
        </Text>
        <Text
          style={[
            styles.subtitle,
            {
              color: tokens.colors.ink,
              fontFamily: tokens.fonts.semibold,
            },
          ]}
        >
          Build games, solve puzzles, and code with Captain Jetty.
        </Text>

        <View style={styles.actions}>
          <TpButton
            testID="welcome-kid-login-btn"
            label="I'm a Kid — Start Learning!"
            variant="purple"
            onPress={onNavigateKidLogin}
          />
          <TpButton
            testID="welcome-parent-login-btn"
            label="Parent Sign In"
            variant="teal"
            onPress={onNavigateParentLogin}
          />
          <TpButton
            testID="welcome-parent-register-btn"
            label="Create Parent Account"
            variant="ghost"
            onPress={onNavigateParentRegister}
          />
        </View>
      </TpCard>

      {/* Accessibility & Age-Band Theme Controls */}
      <View style={styles.chipsRow}>
        <Pressable
          testID="welcome-theme-toggle"
          accessibilityRole="button"
          accessibilityLabel={`Switch theme preview, currently ${mode}`}
          onPress={() => setMode(mode === 'junior' ? 'senior' : 'junior')}
          style={[styles.chip, { backgroundColor: tokens.colors.surface }]}
        >
          <Text style={[styles.chipText, { fontFamily: tokens.fonts.bold, color: tokens.colors.ink }]}>
            Theme: {mode === 'junior' ? 'Junior (5–11)' : 'Senior (12–18)'}
          </Text>
        </Pressable>

        <Pressable
          testID="welcome-reduced-motion-toggle"
          accessibilityRole="switch"
          accessibilityState={{ checked: reducedMotion }}
          onPress={() => setReducedMotion(!reducedMotion)}
          style={[styles.chip, { backgroundColor: tokens.colors.surface }]}
        >
          <Text style={[styles.chipText, { fontFamily: tokens.fonts.bold, color: tokens.colors.ink }]}>
            Reduced Motion: {reducedMotion ? 'ON' : 'OFF'}
          </Text>
        </Pressable>

        <Pressable
          testID="welcome-mute-toggle"
          accessibilityRole="switch"
          accessibilityState={{ checked: muted }}
          onPress={() => setMuted(!muted)}
          style={[styles.chip, { backgroundColor: tokens.colors.surface }]}
        >
          <Text style={[styles.chipText, { fontFamily: tokens.fonts.bold, color: tokens.colors.ink }]}>
            Mute: {muted ? 'ON' : 'OFF'}
          </Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingVertical: 28,
    alignItems: 'center',
    gap: 20,
  },
  heroCard: {
    maxWidth: 420,
    alignItems: 'center',
  },
  title: {
    fontSize: 26,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
  },
  actions: {
    width: '100%',
    gap: 12,
    marginTop: 8,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  chipText: {
    fontSize: 12,
  },
});
