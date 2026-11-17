/** Backward-compatible style configuration facade. New presentation tokens live in src/styles. */
export * from '../styles';

import { COLORS } from '../styles/colors';
import { THEME } from '../commons/theme';

export const THEME_CONFIG = {
  gradients: {
    primary: 'from-blue-600 to-cyan-600',
    primaryHover: 'from-blue-700 to-cyan-700',
    emblem: 'from-blue-700 via-indigo-600 to-cyan-500',
    accent: 'from-cyan-500 to-teal-500',
    success: 'from-emerald-500 to-teal-600',
    warning: 'from-amber-400 to-orange-500',
    danger: 'from-rose-500 to-red-600',
    purple: 'from-violet-600 to-indigo-600',
  },
  colors: {
    electricBlue: COLORS.control,
    navyBlue: COLORS.control,
    cyan: COLORS.textSecondary,
    emerald: COLORS.textSecondary,
    amber: COLORS.textMuted,
    rose: COLORS.textSecondary,
    violet: COLORS.textSecondary,
    slateDark: COLORS.text,
    slateMuted: COLORS.textMuted,
    slateBorder: COLORS.border,
    canvasBg: COLORS.canvas,
    cardBg: COLORS.surface,
  },
  roleBadges: THEME.roleBadges,
  getPriorityStyle: THEME.getPriorityStyle,
  getStatusStyle: THEME.getStatusStyle,
} as const;
