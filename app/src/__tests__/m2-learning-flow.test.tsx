import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { createAudioPlayer } from 'expo-audio';
import * as Haptics from 'expo-haptics';
import * as learningApi from '../api/learningApi';
import { AuthProvider } from '../features/auth/AuthContext';
import { BuildScreen, SAMPLE_PORTFOLIO_PROJECTS } from '../features/kid/BuildScreen';
import { JourneyMapScreen } from '../features/kid/JourneyMapScreen';
import { KidHomeScreen } from '../features/kid/KidHomeScreen';
import { KidProfileScreen } from '../features/kid/KidProfileScreen';
import {
  DEFAULT_DEMO_LESSON,
  LessonDetailScreen,
} from '../features/kid/LessonDetailScreen';
import { DEFAULT_DEMO_QUIZ, QuizScreen } from '../features/kid/QuizScreen';
import { RewardsScreen } from '../features/kid/RewardsScreen';
import { buildFx03SvgXml, Fx03CorrectWrong } from '../fx/Fx03CorrectWrong';
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

const mockVideoPlay = jest.fn();
jest.mock('expo-video', () => {
  const ReactActual = jest.requireActual<typeof import('react')>('react');
  const RN = jest.requireActual<typeof import('react-native')>('react-native');
  return {
    useVideoPlayer: jest.fn(() => ({
      loop: false,
      muted: false,
      currentTime: 0,
      play: mockVideoPlay,
      pause: jest.fn(),
    })),
    VideoView: (props: Record<string, unknown>) => ReactActual.createElement(RN.View, props),
  };
});

function TestWrapper({
  children,
  mode = 'junior',
  reducedMotion = false,
  muted = false,
}: {
  readonly children: React.ReactNode;
  readonly mode?: AgeBandThemeMode;
  readonly reducedMotion?: boolean;
  readonly muted?: boolean;
}): React.JSX.Element {
  return (
    <ThemeProvider
      initialMode={mode}
      initialReducedMotion={reducedMotion}
      initialMuted={muted}
    >
      <AuthProvider skipHydration>{children}</AuthProvider>
    </ThemeProvider>
  );
}

