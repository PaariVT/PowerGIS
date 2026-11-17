/**
 * PowerGIS enterprise design tokens.
 * A restrained navy/blue foundation with teal operational accents and clear status colours.
 */
export const COLORS = {
  canvas: '#F3F6FB',
  surface: '#FFFFFF',
  surfaceSubtle: '#F7F9FC',
  surfaceMuted: '#EAF0F7',
  text: '#14213D',
  textSecondary: '#52627A',
  textMuted: '#718096',
  textDisabled: '#A0AEC0',
  textInverse: '#FFFFFF',
  border: '#E2E8F0',
  borderStrong: '#CBD5E1',
  divider: '#EDF2F7',
  control: '#2563EB',
  controlHover: '#1D4ED8',
  focus: '#60A5FA',
  shadow: 'rgba(15, 23, 42, 0.08)',
  navy: '#14213D',
  blue: '#2563EB',
  cyan: '#0891B2',
  teal: '#0F9D8A',
  green: '#16A34A',
  amber: '#D97706',
  red: '#DC2626',
  violet: '#7C3AED',
} as const;

export type Colors = typeof COLORS;
