import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { createAudioPlayer } from 'expo-audio';
import * as Haptics from 'expo-haptics';
import * as learningApi from '../api/learningApi';
import type { RewardPresentationTier, RewardResultDto } from '../api/learningApi';
import { AuthProvider } from '../features/auth/AuthContext';
import { KidProfileScreen } from '../features/kid/KidProfileScreen';
import { RewardsScreen } from '../features/kid/RewardsScreen';
import { RewardCelebrationModal } from '../fx/RewardCelebrationModal';
import { StreakFlameIdle } from '../fx/StreakFlameIdle';
import { AgeBandThemeMode, ThemeProvider } from '../theme';

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

jest.mock('react-native-webview', () => {
  const ReactActual = jest.requireActual<typeof import('react')>('react');
  const RN = jest.requireActual<typeof import('react-native')>('react-native');
  return {
    WebView: (props: Record<string, unknown>) =>
      ReactActual.createElement(RN.View, { testID: 'mock-webview', ...props }),
  };
});

jest.mock('expo-haptics', () => ({
  ImpactFeedbackStyle: { Light: 'light' },
  NotificationFeedbackType: { Success: 'success' },
  impactAsync: jest.fn(() => Promise.resolve()),
  notificationAsync: jest.fn(() => Promise.resolve()),
  selectionAsync: jest.fn(() => Promise.resolve()),
}));

jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(() => Promise.resolve(null)),
  setItemAsync: jest.fn(() => Promise.resolve()),
  deleteItemAsync: jest.fn(() => Promise.resolve()),
}));

const mockAudioPlay = jest.fn();
jest.mock('expo-audio', () => ({
  createAudioPlayer: jest.fn(() => ({
    play: mockAudioPlay,
    pause: jest.fn(),
    remove: jest.fn(),
  })),
}));

function TestWrapper({
  children,
  mode = 'junior',
  reducedMotion = false,
  reducedEffects = false,
  muted = false,
}: {
  readonly children: React.ReactNode;
  readonly mode?: AgeBandThemeMode;
  readonly reducedMotion?: boolean;
  readonly reducedEffects?: boolean;
  readonly muted?: boolean;
}): React.JSX.Element {
  return (
    <ThemeProvider
      initialMode={mode}
      initialReducedMotion={reducedMotion}
      initialReducedEffects={reducedEffects}
      initialMuted={muted}
    >
      <AuthProvider skipHydration>{children}</AuthProvider>
    </ThemeProvider>
  );
}

function makeSampleRewardResult(tier: RewardPresentationTier): RewardResultDto {
  return {
    ledger_entries: [
      {
        id: '01JLEDGER1',
        currency: 'xp',
        amount: 50,
        source_type: 'lesson_completed',
        source_id: '1',
        rule_version: 1,
        idempotency_key: 'lesson_completed:1:1',
      },
      {
        id: '01JLEDGER2',
        currency: 'coins',
        amount: 20,
        source_type: 'lesson_completed',
        source_id: '1',
        rule_version: 1,
        idempotency_key: 'lesson_completed:1:1:coins',
      },
    ],
    totals: { xp: 350, coins: 120, gems: 5 },
    level_change: {
      previous_level: tier === 'level_up' ? 3 : 4,
      current_level: 4,
      leveled_up: tier === 'level_up',
    },
    new_badges:
      tier === 'badge' || tier === 'big'
        ? [
            {
              slug: 'loop-master',
              name: 'Loop Master',
              description: 'Complete 3 lessons.',
              icon: 'repeat',
              color: '#7C3AED',
              earned_at: '2026-10-31T10:00:00Z',
            },
          ]
        : [],
    streak_change: {
      previous_streak: 4,
      current_streak: 5,
      best_streak: 5,
      status: 'active',
      incremented: tier === 'streak',
      last_active_date: '2026-10-31',
      grace_days_used: 0,
      message: '5-day streak active! Keep coding!',
    },
    current_title: {
      slug: 'code-apprentice',
      name: 'Code Apprentice',
    },
    next_title: {
      slug: 'junior-dev',
      name: 'Junior Dev',
      min_level: 5,
    },
    new_title:
      tier === 'level_up'
        ? {
            slug: 'code-apprentice',
            name: 'Code Apprentice',
          }
        : null,
    presentation_tier: tier,
    was_replayed: false,
  };
}

