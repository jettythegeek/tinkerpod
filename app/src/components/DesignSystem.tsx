import React from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
  ViewStyle,
} from 'react-native';
import { APPROVED_LOGO_ASSET, resolveApprovedAvatar } from '../assets/approvedAssets';
import { useTheme } from '../theme';

export interface TpButtonProps {
  readonly label: string;
  readonly onPress: () => void;
  readonly variant?: 'teal' | 'purple' | 'yellow' | 'ghost';
  readonly disabled?: boolean;
  readonly loading?: boolean;
  readonly testID?: string;
}

export function TpButton({
  label,
  onPress,
  variant = 'teal',
  disabled = false,
  loading = false,
  testID,
}: TpButtonProps): React.JSX.Element {
  const { tokens, ageBand } = useTheme();
  const isDisabled = disabled || loading;

  const backgroundColor = (() => {
    switch (variant) {
      case 'purple':
        return tokens.colors.kidPurple;
      case 'yellow':
        return tokens.colors.accents.amber;
      case 'ghost':
        return tokens.colors.surface;
      case 'teal':
      default:
        return tokens.colors.buttonTeal;
    }
  })();

  const textColor = (() => {
    switch (variant) {
      case 'yellow':
        return tokens.colors.ink;
      case 'ghost':
        return tokens.colors.buttonTeal;
      case 'purple':
      case 'teal':
      default:
        return tokens.colors.surface;
    }
  })();

  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      disabled={isDisabled}
      onPress={onPress}
      style={[
        styles.button,
        {
          backgroundColor,
          borderRadius: ageBand.buttonRadius,
          borderColor:
            variant === 'ghost' ? tokens.colors.buttonTeal : backgroundColor,
          opacity: isDisabled ? 0.6 : 1,
        },
      ]}
    >
      {loading ? (
        <ActivityIndicator color={textColor} />
      ) : (
        <Text
          style={[
            styles.buttonText,
            {
              color: textColor,
              fontFamily: tokens.fonts.black,
            },
          ]}
        >
          {label}
        </Text>
      )}
    </Pressable>
  );
}

export interface TpInputProps extends TextInputProps {
  readonly label: string;
  readonly errorMessage?: string;
  readonly testID?: string;
}

export function TpInput({
  label,
  errorMessage,
  testID,
  ...inputProps
}: TpInputProps): React.JSX.Element {
  const { tokens } = useTheme();

  return (
    <View style={styles.field}>
      <Text
        style={[
          styles.fieldLabel,
          {
            color: tokens.colors.ink,
            fontFamily: tokens.fonts.extrabold,
          },
        ]}
      >
        {label}
      </Text>
      <TextInput
        testID={testID}
        accessibilityLabel={label}
        placeholderTextColor="#64748B"
        style={[
          styles.input,
          {
            backgroundColor: tokens.colors.surface,
            color: tokens.colors.ink,
            fontFamily: tokens.fonts.bold,
            borderColor: errorMessage
              ? tokens.colors.accents.coral
              : '#CBD5E1',
          },
        ]}
        {...inputProps}
      />
      {errorMessage ? (
        <Text
          testID={testID ? `${testID}-error` : undefined}
          accessibilityLiveRegion="polite"
          style={[
            styles.errorText,
            {
              color: tokens.colors.ink,
              fontFamily: tokens.fonts.bold,
            },
          ]}
        >
          {errorMessage}
        </Text>
      ) : null}
    </View>
  );
}

export interface TpCardProps {
  readonly children: React.ReactNode;
  readonly style?: ViewStyle;
  readonly testID?: string;
}

export function TpCard({ children, style, testID }: TpCardProps): React.JSX.Element {
  const { tokens, ageBand } = useTheme();

  return (
    <View
      testID={testID}
      style={[
        styles.card,
        {
          backgroundColor: tokens.colors.surface,
          borderRadius: ageBand.cardRadius,
          borderColor: '#E2E8F0',
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

export interface TpErrorBannerProps {
  readonly message: string | null | undefined;
  readonly testID?: string;
}

export function TpErrorBanner({
  message,
  testID = 'api-error-banner',
}: TpErrorBannerProps): React.JSX.Element | null {
  const { tokens } = useTheme();

  if (!message) {
    return null;
  }

  return (
    <View
      testID={testID}
      accessibilityRole="alert"
      accessibilityLiveRegion="assertive"
      style={[
        styles.banner,
        {
          backgroundColor: '#FFEDED',
          borderColor: tokens.colors.accents.coral,
        },
      ]}
    >
      <Text
        style={[
          styles.bannerText,
          {
            color: tokens.colors.ink,
            fontFamily: tokens.fonts.bold,
          },
        ]}
      >
        {message}
      </Text>
    </View>
  );
}

export function ApprovedLogo({ height = 40 }: { readonly height?: number }): React.JSX.Element {
  return (
    <Image
      source={APPROVED_LOGO_ASSET}
      accessibilityLabel="TinkerPod logo"
      resizeMode="contain"
      style={{ height, width: height * 3.4 }}
    />
  );
}

export interface ApprovedAvatarProps {
  readonly filename: string;
  readonly size?: number;
}

export function ApprovedAvatar({
  filename,
  size = 64,
}: ApprovedAvatarProps): React.JSX.Element {
  const { tokens } = useTheme();
  const source = resolveApprovedAvatar(filename);

  if (!source) {
    return (
      <View
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: tokens.colors.placeholderGrey,
          alignItems: 'center',
          justifyContent: 'center',
          padding: 4,
        }}
      >
        <Text
          style={{
            color: tokens.colors.ink,
            fontFamily: tokens.fonts.bold,
            fontSize: 10,
            textAlign: 'center',
          }}
        >
          {filename}
        </Text>
      </View>
    );
  }

  return (
    <Image
      source={source}
      accessibilityLabel={`Avatar ${filename}`}
      resizeMode="cover"
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
      }}
    />
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 56,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  buttonText: {
    fontSize: 17,
  },
  field: {
    width: '100%',
    gap: 6,
  },
  fieldLabel: {
    fontSize: 13,
  },
  input: {
    minHeight: 52,
    borderRadius: 12,
    borderWidth: 1.5,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 16,
  },
  errorText: {
    fontSize: 13,
  },
  card: {
    width: '100%',
    padding: 20,
    borderWidth: 1.5,
    gap: 14,
  },
  banner: {
    width: '100%',
    borderRadius: 12,
    borderWidth: 1.5,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  bannerText: {
    fontSize: 14,
    lineHeight: 20,
  },
});
