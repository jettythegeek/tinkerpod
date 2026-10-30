import React, { createContext, useContext, useMemo, useState } from 'react';
import {
  AgeBandThemeConfig,
  AgeBandThemeMode,
  ageBandThemes,
  DesignTokens,
  tokens,
} from './tokens';

export interface ThemeContextValue {
  readonly tokens: DesignTokens;
  readonly mode: AgeBandThemeMode;
  readonly ageBand: AgeBandThemeConfig;
  readonly reducedMotion: boolean;
  readonly reducedEffects: boolean;
  readonly muted: boolean;
  readonly setMode: (mode: AgeBandThemeMode) => void;
  readonly setReducedMotion: (enabled: boolean) => void;
  readonly setReducedEffects: (enabled: boolean) => void;
  readonly setMuted: (enabled: boolean) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export interface ThemeProviderProps {
  readonly initialMode?: AgeBandThemeMode;
  readonly initialReducedMotion?: boolean;
  readonly initialReducedEffects?: boolean;
  readonly initialMuted?: boolean;
  readonly children: React.ReactNode;
}

export function ThemeProvider({
  initialMode = 'junior',
  initialReducedMotion = false,
  initialReducedEffects = false,
  initialMuted = false,
  children,
}: ThemeProviderProps): React.JSX.Element {
  const [mode, setMode] = useState<AgeBandThemeMode>(initialMode);
  const [reducedMotion, setReducedMotion] = useState<boolean>(initialReducedMotion);
  const [reducedEffects, setReducedEffects] = useState<boolean>(initialReducedEffects);
  const [muted, setMuted] = useState<boolean>(initialMuted);

  const value = useMemo<ThemeContextValue>(
    () => ({
      tokens,
      mode,
      ageBand: ageBandThemes[mode],
      reducedMotion,
      reducedEffects,
      muted,
      setMode,
      setReducedMotion,
      setReducedEffects,
      setMuted,
    }),
    [mode, reducedMotion, reducedEffects, muted],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return ctx;
}

export * from './tokens';
