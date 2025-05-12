
"use client";

import { useRouter, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useUserPreferences } from '@/context/UserPreferencesContext';
import type { LocaleTypes } from '@/locales/settings';
import { Globe } from 'lucide-react';

export function LanguageToggle() {
  const { language, setLanguage } = useUserPreferences();
  const router = useRouter();
  const pathname = usePathname();

  const handleLanguageChange = () => {
    const newLocale = language === 'en' ? 'ar' : 'en';
    setLanguage(newLocale as LocaleTypes);

    // Replace the locale part of the pathname
    // Pathname might be /en, /en/dashboard, /en/dashboard/settings
    const segments = pathname.split('/');
    if (segments.length > 1 && (segments[1] === 'en' || segments[1] === 'ar')) {
      segments[1] = newLocale;
    } else {
      // This case should ideally not happen if middleware is working correctly
      // but as a fallback, prepend newLocale if current locale is not in path
      segments.splice(1, 0, newLocale);
    }
    const newPathname = segments.join('/');
    router.push(newPathname);
  };

  return (
    <Button variant="ghost" size="icon" onClick={handleLanguageChange} aria-label="Toggle language">
      <Globe className="h-[1.2rem] w-[1.2rem] transition-all" />
      <span className="sr-only">Toggle language, current: {language}</span>
    </Button>
  );
}
