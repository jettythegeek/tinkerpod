import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import {
  confirmPasswordReset,
  requestPasswordResetCode,
} from '../../../api/authApi';
import { extractApiErrorMessage } from '../../../api/client';
import {
  ApprovedLogo,
  TpButton,
  TpCard,
  TpErrorBanner,
  TpInput,
} from '../../../components/DesignSystem';
import { useTheme } from '../../../theme';
import {
  ForgotPasswordRequestFormValues,
  forgotPasswordRequestSchema,
  ResetPasswordConfirmFormValues,
  resetPasswordConfirmSchema,
} from '../schemas';

export interface ForgotPasswordScreenProps {
  readonly onNavigateBackToLogin: () => void;
}

export function ForgotPasswordScreen({
  onNavigateBackToLogin,
}: ForgotPasswordScreenProps): React.JSX.Element {
  const { tokens } = useTheme();
  const [step, setStep] = useState<'request' | 'confirm'>('request');
  const [savedIdentifier, setSavedIdentifier] = useState<string>('');
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  const requestForm = useForm<ForgotPasswordRequestFormValues>({
    resolver: zodResolver(forgotPasswordRequestSchema),
    defaultValues: { identifier: '' },
  });

  const confirmForm = useForm<ResetPasswordConfirmFormValues>({
    resolver: zodResolver(resetPasswordConfirmSchema),
    defaultValues: { code: '', password: '' },
  });

  const requestMutation = useMutation({
    mutationFn: (values: ForgotPasswordRequestFormValues) =>
      requestPasswordResetCode({ identifier: values.identifier }),
    onSuccess: (envelope, variables) => {
      setApiError(null);
      setSavedIdentifier(variables.identifier);
      setInfoMessage(envelope.message);
      setStep('confirm');
    },
    onError: (err: unknown) => {
      setApiError(extractApiErrorMessage(err));
    },
  });

  const confirmMutation = useMutation({
    mutationFn: (values: ResetPasswordConfirmFormValues) =>
      confirmPasswordReset({
        identifier: savedIdentifier,
        code: values.code,
        password: values.password,
      }),
    onSuccess: () => {
      setApiError(null);
      onNavigateBackToLogin();
    },
    onError: (err: unknown) => {
      setApiError(extractApiErrorMessage(err));
    },
  });

  return (
    <ScrollView
      style={[styles.screen, { backgroundColor: tokens.colors.bg }]}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
      testID="forgot-password-screen"
    >
      <ApprovedLogo height={36} />

      <TpCard style={styles.card}>
        <Text
          style={[
            styles.heading,
            { color: tokens.colors.ink, fontFamily: tokens.fonts.black },
          ]}
        >
          Reset Parent Password
        </Text>

        <TpErrorBanner message={apiError} />

        {infoMessage ? (
          <View style={styles.infoBox} testID="forgot-password-info">
            <Text style={[styles.infoText, { color: tokens.colors.ink, fontFamily: tokens.fonts.bold }]}>
              {infoMessage}
            </Text>
          </View>
        ) : null}

        {step === 'request' ? (
          <>
            <Text
              style={[
                styles.caption,
                { color: tokens.colors.ink, fontFamily: tokens.fonts.semibold },
              ]}
            >
              We’ll send a 6-digit code to your email or phone (expires in 10 minutes).
            </Text>

            <Controller
              control={requestForm.control}
              name="identifier"
              render={({ field: { onChange, onBlur, value } }) => (
                <TpInput
                  testID="forgot-identifier-input"
                  label="Email or Nigerian phone"
                  placeholder="ngozi@example.com or 0803..."
                  autoCapitalize="none"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  errorMessage={requestForm.formState.errors.identifier?.message}
                />
              )}
            />

            <View style={styles.actions}>
              <TpButton
                testID="forgot-send-code-btn"
                label="Send 6-Digit Code"
                variant="teal"
                loading={requestMutation.isPending}
                onPress={() => {
                  setApiError(null);
                  void requestForm.handleSubmit((vals) => requestMutation.mutate(vals))();
                }}
              />
              <TpButton
                testID="forgot-back-btn"
                label="Back to Sign In"
                variant="ghost"
                onPress={onNavigateBackToLogin}
              />
            </View>
          </>
        ) : (
          <>
            <Controller
              control={confirmForm.control}
              name="code"
              render={({ field: { onChange, onBlur, value } }) => (
                <TpInput
                  testID="forgot-code-input"
                  label="6-digit reset code"
                  placeholder="123456"
                  keyboardType="number-pad"
                  maxLength={6}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  errorMessage={confirmForm.formState.errors.code?.message}
                />
              )}
            />

            <Controller
              control={confirmForm.control}
              name="password"
              render={({ field: { onChange, onBlur, value } }) => (
                <TpInput
                  testID="forgot-new-password-input"
                  label="New password"
                  placeholder="At least 8 characters"
                  secureTextEntry
                  autoCapitalize="none"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  errorMessage={confirmForm.formState.errors.password?.message}
                />
              )}
            />

            <View style={styles.actions}>
              <TpButton
                testID="forgot-confirm-btn"
                label="Save New Password"
                variant="teal"
                loading={confirmMutation.isPending}
                onPress={() => {
                  setApiError(null);
                  void confirmForm.handleSubmit((vals) => confirmMutation.mutate(vals))();
                }}
              />
            </View>
          </>
        )}
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
  infoBox: {
    backgroundColor: '#E6F9F7',
    borderRadius: 12,
    padding: 12,
  },
  infoText: {
    fontSize: 14,
  },
  actions: {
    gap: 10,
    marginTop: 6,
  },
});
