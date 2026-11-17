import { COLORS } from './colors';
import { FONTS } from './fonts';

/** Shared UI/design-system tokens. */
export const UI = {
  colors: COLORS,
  fonts: FONTS,
  radius: { sm: '0.5rem', md: '0.75rem', lg: '1rem', xl: '1.25rem' },
  spacing: { page: '1.25rem', section: '1.5rem' },
  focusRing: `0 0 0 3px rgba(96, 165, 250, 0.28)`,
  shadow: `0 8px 24px ${COLORS.shadow}`,
  table: { headerHeight: '2.75rem', rowHeight: '3rem' },
} as const;

export type UIConfig = typeof UI;
