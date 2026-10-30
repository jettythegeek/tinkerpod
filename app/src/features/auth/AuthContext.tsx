import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import * as SecureStore from 'expo-secure-store';
import { KidProfileDto, ParentUserDto } from '../../api/authApi';
import {
  AUTH_SESSION_STORAGE_KEY,
  setApiAuthToken,
  setStoredAuthToken,
} from '../../api/client';
import { useTheme } from '../../theme';

export type AuthTreeRole = 'guest' | 'parent' | 'kid';

interface PersistedSession {
  readonly role: 'parent' | 'kid';
  readonly token: string;
  readonly parentUser?: ParentUserDto;
  readonly kidProfile?: KidProfileDto;
}

export interface AuthContextValue {
  readonly role: AuthTreeRole;
  readonly isHydrating: boolean;
  readonly token: string | null;
  readonly parentUser: ParentUserDto | null;
  readonly kidProfile: KidProfileDto | null;
  readonly signInParent: (token: string, user: ParentUserDto) => Promise<void>;
  readonly signInKid: (token: string, child: KidProfileDto) => Promise<void>;
  readonly signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export interface AuthProviderProps {
  readonly children: React.ReactNode;
  readonly skipHydration?: boolean;
}

export function AuthProvider({
  children,
  skipHydration = false,
}: AuthProviderProps): React.JSX.Element {
  const { setMode } = useTheme();
  const [role, setRole] = useState<AuthTreeRole>('guest');
  const [isHydrating, setIsHydrating] = useState<boolean>(!skipHydration);
  const [token, setToken] = useState<string | null>(null);
  const [parentUser, setParentUser] = useState<ParentUserDto | null>(null);
  const [kidProfile, setKidProfile] = useState<KidProfileDto | null>(null);

  useEffect(() => {
    if (skipHydration) {
      return;
    }

    let active = true;

    async function hydrate(): Promise<void> {
      try {
        const raw = await SecureStore.getItemAsync(AUTH_SESSION_STORAGE_KEY);
        if (!raw || !active) {
          return;
        }
        const parsed = JSON.parse(raw) as PersistedSession;
        if (parsed.role === 'parent' && parsed.token && parsed.parentUser) {
          setApiAuthToken(parsed.token);
          setToken(parsed.token);
          setParentUser(parsed.parentUser);
          setKidProfile(null);
          setRole('parent');
        } else if (parsed.role === 'kid' && parsed.token && parsed.kidProfile) {
          setApiAuthToken(parsed.token);
          setToken(parsed.token);
          setKidProfile(parsed.kidProfile);
          setParentUser(null);
          setMode(parsed.kidProfile.theme_flag);
          setRole('kid');
        }
      } catch {
        // Ignore corrupt or unavailable SecureStore in test/dev environments
      } finally {
        if (active) {
          setIsHydrating(false);
        }
      }
    }

    void hydrate();

    return () => {
      active = false;
    };
  }, [setMode, skipHydration]);

  const signInParent = useCallback(async (nextToken: string, user: ParentUserDto) => {
    setApiAuthToken(nextToken);
    setToken(nextToken);
    setParentUser(user);
    setKidProfile(null);
    setRole('parent');
    await setStoredAuthToken(nextToken);
    try {
      const session: PersistedSession = {
        role: 'parent',
        token: nextToken,
        parentUser: user,
      };
      await SecureStore.setItemAsync(AUTH_SESSION_STORAGE_KEY, JSON.stringify(session));
    } catch {
      // Ignore storage error
    }
  }, []);

  const signInKid = useCallback(
    async (nextToken: string, child: KidProfileDto) => {
      setApiAuthToken(nextToken);
      setToken(nextToken);
      setKidProfile(child);
      setParentUser(null);
      setMode(child.theme_flag);
      setRole('kid');
      await setStoredAuthToken(nextToken);
      try {
        const session: PersistedSession = {
          role: 'kid',
          token: nextToken,
          kidProfile: child,
        };
        await SecureStore.setItemAsync(AUTH_SESSION_STORAGE_KEY, JSON.stringify(session));
      } catch {
        // Ignore storage error
      }
    },
    [setMode],
  );

  const signOut = useCallback(async () => {
    setApiAuthToken(null);
    setToken(null);
    setParentUser(null);
    setKidProfile(null);
    setRole('guest');
    await setStoredAuthToken(null);
    try {
      await SecureStore.deleteItemAsync(AUTH_SESSION_STORAGE_KEY);
    } catch {
      // Ignore storage error
    }
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      role,
      isHydrating,
      token,
      parentUser,
      kidProfile,
      signInParent,
      signInKid,
      signOut,
    }),
    [role, isHydrating, token, parentUser, kidProfile, signInParent, signInKid, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
