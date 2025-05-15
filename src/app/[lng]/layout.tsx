
import type { Metadata } from 'next';
// Removed Inter import as it's handled in root layout
import '../globals.css'; 
import { Toaster } from '@/components/ui/toaster';
import { ThemeProvider } from '@/components/theme-provider';
import { I18nProviderClient } from '@/locales/client';
import { UserPreferencesProvider } from '@/context/UserPreferencesContext';
import { locales, type LocaleTypes, fallbackLng as defaultFallbackLng } from '@/locales/settings'; // Renamed fallbackLng import
import { useTranslation } from '@/locales/server';


export const metadata: Metadata = { // Metadata can be localized if needed using generateMetadata
  title: 'Amana', // Default title, can be overridden by specific pages
  description: 'Secure your digital legacy.',
};

export async function generateStaticParams() {
  return locales.map((lng) => ({ lng }));
}

export default async function LocaleLayout({ 
  children,
  params: { lng } 
}: Readonly<{
  children: React.ReactNode;
  params: { lng: LocaleTypes }; 
}>) {
  const currentLocale = locales.includes(lng) ? lng : defaultFallbackLng;
  const { i18n } = await useTranslation(currentLocale);

  // The class for font family (e.g., font-conventional or font-islamic) 
  // and data-theme will be applied by UserPreferencesProvider client-side.
  // The `lang` and `dir` attributes are set here for initial server render.
  return (
    // The div here no longer needs font-sans as it's handled by html tag + UserPreferencesProvider
    <div lang={currentLocale} dir={i18n.dir(currentLocale)} className="antialiased">
        <UserPreferencesProvider>
          <ThemeProvider
            attribute="class" // This remains for light/dark mode via next-themes
            defaultTheme="light" 
            enableSystem
            disableTransitionOnChange
          >
            <I18nProviderClient locale={currentLocale}>
              {children}
              <Toaster />
            </I18nProviderClient>
          </ThemeProvider>
        </UserPreferencesProvider>
    </div>
  );
}
