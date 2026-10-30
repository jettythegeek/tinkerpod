import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { KidPickerProfileDto } from '../../../api/authApi';
import { ApprovedAvatar, TpButton, TpCard } from '../../../components/DesignSystem';
import { useTheme } from '../../../theme';

export interface ProfilePickerScreenProps {
  readonly profiles: KidPickerProfileDto[];
  readonly onSelectProfile: (profile: KidPickerProfileDto) => void;
  readonly onBack: () => void;
}

export function ProfilePickerScreen({
  profiles,
  onSelectProfile,
  onBack,
}: ProfilePickerScreenProps): React.JSX.Element {
  const { tokens, ageBand } = useTheme();

  return (
    <ScrollView
      style={[styles.screen, { backgroundColor: tokens.colors.bg }]}
      contentContainerStyle={styles.content}
      testID="profile-picker-screen"
    >
      <TpCard style={styles.card}>
        <Text
          style={[
            styles.heading,
            { color: tokens.colors.ink, fontFamily: tokens.fonts.black },
          ]}
        >
          Pick Your Profile
        </Text>
        <Text
          style={[
            styles.caption,
            { color: tokens.colors.ink, fontFamily: tokens.fonts.semibold },
          ]}
        >
          Tap your picture to enter your secret PIN!
        </Text>

        <View style={styles.grid}>
          {profiles.map((profile) => (
            <Pressable
              key={profile.id}
              testID={`picker-profile-${profile.id}`}
              accessibilityRole="button"
              accessibilityLabel={`Select ${profile.first_name}`}
              onPress={() => onSelectProfile(profile)}
              style={[
                styles.profileTile,
                {
                  borderRadius: ageBand.cardRadius,
                  borderColor: ageBand.primaryAccent,
                  backgroundColor: '#F8FAFC',
                },
              ]}
            >
              <ApprovedAvatar filename={profile.avatar} size={72} />
              <Text
                style={[
                  styles.profileName,
                  { color: tokens.colors.ink, fontFamily: tokens.fonts.extrabold },
                ]}
              >
                {profile.first_name}
              </Text>
            </Pressable>
          ))}
        </View>

        <TpButton
          testID="picker-back-btn"
          label="Try Another Name"
          variant="ghost"
          onPress={onBack}
        />
      </TpCard>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    alignItems: 'center',
  },
  card: {
    maxWidth: 420,
    alignItems: 'center',
  },
  heading: {
    fontSize: 24,
    textAlign: 'center',
  },
  caption: {
    fontSize: 15,
    textAlign: 'center',
  },
  grid: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'center',
    marginVertical: 8,
  },
  profileTile: {
    minWidth: 140,
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderWidth: 2,
    alignItems: 'center',
    gap: 10,
  },
  profileName: {
    fontSize: 17,
  },
});
