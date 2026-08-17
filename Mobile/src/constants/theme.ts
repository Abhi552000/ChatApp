/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#1E293B',
    background: '#F5F7FB',
    backgroundElement: '#FFFFFF',
    backgroundSelected: '#F1F5F9',
    textSecondary: '#64748B',
    border: '#E2E8F0',
    input: '#F1F5F9',
    header: '#FFFFFF',
    messageSent: '#2563EB',
    messageReceived: '#E2E8F0',
    messageText: '#FFFFFF',
  },
  dark: {
    text: '#F3F4F6',
    background: '#090D16',
    backgroundElement: '#111827',
    backgroundSelected: '#1F2937',
    textSecondary: '#9CA3AF',
    border: '#161B26',
    input: '#1F2937',
    header: '#0F172A',
    messageSent: '#2563EB',
    messageReceived: '#1F2937',
    messageText: '#FFFFFF',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
