
import type { Metadata } from 'next';
import './globals.css'; // Keep global styles here
import { UserPreferencesProvider } from '@/context/UserPreferencesContext';
import { Inter } from 'next/font/google'; // Import Inter

// Initialize Inter font
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans', // Define a CSS variable for the font
});

export const metadata: Metadata = {
  title: 'Amana',
  description: 'Amana - Secure your digital legacy.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // The lang, dir, data-theme, and font class attributes will be set by app/[lng]/layout.tsx and UserPreferencesContext
  // This root layout is minimal.
  return (
    // The `inter.variable` class applies the CSS variable to the html tag
    // The theme-specific font class and data-theme will be added by UserPreferencesContext
    <html lang="en" className={inter.variable}> 
      <body>
        {/* TODO: Read initial user preferences from Firebase */}
        <UserPreferencesProvider initialPreferences={{ mode: 'conventional' }}>
          {children}
        </UserPreferencesProvider>
      </body>
    </html>
  );
}
