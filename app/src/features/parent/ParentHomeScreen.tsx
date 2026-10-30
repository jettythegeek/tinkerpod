import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { ApprovedLogo, TpButton, TpCard } from '../../components/DesignSystem';
import { useAuth } from '../auth/AuthContext';
import { useTheme } from '../../theme';

export function ParentHomeScreen(): React.JSX.Element {
  const { tokens } = useTheme();
  const { parentUser, signOut } = useAuth();

  return (
    <ScrollView
      style={[styles.screen, { backgroundColor: tokens.colors.bg }]}
      contentContainerStyle={styles.content}
      testID="parent-home-screen"
    >
      <ApprovedLogo height={36} />

      <TpCard style={styles.card}>
        <Text
          style={[
            styles.badge,
            { color: tokens.colors.buttonTeal, fontFamily: tokens.fonts.black },
          ]}
        >
          PARENT MODE
        </Text>
        <Text
          style={[
            styles.heading,
            { color: tokens.colors.ink, fontFamily: tokens.fonts.black },
          ]}
        >
          Welcome, {parentUser?.name ?? 'Parent'}!
        </Text>
        <Text
          style={[
            styles.body,
            { color: tokens.colors.ink, fontFamily: tokens.fonts.semibold },
          ]}
        >
          Manage your children’s profiles, usernames, PINs, and learning progress from this parent dashboard.
        </Text>

        {parentUser?.phone ? (
          <View style={styles.metaRow}>
            <Text style={{ color: tokens.colors.ink, fontFamily: tokens.fonts.bold }}>
              Phone: {parentUser.phone}
            </Text>
          </View>
        ) : null}

        <TpButton
          testID="parent-sign-out-btn"
          label="Sign Out"
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
    gap: 16,
  },
  card: {
    maxWidth: 420,
  },
  badge: {
    fontSize: 12,
    letterSpacing: 0.8,
  },
  heading: {
    fontSize: 24,
  },
  body: {
    fontSize: 15,
    lineHeight: 22,
  },
  metaRow: {
    paddingVertical: 4,
  },
});