describe('M3.0 mockup screens, Learn hub, Build/Rewards/Profile tabs, and fx03 asset feedback', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('switches KidHomeScreen between junior (01-kid-home) and senior (10-teen-home) themes with kind streak wording', async () => {
    const juniorRender = await render(
      <TestWrapper mode="junior" reducedMotion>
        <KidHomeScreen />
      </TestWrapper>,
    );
    expect(juniorRender.getByTestId('kid-home-junior-header')).toBeTruthy();
    expect(juniorRender.getByText('Hi, Amara!')).toBeTruthy();
    expect(juniorRender.queryByText(/Molo/i)).toBeNull();
    expect(juniorRender.getByTestId('kid-home-mascot-cheering')).toBeTruthy();
    expect(juniorRender.getByTestId('junior-continue-card')).toBeTruthy();
    await juniorRender.unmount();

    const seniorRender = await render(
      <TestWrapper mode="senior" reducedMotion>
        <KidHomeScreen />
      </TestWrapper>,
    );
    expect(seniorRender.getByTestId('kid-home-senior-header')).toBeTruthy();
    expect(seniorRender.getByText('Welcome back')).toBeTruthy();
    expect(seniorRender.getByTestId('senior-xp-stub-banner')).toBeTruthy();
    expect(seniorRender.getByTestId('kid-home-mascot-sleepy')).toBeTruthy();
    expect(
      seniorRender.getByText(
        'Captain Jetty kept your spot warm! Do one lesson today to start a new streak.',
      ),
    ).toBeTruthy();
    await seniorRender.unmount();

    const offlineRender = await render(
      <TestWrapper mode="junior" reducedMotion>
        <KidHomeScreen screenState="offline" />
      </TestWrapper>,
    );
    expect(offlineRender.getByTestId('learning-state-offline')).toBeTruthy();
    expect(offlineRender.getByText('You look offline right now')).toBeTruthy();
    await offlineRender.unmount();
  });

  it('renders JourneyMapScreen (02 & 33) with journey-map-bg, mascot-happy, stars, and switches to Missions (38 & 39) and Compete (40)', async () => {
    const onOpenLesson = jest.fn();
    const mapRender = await render(
      <TestWrapper mode="junior" reducedMotion>
        <JourneyMapScreen onOpenLesson={onOpenLesson} />
      </TestWrapper>,
    );

    expect(mapRender.getAllByText('Coding Pod').length).toBeGreaterThanOrEqual(1);
    expect(mapRender.getByText('3 of 6 worlds cleared')).toBeTruthy();
    expect(mapRender.getByTestId('journey-map-bg')).toBeTruthy();
    expect(mapRender.getByTestId('journey-map-mascot-happy')).toBeTruthy();
    expect(mapRender.getByTestId('journey-map-lesson-stars')).toBeTruthy();
    expect(mapRender.getByTestId('world-node-loops-valley')).toBeTruthy();

    await fireEvent.press(mapRender.getByTestId('journey-map-continue-btn'));
    expect(onOpenLesson).toHaveBeenCalledWith('01J0000000000000000LESSON2');

    // Switch to Missions tab (38-learn-missions) and open Codazanga mission (39-mission-codazanga)
    await fireEvent.press(mapRender.getByTestId('learn-tab-missions'));
    expect(mapRender.getByTestId('learn-missions-section')).toBeTruthy();
    expect(mapRender.getByText('The Lost Key of Ngodo')).toBeTruthy();

    await fireEvent.press(mapRender.getByTestId('open-mission-codazanga-btn'));
    expect(mapRender.getByTestId('mission-codazanga-view')).toBeTruthy();
    expect(mapRender.getByText('The Golden Gate of Codazanga')).toBeTruthy();
    await fireEvent.press(mapRender.getByTestId('mission-detail-back-btn'));

    // Switch to Compete tab (40-compete-coming-soon) -> League, Cup, World Cup locked cards
    await fireEvent.press(mapRender.getByTestId('learn-tab-compete'));
    expect(mapRender.getByTestId('learn-compete-section')).toBeTruthy();
    expect(mapRender.getByTestId('compete-card-league')).toBeTruthy();
    expect(mapRender.getByTestId('compete-card-cup')).toBeTruthy();
    expect(mapRender.getByTestId('compete-card-world-cup')).toBeTruthy();

    await mapRender.unmount();
  });

  it('renders BuildScreen (46 & 47), RewardsScreen (44 & 45), and KidProfileScreen (07)', async () => {
    const emptyBuild = await render(
      <TestWrapper mode="junior" reducedMotion>
        <BuildScreen />
      </TestWrapper>,
    );
    expect(emptyBuild.getByTestId('build-empty-view')).toBeTruthy();
    expect(emptyBuild.getByText('Nothing built yet')).toBeTruthy();
    expect(emptyBuild.getByText('First up: Jollof Timer App')).toBeTruthy();
    await emptyBuild.unmount();

    const portfolioBuild = await render(
      <TestWrapper mode="junior" reducedMotion>
        <BuildScreen initialProjects={SAMPLE_PORTFOLIO_PROJECTS} />
      </TestWrapper>,
    );
    expect(portfolioBuild.getByTestId('build-portfolio-view')).toBeTruthy();
    expect(portfolioBuild.getByText('Space Dodger Game')).toBeTruthy();
    await portfolioBuild.unmount();

    const activeRewards = await render(
      <TestWrapper mode="junior" reducedMotion>
        <RewardsScreen streakPaused={false} />
      </TestWrapper>,
    );
    expect(activeRewards.getByTestId('rewards-streak-active-card')).toBeTruthy();
    expect(activeRewards.getByTestId('rewards-flame-idle')).toBeTruthy();
    await activeRewards.unmount();

    const pausedRewards = await render(
      <TestWrapper mode="junior" reducedMotion>
        <RewardsScreen streakPaused />
      </TestWrapper>,
    );
    expect(pausedRewards.getByTestId('rewards-streak-paused-card')).toBeTruthy();
    expect(pausedRewards.getByTestId('rewards-pip-sleepy')).toBeTruthy();
    expect(pausedRewards.getByText('Wake Jetty · do 1 lesson')).toBeTruthy();
    await pausedRewards.unmount();

    const profileRender = await render(
      <TestWrapper mode="junior" reducedMotion>
        <KidProfileScreen />
      </TestWrapper>,
    );
    expect(profileRender.getByTestId('kid-profile-girl-cutout')).toBeTruthy();
    expect(profileRender.getByTestId('kid-profile-title-ladder')).toBeTruthy();
    await profileRender.unmount();
  });

  it('displays saved lesson progress resume position and sends watch_percent from expo-video player', async () => {
    const updateProgressSpy = jest
      .spyOn(learningApi, 'updateLessonProgress')
      .mockResolvedValue({
        success: true,
        message: 'Lesson progress updated.',
        data: {
          lesson_id: DEFAULT_DEMO_LESSON.id,
          completion_mode: 'watch_percent',
          newly_completed: true,
          progress: {
            resume_position_seconds: 80,
            watch_percent: 100,
            manual_completed: false,
            quiz_passed: false,
            is_completed: true,
            completed_at: '2026-10-31T12:00:00Z',
          },
        },
      });

    const resumedLesson = {
      ...DEFAULT_DEMO_LESSON,
      progress: {
        resume_position_seconds: 32,
        watch_percent: 40,
        manual_completed: false,
        quiz_passed: false,
        is_completed: false,
        completed_at: null,
      },
    };

    const lessonRender = await render(
      <TestWrapper mode="junior" reducedMotion>
        <LessonDetailScreen initialLesson={resumedLesson} />
      </TestWrapper>,
    );

    expect(lessonRender.getByTestId('lesson-detail-hero-image')).toBeTruthy();
    expect(lessonRender.getByTestId('lesson-resume-banner')).toBeTruthy();
    expect(
      lessonRender.getByText('Progress saved: 40% watched · Resume at 0:32'),
    ).toBeTruthy();

    await fireEvent.press(lessonRender.getByTestId('watch-intro-btn'));
    expect(lessonRender.getByTestId('lesson-video-player-card')).toBeTruthy();
    expect(lessonRender.getByTestId('lesson-expo-video-view')).toBeTruthy();
    expect(mockVideoPlay).toHaveBeenCalled();

    await fireEvent.press(lessonRender.getByTestId('video-progress-100-btn'));

    await waitFor(() => {
      expect(updateProgressSpy).toHaveBeenCalledWith(DEFAULT_DEMO_LESSON.id, {
        resume_position_seconds: 80,
        watch_percent: 100,
        mark_complete: false,
      });
    });

    await waitFor(() => {
      expect(
        lessonRender.getByText('Progress saved: 100% watched · Resume at 1:20'),
      ).toBeTruthy();
    });

    updateProgressSpy.mockRestore();
    await lessonRender.unmount();
  });

  it('completes the quiz flow with 2x2 grid, mascot-thinking hint bubble, lightbulb button, and open-attempt check', async () => {
    const checkSpy = jest.spyOn(learningApi, 'checkQuizAnswer');
    const q2 = DEFAULT_DEMO_QUIZ.questions[1]!;
    const optA = q2.options[0]!;
    const optB = q2.options[1]!;

    checkSpy.mockResolvedValueOnce({
      success: true,
      message: 'Not quite. Try again!',
      data: {
        attempt_id: DEFAULT_DEMO_QUIZ.open_attempt_id!,
        quiz_id: DEFAULT_DEMO_QUIZ.id,
        question_id: q2.id,
        option_id: optB.id,
        option_key: 'B',
        is_correct: false,
        is_first_answer: true,
        points_awarded: 0,
        feedback: 'Not quite. Try again!',
        explanation: 'range(3) starts at 0 and stops before 3, so it prints 0, 1, and 2.',
      },
    });

    checkSpy.mockResolvedValueOnce({
      success: true,
      message: 'Correct! Captain Jetty is proud of you.',
      data: {
        attempt_id: DEFAULT_DEMO_QUIZ.open_attempt_id!,
        quiz_id: DEFAULT_DEMO_QUIZ.id,
        question_id: q2.id,
        option_id: optA.id,
        option_key: 'A',
        is_correct: true,
        is_first_answer: false,
        is_retry: true,
        points_awarded: 0,
        feedback: 'Correct! Captain Jetty is proud of you.',
        explanation: 'range(3) starts at 0 and stops before 3, so it prints 0, 1, and 2.',
      },
    });

    const quizRender = await render(
      <TestWrapper mode="junior" reducedMotion muted>
        <QuizScreen initialQuiz={DEFAULT_DEMO_QUIZ} initialQuestionIndex={1} />
      </TestWrapper>,
    );

    expect(quizRender.getByText('What will this loop print?')).toBeTruthy();
    expect(quizRender.getByTestId('quiz-options-grid')).toBeTruthy();
    expect(quizRender.getByTestId('quiz-mascot-thinking')).toBeTruthy();
    expect(quizRender.getByTestId('quiz-hint-btn')).toBeTruthy();

    await fireEvent.press(quizRender.getByTestId('quiz-option-B'));
    await fireEvent.press(quizRender.getByTestId('quiz-check-answer-btn'));

    await waitFor(() => {
      expect(quizRender.getByText('Not quite. Try again!')).toBeTruthy();
      expect(
        quizRender.getByText(
          'range(3) starts at 0 and stops before 3, so it prints 0, 1, and 2.',
        ),
      ).toBeTruthy();
    });

    expect(quizRender.queryByText(/Wrong!/i)).toBeNull();

    await fireEvent.press(quizRender.getByTestId('quiz-try-again-btn'));
    await fireEvent.press(quizRender.getByTestId('quiz-option-A'));
    await fireEvent.press(quizRender.getByTestId('quiz-check-answer-btn'));

    await waitFor(() => {
      expect(quizRender.getByText('Correct!')).toBeTruthy();
      expect(quizRender.getByText('Captain Jetty is proud of you')).toBeTruthy();
      expect(quizRender.getByTestId('quiz-next-or-submit-btn')).toBeTruthy();
    });

    checkSpy.mockRestore();
    await quizRender.unmount();
  });

  it('uses design/fx/svg/fx03-correct-wrong.svg and respects mute and reducedMotion on fx03 feedback banner', async () => {
    const correctSvg = buildFx03SvgXml('correct', true);
    expect(correctSvg).toContain('id="f3-root"');
    expect(correctSvg).toContain('Captain Jetty is proud of you');
    expect(correctSvg).not.toContain('Pip is proud of you');

    const mutedStillRender = await render(
      <TestWrapper mode="junior" muted reducedMotion>
        <Fx03CorrectWrong
          variant="correct"
          explanation="range(3) prints 0, 1, 2."
          muted
          reducedMotion
        />
      </TestWrapper>,
    );

    expect(mutedStillRender.getByTestId('fx03-still-frame')).toBeTruthy();
    expect(createAudioPlayer).not.toHaveBeenCalled();
    expect(mockAudioPlay).not.toHaveBeenCalled();
    expect(Haptics.impactAsync).not.toHaveBeenCalled();
    await mutedStillRender.unmount();

    const unmutedAnimatedRender = await render(
      <TestWrapper mode="junior" muted={false} reducedMotion={false}>
        <Fx03CorrectWrong
          variant="wrong"
          explanation="Try counting from 0."
          muted={false}
          reducedMotion={false}
        />
      </TestWrapper>,
    );

    expect(unmutedAnimatedRender.getByTestId('fx03-animated-frame')).toBeTruthy();
    expect(createAudioPlayer).toHaveBeenCalledTimes(1);
    expect(mockAudioPlay).toHaveBeenCalledTimes(1);
    expect(Haptics.impactAsync).toHaveBeenCalledTimes(1);
    await unmutedAnimatedRender.unmount();
  });
});
