
import type { Metadata } from 'next';
import './globals.css'; // Keep global styles here

export const metadata: Metadata = {
  title: 'Guardian Angel',
  description: 'Secure your digital legacy.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // The lang and dir attributes will be set by app/[lng]/layout.tsx
  // This root layout is minimal, actual page structure is handled by [lng]/layout.tsx
  return (
    <html>
      <body>
        {children}
      </body>
    </html>
  );
}
