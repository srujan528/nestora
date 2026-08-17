import { LOCALE } from '@qrent/shared/enum';
import { DEFAULT_LOCALE, isLocale, SUPPORTED_LOCALES } from '@qrent/shared/utils/helper';
import { getRequestConfig } from 'next-intl/server';

// Re-export shared locale constants for frontend use
export const locales = SUPPORTED_LOCALES;
export type Locale = LOCALE;
export const fallbackLocale = DEFAULT_LOCALE;

export default getRequestConfig(async ({ requestLocale }) => {
  const resolvedLocale = await requestLocale;
  const locale = isLocale(resolvedLocale) ? resolvedLocale : fallbackLocale;

  try {
    return {
      locale,
      messages: (await import(`../messages/${locale}.json`)).default,
    };
  } catch (error) {
    return {
      locale: fallbackLocale,
      messages: (await import(`../messages/${fallbackLocale}.json`)).default,
    };
  }
});
