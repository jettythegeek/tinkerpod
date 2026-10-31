import React, { useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import {
  APPROVED_EMPTY_NO_PACKS_PNG,
  APPROVED_LESSON_LOOPS_ASSET,
  APPROVED_MASCOT_THINKING_ASSET,
} from '../../assets/approvedAssets';
import { TpIcon } from '../../components/TpIcon';
import { useTheme } from '../../theme';
import { KidBottomNav, KidNavTab } from './components/KidBottomNav';

export interface BuildProjectItem {
  readonly id: string;
  readonly title: string;
  readonly unitLabel: string;
  readonly status: 'reviewed' | 'waiting' | 'draft';
  readonly stars?: number;
  readonly mentorQuote?: string;
}

export interface BuildScreenProps {
  readonly initialProjects?: readonly BuildProjectItem[];
  readonly onGoToLearn?: () => void;
  readonly onSelectTab?: (tab: KidNavTab) => void;
}

export const SAMPLE_PORTFOLIO_PROJECTS: readonly BuildProjectItem[] = [
  {
    id: 'build-1',
    title: 'Space Dodger Game',
    unitLabel: 'Unit 2 Assignment · Coding',
    status: 'reviewed',
    stars: 3,
    mentorQuote: 'Clean loop logic, Amara!',
  },
  {
    id: 'build-2',
    title: 'Jollof Timer App',
    unitLabel: 'Unit 3 Assignment · Coding',
    status: 'waiting',
  },
  {
    id: 'build-3',
    title: 'Ankara Pattern Gen',
    unitLabel: 'Unit 1 Assignment · Design',
    status: 'reviewed',
    stars: 3,
  },
  {
    id: 'build-4',
    title: 'Quiz Bot v1',
    unitLabel: 'Sandbox · Python',
    status: 'draft',
  },
];

export function BuildScreen({
  initialProjects = [],
  onGoToLearn,
  onSelectTab,
}: BuildScreenProps = {}): React.JSX.Element {
  const { tokens } = useTheme();
  const [filter, setFilter] = useState<'all' | 'reviewed' | 'waiting' | 'draft'>('all');

  const filteredProjects =
    filter === 'all'
      ? initialProjects
      : initialProjects.filter((p) => p.status === filter);

  const isEmpty = initialProjects.length === 0;

  return (
    <View testID="build-screen" style={styles.root}>
      {/* Purple Header (46-build-portfolio.png & 47-build-empty.png) */}
      <View style={styles.header}>
        <View style={styles.headerTopRow}>
          <View>
            <Text style={[styles.headerEyebrow, { fontFamily: tokens.fonts.extrabold }]}>
              ASSIGNMENTS &amp; PROJECTS
            </Text>
            <Text style={[styles.headerTitle, { fontFamily: tokens.fonts.black }]}>
              My Build
            </Text>
          </View>
          <View style={styles.countChip}>
            <TpIcon name="hammer" size={14} color="#FDE68A" />
            <Text style={[styles.countChipText, { fontFamily: tokens.fonts.extrabold }]}>
              {initialProjects.length} builds
            </Text>
          </View>
        </View>

        <View style={styles.filterPillsRow}>
          {(
            [
              { key: 'all', label: `All · ${initialProjects.length}` },
              { key: 'reviewed', label: 'Reviewed' },
              { key: 'waiting', label: 'Waiting' },
              { key: 'draft', label: 'Drafts' },
            ] as const
          ).map((tab) => {
            const isActive = filter === tab.key;
            return (
              <Pressable
                key={tab.key}
                testID={`build-filter-${tab.key}`}
                accessibilityRole="tab"
                accessibilityState={{ selected: isActive }}
                onPress={() => setFilter(tab.key)}
                style={isActive ? styles.filterPillActive : styles.filterPillInactive}
              >
                <Text
                  style={[
                    isActive ? styles.filterPillActiveText : styles.filterPillInactiveText,
                    { fontFamily: tokens.fonts.extrabold },
                  ]}
                >
                  {tab.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {isEmpty ? (
        /* Screen 47: Build Empty State */
        <ScrollView
          testID="build-empty-view"
          contentContainerStyle={styles.emptyScroll}
        >
          <View style={styles.emptyCard}>
            <Image
              testID="build-empty-illustration"
              source={APPROVED_EMPTY_NO_PACKS_PNG}
              accessibilityLabel="No builds yet"
              style={styles.emptyIllustration}
              resizeMode="contain"
            />
            <Text style={[styles.emptyTitle, { fontFamily: tokens.fonts.black }]}>
              Nothing built yet
            </Text>
            <Text style={[styles.emptySub, { fontFamily: tokens.fonts.bold }]}>
              Finish Unit 1 in Learn to unlock your first mentor-reviewed Assignment — it will
              live right here.
            </Text>
            <Pressable
              testID="build-go-to-learn-btn"
              accessibilityRole="button"
              onPress={() => {
                if (onGoToLearn) {
                  onGoToLearn();
                } else {
                  onSelectTab?.('learn');
                }
              }}
              style={styles.goToLearnBtn}
            >
              <TpIcon name="book-open" size={16} color="#FFFFFF" />
              <Text style={[styles.goToLearnBtnText, { fontFamily: tokens.fonts.black }]}>
                Go to Learn
              </Text>
            </Pressable>
          </View>

          <Text style={[styles.sectionEyebrow, { fontFamily: tokens.fonts.extrabold }]}>
            WHAT YOU&apos;LL BUILD
          </Text>

          <View testID="build-locked-preview-card" style={styles.lockedPreviewCard}>
            <View style={styles.lockedPreviewTop}>
              <View style={styles.lockedIconBox}>
                <TpIcon name="lock" size={20} color="#64748B" />
              </View>
              <View style={styles.lockedTextCol}>
                <Text style={[styles.lockedPreviewTitle, { fontFamily: tokens.fonts.black }]}>
                  First up: Jollof Timer App
                </Text>
                <Text style={[styles.lockedPreviewSub, { fontFamily: tokens.fonts.bold }]}>
                  Unit 1 Assignment · Coding Pod · Mentor-reviewed
                </Text>
              </View>
            </View>
            <View style={styles.mentorNoteRow}>
              <Image
                source={APPROVED_MASCOT_THINKING_ASSET}
                accessibilityLabel="Captain Jetty"
                style={styles.mentorMascot}
                resizeMode="contain"
              />
              <Text style={[styles.mentorNoteText, { fontFamily: tokens.fonts.bold }]}>
                Captain Jetty &amp; a real mentor will leave you a voice note on your code!
              </Text>
            </View>
          </View>
        </ScrollView>
      ) : (
        /* Screen 46: Build Portfolio Grid */
        <ScrollView
          testID="build-portfolio-view"
          contentContainerStyle={styles.portfolioScroll}
        >
          <View style={styles.portfolioGrid}>
            {filteredProjects.map((project) => (
              <View
                key={project.id}
                testID={`build-card-${project.id}`}
                style={styles.projectCard}
              >
                <Image
                  source={APPROVED_LESSON_LOOPS_ASSET}
                  accessibilityLabel={project.title}
                  style={styles.projectCover}
                  resizeMode="cover"
                />
                <View style={styles.projectCardBody}>
                  <Text style={[styles.projectTitle, { fontFamily: tokens.fonts.black }]}>
                    {project.title}
                  </Text>
                  <Text style={[styles.projectUnitSub, { fontFamily: tokens.fonts.bold }]}>
                    {project.unitLabel}
                  </Text>
                  {project.mentorQuote ? (
                    <Text style={[styles.projectQuote, { fontFamily: tokens.fonts.bold }]}>
                      &ldquo;{project.mentorQuote}&rdquo;
                    </Text>
                  ) : null}
                </View>
              </View>
            ))}
          </View>
        </ScrollView>
      )}

      <KidBottomNav activeTab="build" onSelectTab={onSelectTab} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#FAF8FF',
  },
  header: {
    backgroundColor: '#6B2FD6',
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 16,
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerEyebrow: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.78)',
    letterSpacing: 0.6,
  },
  headerTitle: {
    fontSize: 20,
    color: '#FFFFFF',
  },
  countChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(255,255,255,0.18)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 9999,
  },
  countChipText: {
    fontSize: 11,
    color: '#FFFFFF',
  },
  filterPillsRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 10,
  },
  filterPillActive: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 9999,
  },
  filterPillInactive: {
    backgroundColor: 'rgba(255,255,255,0.16)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 9999,
  },
  filterPillActiveText: {
    fontSize: 11,
    color: '#6B2FD6',
  },
  filterPillInactiveText: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.9)',
  },
  emptyScroll: {
    padding: 16,
    gap: 10,
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EEF2FF',
  },
  emptyIllustration: {
    width: 140,
    height: 140,
  },
  emptyTitle: {
    fontSize: 17,
    color: '#0F172A',
    marginTop: 4,
  },
  emptySub: {
    fontSize: 12,
    lineHeight: 17,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 4,
  },
  goToLearnBtn: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#6B2FD6',
    paddingHorizontal: 20,
    paddingVertical: 11,
    borderRadius: 14,
  },
  goToLearnBtnText: {
    fontSize: 13,
    color: '#FFFFFF',
  },
  sectionEyebrow: {
    fontSize: 10,
    color: '#64748B',
    letterSpacing: 0.6,
    marginTop: 4,
  },
  lockedPreviewCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: '#CBD5E1',
  },
  lockedPreviewTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  lockedIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  lockedTextCol: {
    flex: 1,
  },
  lockedPreviewTitle: {
    fontSize: 13,
    color: '#0F172A',
  },
  lockedPreviewSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  mentorNoteRow: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FAF5FF',
    padding: 8,
    borderRadius: 10,
  },
  mentorMascot: {
    width: 34,
    height: 34,
  },
  mentorNoteText: {
    flex: 1,
    fontSize: 11,
    color: '#6B2FD6',
  },
  portfolioScroll: {
    padding: 16,
  },
  portfolioGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 10,
  },
  projectCard: {
    width: '48.5%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#EEF2FF',
  },
  projectCover: {
    width: '100%',
    height: 78,
  },
  projectCardBody: {
    padding: 10,
  },
  projectTitle: {
    fontSize: 13,
    color: '#0F172A',
  },
  projectUnitSub: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 1,
  },
  projectQuote: {
    fontSize: 10,
    color: '#5B21B6',
    marginTop: 6,
    backgroundColor: '#FAF5FF',
    padding: 5,
    borderRadius: 8,
  },
});
