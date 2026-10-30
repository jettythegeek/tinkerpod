import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { KidPickerProfileDto } from '../api/authApi';
import { useAuth } from '../features/auth/AuthContext';
import { ForgotPasswordScreen } from '../features/auth/screens/ForgotPasswordScreen';
import { KidLoginScreen } from '../features/auth/screens/KidLoginScreen';
import { ParentLoginScreen } from '../features/auth/screens/ParentLoginScreen';
import { ParentRegisterScreen } from '../features/auth/screens/ParentRegisterScreen';
import { PinPadScreen } from '../features/auth/screens/PinPadScreen';
import { ProfilePickerScreen } from '../features/auth/screens/ProfilePickerScreen';
import { WelcomeScreen } from '../features/auth/screens/WelcomeScreen';
import { KidHomeScreen } from '../features/kid/KidHomeScreen';
import { ParentHomeScreen } from '../features/parent/ParentHomeScreen';
import { useTheme } from '../theme';

export type AuthStackParamList = {
  readonly Welcome: undefined;
  readonly ParentLogin: undefined;
  readonly ParentRegister: undefined;
  readonly ForgotPassword: undefined;
  readonly KidLogin: undefined;
  readonly ProfilePicker: { readonly profiles: KidPickerProfileDto[] };
  readonly PinPad: { readonly profile: KidPickerProfileDto };
};

export type ParentStackParamList = {
  readonly ParentHome: undefined;
};

export type KidStackParamList = {
  readonly KidHome: undefined;
};

export type RootStackParamList = AuthStackParamList &
  ParentStackParamList &
  KidStackParamList;

const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const ParentStack = createNativeStackNavigator<ParentStackParamList>();
const KidStack = createNativeStackNavigator<KidStackParamList>();

export function RootNavigator(): React.JSX.Element {
  const { tokens } = useTheme();
  const { role } = useAuth();

  const sharedHeaderOptions = {
    headerStyle: {
      backgroundColor: tokens.colors.adminNavy,
    },
    headerTintColor: tokens.colors.surface,
    headerTitleStyle: {
      fontFamily: tokens.fonts.extrabold,
    },
  };

  return (
    <NavigationContainer>
      {role === 'parent' ? (
        <ParentStack.Navigator
          initialRouteName="ParentHome"
          screenOptions={sharedHeaderOptions}
        >
          <ParentStack.Screen
            name="ParentHome"
            component={ParentHomeScreen}
            options={{ title: 'Parent Dashboard' }}
          />
        </ParentStack.Navigator>
      ) : role === 'kid' ? (
        <KidStack.Navigator
          initialRouteName="KidHome"
          screenOptions={sharedHeaderOptions}
        >
          <KidStack.Screen
            name="KidHome"
            component={KidHomeScreen}
            options={{ title: 'TinkerPod Studio' }}
          />
        </KidStack.Navigator>
      ) : (
        <AuthStack.Navigator
          initialRouteName="Welcome"
          screenOptions={sharedHeaderOptions}
        >
          <AuthStack.Screen name="Welcome" options={{ title: 'TinkerPod' }}>
            {({ navigation }) => (
              <WelcomeScreen
                onNavigateKidLogin={() => navigation.navigate('KidLogin')}
                onNavigateParentLogin={() => navigation.navigate('ParentLogin')}
                onNavigateParentRegister={() => navigation.navigate('ParentRegister')}
              />
            )}
          </AuthStack.Screen>

          <AuthStack.Screen name="ParentLogin" options={{ title: 'Parent Sign In' }}>
            {({ navigation }) => (
              <ParentLoginScreen
                onNavigateRegister={() => navigation.navigate('ParentRegister')}
                onNavigateForgotPassword={() => navigation.navigate('ForgotPassword')}
              />
            )}
          </AuthStack.Screen>

          <AuthStack.Screen
            name="ParentRegister"
            options={{ title: 'Create Parent Account' }}
          >
            {({ navigation }) => (
              <ParentRegisterScreen
                onNavigateLogin={() => navigation.navigate('ParentLogin')}
              />
            )}
          </AuthStack.Screen>

          <AuthStack.Screen
            name="ForgotPassword"
            options={{ title: 'Reset Password' }}
          >
            {({ navigation }) => (
              <ForgotPasswordScreen
                onNavigateBackToLogin={() => navigation.navigate('ParentLogin')}
              />
            )}
          </AuthStack.Screen>

          <AuthStack.Screen name="KidLogin" options={{ title: 'Kid Sign In' }}>
            {({ navigation }) => (
              <KidLoginScreen
                onSingleProfileResolved={(profile) =>
                  navigation.navigate('PinPad', { profile })
                }
                onPickerResolved={(profiles) =>
                  navigation.navigate('ProfilePicker', { profiles })
                }
                onNavigateBack={() => navigation.goBack()}
              />
            )}
          </AuthStack.Screen>

          <AuthStack.Screen
            name="ProfilePicker"
            options={{ title: 'Choose Your Profile' }}
          >
            {({ navigation, route }) => (
              <ProfilePickerScreen
                profiles={route.params.profiles}
                onSelectProfile={(profile) =>
                  navigation.navigate('PinPad', { profile })
                }
                onBack={() => navigation.goBack()}
              />
            )}
          </AuthStack.Screen>

          <AuthStack.Screen name="PinPad" options={{ title: 'Enter PIN' }}>
            {({ navigation, route }) => (
              <PinPadScreen
                profile={route.params.profile}
                onBack={() => navigation.goBack()}
              />
            )}
          </AuthStack.Screen>
        </AuthStack.Navigator>
      )}
    </NavigationContainer>
  );
}
