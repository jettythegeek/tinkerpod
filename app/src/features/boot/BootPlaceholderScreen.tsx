import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { PipIdleSvg, PIP_IDLE_SOURCE_ASSET } from '../../pip';
import { AgeBandThemeMode, useTheme } from '../../theme';

export function BootPlaceholderScreen(): React.JSX.Element {
  const {
    tokens,
    mode,
    ageBand,
    reducedMotion,
    muted,
    setMode,
    setReducedMotion,
    setMuted,
  } = useTheme();

  const handleThemeSwitch = (nextMode: AgeBandThemeMode): void => {
    setMode(nextMode);
    if (!muted && !reducedMotion) {
      void Haptics.selectionAsync().catch(() => undefined);
    }
  };

  return (
    <ScrollView
      style={[styles.screen, { backgroundColor: tokens.colors.bg }]}
      contentContainerStyle={styles.content}
      testID="boot-placeholder-screen"
    >
      {/* Top Pill — Teal #00BFAE fill with dark Ink #0F172A text per AGENTS.md */}
      <View
        style={[
          styles.badge,
          {
            backgroundColor: tokens.colors.teal,
            borderRadius: ageBand.buttonRadius,
          },
        ]}
      >
        <Text
          style={[
            styles.badgeText,
            {
              color: tokens.colors.ink,
              fontFamily: tokens.fonts.extrabold,
            },
          ]}
        >
          TINKERPOD · M0 SCAFFOLD
        </Text>
      </View>

      {/* Hero Card with Pip Idle SVG */}
      <View
        style={[
          styles.card,
          {
            backgroundColor: tokens.colors.surface,
            borderRadius: ageBand.cardRadius,
            borderColor: ageBand.primaryAccent,
          },
        ]}
      >
        <PipIdleSvg size={220} reducedMotion={reducedMotion} />

        <Text
          style={[
            styles.title,
            {
              color: tokens.colors.ink,
              fontFamily: tokens.fonts.black,
              fontSize: Math.round(26 * ageBand.headingScale),
            },
          ]}
        >
          Hi, I&apos;m Pip!
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
          {ageBand.label}
        </Text>

        <Text
          style={[
            styles.assetCaption,
            {
              color: tokens.colors.adminNavy,
              fontFamily: tokens.fonts.regular,
            },
          ]}
        >
          Rig source: {PIP_IDLE_SOURCE_ASSET}
        </Text>
      </View>

      {/* Age-Band Theme Switcher (Junior 5–11 vs Senior 12–18) */}
      <View style={styles.section}>
        <Text
          style={[
            styles.sectionLabel,
            {
              color: tokens.colors.ink,
              fontFamily: tokens.fonts.bold,
            },
          ]}
        >
          Age-Band Theme Flag
        </Text>

        <View style={styles.row}>
          <Pressable
            testID="theme-btn-junior"
            accessibilityRole="button"
            accessibilityState={{ selected: mode === 'junior' }}
            onPress={() => handleThemeSwitch('junior')}
            style={[
              styles.button,
              {
                backgroundColor:
                  mode === 'junior' ? tokens.colors.buttonTeal : tokens.colors.surface,
                borderColor: tokens.colors.buttonTeal,
                borderRadius: ageBand.buttonRadius,
              },
            ]}
          >
            <Text
              style={[
                styles.buttonText,
                {
                  color: mode === 'junior' ? tokens.colors.surface : tokens.colors.ink,
                  fontFamily: tokens.fonts.bold,
                },
              ]}
            >
              Junior (5–11)
            </Text>
          </Pressable>

          <Pressable
            testID="theme-btn-senior"
            accessibilityRole="button"
            accessibilityState={{ selected: mode === 'senior' }}
            onPress={() => handleThemeSwitch('senior')}
            style={[
              styles.button,
              {
                backgroundColor:
                  mode === 'senior' ? tokens.colors.buttonTeal : tokens.colors.surface,
                borderColor: tokens.colors.buttonTeal,
                borderRadius: ageBand.buttonRadius,
              },
            ]}
          >
            <Text
              style={[
                styles.buttonText,
                {
                  color: mode === 'senior' ? tokens.colors.surface : tokens.colors.ink,
                  fontFamily: tokens.fonts.bold,
                },
              ]}
            >
              Senior (12–18)
            </Text>
          </Pressable>
        </View>
      </View>

      {/* Accessibility Controls (Reduced Motion & Mute) */}
      <View style={styles.row}>
        <Pressable
          testID="toggle-reduced-motion"
          accessibilityRole="switch"
          accessibilityState={{ checked: reducedMotion }}
          onPress={() => setReducedMotion(!reducedMotion)}
          style={[
            styles.chip,
            {
              backgroundColor: reducedMotion
                ? tokens.colors.accents.amber
                : tokens.colors.surface,
              borderColor: tokens.colors.ink,
            },
          ]}
        >
          <Text
            style={{
              color: tokens.colors.ink,
              fontFamily: tokens.fonts.bold,
              fontSize: 13,
            }}
          >
            Reduced Motion: {reducedMotion ? 'ON' : 'OFF'}
          </Text>
        </Pressable>

        <Pressable
          testID="toggle-muted"
          accessibilityRole="switch"
          accessibilityState={{ checked: muted }}
          onPress={() => setMuted(!muted)}
          style={[
            styles.chip,
            {
              backgroundColor: muted ? tokens.colors.accents.coral : tokens.colors.surface,
              borderColor: tokens.colors.ink,
            },
          ]}
        >
          <Text
            style={{
              color: tokens.colors.ink,
              fontFamily: tokens.fonts.bold,
              fontSize: 13,
            }}
          >
            Audio Mute: {muted ? 'ON' : 'OFF'}
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
    paddingVertical: 32,
    alignItems: 'center',
    gap: 20,
  },
  badge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  badgeText: {
    fontSize: 12,
    letterSpacing: 0.8,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    padding: 24,
    alignItems: 'center',
    borderWidth: 2,
  },
  title: {
    marginTop: 8,
    textAlign: 'center',
  },
  subtitle: {
    marginTop: 4,
    fontSize: 16,
    textAlign: 'center',
  },
  assetCaption: {
    marginTop: 8,
    fontSize: 12,
    textAlign: 'center',
  },
  section: {
    width: '100%',
    maxWidth: 420,
    alignItems: 'center',
    gap: 10,
  },
  sectionLabel: {
    fontSize: 14,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  button: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderWidth: 2,
    minWidth: 140,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 15,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 9999,
    borderWidth: 1.5,
  },
});
