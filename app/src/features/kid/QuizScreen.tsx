import React, { useCallback, useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { extractApiErrorMessage } from '../../api/client';
import {
  checkQuizAnswer,
  CheckQuizAnswerData,
  fetchLessonQuiz,
  fetchQuizDetail,
  isOfflineError,
  QuizAttemptResultDto,
  QuizDetailDto,
  QuizOptionDto,
  submitQuizAttempt,
} from '../../api/learningApi';
import { TpButton, TpCard, TpErrorBanner } from '../../components/DesignSystem';
import { Fx03CorrectWrong } from '../../fx/Fx03CorrectWrong';
import { PipIdleSvg } from '../../pip';
import { useTheme } from '../../theme';
import { useAuth } from '../auth/AuthContext';
import { LearningScreenState } from './components/LearningScreenState';

export interface QuizScreenProps {
  readonly quizId?: string;
  readonly lessonId?: string;
  readonly initialQuiz?: QuizDetailDto | null;
  readonly screenState?: 'loading' | 'empty' | 'error' | 'offline';
  readonly errorMessage?: string;
  readonly autoFetch?: boolean;
  readonly initialQuestionIndex?: number;
  readonly onBack?: () => void;
  readonly onQuizPassed?: (attempt: QuizAttemptResultDto) => void;
}

export const DEFAULT_DEMO_QUIZ: QuizDetailDto = {
  id: '01J000000000000000000QUIZ1',
  lesson_id: '01J0000000000000000LESSON2',
  title: 'Repeat and Count: range() Quiz',
  description: 'Check how Python range() loops count numbers.',
  pass_mark_percent: 75,
  max_attempts: 3,
  attempts_used: 0,
  remaining_attempts: 3,
  best_score_percent: 0,
  is_passed: false,
  is_demo: true,
  questions: [
    {
      id: '01J00000000000000000000Q1',
      question_number: 1,
      prompt: 'Where does Python range(3) start counting from?',
      code_snippet: 'for i in range(3):\n    print(i)',
      hint: 'Remember: Python starts counting at 0.',
      points: 10,
      options: [
        { id: '01J00000000000000000Q1OPTA', option_key: 'A', label: '0', sort_order: 1 },
        { id: '01J00000000000000000Q1OPTB', option_key: 'B', label: '1', sort_order: 2 },
        { id: '01J00000000000000000Q1OPTC', option_key: 'C', label: '3', sort_order: 3 },
        { id: '01J00000000000000000Q1OPTD', option_key: 'D', label: '-1', sort_order: 4 },
      ],
    },
    {
      id: '01J00000000000000000000Q2',
      question_number: 2,
      prompt: 'What will this loop print?',
      code_snippet: 'for i in range(3):\n    print(i)',
      hint: 'Remember: range(3) starts at 0 and stops before 3.',
      points: 10,
      options: [
        { id: '01J00000000000000000Q2OPTA', option_key: 'A', label: '0  1  2', sort_order: 1 },
        { id: '01J00000000000000000Q2OPTB', option_key: 'B', label: '1  2  3', sort_order: 2 },
        { id: '01J00000000000000000Q2OPTC', option_key: 'C', label: '0  1  2  3', sort_order: 3 },
        { id: '01J00000000000000000Q2OPTD', option_key: 'D', label: '3  2  1', sort_order: 4 },
      ],
    },
    {
      id: '01J00000000000000000000Q3',
      question_number: 3,
      prompt: 'How many times will this loop repeat?',
      code_snippet: 'for step in range(5):\n    move_forward()',
      hint: 'Count the numbers 0, 1, 2, 3, and 4.',
      points: 10,
      options: [
        { id: '01J00000000000000000Q3OPTA', option_key: 'A', label: '4 times', sort_order: 1 },
        { id: '01J00000000000000000Q3OPTB', option_key: 'B', label: '5 times', sort_order: 2 },
        { id: '01J00000000000000000Q3OPTC', option_key: 'C', label: '6 times', sort_order: 3 },
        { id: '01J00000000000000000Q3OPTD', option_key: 'D', label: '1 time', sort_order: 4 },
      ],
    },
    {
      id: '01J00000000000000000000Q4',
      question_number: 4,
      prompt: 'Which loop prints only 0 and 1?',
      code_snippet: '# Choose the loop that stops before 2',
      hint: 'range(n) stops right before n.',
      points: 10,
      options: [
        { id: '01J00000000000000000Q4OPTA', option_key: 'A', label: 'for i in range(1):', sort_order: 1 },
        { id: '01J00000000000000000Q4OPTB', option_key: 'B', label: 'for i in range(2):', sort_order: 2 },
        { id: '01J00000000000000000Q4OPTC', option_key: 'C', label: 'for i in range(3):', sort_order: 3 },
        { id: '01J00000000000000000Q4OPTD', option_key: 'D', label: 'for i in range(0):', sort_order: 4 },
      ],
    },
  ],
};

export function QuizScreen({
  quizId,
  lessonId,
  initialQuiz,
  screenState,
  errorMessage,
  autoFetch,
  initialQuestionIndex = 1,
  onBack,
  onQuizPassed,
}: QuizScreenProps = {}): React.JSX.Element {
  const { tokens, reducedMotion } = useTheme();
  const { token } = useAuth();

  const shouldFetch =
    autoFetch ?? Boolean(token && initialQuiz === undefined && !screenState && (quizId || lessonId));

  const [quiz, setQuiz] = useState<QuizDetailDto | null>(
    initialQuiz !== undefined ? initialQuiz : DEFAULT_DEMO_QUIZ,
  );
  const [status, setStatus] = useState<'idle' | 'loading' | 'empty' | 'error' | 'offline'>(
    screenState ?? (shouldFetch ? 'loading' : 'idle'),
  );
  const [errorText, setErrorText] = useState<string | undefined>(errorMessage);

  const [questionIndex, setQuestionIndex] = useState<number>(initialQuestionIndex);
  const [selectedByQuestionId, setSelectedByQuestionId] = useState<Record<string, QuizOptionDto>>(
    () => {
      // Pre-select option A on question 2 when showing default mockup state if no initialQuiz was passed
      const q2 = DEFAULT_DEMO_QUIZ.questions[1];
      const optA = q2?.options[0];
      return q2 && optA && initialQuiz === undefined ? { [q2.id]: optA } : {};
    },
  );
  const [checkedResult, setCheckedResult] = useState<CheckQuizAnswerData | null>(null);
  const [attemptResult, setAttemptResult] = useState<QuizAttemptResultDto | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [isChecking, setIsChecking] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const loadQuiz = useCallback(async () => {
    setStatus('loading');
    setErrorText(undefined);
    try {
      const res = quizId
        ? await fetchQuizDetail(quizId)
        : lessonId
          ? await fetchLessonQuiz(lessonId)
          : await fetchQuizDetail(DEFAULT_DEMO_QUIZ.id);

      if (!res.data.quiz || res.data.quiz.questions.length === 0) {
        setQuiz(null);
        setStatus('empty');
      } else {
        setQuiz(res.data.quiz);
        setQuestionIndex(0);
        setStatus('idle');
      }
    } catch (err) {
      setErrorText(extractApiErrorMessage(err, 'Could not load this quiz.'));
      setStatus(isOfflineError(err) ? 'offline' : 'error');
    }
  }, [lessonId, quizId]);

  useEffect(() => {
    if (screenState) {
      setStatus(screenState);
      return;
    }
    if (shouldFetch) {
      void loadQuiz();
    }
  }, [loadQuiz, screenState, shouldFetch]);

  if (status === 'loading' || status === 'empty' || status === 'error' || status === 'offline') {
    return (
      <LearningScreenState
        state={status}
        message={errorText}
        onRetry={() => {
          void loadQuiz();
        }}
        onBack={onBack}
      />
    );
  }

  const activeQuiz = quiz ?? DEFAULT_DEMO_QUIZ;
  const clampedIndex = Math.min(
    Math.max(0, questionIndex),
    Math.max(0, activeQuiz.questions.length - 1),
  );
  const currentQuestion = activeQuiz.questions[clampedIndex] ?? activeQuiz.questions[0];

  if (!currentQuestion) {
    return <LearningScreenState state="empty" onBack={onBack} />;
  }

  const selectedOption = selectedByQuestionId[currentQuestion.id] ?? null;
  const progressPct = Math.round(((clampedIndex + 1) / activeQuiz.questions.length) * 100);

  const handleSelectOption = (option: QuizOptionDto) => {
    setSelectedByQuestionId((prev) => ({
      ...prev,
      [currentQuestion.id]: option,
    }));
    setCheckedResult(null);
    setActionError(null);
  };

  const handleCheckAnswer = async () => {
    if (!selectedOption) {
      return;
    }
    setIsChecking(true);
    setActionError(null);
    try {
      const response = await checkQuizAnswer(activeQuiz.id, {
        question_id: currentQuestion.id,
        option_id: selectedOption.id,
        option_key: selectedOption.option_key,
      });
      setCheckedResult(response.data);
    } catch (err) {
      setActionError(extractApiErrorMessage(err, 'Could not check your answer right now.'));
    } finally {
      setIsChecking(false);
    }
  };

  const handleRetryQuestion = () => {
    setCheckedResult(null);
    setActionError(null);
  };

  const handleNextOrSubmit = async () => {
    if (clampedIndex + 1 < activeQuiz.questions.length) {
      setCheckedResult(null);
      setActionError(null);
      setQuestionIndex(clampedIndex + 1);
      return;
    }

    setIsSubmitting(true);
    setActionError(null);
    try {
      const answersPayload = activeQuiz.questions.map((q) => {
        const chosen = selectedByQuestionId[q.id] ?? q.options[0];
        return {
          question_id: q.id,
          option_id: chosen?.id,
          option_key: chosen?.option_key,
        };
      });

      const res = await submitQuizAttempt(activeQuiz.id, {
        idempotency_key: `quiz-${activeQuiz.id}-attempt-${activeQuiz.attempts_used + 1}`,
        answers: answersPayload,
      });
      setAttemptResult(res.data.attempt);
      if (res.data.attempt.passed) {
        onQuizPassed?.(res.data.attempt);
      }
    } catch (err) {
      setActionError(extractApiErrorMessage(err, 'Could not submit your quiz attempt.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRetryFullQuiz = () => {
    if (attemptResult) {
      setQuiz((prev) =>
        prev
          ? {
              ...prev,
              attempts_used: attemptResult.attempts_used,
              remaining_attempts: attemptResult.remaining_attempts,
            }
          : prev,
      );
    }
    setAttemptResult(null);
    setCheckedResult(null);
    setActionError(null);
    setSelectedByQuestionId({});
    setQuestionIndex(0);
  };

  return (
    <View testID="quiz-screen" style={[styles.root, { backgroundColor: tokens.colors.bg }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Top Bar */}
        <View style={styles.topRow}>
          <Pressable
            testID="quiz-close-btn"
            accessibilityRole="button"
            accessibilityLabel="Close quiz"
            onPress={onBack}
            style={styles.closeBtn}
          >
            <Text style={[styles.closeBtnText, { fontFamily: tokens.fonts.black }]}>✕</Text>
          </Pressable>
          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${progressPct}%`,
                  backgroundColor: tokens.colors.kidPurple,
                },
              ]}
            />
          </View>
          <View style={styles.attemptsPill} testID="quiz-attempts-pill">
            <Text style={[styles.attemptsPillText, { fontFamily: tokens.fonts.extrabold }]}>
              {attemptResult ? attemptResult.remaining_attempts : activeQuiz.remaining_attempts}{' '}
              left
            </Text>
          </View>
        </View>

        <TpErrorBanner message={actionError} testID="quiz-error-banner" />

        {attemptResult ? (
          <TpCard style={styles.attemptSummaryCard} testID="quiz-attempt-summary">
            <Fx03CorrectWrong
              variant={attemptResult.passed ? 'correct' : 'wrong'}
              explanation={`You scored ${attemptResult.score_percent}% (${attemptResult.earned_points}/${attemptResult.total_points} points). Pass mark: ${attemptResult.pass_mark_percent}%.`}
            />
            {!attemptResult.passed && attemptResult.remaining_attempts > 0 ? (
              <TpButton
                testID="quiz-retry-attempt-btn"
                label="Try Again"
                variant="teal"
                onPress={handleRetryFullQuiz}
              />
            ) : null}
            {onBack ? (
              <TpButton
                testID="quiz-back-to-lesson-btn"
                label="Back to Lesson"
                variant="ghost"
                onPress={onBack}
              />
            ) : null}
          </TpCard>
        ) : (
          <>
            {/* Question Header */}
            <Text
              style={[
                styles.questionOverline,
                { color: tokens.colors.kidPurple, fontFamily: tokens.fonts.extrabold },
              ]}
            >
              QUESTION {currentQuestion.question_number} OF {activeQuiz.questions.length}
            </Text>
            <Text
              testID="quiz-question-prompt"
              style={[
                styles.questionPrompt,
                { color: tokens.colors.ink, fontFamily: tokens.fonts.black },
              ]}
            >
              {currentQuestion.prompt}
            </Text>

            {/* Code Block */}
            {currentQuestion.code_snippet ? (
              <View style={styles.codeBlock} testID="quiz-code-snippet">
                <Text style={styles.codeText}>{currentQuestion.code_snippet}</Text>
              </View>
            ) : null}

            {/* Options */}
            <View style={styles.optionsList}>
              {currentQuestion.options.map((opt) => {
                const isSelected = selectedOption?.id === opt.id;
                return (
                  <Pressable
                    key={opt.id}
                    testID={`quiz-option-${opt.option_key}`}
                    accessibilityRole="radio"
                    accessibilityState={{ checked: isSelected }}
                    accessibilityLabel={`Option ${opt.option_key}: ${opt.label}`}
                    onPress={() => handleSelectOption(opt)}
                    style={[
                      styles.optionCard,
                      {
                        backgroundColor: isSelected ? '#F5F0FF' : tokens.colors.surface,
                        borderColor: isSelected ? tokens.colors.kidPurple : '#E2E8F0',
                      },
                    ]}
                  >
                    <View
                      style={[
                        styles.optionLetterBadge,
                        {
                          backgroundColor: isSelected ? tokens.colors.kidPurple : '#F1F5F9',
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.optionLetterText,
                          {
                            color: isSelected ? '#FFFFFF' : '#475569',
                            fontFamily: tokens.fonts.black,
                          },
                        ]}
                      >
                        {opt.option_key}
                      </Text>
                    </View>
                    <Text
                      style={[
                        styles.optionLabel,
                        { color: tokens.colors.ink, fontFamily: tokens.fonts.extrabold },
                      ]}
                    >
                      {opt.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {/* FX03 Feedback Banner + Kid-Facing Explanation after Check */}
            {checkedResult ? (
              <View style={styles.checkedSection}>
                <Fx03CorrectWrong
                  variant={checkedResult.is_correct ? 'correct' : 'wrong'}
                  explanation={checkedResult.explanation}
                />
                {!checkedResult.is_correct ? (
                  <TpButton
                    testID="quiz-try-again-btn"
                    label="Try Again"
                    variant="ghost"
                    onPress={handleRetryQuestion}
                  />
                ) : null}
              </View>
            ) : null}

            {/* Captain Jetty Hint Box */}
            {currentQuestion.hint ? (
              <View style={styles.hintCard} testID="quiz-hint-box">
                <PipIdleSvg size={44} reducedMotion={reducedMotion} />
                <Text
                  style={[
                    styles.hintText,
                    { color: '#5B21B6', fontFamily: tokens.fonts.bold },
                  ]}
                >
                  Captain Jetty Hint: {currentQuestion.hint}
                </Text>
              </View>
            ) : null}

            {/* Primary Action Button */}
            {checkedResult?.is_correct ? (
              <TpButton
                testID="quiz-next-or-submit-btn"
                label={
                  clampedIndex + 1 < activeQuiz.questions.length
                    ? 'Next Question'
                    : 'Finish Quiz'
                }
                variant="teal"
                loading={isSubmitting}
                onPress={() => {
                  void handleNextOrSubmit();
                }}
              />
            ) : (
              <TpButton
                testID="quiz-check-answer-btn"
                label="Check Answer"
                variant="teal"
                disabled={!selectedOption}
                loading={isChecking}
                onPress={() => {
                  void handleCheckAnswer();
                }}
              />
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 28,
    gap: 14,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  closeBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: {
    fontSize: 16,
    color: '#0F172A',
  },
  progressTrack: {
    flex: 1,
    height: 12,
    borderRadius: 999,
    backgroundColor: '#E2E8F0',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 999,
  },
  attemptsPill: {
    backgroundColor: '#FFFFFF',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  attemptsPillText: {
    fontSize: 12,
    color: '#0F172A',
  },
  questionOverline: {
    fontSize: 11,
    letterSpacing: 0.6,
    marginTop: 4,
  },
  questionPrompt: {
    fontSize: 22,
    lineHeight: 28,
  },
  codeBlock: {
    backgroundColor: '#0F172A',
    borderRadius: 18,
    padding: 16,
  },
  codeText: {
    color: '#F8FAFC',
    fontFamily: 'monospace',
    fontSize: 15,
    lineHeight: 24,
  },
  optionsList: {
    gap: 10,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 16,
    borderRadius: 18,
    borderWidth: 2.5,
  },
  optionLetterBadge: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionLetterText: {
    fontSize: 15,
  },
  optionLabel: {
    flex: 1,
    fontSize: 16,
  },
  checkedSection: {
    gap: 10,
  },
  hintCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#F5F0FF',
    borderColor: '#DDD6FE',
    borderWidth: 1.5,
    borderRadius: 16,
    padding: 12,
  },
  hintText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
  attemptSummaryCard: {
    gap: 12,
  },
});
