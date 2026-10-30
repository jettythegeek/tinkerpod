import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../../theme';

export interface PinPadProps {
  readonly value: string;
  readonly onChange: (nextPin: string) => void;
  readonly onSubmit?: (pin: string) => void;
  readonly minLength?: number;
  readonly maxLength?: number;
  readonly disabled?: boolean;
  readonly errorMessage?: string | null;
}

const KEY_ROWS: ReadonlyArray<ReadonlyArray<string>> = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
  ['clear', '0', 'backspace'],
];

export function PinPad({
  value,
  onChange,
  onSubmit,
  minLength = 4,
  maxLength = 6,
  disabled = false,
  errorMessage,
}: PinPadProps): React.JSX.Element {
  const { tokens, ageBand, muted, reducedMotion } = useTheme();

  const triggerHaptic = (): void => {
    if (!muted && !reducedMotion) {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined);
    }
  };

  const handleDigitPress = (digit: string): void => {
    if (disabled || value.length >= maxLength) {
      return;
    }
    triggerHaptic();
    const next = `${value}${digit}`;
    onChange(next);
  };

  const handleBackspace = (): void => {
    if (disabled || value.length === 0) {
      return;
    }
    triggerHaptic();
    onChange(value.slice(0, -1));
  };

  const handleClear = (): void => {
    if (disabled || value.length === 0) {
      return;
    }
    triggerHaptic();
    onChange('');
  };

  const dotCount = Math.max(minLength, Math.min(maxLength, Math.max(4, value.length)));

  return (
    <View style={styles.container} testID="pin-pad">
      {/* PIN Dots Indicator */}
      <View
        style={styles.dotsRow}
        accessible
        accessibilityRole="progressbar"
        accessibilityLabel={`PIN progress: ${value.length} digits entered`}
        accessibilityValue={{ min: 0, max: maxLength, now: value.length }}
        testID="pin-pad-dots"
      >
        {Array.from({ length: dotCount }).map((_, idx) => {
          const filled = idx < value.length;
          return (
            <View
              key={`pin-dot-${idx}`}
              testID={`pin-dot-${idx}-${filled ? 'filled' : 'empty'}`}
              style={[
                styles.dotSlot,
                {
                  borderColor: filled ? ageBand.primaryAccent : '#CBD5E1',
                  backgroundColor: filled ? '#E6F9F7' : tokens.colors.surface,
                },
              ]}
            >
              <View
                style={[
                  styles.dotInner,
                  {
                    backgroundColor: filled ? tokens.colors.ink : 'transparent',
                  },
                ]}
              />
            </View>
          );
        })}
      </View>

      {errorMessage ? (
        <View
          testID="pin-pad-error"
          accessibilityRole="alert"
          accessibilityLiveRegion="assertive"
          style={[
            styles.errorBox,
            {
              backgroundColor: '#FFF6DB',
              borderColor: tokens.colors.accents.amber,
            },
          ]}
        >
          <Text
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
        </View>
      ) : null}

      {/* 3x4 Keypad Grid — Every key is >= 56 dp tall */}
      <View style={styles.grid}>
        {KEY_ROWS.map((row, rowIndex) => (
          <View key={`pin-row-${rowIndex}`} style={styles.row}>
            {row.map((key) => {
              if (key === 'clear') {
                return (
                  <Pressable
                    key={key}
                    testID="pin-key-clear"
                    accessibilityRole="button"
                    accessibilityLabel="Clear PIN"
                    disabled={disabled || value.length === 0}
                    onPress={handleClear}
                    style={[
                      styles.key,
                      {
                        backgroundColor: tokens.colors.surface,
                        borderColor: '#CBD5E1',
                        opacity: disabled || value.length === 0 ? 0.5 : 1,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.actionKeyText,
                        {
                          color: tokens.colors.ink,
                          fontFamily: tokens.fonts.extrabold,
                        },
                      ]}
                    >
                      Clear
                    </Text>
                  </Pressable>
                );
              }

              if (key === 'backspace') {
                return (
                  <Pressable
                    key={key}
                    testID="pin-key-backspace"
                    accessibilityRole="button"
                    accessibilityLabel="Delete last digit"
                    disabled={disabled || value.length === 0}
                    onPress={handleBackspace}
                    style={[
                      styles.key,
                      {
                        backgroundColor: tokens.colors.surface,
                        borderColor: '#CBD5E1',
                        opacity: disabled || value.length === 0 ? 0.5 : 1,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.digitKeyText,
                        {
                          color: tokens.colors.ink,
                          fontFamily: tokens.fonts.black,
                        },
                      ]}
                    >
                      ⌫
                    </Text>
                  </Pressable>
                );
              }

              return (
                <Pressable
                  key={key}
                  testID={`pin-key-${key}`}
                  accessibilityRole="button"
                  accessibilityLabel={`Digit ${key}`}
                  disabled={disabled}
                  onPress={() => handleDigitPress(key)}
                  style={[
                    styles.key,
                    {
                      backgroundColor: tokens.colors.surface,
                      borderColor: '#CBD5E1',
                      opacity: disabled ? 0.5 : 1,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.digitKeyText,
                      {
                        color: tokens.colors.ink,
                        fontFamily: tokens.fonts.black,
                      },
                    ]}
                  >
                    {key}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        ))}
      </View>

      {onSubmit ? (
        <Pressable
          testID="pin-submit-button"
          accessibilityRole="button"
          accessibilityLabel="Enter TinkerPod"
          accessibilityState={{ disabled: disabled || value.length < minLength }}
          disabled={disabled || value.length < minLength}
          onPress={() => onSubmit(value)}
          style={[
            styles.submitBtn,
            {
              backgroundColor: tokens.colors.buttonTeal,
              borderRadius: ageBand.buttonRadius,
              opacity: disabled || value.length < minLength ? 0.5 : 1,
            },
          ]}
        >
          <Text
            style={[
              styles.submitBtnText,
              {
                color: tokens.colors.surface,
                fontFamily: tokens.fonts.black,
              },
            ]}
          >
            Let&apos;s Go!
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
    gap: 16,
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'center',
    marginVertical: 4,
  },
  dotSlot: {
    width: 48,
    height: 56,
    borderRadius: 14,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotInner: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  errorBox: {
    width: '100%',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  errorText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  grid: {
    width: '100%',
    gap: 12,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'center',
  },
  key: {
    flex: 1,
    minHeight: 60,
    minWidth: 76,
    borderRadius: 16,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  digitKeyText: {
    fontSize: 24,
  },
  actionKeyText: {
    fontSize: 14,
  },
  submitBtn: {
    width: '100%',
    minHeight: 56,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    marginTop: 4,
  },
  submitBtnText: {
    fontSize: 17,
  },
});
