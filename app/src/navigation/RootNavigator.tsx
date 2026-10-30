import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { BootPlaceholderScreen } from '../features/boot/BootPlaceholderScreen';
import { useTheme } from '../theme';

export type RootStackParamList = {
  readonly BootPlaceholder: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator(): React.JSX.Element {
  const { tokens } = useTheme();

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="BootPlaceholder"
        screenOptions={{
          headerStyle: {
            backgroundColor: tokens.colors.adminNavy,
          },
          headerTintColor: tokens.colors.surface,
          headerTitleStyle: {
            fontFamily: tokens.fonts.extrabold,
          },
        }}
      >
        <Stack.Screen
          name="BootPlaceholder"
          component={BootPlaceholderScreen}
          options={{ title: 'TinkerPod' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
