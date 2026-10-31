import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../../theme';

export type KidNavTab = 'home' | 'learn' | 'build' | 'rewards' | 'me';

export interface KidBottomNavProps {
  readonly activeTab: KidNavTab;
  readonly onNavigateHome: () => void;
  readonly onNavigateLearn: () => void;
}

const NAV_ITEMS: readonly { readonly id: KidNavTab; readonly label: string }[] = [
  { id: 'home', label: 'Home' },
  { id: 'learn', label: 'Learn' },
  { id: 'build', label: 'Build' },
  { id: 'rewards', label: 'Rewards' },
  { id: 'me', label: 'Me' },
];

export function KidBottomNav({
  activeTab,
  onNavigateHome,
  onNavigateLearn,
}: KidBottomNavProps): React.JSX.Element {
  const { tokens } = useTheme();

  return (
    <View
      testID="kid-bottom-nav"
      style={[
        styles.bar,
        {
          backgroundColor: tokens.colors.surface,
          borderTopColor: '#E2E8F0',
        },
      ]}
    >
      {NAV_ITEMS.map((item) => {
        const isActive = item.id === activeTab;
        const onPress = () => {
          if (item.id === 'home') {
            onNavigateHome();
          } else if (item.id === 'learn') {
            onNavigateLearn();
          }
        };

        return (
          <Pressable
            key={item.id}
            testID={`kid-bottom-nav-${item.id}`}
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}
            accessibilityLabel={item.label}
            onPress={onPress}
            style={styles.tab}
          >
            <View
              style={[
                styles.dot,
                {
                  backgroundColor: isActive ? tokens.colors.buttonTeal : '#CBD5E1',
                },
              ]}
            />
            <Text
              style={[
                styles.label,
                {
                  color: isActive ? tokens.colors.buttonTeal : '#64748B',
                  fontFamily: tokens.fonts.extrabold,
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
  bar: {
    height: 64,
    borderTopWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 8,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  label: {
    fontSize: 11,
  },
});
