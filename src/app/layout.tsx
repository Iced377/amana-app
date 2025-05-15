
import type { Metadata } from 'next';
import './globals.css'; // Keep global styles here
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
    // The theme-specific font class will be added by UserPreferencesContext
    <html lang="en" className={inter.variable}> 
      <body>
        {children}
      </body>
    </html>
  );
}
