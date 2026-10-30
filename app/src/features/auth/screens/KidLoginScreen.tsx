import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import {
  KidLookupData,
  KidPickerProfileDto,
  lookupKidProfiles,
} from '../../../api/authApi';
import { extractApiErrorMessage } from '../../../api/client';
import {
  TpButton,
  TpCard,
  TpErrorBanner,
  TpInput,
} from '../../../components/DesignSystem';
import { PipIdleSvg } from '../../../pip';
import { useTheme } from '../../../theme';
import { KidLookupFormValues, kidLookupSchema } from '../schemas';

export interface KidLoginScreenProps {
  readonly onSingleProfileResolved: (profile: KidPickerProfileDto) => void;
  readonly onPickerResolved: (profiles: KidPickerProfileDto[]) => void;
  readonly onNavigateBack?: () => void;
  readonly lookupOverride?: (identifier: string) => Promise<KidLookupData>;
}

export function KidLoginScreen({
  onSingleProfileResolved,
  onPickerResolved,
  onNavigateBack,
  lookupOverride,
}: KidLoginScreenProps): React.JSX.Element {
  const { tokens, reducedMotion } = useTheme();
  const [apiError, setApiError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<KidLookupFormValues>({
    resolver: zodResolver(kidLookupSchema),
    defaultValues: {
      identifier: '',
    },
  });

  const lookupMutation = useMutation({
    mutationFn: async (values: KidLookupFormValues) => {
      if (lookupOverride) {
        return lookupOverride(values.identifier);
      }
      const envelope = await lookupKidProfiles(values.identifier);
      return envelope.data;
    },
    onSuccess: (data) => {
      setApiError(null);
      if (data.mode === 'single' && data.profiles[0]) {
        onSingleProfileResolved(data.profiles[0]);
      } else if (data.profiles.length === 1 && data.profiles[0]) {
        onSingleProfileResolved(data.profiles[0]);
      } else {
        onPickerResolved(data.profiles);
      }
    },
    onError: (err: unknown) => {
      setApiError(
        extractApiErrorMessage(err, "We couldn't find that. Ask your parent to check."),
      );
    },
  });

  const onSubmit = handleSubmit((values) => {
    setApiError(null);
    lookupMutation.mutate(values);
  });

  return (
    <ScrollView
      style={[styles.screen, { backgroundColor: tokens.colors.bg }]}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
      testID="kid-login-screen"
    >
      <TpCard style={styles.card}>
        <View style={styles.mascotWrap}>
          <PipIdleSvg size={132} reducedMotion={reducedMotion} />
        </View>

        <Text
          style={[
            styles.heading,
            { color: tokens.colors.ink, fontFamily: tokens.fonts.black },
          ]}
        >
          Hi Coder! Who’s playing today?
        </Text>
        <Text
          style={[
            styles.caption,
            { color: tokens.colors.ink, fontFamily: tokens.fonts.semibold },
          ]}
        >
          Type your username, or your parent’s phone number or email.
        </Text>

        <TpErrorBanner message={apiError} testID="kid-lookup-error-banner" />

        <Controller
          control={control}
          name="identifier"
          render={({ field: { onChange, onBlur, value } }) => (
            <TpInput
              testID="kid-identifier-input"
              label="Username or Parent Phone / Email"
              placeholder="star_coder or 0803..."
              autoCapitalize="none"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              errorMessage={errors.identifier?.message}
            />
          )}
        />

        <View style={styles.actions}>
          <TpButton
            testID="kid-lookup-submit-btn"
            label="Find My Profile"
            variant="purple"
            loading={lookupMutation.isPending}
            onPress={() => {
              void onSubmit();
            }}
          />
          {onNavigateBack ? (
            <TpButton
              testID="kid-login-back-btn"
              label="Back"
              variant="ghost"
              onPress={onNavigateBack}
            />
          ) : null}
        </View>
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
    paddingVertical: 24,
    alignItems: 'center',
  },
  card: {
    maxWidth: 420,
  },
  mascotWrap: {
    alignItems: 'center',
  },
  heading: {
    fontSize: 24,
    textAlign: 'center',
  },
  caption: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
  },
  actions: {
    gap: 10,
    marginTop: 6,
  },
});
