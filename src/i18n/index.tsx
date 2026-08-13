import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

import { en, type Catalogue, type TranslationKey } from './en';
import { si } from './si';
import { ta } from './ta';

export type Locale = 'en' | 'si' | 'ta';
export type Script = 'latin' | 'sinhala' | 'tamil';

const catalogues: Record<Locale, Catalogue> = { en, si, ta };

/** The switcher labels are written in their own script, as the design shows. */
export const localeLabels: Record<Locale, string> = {
  en: 'EN',
  si: 'සිං',
  ta: 'தமிழ்',
};

/**
 * Which font stack a locale's text needs.
 *
 * Exported because the language switcher has to render all three labels at once,
 * each in its own face, regardless of which locale is active — see `<Txt script>`.
 */
export const localeScripts: Record<Locale, Script> = {
  en: 'latin',
  si: 'sinhala',
  ta: 'tamil',
};

/**
 * A translated string can carry `{placeholders}` and `**bold**` runs. `t`
 * resolves the placeholders; `<Rich>` renders the bold runs.
 */
export type Vars = Record<string, string | number>;

function interpolate(template: string, vars?: Vars): string {
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (whole, key: string) =>
    key in vars ? String(vars[key]) : whole,
  );
}

type I18nValue = {
  locale: Locale;
  setLocale: (next: Locale) => void;
  t: (key: TranslationKey, vars?: Vars) => string;
  /**
   * Which script the body font has to cover. Latin numerals are used in every
   * locale — the design is explicit that amounts read the same everywhere — so
   * this only ever affects the sans stack, never the mono one.
   */
  script: Script;
};

const I18nContext = createContext<I18nValue | null>(null);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocale] = useState<Locale>('en');

  const t = useCallback(
    (key: TranslationKey, vars?: Vars) => interpolate(catalogues[locale][key], vars),
    [locale],
  );

  const value = useMemo<I18nValue>(
    () => ({
      locale,
      setLocale,
      t,
      script: localeScripts[locale],
    }),
    [locale, t],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nValue {
  const value = useContext(I18nContext);
  if (!value) throw new Error('useI18n must be used inside <I18nProvider>');
  return value;
}

/** Convenience for the common case of only needing the lookup function. */
export function useT() {
  return useI18n().t;
}

export type { TranslationKey };
