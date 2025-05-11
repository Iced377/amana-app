
export const fallbackLng = 'en'
export const locales = [fallbackLng, 'ar'] as const; // Add 'ar'
export type LocaleTypes = typeof locales[number];
export const defaultNS = 'translation' // Default namespace

export function getOptions (lng = fallbackLng, ns = defaultNS) {
  return {
    // debug: true, // Set to true for development
    supportedLngs: locales,
    fallbackLng,
    lng,
    fallbackNS: defaultNS,
    defaultNS,
    ns
  }
}
