import React, { useState } from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import * as Haptics from 'expo-haptics';
import { AuthProvider } from '../features/auth/AuthContext';
import { PinPad } from '../features/auth/components/PinPad';
import { KidLoginScreen } from '../features/auth/screens/KidLoginScreen';
import { ParentLoginScreen } from '../features/auth/screens/ParentLoginScreen';
import { ParentRegisterScreen } from '../features/auth/screens/ParentRegisterScreen';
import { ThemeProvider } from '../theme';

jest.mock('../pip', () => ({
  PipIdleSvg: () => null,
}));

jest.mock('expo-haptics', () => ({
  ImpactFeedbackStyle: { Light: 'light' },
  impactAsync: jest.fn(() => Promise.resolve()),
}));

jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(() => Promise.resolve(null)),
  setItemAsync: jest.fn(() => Promise.resolve()),
  deleteItemAsync: jest.fn(() => Promise.resolve()),
}));

function TestHarness({
  children,
  initialMuted = false,
  initialReducedMotion = false,
}: {
  readonly children: React.ReactNode;
  readonly initialMuted?: boolean;
  readonly initialReducedMotion?: boolean;
}): React.JSX.Element {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
      mutations: { retry: false, gcTime: 0 },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider
        initialMode="junior"
        initialMuted={initialMuted}
        initialReducedMotion={initialReducedMotion}
      >
        <AuthProvider skipHydration>{children}</AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

function StatefulPinPad({
  onSubmit,
  errorMessage,
}: {
  readonly onSubmit: (pin: string) => void;
  readonly errorMessage?: string | null;
}): React.JSX.Element {
  const [pin, setPin] = useState('');
  return (
    <PinPad
      value={pin}
      onChange={setPin}
      onSubmit={onSubmit}
      errorMessage={errorMessage}
    />
  );
}

describe('PinPad component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('enters digits, updates dots, supports backspace/clear, and submits when >= 4 digits', async () => {
    const onSubmit = jest.fn();
    const { getByTestId } = await render(
      <TestHarness>
        <StatefulPinPad onSubmit={onSubmit} />
      </TestHarness>,
    );

    expect(getByTestId('pin-dot-0-empty')).toBeTruthy();

    await fireEvent.press(getByTestId('pin-key-4'));
    await fireEvent.press(getByTestId('pin-key-8'));
    await fireEvent.press(getByTestId('pin-key-2'));

    expect(getByTestId('pin-dot-0-filled')).toBeTruthy();
    expect(getByTestId('pin-dot-1-filled')).toBeTruthy();
    expect(getByTestId('pin-dot-2-filled')).toBeTruthy();
    expect(getByTestId('pin-dot-3-empty')).toBeTruthy();

    // Backspace removes last digit
    await fireEvent.press(getByTestId('pin-key-backspace'));
    expect(getByTestId('pin-dot-2-empty')).toBeTruthy();

    // Complete 4-digit PIN and submit
    await fireEvent.press(getByTestId('pin-key-2'));
    await fireEvent.press(getByTestId('pin-key-9'));
    expect(getByTestId('pin-dot-3-filled')).toBeTruthy();

    await fireEvent.press(getByTestId('pin-submit-button'));
    expect(onSubmit).toHaveBeenCalledWith('4829');
    expect(Haptics.impactAsync).toHaveBeenCalled();

    // Clear resets all dots
    await fireEvent.press(getByTestId('pin-key-clear'));
    expect(getByTestId('pin-dot-0-empty')).toBeTruthy();
  });

  it('suppresses haptics when muted or reducedMotion is enabled', async () => {
    const onSubmit = jest.fn();
    const { getByTestId, unmount } = await render(
      <TestHarness initialMuted>
        <StatefulPinPad onSubmit={onSubmit} />
      </TestHarness>,
    );

    await fireEvent.press(getByTestId('pin-key-1'));
    expect(Haptics.impactAsync).not.toHaveBeenCalled();
    await unmount();

    const reducedRender = await render(
      <TestHarness initialReducedMotion>
        <StatefulPinPad onSubmit={onSubmit} />
      </TestHarness>,
    );

    await fireEvent.press(reducedRender.getByTestId('pin-key-2'));
    expect(Haptics.impactAsync).not.toHaveBeenCalled();
  });

  it('renders a kid-friendly error alert when errorMessage is provided', async () => {
    const { getByTestId, getByText } = await render(
      <TestHarness>
        <StatefulPinPad
          onSubmit={jest.fn()}
          errorMessage="Hmm, that PIN didn't match. Try again or ask your parent for help."
        />
      </TestHarness>,
    );

    expect(getByTestId('pin-pad-error')).toBeTruthy();
    expect(
      getByText("Hmm, that PIN didn't match. Try again or ask your parent for help."),
    ).toBeTruthy();
  });
});

