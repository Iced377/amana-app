import type { Metadata } from 'next';
import { Inter } from 'next/font/google'; // Using Inter as a clean sans-serif font
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { ThemeProvider } from '@/components/theme-provider';
import { UserPreferencesProvider } from '@/context/UserPreferencesContext';
import { I18nProviderClient } from '@/locales/client'; // For client-side i18n

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans', // Changed from Geist to Inter as per "Clean, sans-serif"
});

export const metadata: Metadata = {
  title: 'Guardian Angel',
  description: 'Secure your digital legacy.',
};

export default function RootLayout({
  children,
  params: { locale } // Next.js 13+ app router passes locale this way if using middleware for routing
}: Readonly<{
  children: React.ReactNode;
  params: { locale?: string };
}>) {
  const currentLocale = locale || 'en'; // Default to 'en' if locale is not in params

  return (
    <html lang={currentLocale} dir={currentLocale === 'ar' ? 'rtl' : 'ltr'} suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <UserPreferencesProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem
            disableTransitionOnChange
          >
            {/*
              Wrap with I18nProviderClient if you need client components to access translations.
              If all translations are handled by server components, this might not be strictly necessary
              at the root, but good for consistency if any client component needs i18n.
            */}
            <I18nProviderClient locale={currentLocale}>
              <main>{children}</main>
              <Toaster />
            </I18nProviderClient>
          </ThemeProvider>
        </UserPreferencesProvider>
      </body>
    </html>
  );
}