describe('M3 reward celebrations, streak animations, and accessibility settings', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders all 5 presentation tiers and overlays native Text for earned badge names', async () => {
    const tiers: RewardPresentationTier[] = [
      'small',
      'level_up',
      'badge',
      'streak',
      'big',
    ];

    for (const tier of tiers) {
      const onDismiss = jest.fn();
      const result = makeSampleRewardResult(tier);
      const rendered = await render(
        <TestWrapper mode="junior" muted={false} reducedMotion={false}>
          <RewardCelebrationModal
            visible={true}
            rewardResult={result}
            onDismiss={onDismiss}
          />
        </TestWrapper>,
      );

      await waitFor(() => {
        expect(rendered.getByTestId(`reward-celebration-${tier}`)).toBeTruthy();
      });

      expect(rendered.getByTestId('celebration-animated-frame')).toBeTruthy();
      expect(rendered.getByTestId('celebration-xp-chip')).toBeTruthy();
      expect(rendered.getByTestId('celebration-coins-chip')).toBeTruthy();

      if (tier === 'badge') {
        const badgeNameOverlay = rendered.getByTestId('reward-celebration-badge-name');
        expect(badgeNameOverlay.props.children).toBe('Loop Master');
      }

      await fireEvent.press(rendered.getByTestId('reward-celebration-continue-btn'));
      expect(onDismiss).toHaveBeenCalledTimes(1);
      await rendered.unmount();
    }

    expect(createAudioPlayer).toHaveBeenCalled();
    expect(Haptics.notificationAsync).toHaveBeenCalled();
  });

  it('renders kind streak_paused wakeup card with Captain Jetty sleepy -> wake and never uses sad or loss wording', async () => {
    const onWakeJetty = jest.fn();
    const rendered = await render(
      <TestWrapper mode="junior" reducedMotion={false} muted={false}>
        <RewardCelebrationModal
          visible={true}
          streakPaused={true}
          onWakeJetty={onWakeJetty}
        />
      </TestWrapper>,
    );

    expect(rendered.getByTestId('reward-celebration-streak-paused')).toBeTruthy();
    const messageNode = rendered.getByTestId('streak-paused-kind-message');
    expect(String(messageNode.props.children)).toContain(
      'Captain Jetty kept your spot warm!',
    );

    // Hard rule 6: never sad or a loss ("streak ended", "lost", "broken")
    expect(rendered.queryByText(/streak ended/i)).toBeNull();
    expect(rendered.queryByText(/broken/i)).toBeNull();
    expect(rendered.queryByText(/lost/i)).toBeNull();

    // Press wake button -> transitions to pip-sleepy-wake-static.svg
    await fireEvent.press(rendered.getByTestId('streak-paused-wake-btn'));
    expect(rendered.getByTestId('streak-paused-wake-frame')).toBeTruthy();
    expect(onWakeJetty).toHaveBeenCalledTimes(1);
    await rendered.unmount();
  });

  it('respects muted, reducedMotion, and reducedEffects across RewardCelebrationModal and StreakFlameIdle', async () => {
    jest.clearAllMocks();
    const result = makeSampleRewardResult('level_up');

    const rendered = await render(
      <TestWrapper
        mode="junior"
        muted={true}
        reducedMotion={true}
        reducedEffects={true}
      >
        <StreakFlameIdle size={20} />
        <RewardCelebrationModal
          visible={true}
          rewardResult={result}
          onDismiss={jest.fn()}
        />
      </TestWrapper>,
    );

    expect(rendered.getByTestId('celebration-still-frame')).toBeTruthy();
    expect(rendered.getByTestId('fx10-flame-still')).toBeTruthy();
    expect(createAudioPlayer).not.toHaveBeenCalled();
    expect(Haptics.notificationAsync).not.toHaveBeenCalled();
    expect(Haptics.impactAsync).not.toHaveBeenCalled();
    await rendered.unmount();
  });

  it('renders RewardsScreen and KidProfileScreen with live M3 rewards data and kind paused streak banner', async () => {
    const fetchProfileSpy = jest
      .spyOn(learningApi, 'fetchKidProfile')
      .mockResolvedValue({
        success: true,
        message: 'Profile retrieved.',
        data: {
          child: {
            id: '01JCHILD1',
            public_id: '01JCHILD1',
            username: 'amara_codes',
            first_name: 'Amara',
            age_band: 'junior',
            theme_flag: 'junior',
            avatar: 'avatar-amara',
          },
          profile: {
            xp: 420,
            coins: 195,
            gems: 10,
            level: 3,
            current_level_xp: 250,
            next_level_xp: 500,
            xp_in_level: 170,
            xp_for_next_level: 250,
            progress_percent: 68,
            title: 'Code Apprentice',
            next_title: 'Junior Dev',
            title_ladder: [
              {
                slug: 'small-pikin-coder',
                name: 'Small Pikin Coder',
                min_level: 1,
                unlocked: true,
                is_current: false,
              },
              {
                slug: 'code-apprentice',
                name: 'Code Apprentice',
                min_level: 3,
                unlocked: true,
                is_current: true,
              },
            ],
            streak: {
              current_streak: 0,
              best_streak: 5,
              status: 'streak_paused',
              is_paused: true,
              last_active_date: '2026-10-28',
              grace_days_used: 0,
              grace_days_allowed: 1,
              timezone: 'Africa/Lagos',
              message:
                'Captain Jetty kept your spot warm! Do one lesson today to start a new streak.',
            },
            stats: {
              streak_days: 0,
              best_streak_days: 5,
              total_xp: 420,
              coins: 195,
              gems: 10,
              level: 3,
              badges_earned_count: 1,
              badges_total_count: 2,
            },
            badges: {
              earned_count: 1,
              total_count: 2,
              earned: [
                {
                  slug: 'first-steps',
                  name: 'First Steps',
                  description: 'Complete your very first lesson.',
                  icon: 'rocket',
                  color: '#F59E0B',
                  is_earned: true,
                  earned_at: '2026-10-28T10:00:00Z',
                },
              ],
              locked: [
                {
                  slug: 'loop-master',
                  name: 'Loop Master',
                  description: 'Complete 3 lessons.',
                  icon: 'repeat',
                  color: '#7C3AED',
                  is_earned: false,
                  earned_at: null,
                },
              ],
              all: [],
            },
          },
        },
      });

    const rewardsRender = await render(
      <TestWrapper mode="junior" reducedMotion>
        <RewardsScreen autoFetch />
      </TestWrapper>,
    );

    await waitFor(() => {
      expect(rewardsRender.getByTestId('rewards-streak-paused-card')).toBeTruthy();
    });

    expect(
      rewardsRender.getByText(/Captain Jetty kept your spot warm!/i),
    ).toBeTruthy();
    await rewardsRender.unmount();

    const profileRender = await render(
      <TestWrapper mode="junior" reducedMotion>
        <KidProfileScreen autoFetch />
      </TestWrapper>,
    );

    await waitFor(() => {
      expect(profileRender.getByTestId('kid-profile-title-ladder')).toBeTruthy();
    });
    expect(profileRender.getByTestId('kid-profile-girl-cutout')).toBeTruthy();
    await profileRender.unmount();
    fetchProfileSpy.mockRestore();
  });
});
