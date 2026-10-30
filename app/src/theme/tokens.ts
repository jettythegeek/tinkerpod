export type AgeBandThemeMode = 'junior' | 'senior';

export const colors = {
  /** Primary brand teal — used for fills and illustrations with dark text (#0F172A) only. */
  teal: '#00BFAE',
  /** Accessible button teal — used for interactive buttons with white (#FFFFFF) text. */
  buttonTeal: '#007A70',
  /** Primary ink / text colour. */
  ink: '#0F172A',
  /** Kid mode purple accent. */
  kidPurple: '#7C3AED',
  /** Accent palette. */
  accents: {
    amber: '#FFB700',
    coral: '#FF6B6B',
    blue: '#2563EB',
  },
  /** Flat aliases for accent colours. */
  accentAmber: '#FFB700',
  accentCoral: '#FF6B6B',
  accentBlue: '#2563EB',
  /** Success green. */
  success: '#63C132',
  /** App background. */
  bg: '#F8FAFC',
  /** Filament / Admin panel navy. */
  adminNavy: '#101B4D',
  /** Card / elevated surface. */
  surface: '#FFFFFF',
  /** Neutral grey for missing-asset placeholders per AGENTS.md. */
  placeholderGrey: '#CBD5E1',
} as const;

export const fonts = {
  family: 'Nunito',
  regular: 'Nunito_400Regular',
  semibold: 'Nunito_600SemiBold',
  bold: 'Nunito_700Bold',
  extrabold: 'Nunito_800ExtraBold',
  black: 'Nunito_900Black',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const radii = {
  junior: {
    sm: 12,
    md: 18,
    lg: 24,
    pill: 9999,
  },
  senior: {
    sm: 8,
    md: 12,
    lg: 16,
    pill: 9999,
  },
} as const;

export interface AgeBandThemeConfig {
  readonly mode: AgeBandThemeMode;
  readonly label: string;
  readonly minAge: number;
  readonly maxAge: number;
  readonly primaryAccent: string;
  readonly secondaryAccent: string;
  readonly cardRadius: number;
  readonly buttonRadius: number;
  readonly headingScale: number;
}

export const ageBandThemes: Record<AgeBandThemeMode, AgeBandThemeConfig> = {
  junior: {
    mode: 'junior',
    label: 'Junior Builders (Ages 5–11)',
    minAge: 5,
    maxAge: 11,
    primaryAccent: colors.kidPurple,
    secondaryAccent: colors.accents.amber,
    cardRadius: radii.junior.lg,
    buttonRadius: radii.junior.pill,
    headingScale: 1.08,
  },
  senior: {
    mode: 'senior',
    label: 'Senior Creators (Ages 12–18)',
    minAge: 12,
    maxAge: 18,
    primaryAccent: colors.accents.blue,
    secondaryAccent: colors.teal,
    cardRadius: radii.senior.lg,
    buttonRadius: radii.senior.md,
    headingScale: 1.0,
  },
} as const;

export function resolveThemeModeForAge(age: number): AgeBandThemeMode {
  if (age >= 12) {
    return 'senior';
  }
  return 'junior';
}

export const tokens = {
  colors,
  fonts,
  spacing,
  radii,
  ageBandThemes,
  resolveThemeModeForAge,
} as const;

export type DesignTokens = typeof tokens;
