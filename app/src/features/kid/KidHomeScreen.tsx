import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { ApprovedAvatar, TpButton, TpCard } from '../../components/DesignSystem';
import { PipIdleSvg } from '../../pip';
import { useTheme } from '../../theme';
import { useAuth } from '../auth/AuthContext';

export function KidHomeScreen(): React.JSX.Element {
  const { tokens, ageBand, reducedMotion } = useTheme();
  const { kidProfile, signOut } = useAuth();

  return (
    <ScrollView
      style={[styles.screen, { backgroundColor: tokens.colors.bg }]}
      contentContainerStyle={styles.content}
      testID="kid-home-screen"
    >
      <TpCard style={styles.card}>
        <View style={styles.row}>
          <ApprovedAvatar filename={kidProfile?.avatar ?? 'av1.png'} size={56} />
          <View style={styles.headerText}>
            <Text
              style={[
                styles.greeting,
                { color: tokens.colors.ink, fontFamily: tokens.fonts.black },
              ]}
            >
              Hi, {kidProfile?.first_name ?? 'Coder'}!
            </Text>
            <Text
              style={[
                styles.handle,
                { color: ageBand.primaryAccent, fontFamily: tokens.fonts.bold },
              ]}
            >
              @{kidProfile?.username ?? 'coder'} · {ageBand.label}
            </Text>
          </View>
        </View>

        <View style={styles.mascotBox}>
          <PipIdleSvg size={180} reducedMotion={reducedMotion} />
        </View>

        <Text
          style={[
            styles.body,
            { color: tokens.colors.ink, fontFamily: tokens.fonts.semibold },
          ]}
        >
          Your coding adventures are ready! Let’s build something awesome with Captain Jetty.
        </Text>

        <TpButton
          testID="kid-sign-out-btn"
          label="Switch Profile / Sign Out"
          variant="ghost"
          onPress={() => {
            void signOut();
          }}
        />
      </TpCard>
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
  },
  card: {
    maxWidth: 420,
    alignItems: 'center',
  },
  row: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerText: {
    flex: 1,
  },
  greeting: {
    fontSize: 22,
  },
  handle: {
    fontSize: 13,
  },
  mascotBox: {
    marginVertical: 8,
  },
  body: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
  },
});
