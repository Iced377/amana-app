
"use client"; // Required for usePathname

import Link from 'next/link';
import { ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePathname } from 'next/navigation'; 
import { fallbackLng, locales, type LocaleTypes } from '@/locales/settings';

interface AppLogoProps {
  className?: string;
  iconSize?: number;
  textSize?: string;
  showText?: boolean;
}

export function AppLogo({ className, iconSize = 8, textSize = "text-xl", showText = true }: AppLogoProps) {
  const pathname = usePathname();
  let currentLocale: LocaleTypes = fallbackLng;

  if (pathname) {
    const segments = pathname.split('/');
    if (segments.length > 1 && locales.includes(segments[1] as LocaleTypes)) {
      currentLocale = segments[1] as LocaleTypes;
    }
  }

  // Link to the localized root (home page)
  return (
    <Link href={`/${currentLocale}/`} className={cn("flex items-center gap-2", className)}>
      <ShieldCheck className={`h-${iconSize} w-${iconSize} text-primary`} />
      {showText && <span className={`${textSize} font-bold`}>Guardian Angel</span>}
    </Link>
  );
}