describe('Auth and login forms', () => {
  it('validates and submits the ParentLoginScreen form', async () => {
    const onSubmitOverride = jest.fn(() => Promise.resolve());
    const { getByTestId, findByText } = await render(
      <TestHarness>
        <ParentLoginScreen
          onNavigateRegister={jest.fn()}
          onNavigateForgotPassword={jest.fn()}
          onSubmitOverride={onSubmitOverride}
        />
      </TestHarness>,
    );

    // Submitting empty form shows validation errors
    await fireEvent.press(getByTestId('parent-login-submit-btn'));
    expect(
      await findByText('Enter your email address or Nigerian phone number.'),
    ).toBeTruthy();

    await fireEvent.changeText(
      getByTestId('parent-login-identifier-input'),
      'ngozi@example.com',
    );
    await fireEvent.changeText(
      getByTestId('parent-login-password-input'),
      'SecretPass123!',
    );
    await fireEvent.press(getByTestId('parent-login-submit-btn'));

    await waitFor(() => {
      expect(onSubmitOverride).toHaveBeenCalledWith({
        identifier: 'ngozi@example.com',
        password: 'SecretPass123!',
      });
    });
  });

  it('validates Nigerian phone numbers and submits ParentRegisterScreen', async () => {
    const onSubmitOverride = jest.fn(() => Promise.resolve());
    const { getByTestId, findByText } = await render(
      <TestHarness>
        <ParentRegisterScreen
          onNavigateLogin={jest.fn()}
          onSubmitOverride={onSubmitOverride}
        />
      </TestHarness>,
    );

    await fireEvent.changeText(getByTestId('register-name-input'), 'Ngozi Okafor');
    await fireEvent.changeText(getByTestId('register-email-input'), 'ngozi@example.com');
    await fireEvent.changeText(getByTestId('register-phone-input'), '12345');
    await fireEvent.changeText(getByTestId('register-password-input'), 'SecretPass123!');
    await fireEvent.press(getByTestId('register-submit-btn'));

    expect(
      await findByText(
        'Enter a valid Nigerian phone number (080..., 234..., or +234...).',
      ),
    ).toBeTruthy();

    await fireEvent.changeText(getByTestId('register-phone-input'), '08031234567');
    await fireEvent.press(getByTestId('register-submit-btn'));

    await waitFor(() => {
      expect(onSubmitOverride).toHaveBeenCalledWith({
        name: 'Ngozi Okafor',
        email: 'ngozi@example.com',
        phone: '08031234567',
        password: 'SecretPass123!',
      });
    });
  });

  it('resolves single profile vs picker on KidLoginScreen and displays API error envelope messages', async () => {
    const onSingleProfileResolved = jest.fn();
    const onPickerResolved = jest.fn();

    const lookupOverride = jest
      .fn()
      .mockResolvedValueOnce({
        mode: 'single',
        profiles: [{ id: '01Hkid1', first_name: 'Tobi', avatar: 'av1.png' }],
      })
      .mockResolvedValueOnce({
        mode: 'picker',
        profiles: [
          { id: '01Hkid1', first_name: 'Tobi', avatar: 'av1.png' },
          { id: '01Hkid2', first_name: 'Ada', avatar: 'av2.png' },
        ],
      })
      .mockRejectedValueOnce({
        response: {
          data: {
            success: false,
            message: "We couldn't find that. Ask your parent to check.",
            data: null,
          },
        },
      });

    const { getByTestId, findByText } = await render(
      <TestHarness>
        <KidLoginScreen
          onSingleProfileResolved={onSingleProfileResolved}
          onPickerResolved={onPickerResolved}
          lookupOverride={lookupOverride}
        />
      </TestHarness>,
    );

    // 1. Single username lookup
    await fireEvent.changeText(getByTestId('kid-identifier-input'), 'tobi_codes');
    await fireEvent.press(getByTestId('kid-lookup-submit-btn'));

    await waitFor(() => {
      expect(onSingleProfileResolved).toHaveBeenCalledWith({
        id: '01Hkid1',
        first_name: 'Tobi',
        avatar: 'av1.png',
      });
    });

    // 2. Parent phone lookup with multiple kids -> picker
    await fireEvent.changeText(getByTestId('kid-identifier-input'), '08031234567');
    await fireEvent.press(getByTestId('kid-lookup-submit-btn'));

    await waitFor(() => {
      expect(onPickerResolved).toHaveBeenCalledWith([
        { id: '01Hkid1', first_name: 'Tobi', avatar: 'av1.png' },
        { id: '01Hkid2', first_name: 'Ada', avatar: 'av2.png' },
      ]);
    });

    // 3. Unknown identifier -> shows kind generic error from envelope
    await fireEvent.changeText(getByTestId('kid-identifier-input'), 'unknown_kid');
    await fireEvent.press(getByTestId('kid-lookup-submit-btn'));

    expect(
      await findByText("We couldn't find that. Ask your parent to check."),
    ).toBeTruthy();
  });
});
