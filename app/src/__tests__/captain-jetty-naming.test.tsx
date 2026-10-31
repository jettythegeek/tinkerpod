import React from 'react';
import { render } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '../features/auth/AuthContext';
import { ForgotPasswordScreen } from '../features/auth/screens/ForgotPasswordScreen';
import { KidLoginScreen } from '../features/auth/screens/KidLoginScreen';
import { ParentLoginScreen } from '../features/auth/screens/ParentLoginScreen';
import { ParentRegisterScreen } from '../features/auth/screens/ParentRegisterScreen';
import { PinPadScreen } from '../features/auth/screens/PinPadScreen';
import { ProfilePickerScreen } from '../features/auth/screens/ProfilePickerScreen';
import { WelcomeScreen } from '../features/auth/screens/WelcomeScreen';
import { BootPlaceholderScreen } from '../features/boot/BootPlaceholderScreen';
import { JourneyMapScreen } from '../features/kid/JourneyMapScreen';
import { KidHomeScreen } from '../features/kid/KidHomeScreen';
import { LessonDetailScreen } from '../features/kid/LessonDetailScreen';
import { QuizScreen } from '../features/kid/QuizScreen';
import { ParentHomeScreen } from '../features/parent/ParentHomeScreen';
import { RootNavigator } from '../navigation/RootNavigator';
import { PipIdleSvg } from '../pip/PipIdleSvg';
import { ThemeProvider } from '../theme';

jest.mock('react-native-reanimated', () => {
  const ReactActual = jest.requireActual<typeof import('react')>('react');
  const RN = jest.requireActual<typeof import('react-native')>('react-native');

  function MockAnimatedView(props: Record<string, unknown>): React.JSX.Element {
    return ReactActual.createElement(RN.View, props);
  }

  return {
    __esModule: true,
    default: {
      View: MockAnimatedView,
    },
    Easing: {
      sin: jest.fn(),
      inOut: jest.fn(() => jest.fn()),
    },
    cancelAnimation: jest.fn(),
    useSharedValue: (init: unknown) => ({ value: init }),
    useAnimatedStyle: (updater: () => Record<string, unknown>) => updater(),
    withRepeat: (val: unknown) => val,
    withSequence: (...vals: unknown[]) => vals[0],
    withTiming: (val: unknown) => val,
  };
});

jest.mock('expo-haptics', () => ({
  ImpactFeedbackStyle: { Light: 'light' },
  impactAsync: jest.fn(() => Promise.resolve()),
  selectionAsync: jest.fn(() => Promise.resolve()),
}));

jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(() => Promise.resolve(null)),
  setItemAsync: jest.fn(() => Promise.resolve()),
  deleteItemAsync: jest.fn(() => Promise.resolve()),
}));

jest.mock('expo-audio', () => ({
  createAudioPlayer: jest.fn(() => ({
    play: jest.fn(),
    pause: jest.fn(),
    remove: jest.fn(),
  })),
}));

jest.mock('expo-video', () => {
  const ReactActual = jest.requireActual<typeof import('react')>('react');
  const RN = jest.requireActual<typeof import('react-native')>('react-native');
  return {
    useVideoPlayer: jest.fn(() => ({
      loop: false,
      muted: false,
      currentTime: 0,
      play: jest.fn(),
      pause: jest.fn(),
    })),
    VideoView: (props: Record<string, unknown>) => ReactActual.createElement(RN.View, props),
  };
});

function Harness({ children }: { readonly children: React.ReactNode }): React.JSX.Element {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
      mutations: { retry: false, gcTime: 0 },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider initialMode="junior" initialReducedMotion>
        <AuthProvider skipHydration>{children}</AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

describe('Captain Jetty user-facing naming and M2.0 navigation hygiene', () => {
  it('renders PipIdleSvg with accessibilityLabel "Captain Jetty, the TinkerPod robot"', async () => {
    const { getByTestId, queryByLabelText } = await render(<PipIdleSvg reducedMotion />);
    const svgView = getByTestId('pip-idle-svg');
    expect(svgView.props.accessibilityLabel).toBe('Captain Jetty, the TinkerPod robot');
    expect(queryByLabelText(/\bpip\b/i)).toBeNull();
  });

  it('uses Captain Jetty and never the word "Pip" in any user-visible text or accessibility label across screens', async () => {
    const screens: React.ReactElement[] = [
      <WelcomeScreen
        key="welcome"
        onNavigateKidLogin={jest.fn()}
        onNavigateParentLogin={jest.fn()}
        onNavigateParentRegister={jest.fn()}
      />,
      <KidHomeScreen key="kid-home" />,
      <JourneyMapScreen key="journey-map" />,
      <LessonDetailScreen key="lesson-detail" />,
      <QuizScreen key="quiz" />,
      <BootPlaceholderScreen key="boot" />,
      <KidLoginScreen
        key="kid-login"
        onSingleProfileResolved={jest.fn()}
        onPickerResolved={jest.fn()}
        onNavigateBack={jest.fn()}
      />,
      <ProfilePickerScreen
        key="picker"
        profiles={[{ id: '01H1', first_name: 'Tobi', avatar: 'av1.png' }]}
        onSelectProfile={jest.fn()}
        onBack={jest.fn()}
      />,
      <PinPadScreen
        key="pin-pad"
        profile={{ id: '01H1', first_name: 'Tobi', avatar: 'av1.png' }}
        onBack={jest.fn()}
      />,
      <ParentLoginScreen
        key="parent-login"
        onNavigateRegister={jest.fn()}
        onNavigateForgotPassword={jest.fn()}
      />,
      <ParentRegisterScreen key="parent-register" onNavigateLogin={jest.fn()} />,
      <ForgotPasswordScreen key="forgot" onNavigateBackToLogin={jest.fn()} />,
      <ParentHomeScreen key="parent-home" />,
    ];

    for (const screen of screens) {
      const rendered = await render(<Harness>{screen}</Harness>);
      expect(rendered.queryByText(/\bpip\b/i)).toBeNull();
      expect(rendered.queryByLabelText(/\bpip\b/i)).toBeNull();
      expect(rendered.queryByPlaceholderText(/\bpip\b/i)).toBeNull();
      await rendered.unmount();
    }

    const welcomeRender = await render(
      <Harness>
        <WelcomeScreen
          onNavigateKidLogin={jest.fn()}
          onNavigateParentLogin={jest.fn()}
          onNavigateParentRegister={jest.fn()}
        />
      </Harness>,
    );
    expect(
      welcomeRender.getByText('Build games, solve puzzles, and code with Captain Jetty.'),
    ).toBeTruthy();
    await welcomeRender.unmount();

    const bootRender = await render(
      <Harness>
        <BootPlaceholderScreen />
      </Harness>,
    );
    expect(bootRender.getByText("Hi, I'm Captain Jetty!")).toBeTruthy();
    await bootRender.unmount();
  });

  it('boots RootNavigator to WelcomeScreen and does not include BootPlaceholder in navigator', async () => {
    const rendered = await render(
      <Harness>
        <RootNavigator />
      </Harness>,
    );

    expect(rendered.getByTestId('welcome-screen')).toBeTruthy();
    expect(rendered.queryByTestId('boot-placeholder-screen')).toBeNull();
    await rendered.unmount();
  });
});
