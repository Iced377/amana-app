
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { ThemeProvider } from '@/components/theme-provider';
import { I18nProviderClient } from '@/locales/client';
import { UserPreferencesProvider } from '@/context/UserPreferencesContext';
import { locales } from '@/locales/settings';
// For server-side initial locale to pass to html tag, and for dir attribute
import { useTranslation } from '@/locales/server';


const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

export const metadata: Metadata = {
  title: 'Guardian Angel',
  description: 'Secure your digital legacy.',
};

// Required for static generation with dynamic segments (i18n routes)
export async function generateStaticParams() {
  return locales.map((lng) => ({ lng }));
}

export default async function RootLayout({
  children,
  params: { lng } // Locale is passed as a parameter from the route
}: Readonly<{
  children: React.ReactNode;
  params: { lng: string }; // Define params type to include lng
}>) {
  // Validate lng or set a default, important for robustness
  // Ensure `locales` is an array of strings like ['en', 'ar']
  const currentLocale = locales.includes(lng as 'en' | 'ar') ? lng : 'en';
  
  // `useTranslation` from server can be used to get i18n instance for `dir`
  const { i18n } = await useTranslation(currentLocale);

  return (
    <html lang={currentLocale} dir={i18n.dir(currentLocale)} suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <UserPreferencesProvider> {/* UserPreferencesProvider should wrap ThemeProvider and I18nProviderClient */}
          <ThemeProvider
            attribute="class"
            defaultTheme="light" // Can be 'system' or specific like 'light'/'dark'
            enableSystem
            disableTransitionOnChange
          >
            <I18nProviderClient locale={currentLocale}> {/* Pass the current locale to the client provider */}
              <main>{children}</main>
              <Toaster />
            </I18nProviderClient>
          </ThemeProvider>
        </UserPreferencesProvider>
      </body>
    </html>
  );
}
