import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useMutation } from '@tanstack/react-query';
import { KidPickerProfileDto, loginKid } from '../../../api/authApi';
import { extractApiErrorMessage } from '../../../api/client';
import { ApprovedAvatar, TpButton, TpCard } from '../../../components/DesignSystem';
import { useTheme } from '../../../theme';
import { useAuth } from '../AuthContext';
import { PinPad } from '../components/PinPad';

export interface PinPadScreenProps {
  readonly profile: KidPickerProfileDto;
  readonly onBack: () => void;
}

export function PinPadScreen({
  profile,
  onBack,
}: PinPadScreenProps): React.JSX.Element {
  const { tokens } = useTheme();
  const { signInKid } = useAuth();
  const [pin, setPin] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loginMutation = useMutation({
    mutationFn: (enteredPin: string) =>
      loginKid({
        profile_id: profile.id,
        pin: enteredPin,
      }),
    onSuccess: async (envelope) => {
      setErrorMessage(null);
      await signInKid(envelope.data.token, envelope.data.child);
    },
    onError: (err: unknown) => {
      setPin('');
      setErrorMessage(
        extractApiErrorMessage(
          err,
          "Hmm, that PIN didn't match. Try again or ask your parent for help.",
        ),
      );
    },
  });

  return (
    <ScrollView
      style={[styles.screen, { backgroundColor: tokens.colors.bg }]}
      contentContainerStyle={styles.content}
      testID="pin-pad-screen"
    >
      <TpCard style={styles.card}>
        <View style={styles.header}>
          <ApprovedAvatar filename={profile.avatar} size={76} />
          <Text
            style={[
              styles.heading,
              { color: tokens.colors.ink, fontFamily: tokens.fonts.black },
            ]}
          >
            Hi, {profile.first_name}!
          </Text>
          <Text
            style={[
              styles.caption,
              { color: tokens.colors.ink, fontFamily: tokens.fonts.semibold },
            ]}
          >
            Enter your secret PIN to start coding.
          </Text>
        </View>

        <PinPad
          value={pin}
          onChange={setPin}
          onSubmit={(enteredPin) => loginMutation.mutate(enteredPin)}
          disabled={loginMutation.isPending}
          errorMessage={errorMessage}
        />

        <TpButton
          testID="pin-pad-back-btn"
          label="Switch Profile"
          variant="ghost"
          onPress={onBack}
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
    paddingVertical: 20,
    alignItems: 'center',
  },
  card: {
    maxWidth: 420,
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    gap: 6,
  },
  heading: {
    fontSize: 24,
  },
  caption: {
    fontSize: 15,
    textAlign: 'center',
  },
});
