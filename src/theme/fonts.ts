/**
 * Font wiring.
 *
 * The design specifies Instrument Sans for text and JetBrains Mono for every
 * number, order id and phone number. Instrument Sans has no Sinhala or Tamil
 * coverage, and React Native does not fall back across families once an
 * explicit `fontFamily` is set — so each script gets its own Noto Sans face and
 * `familyFor()` picks between them. Mono is never swapped: the design keeps
 * numerals Latin in all three languages so amounts read identically.
 *
 * Weights are imported one subpath at a time rather than from the package root,
 * which keeps the italics (which the design never uses) out of the bundle.
 */
import { InstrumentSans_400Regular } from '@expo-google-fonts/instrument-sans/400Regular';
import { InstrumentSans_500Medium } from '@expo-google-fonts/instrument-sans/500Medium';
import { InstrumentSans_600SemiBold } from '@expo-google-fonts/instrument-sans/600SemiBold';
import { InstrumentSans_700Bold } from '@expo-google-fonts/instrument-sans/700Bold';
import { JetBrainsMono_400Regular } from '@expo-google-fonts/jetbrains-mono/400Regular';
import { JetBrainsMono_500Medium } from '@expo-google-fonts/jetbrains-mono/500Medium';
import { NotoSansSinhala_400Regular } from '@expo-google-fonts/noto-sans-sinhala/400Regular';
import { NotoSansSinhala_500Medium } from '@expo-google-fonts/noto-sans-sinhala/500Medium';
import { NotoSansSinhala_600SemiBold } from '@expo-google-fonts/noto-sans-sinhala/600SemiBold';
import { NotoSansSinhala_700Bold } from '@expo-google-fonts/noto-sans-sinhala/700Bold';
import { NotoSansTamil_400Regular } from '@expo-google-fonts/noto-sans-tamil/400Regular';
import { NotoSansTamil_500Medium } from '@expo-google-fonts/noto-sans-tamil/500Medium';
import { NotoSansTamil_600SemiBold } from '@expo-google-fonts/noto-sans-tamil/600SemiBold';
import { NotoSansTamil_700Bold } from '@expo-google-fonts/noto-sans-tamil/700Bold';

/** Passed straight to `useFonts`. */
export const fontAssets = {
  InstrumentSans_400Regular,
  InstrumentSans_500Medium,
  InstrumentSans_600SemiBold,
  InstrumentSans_700Bold,
  JetBrainsMono_400Regular,
  JetBrainsMono_500Medium,
  NotoSansSinhala_400Regular,
  NotoSansSinhala_500Medium,
  NotoSansSinhala_600SemiBold,
  NotoSansSinhala_700Bold,
  NotoSansTamil_400Regular,
  NotoSansTamil_500Medium,
  NotoSansTamil_600SemiBold,
  NotoSansTamil_700Bold,
};

/** The four weights the design actually uses. */
export type Weight = 400 | 500 | 600 | 700;
export type Script = 'latin' | 'sinhala' | 'tamil';

const sans: Record<Script, Record<Weight, string>> = {
  latin: {
    400: 'InstrumentSans_400Regular',
    500: 'InstrumentSans_500Medium',
    600: 'InstrumentSans_600SemiBold',
    700: 'InstrumentSans_700Bold',
  },
  sinhala: {
    400: 'NotoSansSinhala_400Regular',
    500: 'NotoSansSinhala_500Medium',
    600: 'NotoSansSinhala_600SemiBold',
    700: 'NotoSansSinhala_700Bold',
  },
  tamil: {
    400: 'NotoSansTamil_400Regular',
    500: 'NotoSansTamil_500Medium',
    600: 'NotoSansTamil_600SemiBold',
    700: 'NotoSansTamil_700Bold',
  },
};

/** JetBrains Mono ships Regular and Medium; heavier requests clamp to Medium. */
const mono: Record<Weight, string> = {
  400: 'JetBrainsMono_400Regular',
  500: 'JetBrainsMono_500Medium',
  600: 'JetBrainsMono_500Medium',
  700: 'JetBrainsMono_500Medium',
};

export function familyFor(script: Script, weight: Weight, isMono: boolean): string {
  return isMono ? mono[weight] : sans[script][weight];
}

/**
 * The prototype expresses tracking in `em`; React Native wants absolute points.
 */
export function trackingToPoints(em: number, fontSize: number): number {
  return em * fontSize;
}
