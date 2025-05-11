
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '../globals.css'; // Adjusted path for globals.css
import { Toaster } from '@/components/ui/toaster';
import { ThemeProvider } from '@/components/theme-provider';
import { I18nProviderClient } from '@/locales/client';
import { UserPreferencesProvider } from '@/context/UserPreferencesContext';
import { locales, type LocaleTypes } from '@/locales/settings';
// For server-side initial locale to pass to html tag, and for dir attribute
import { useTranslation } from '@/locales/server';


const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

// Metadata can remain here or be moved to the minimal root layout,
// but it's often useful to have it close to the main structure.
export const metadata: Metadata = {
  title: 'Guardian Angel',
  description: 'Secure your digital legacy.',
};

// Required for static generation with dynamic segments (i18n routes)
export async function generateStaticParams() {
  return locales.map((lng) => ({ lng }));
}

export default async function LocaleLayout({ // Renamed to avoid conflict, e.g. LocaleLayout
  children,
  params: { lng } // Locale is passed as a parameter from the route
}: Readonly<{
  children: React.ReactNode;
  params: { lng: LocaleTypes }; // Define params type to include lng
}>) {
  // Validate lng or set a default, important for robustness
  const currentLocale = locales.includes(lng) ? lng : fallbackLng;
  const { i18n } = await useTranslation(currentLocale);

  return (
    // HTML and body tags are now in the minimal root src/app/layout.tsx
    // This component will be a child of that minimal layout.
    // We set lang and dir on the html tag in the root layout via this layout.
    // However, since this is a nested layout, we can't directly modify the root <html> tag from here in App Router.
    // The middleware handles redirection, and client-side useEffect in UserPreferencesProvider/I18nProviderClient can set attributes.
    // For initial SSR, the lang/dir on <html> should be set in the actual root `app/layout.tsx`.
    // Let's simplify: The `app/layout.tsx` is already setting `<html>`. This `[lng]/layout.tsx` wraps children with providers.
    // The `lang` and `dir` for `<html>` tag are best handled in the true root `app/layout.tsx` if possible,
    // or rely on client-side updates for `dir`. For now, `useTranslation` here helps get the `dir` for the `I18nProviderClient`.

    // The following html and body structure is for the content *within* the root <html><body> defined in src/app/layout.tsx
    // Effectively, this becomes the primary layout for localized content.
    <div lang={currentLocale} dir={i18n.dir(currentLocale)} className={`${inter.variable} font-sans antialiased`}>
        <UserPreferencesProvider> {/* UserPreferencesProvider should wrap ThemeProvider and I18nProviderClient */}
          <ThemeProvider
            attribute="class"
            defaultTheme="light" // Can be 'system' or specific like 'light'/'dark'
            enableSystem
            disableTransitionOnChange
          >
            <I18nProviderClient locale={currentLocale}> {/* Pass the current locale to the client provider */}
              {children} {/* Removed <main> wrapper, pages/dashboard layout will handle structure */}
              <Toaster />
            </I18nProviderClient>
          </ThemeProvider>
        </UserPreferencesProvider>
    </div>
  );
}

// Helper for fallbackLng if not directly importable due to server/client constraints
const fallbackLng = 'en';
