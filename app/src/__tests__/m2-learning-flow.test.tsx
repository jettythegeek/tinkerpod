import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { createAudioPlayer } from 'expo-audio';
import * as Haptics from 'expo-haptics';
import * as learningApi from '../api/learningApi';
import { AuthProvider } from '../features/auth/AuthContext';
import { JourneyMapScreen } from '../features/kid/JourneyMapScreen';
import { KidHomeScreen } from '../features/kid/KidHomeScreen';
import {
  DEFAULT_DEMO_LESSON,
  LessonDetailScreen,
} from '../features/kid/LessonDetailScreen';
import { DEFAULT_DEMO_QUIZ, QuizScreen } from '../features/kid/QuizScreen';
import { Fx03CorrectWrong } from '../fx/Fx03CorrectWrong';
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

describe('M2 learning screens, progress resume, video player, and fx03 quiz feedback', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('switches KidHomeScreen between junior (01-kid-home) and senior (10-teen-home) themes and supports loading/empty/error/offline states', async () => {
    const juniorRender = await render(
      <TestWrapper mode="junior" reducedMotion>
        <KidHomeScreen />
      </TestWrapper>,
    );
    expect(juniorRender.getByTestId('kid-home-junior-header')).toBeTruthy();
    expect(juniorRender.getByText('Molo, Amara!')).toBeTruthy();
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

  it('renders JourneyMapScreen with done, now, and lock world states and navigates to active lesson', async () => {
    const onOpenLesson = jest.fn();
    const mapRender = await render(
      <TestWrapper mode="junior" reducedMotion>
        <JourneyMapScreen onOpenLesson={onOpenLesson} />
      </TestWrapper>,
    );

    expect(mapRender.getByText('Coding Pod')).toBeTruthy();
    expect(mapRender.getByText('3 of 6 worlds cleared')).toBeTruthy();
    expect(mapRender.getByTestId('world-node-loops-valley')).toBeTruthy();

    await fireEvent.press(mapRender.getByTestId('journey-map-continue-btn'));
    expect(onOpenLesson).toHaveBeenCalledWith('01J0000000000000000LESSON2');
    await mapRender.unmount();
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

    // Shows saved resume banner
    expect(lessonRender.getByTestId('lesson-resume-banner')).toBeTruthy();
    expect(
      lessonRender.getByText('Progress saved: 40% watched · Resume at 0:32'),
    ).toBeTruthy();

    // Open Watch Intro player (expo-video)
    await fireEvent.press(lessonRender.getByTestId('watch-intro-btn'));
    expect(lessonRender.getByTestId('lesson-video-player-card')).toBeTruthy();
    expect(lessonRender.getByTestId('lesson-expo-video-view')).toBeTruthy();
    expect(mockVideoPlay).toHaveBeenCalled();

    // Report 100% watch completion to progress endpoint
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

  it('completes the quiz flow: select wrong answer, check, see friendly explanation, retry, check correct answer', async () => {
    const checkSpy = jest.spyOn(learningApi, 'checkQuizAnswer');
    const q2 = DEFAULT_DEMO_QUIZ.questions[1]!;
    const optA = q2.options[0]!;
    const optB = q2.options[1]!;

    checkSpy.mockResolvedValueOnce({
      success: true,
      message: 'Not quite. Try again!',
      data: {
        quiz_id: DEFAULT_DEMO_QUIZ.id,
        question_id: q2.id,
        option_id: optB.id,
        option_key: 'B',
        is_correct: false,
        points_awarded: 0,
        feedback: 'Not quite. Try again!',
        explanation: 'range(3) starts at 0 and stops before 3, so it prints 0, 1, and 2.',
      },
    });

    checkSpy.mockResolvedValueOnce({
      success: true,
      message: 'Correct! Captain Jetty is proud of you.',
      data: {
        quiz_id: DEFAULT_DEMO_QUIZ.id,
        question_id: q2.id,
        option_id: optA.id,
        option_key: 'A',
        is_correct: true,
        points_awarded: 10,
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

    // 1. Select wrong option B and check
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

    // Ensure "Wrong!" never appears
    expect(quizRender.queryByText(/Wrong!/i)).toBeNull();

    // 2. Tap Try Again, select correct option A, and check
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

  it('respects mute and reducedMotion on fx03 feedback banner', async () => {
    // 1. Muted + reducedMotion: no audio, no haptics, renders still frame
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

    // 2. Unmuted + full motion: plays audio + haptics, renders animated frame
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
