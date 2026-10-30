import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { loginParent, LoginParentPayload } from '../../../api/authApi';
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
import { ParentLoginFormValues, parentLoginSchema } from '../schemas';

export interface ParentLoginScreenProps {
  readonly onNavigateRegister: () => void;
  readonly onNavigateForgotPassword: () => void;
  readonly onSubmitOverride?: (values: LoginParentPayload) => Promise<void>;
}

export function ParentLoginScreen({
  onNavigateRegister,
  onNavigateForgotPassword,
  onSubmitOverride,
}: ParentLoginScreenProps): React.JSX.Element {
  const { tokens } = useTheme();
  const { signInParent } = useAuth();
  const [apiError, setApiError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ParentLoginFormValues>({
    resolver: zodResolver(parentLoginSchema),
    defaultValues: {
      identifier: '',
      password: '',
    },
  });

  const loginMutation = useMutation({
    mutationFn: async (values: ParentLoginFormValues) => {
      if (onSubmitOverride) {
        await onSubmitOverride(values);
        return null;
      }
      return loginParent(values);
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
    loginMutation.mutate(values);
  });

  return (
    <ScrollView
      style={[styles.screen, { backgroundColor: tokens.colors.bg }]}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
      testID="parent-login-screen"
    >
      <ApprovedLogo height={36} />

      <TpCard style={styles.card}>
        <Text
          style={[
            styles.heading,
            { color: tokens.colors.ink, fontFamily: tokens.fonts.black },
          ]}
        >
          Parent Sign In
        </Text>
        <Text
          style={[
            styles.caption,
            { color: tokens.colors.ink, fontFamily: tokens.fonts.semibold },
          ]}
        >
          Sign in with your email address or Nigerian phone number.
        </Text>

        <TpErrorBanner message={apiError} />

        <Controller
          control={control}
          name="identifier"
          render={({ field: { onChange, onBlur, value } }) => (
            <TpInput
              testID="parent-login-identifier-input"
              label="Email or phone number"
              placeholder="ngozi@example.com or 0803..."
              autoCapitalize="none"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              errorMessage={errors.identifier?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="password"
          render={({ field: { onChange, onBlur, value } }) => (
            <TpInput
              testID="parent-login-password-input"
              label="Password"
              placeholder="Enter your password"
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
            testID="parent-login-submit-btn"
            label="Sign In"
            variant="teal"
            loading={loginMutation.isPending}
            onPress={() => {
              void onSubmit();
            }}
          />
          <TpButton
            testID="parent-login-forgot-btn"
            label="Forgot password?"
            variant="ghost"
            onPress={onNavigateForgotPassword}
          />
          <TpButton
            testID="parent-login-register-btn"
            label="Create a Parent Account"
            variant="ghost"
            onPress={onNavigateRegister}
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
