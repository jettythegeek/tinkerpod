import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { TpIcon, TpIconName } from '../../../components/TpIcon';
import { useTheme } from '../../../theme';

export type KidNavTab = 'home' | 'learn' | 'build' | 'rewards' | 'me';

export interface KidBottomNavProps {
  readonly activeTab: KidNavTab | Capitalize<KidNavTab>;
  readonly onSelectTab?: (tab: KidNavTab) => void;
  readonly onNavigateHome?: () => void;
  readonly onNavigateLearn?: () => void;
  readonly onNavigateBuild?: () => void;
  readonly onNavigateRewards?: () => void;
  readonly onNavigateMe?: () => void;
}

const NAV_ITEMS: Array<{ key: KidNavTab; label: string; icon: TpIconName }> = [
  { key: 'home', label: 'Home', icon: 'house' },
  { key: 'learn', label: 'Learn', icon: 'book-open' },
  { key: 'build', label: 'Build', icon: 'hammer' },
  { key: 'rewards', label: 'Rewards', icon: 'trophy' },
  { key: 'me', label: 'Me', icon: 'smile' },
];

export function KidBottomNav({
  activeTab,
  onSelectTab,
  onNavigateHome,
  onNavigateLearn,
  onNavigateBuild,
  onNavigateRewards,
  onNavigateMe,
}: KidBottomNavProps): React.JSX.Element {
  const { tokens } = useTheme();
  const normalizedActive = activeTab.toLowerCase() as KidNavTab;

  const handlePress = (tab: KidNavTab): void => {
    onSelectTab?.(tab);
    switch (tab) {
      case 'home':
        onNavigateHome?.();
        break;
      case 'learn':
        onNavigateLearn?.();
        break;
      case 'build':
        onNavigateBuild?.();
        break;
      case 'rewards':
        onNavigateRewards?.();
        break;
      case 'me':
        onNavigateMe?.();
        break;
    }
  };

  return (
    <View testID="kid-bottom-nav" style={styles.container}>
      {NAV_ITEMS.map((item) => {
        const isActive = item.key === normalizedActive;
        return (
          <Pressable
            key={item.key}
            testID={`kid-bottom-nav-${item.key}`}
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}
            accessibilityLabel={item.label}
            onPress={() => handlePress(item.key)}
            style={
              isActive
                ? [styles.activePill, { backgroundColor: tokens.colors.kidPurple }]
                : styles.inactiveItem
            }
          >
            <TpIcon
              name={item.icon}
              size={20}
              color={isActive ? tokens.colors.surface : '#64748B'}
              strokeWidth={2.4}
            />
            <Text
              style={[
                isActive ? styles.activeLabel : styles.inactiveLabel,
                {
                  fontFamily: isActive ? tokens.fonts.extrabold : tokens.fonts.bold,
                },
              ]}
            >
              {item.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#EEF2FF',
    paddingHorizontal: 10,
    paddingTop: 10,
    paddingBottom: 14,
  },
  activePill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 9999,
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 6,
  },
  inactiveItem: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    gap: 3,
  },
  activeLabel: {
    fontSize: 12,
    color: '#FFFFFF',
  },
  inactiveLabel: {
    fontSize: 11,
    color: '#64748B',
  },
});
