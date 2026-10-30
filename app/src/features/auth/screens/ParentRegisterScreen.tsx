import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { registerParent, RegisterParentPayload } from '../../../api/authApi';
import { extractApiErrorMessage } from '../../../api/client';
import {
  ApprovedLogo,
  TpButton,
  TpCard,
  TpErrorBanner,
  TpInput,
} from '../../../components/DesignSystem';
import { useTheme } from '../../../theme';
import { useAuth } from '../AuthContext';
import { ParentRegisterFormValues, parentRegisterSchema } from '../schemas';

export interface ParentRegisterScreenProps {
  readonly onNavigateLogin: () => void;
  readonly onSubmitOverride?: (values: RegisterParentPayload) => Promise<void>;
}

export function ParentRegisterScreen({
  onNavigateLogin,
  onSubmitOverride,
}: ParentRegisterScreenProps): React.JSX.Element {
  const { tokens } = useTheme();
  const { signInParent } = useAuth();
  const [apiError, setApiError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ParentRegisterFormValues>({
    resolver: zodResolver(parentRegisterSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      password: '',
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (values: ParentRegisterFormValues) => {
      if (onSubmitOverride) {
        await onSubmitOverride(values);
        return null;
      }
      return registerParent(values);
    },
    onSuccess: async (envelope) => {
      setApiError(null);
      if (envelope?.data) {
        await signInParent(envelope.data.token, envelope.data.user);
      }
    },
    onError: (err: unknown) => {
      setApiError(extractApiErrorMessage(err));
    },
  });

  const onSubmit = handleSubmit((values) => {
    setApiError(null);
    registerMutation.mutate(values);
  });

  return (
    <ScrollView
      style={[styles.screen, { backgroundColor: tokens.colors.bg }]}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
      testID="parent-register-screen"
    >
      <ApprovedLogo height={36} />

      <TpCard style={styles.card}>
        <Text
          style={[
            styles.heading,
            { color: tokens.colors.ink, fontFamily: tokens.fonts.black },
          ]}
        >
          Create Parent Account
        </Text>
        <Text
          style={[
            styles.caption,
            { color: tokens.colors.ink, fontFamily: tokens.fonts.semibold },
          ]}
        >
          Manage your children’s profiles, PINs, and learning progress.
        </Text>

        <TpErrorBanner message={apiError} />

        <Controller
          control={control}
          name="name"
          render={({ field: { onChange, onBlur, value } }) => (
            <TpInput
              testID="register-name-input"
              label="Full name"
              placeholder="Ngozi Okafor"
              autoCapitalize="words"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              errorMessage={errors.name?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, onBlur, value } }) => (
            <TpInput
              testID="register-email-input"
              label="Email address"
              placeholder="ngozi@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              errorMessage={errors.email?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="phone"
          render={({ field: { onChange, onBlur, value } }) => (
            <TpInput
              testID="register-phone-input"
              label="Nigerian phone number"
              placeholder="0803 123 4567"
              keyboardType="phone-pad"
              autoCapitalize="none"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              errorMessage={errors.phone?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="password"
          render={({ field: { onChange, onBlur, value } }) => (
            <TpInput
              testID="register-password-input"
              label="Password"
              placeholder="At least 8 characters"
              secureTextEntry
              autoCapitalize="none"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              errorMessage={errors.password?.message}
            />
          )}
        />

        <View style={styles.actions}>
          <TpButton
            testID="register-submit-btn"
            label="Create Account"
            variant="teal"
            loading={registerMutation.isPending}
            onPress={() => {
              void onSubmit();
            }}
          />
          <TpButton
            testID="register-to-login-btn"
            label="Already have an account? Sign In"
            variant="ghost"
            onPress={onNavigateLogin}
          />
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
    gap: 16,
  },
  card: {
    maxWidth: 420,
  },
  heading: {
    fontSize: 24,
  },
  caption: {
    fontSize: 14,
    lineHeight: 20,
  },
  actions: {
    gap: 10,
    marginTop: 6,
  },
});
