import React, { useCallback, useEffect, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

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
  RewardResultDto,
  startQuizAttempt,
  submitQuizAttempt,
} from '../../api/learningApi';
import { APPROVED_MASCOT_THINKING_ASSET } from '../../assets/approvedAssets';
import { TpButton, TpCard, TpErrorBanner } from '../../components/DesignSystem';
import { TpIcon } from '../../components/TpIcon';
import { Fx03CorrectWrong } from '../../fx/Fx03CorrectWrong';
import { RewardCelebrationModal } from '../../fx/RewardCelebrationModal';
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
  open_attempt_id: '01J000000000000000ATTEMPT1',
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
  const { tokens } = useTheme();
  const { token } = useAuth();

  const shouldFetch =
    autoFetch ?? Boolean(token && initialQuiz === undefined && !screenState && (quizId || lessonId));

  const [quiz, setQuiz] = useState<QuizDetailDto | null>(
    initialQuiz !== undefined ? initialQuiz : DEFAULT_DEMO_QUIZ,
  );
  const [openAttemptId, setOpenAttemptId] = useState<string | null>(
    initialQuiz?.open_attempt_id ?? DEFAULT_DEMO_QUIZ.open_attempt_id ?? null,
  );
  const [status, setStatus] = useState<'idle' | 'loading' | 'empty' | 'error' | 'offline'>(
    screenState ?? (shouldFetch ? 'loading' : 'idle'),
  );
  const [errorText, setErrorText] = useState<string | undefined>(errorMessage);

  const [questionIndex, setQuestionIndex] = useState<number>(initialQuestionIndex);
  const [selectedByQuestionId, setSelectedByQuestionId] = useState<Record<string, QuizOptionDto>>(
    () => {
      const q2 = DEFAULT_DEMO_QUIZ.questions[1];
      const optA = q2?.options[0];
      return q2 && optA && initialQuiz === undefined ? { [q2.id]: optA } : {};
    },
  );
  const [showHint, setShowHint] = useState<boolean>(true);
  const [checkedResult, setCheckedResult] = useState<CheckQuizAnswerData | null>(null);
  const [attemptResult, setAttemptResult] = useState<QuizAttemptResultDto | null>(null);
  const [rewardResult, setRewardResult] = useState<RewardResultDto | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [isChecking, setIsChecking] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const ensureAttemptStarted = useCallback(
    async (targetQuiz: QuizDetailDto): Promise<string | null> => {
      if (targetQuiz.open_attempt_id) {
        setOpenAttemptId(targetQuiz.open_attempt_id);
        return targetQuiz.open_attempt_id;
      }
      try {
        const started = await startQuizAttempt(
          targetQuiz.id,
          `quiz-${targetQuiz.id}-start-${targetQuiz.attempts_used + 1}`,
        );
        const startedId = started.data.attempt.id;
        setOpenAttemptId(startedId);
        setQuiz((prev) =>
          prev
            ? {
                ...prev,
                attempts_used: started.data.attempt.attempts_used,
                remaining_attempts: started.data.attempt.remaining_attempts,
                open_attempt_id: startedId,
              }
            : prev,
        );
        return startedId;
      } catch {
        return null;
      }
    },
    [],
  );

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
        setOpenAttemptId(res.data.quiz.open_attempt_id ?? null);
        setQuestionIndex(0);
        setStatus('idle');
        if (!res.data.quiz.open_attempt_id && res.data.quiz.remaining_attempts > 0) {
          void ensureAttemptStarted(res.data.quiz);
        }
      }
    } catch (err) {
      setErrorText(extractApiErrorMessage(err, 'Could not load this quiz.'));
      setStatus(isOfflineError(err) ? 'offline' : 'error');
    }
  }, [ensureAttemptStarted, lessonId, quizId]);

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
      let attemptIdToUse = openAttemptId;
      if (!attemptIdToUse && token) {
        attemptIdToUse = await ensureAttemptStarted(activeQuiz);
      }

      const payload = attemptIdToUse
        ? {
            attempt_id: attemptIdToUse,
            question_id: currentQuestion.id,
            option_id: selectedOption.id,
            option_key: selectedOption.option_key,
          }
        : {
            question_id: currentQuestion.id,
            option_id: selectedOption.id,
            option_key: selectedOption.option_key,
          };

      const response = await checkQuizAnswer(activeQuiz.id, payload);
      if (response.data.attempt_id) {
        setOpenAttemptId(response.data.attempt_id);
      }
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
      const res = await submitQuizAttempt(activeQuiz.id, {
        action: 'finish',
        attempt_id: openAttemptId ?? undefined,
        idempotency_key: `quiz-${activeQuiz.id}-finish-${activeQuiz.attempts_used || 1}`,
      });
      setAttemptResult(res.data.attempt);
      if (res.data.reward_result) {
        setRewardResult(res.data.reward_result);
      }
      if (res.data.attempt.passed) {
        onQuizPassed?.(res.data.attempt);
      }
    } catch (err) {
      setActionError(extractApiErrorMessage(err, 'Could not submit your quiz attempt.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRetryFullQuiz = async () => {
    if (attemptResult) {
      setQuiz((prev) =>
        prev
          ? {
              ...prev,
              attempts_used: attemptResult.attempts_used,
              remaining_attempts: attemptResult.remaining_attempts,
              open_attempt_id: null,
            }
          : prev,
      );
    }
    setOpenAttemptId(null);
    setAttemptResult(null);
    setCheckedResult(null);
    setActionError(null);
    setSelectedByQuestionId({});
    setQuestionIndex(0);
    if (quiz) {
      await ensureAttemptStarted({ ...quiz, open_attempt_id: null });
    }
  };

  return (
    <View testID="quiz-screen" style={styles.root}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Top Bar matching 04-quiz.png */}
        <View style={styles.topRow}>
          <Pressable
            testID="quiz-close-btn"
            accessibilityRole="button"
            accessibilityLabel="Close quiz"
            onPress={onBack}
            style={styles.closeBtn}
          >
            <TpIcon name="x" size={18} color="#0F172A" />
          </Pressable>
          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${progressPct}%`,
                },
              ]}
            />
          </View>
          <View style={styles.attemptsPill} testID="quiz-attempts-pill">
            <TpIcon name="heart" size={13} color="#EF4444" fill="#EF4444" />
            <Text style={[styles.attemptsPillText, { fontFamily: tokens.fonts.extrabold }]}>
              {attemptResult ? attemptResult.remaining_attempts : activeQuiz.remaining_attempts}
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
            {rewardResult ? (
              <RewardCelebrationModal
                rewardResult={rewardResult}
                onDismiss={() => setRewardResult(null)}
              />
            ) : null}
            {!attemptResult.passed && attemptResult.remaining_attempts > 0 ? (
              <TpButton
                testID="quiz-retry-attempt-btn"
                label="Try Again"
                variant="teal"
                onPress={() => {
                  void handleRetryFullQuiz();
                }}
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
            <Text style={[styles.questionOverline, { fontFamily: tokens.fonts.extrabold }]}>
              QUESTION {currentQuestion.question_number} OF {activeQuiz.questions.length}
            </Text>
            <Text
              testID="quiz-question-prompt"
              style={[styles.questionPrompt, { fontFamily: tokens.fonts.black }]}
            >
              {currentQuestion.prompt}
            </Text>

            {/* Dark Code Window with Traffic Light Dots */}
            {currentQuestion.code_snippet ? (
              <View style={styles.codeBlock} testID="quiz-code-snippet">
                <View style={styles.codeDotsRow}>
                  <View style={[styles.codeDot, { backgroundColor: '#EF4444' }]} />
                  <View style={[styles.codeDot, { backgroundColor: '#F59E0B' }]} />
                  <View style={[styles.codeDot, { backgroundColor: '#10B981' }]} />
                </View>
                <Text style={styles.codeText}>{currentQuestion.code_snippet}</Text>
              </View>
            ) : null}

            {/* 2x2 Options Grid matching 04-quiz.png */}
            <View testID="quiz-options-grid" style={styles.optionsGrid}>
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
                        backgroundColor: isSelected ? '#EDE9FE' : '#FFFFFF',
                        borderColor: isSelected ? '#6B2FD6' : '#E2E8F0',
                      },
                    ]}
                  >
                    <View
                      style={[
                        styles.optionLetterBadge,
                        {
                          backgroundColor: isSelected ? '#6B2FD6' : '#F1F5F9',
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.optionLetterText,
                          {
                            color: isSelected ? '#FFFFFF' : '#64748B',
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
                        { fontFamily: tokens.fonts.black },
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

            {/* Captain Jetty Hint Bubble with mascot-thinking.png */}
            {currentQuestion.hint && showHint ? (
              <View style={styles.hintCard} testID="quiz-hint-box">
                <Image
                  testID="quiz-mascot-thinking"
                  source={APPROVED_MASCOT_THINKING_ASSET}
                  accessibilityLabel="Captain Jetty thinking"
                  style={styles.mascotThinkingImage}
                  resizeMode="contain"
                />
                <View style={styles.hintBubble}>
                  <Text style={[styles.hintTitle, { fontFamily: tokens.fonts.black }]}>
                    Need a hint?
                  </Text>
                  <Text style={[styles.hintText, { fontFamily: tokens.fonts.bold }]}>
                    {currentQuestion.hint}
                  </Text>
                </View>
              </View>
            ) : null}

            {/* Bottom Action Bar: Lightbulb Hint Button + Check Answer / Next Button */}
            <View style={styles.bottomActionsRow}>
              <Pressable
                testID="quiz-hint-btn"
                accessibilityRole="button"
                accessibilityLabel="Toggle hint"
                onPress={() => setShowHint((prev) => !prev)}
                style={styles.hintToggleButton}
              >
                <TpIcon name="lightbulb" size={16} color="#6B2FD6" />
                <Text style={[styles.hintToggleText, { fontFamily: tokens.fonts.extrabold }]}>
                  Hint
                </Text>
              </Pressable>

              {checkedResult?.is_correct ? (
                <Pressable
                  testID="quiz-next-or-submit-btn"
                  accessibilityRole="button"
                  disabled={isSubmitting}
                  onPress={() => {
                    void handleNextOrSubmit();
                  }}
                  style={styles.checkAnswerCta}
                >
                  <Text style={[styles.checkAnswerCtaText, { fontFamily: tokens.fonts.black }]}>
                    {clampedIndex + 1 < activeQuiz.questions.length
                      ? 'Next Question'
                      : 'Finish Quiz'}
                  </Text>
                </Pressable>
              ) : (
                <Pressable
                  testID="quiz-check-answer-btn"
                  accessibilityRole="button"
                  disabled={!selectedOption || isChecking}
                  onPress={() => {
                    void handleCheckAnswer();
                  }}
                  style={[
                    styles.checkAnswerCta,
                    !selectedOption ? styles.checkAnswerCtaDisabled : null,
                  ]}
                >
                  <Text style={[styles.checkAnswerCtaText, { fontFamily: tokens.fonts.black }]}>
                    Check answer
                  </Text>
                </Pressable>
              )}
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#FAF8FF',
  },
  scrollContent: {
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 28,
    gap: 12,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressTrack: {
    flex: 1,
    height: 12,
    borderRadius: 999,
    backgroundColor: '#EDE9FE',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: '#6B2FD6',
  },
  attemptsPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FEE2E2',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  attemptsPillText: {
    fontSize: 12,
    color: '#991B1B',
  },
  questionOverline: {
    fontSize: 11,
    color: '#6B2FD6',
    letterSpacing: 0.6,
    marginTop: 2,
  },
  questionPrompt: {
    fontSize: 20,
    lineHeight: 26,
    color: '#0F172A',
  },
  codeBlock: {
    backgroundColor: '#1E1B4B',
    borderRadius: 18,
    padding: 16,
  },
  codeDotsRow: {
    flexDirection: 'row',
    gap: 5,
    marginBottom: 10,
  },
  codeDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
  },
  codeText: {
    color: '#E2E8F0',
    fontFamily: 'monospace',
    fontSize: 14,
    lineHeight: 22,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 10,
  },
  optionCard: {
    width: '48.5%',
    borderRadius: 18,
    padding: 14,
    borderWidth: 2.5,
    gap: 8,
  },
  optionLetterBadge: {
    width: 24,
    height: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionLetterText: {
    fontSize: 12,
  },
  optionLabel: {
    fontSize: 17,
    color: '#0F172A',
  },
  checkedSection: {
    gap: 10,
  },
  hintCard: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    marginTop: 4,
  },
  mascotThinkingImage: {
    width: 68,
    height: 68,
  },
  hintBubble: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderBottomLeftRadius: 4,
    padding: 12,
    borderWidth: 1.5,
    borderColor: '#EDE9FE',
  },
  hintTitle: {
    fontSize: 11,
    color: '#6B2FD6',
  },
  hintText: {
    fontSize: 12,
    lineHeight: 17,
    color: '#0F172A',
    marginTop: 2,
  },
  bottomActionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  hintToggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#EDE9FE',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 16,
  },
  hintToggleText: {
    fontSize: 14,
    color: '#6B2FD6',
  },
  checkAnswerCta: {
    flex: 1,
    backgroundColor: '#FFB700',
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkAnswerCtaDisabled: {
    opacity: 0.55,
  },
  checkAnswerCtaText: {
    fontSize: 16,
    color: '#0F172A',
  },
  attemptSummaryCard: {
    gap: 12,
  },
});
