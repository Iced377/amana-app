
"use client";
import { use } from 'react';
import type React from 'react';
import { useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Home, FileText, Users, Share2, Settings, LogOut, UserCircle, Bell, ShieldCheck, Landmark, BookOpen, DollarSign, FolderPlus, Fingerprint, ShieldAlert as InsuranceIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { AppLogo } from '@/components/AppLogo';
import { ModeToggle } from '@/components/mode-toggle';
import { LanguageToggle } from '@/components/language-toggle';
import { useUserPreferences } from '@/context/UserPreferencesContext';
import { useTranslation } from '@/locales/client';
import type { LocaleTypes } from '@/locales/settings';
import { useAuth } from '@/hooks/use-auth';

export default function DashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { lng: LocaleTypes };
}) {
  const { profile, isLoading: profileLoading } = useUserPreferences();
  const { user: firebaseUser, loading: authLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const resolvedParams = use(params);
  const currentLocale = resolvedParams.lng; 
  const { t } = useTranslation(currentLocale);

  useEffect(() => {
    if (authLoading || profileLoading) {
      return; // Still loading, wait for auth/profile state to settle
    }

    const hasValidAppProfile = profile && profile.id && profile.id !== 'guestUser';

    if (!firebaseUser && !hasValidAppProfile) {
      // No Firebase user and no valid app profile (e.g. guest trying to access dashboard)
      if (!pathname.includes(`/${currentLocale}/login`)) {
        router.replace(`/${currentLocale}/login`);
      }
    } else if (profile && !profile.onboardingCompleted) {
      // User is authenticated (Firebase or app profile) but hasn't completed onboarding
      if (!pathname.includes(`/${currentLocale}/onboarding`)) {
        router.replace(`/${currentLocale}/onboarding`);
      }
    }
    // If user is authenticated AND onboarding is complete, they can stay on dashboard pages.
  }, [firebaseUser, authLoading, profile, profileLoading, router, currentLocale, pathname]);


  if (authLoading || profileLoading) {
    return <div className="flex h-screen w-screen items-center justify-center">Loading Dashboard...</div>;
  }
  
  const hasValidAppProfileForDisplay = profile && profile.id && profile.id !== 'guestUser';
  // Condition to stay on dashboard: authenticated AND onboarding completed
  const canStayOnDashboard = (firebaseUser || hasValidAppProfileForDisplay) && profile?.onboardingCompleted;

  if (!canStayOnDashboard && !pathname.includes(`/${currentLocale}/login`) && !pathname.includes(`/${currentLocale}/onboarding`)) {
    // If conditions to stay are not met, and not already on login/onboarding, show finalising and let useEffect handle redirect
     return <div className="flex h-screen w-screen items-center justify-center">Finalizing session...</div>;
  }


  const navItems = [
    { href: `/${currentLocale}/dashboard`, labelKey: 'dashboardTitle', icon: Home },
    { href: `/${currentLocale}/dashboard/my-files`, labelKey: 'myFilesTitle', icon: FileText },
    { href: `/${currentLocale}/dashboard/register-assets`, labelKey: 'registerAssetsTitle', icon: FolderPlus },
    { href: `/${currentLocale}/dashboard/insurance-policies`, labelKey: 'insurancePoliciesTitle', icon: InsuranceIcon },
    { href: `/${currentLocale}/dashboard/digital-footprint`, labelKey: 'digitalFootprintTitle', icon: Fingerprint },
    { href: `/${currentLocale}/dashboard/beneficiaries`, labelKey: 'beneficiariesTitle', icon: Users },
    { href: `/${currentLocale}/dashboard/shared-upon-death`, labelKey: 'sharedUponDeathTitle', icon: Share2 },
    ...(profile?.mode === 'islamic' ? [{ href: `/${currentLocale}/dashboard/islamic-inheritance`, labelKey: 'islamicInheritancePlanning', icon: Landmark }] : []),
    { href: `/${currentLocale}/dashboard/settings`, labelKey: 'settingsTitle', icon: Settings },
    { href: `/${currentLocale}/pricing`, labelKey: 'pricingTitle', icon: DollarSign },
    { href: `/${currentLocale}/info-help`, labelKey: 'infoHelpTitle', icon: BookOpen },
  ];

  const getLabel = (key: string) => {
    const translated = t(key);
    // Basic fallback if translation key is missing, can be enhanced
    if (translated === key || translated === '') {
        switch (key) {
            case 'dashboardTitle': return 'Dashboard';
            case 'myFilesTitle': return 'My Files';
            case 'registerAssetsTitle': return 'Register Assets';
            case 'insurancePoliciesTitle': return 'Insurance Policies';
            case 'digitalFootprintTitle': return 'Digital Footprint';
            case 'beneficiariesTitle': return 'Beneficiaries';
            case 'sharedUponDeathTitle': return 'Shared Upon Death';
            case 'settingsTitle': return 'Settings';
            case 'islamicInheritancePlanning': return 'Islamic Inheritance';
            case 'pricingTitle': return 'Pricing';
            case 'infoHelpTitle': return 'Info & Help';
            case 'logout': return 'Logout';
            default: return key.replace(/([A-Z])/g, ' $1').trim(); // Fallback for untranslated keys
        }
    }
    return translated;
  };

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <div className="hidden border-r bg-sidebar md:block dark:bg-sidebar-dark">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-16 items-center border-b px-4 lg:px-6">
            <AppLogo />
          </div>
          <div className="flex-1">
            <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
              {navItems.map((item) => (
                <Link
                  key={item.labelKey}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 ${pathname === item.href || (item.href !== `/${currentLocale}/dashboard` && pathname.startsWith(item.href)) ? 'bg-sidebar-accent text-sidebar-accent-foreground' : 'text-sidebar-foreground'} transition-all hover:text-primary hover:bg-sidebar-accent/80`}
                >
                  <item.icon className="h-4 w-4" />
                  {getLabel(item.labelKey)}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </div>
      <div className="flex flex-col">
        <header className="flex h-16 items-center gap-4 border-b bg-background px-4 lg:px-6 sticky top-0 z-30">
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="shrink-0 md:hidden"
              >
                <ShieldCheck className="h-5 w-5" /> {/* Using ShieldCheck as placeholder, consider Menu icon */}
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex flex-col bg-sidebar dark:bg-sidebar-dark p-0">
              <SheetHeader className="flex h-16 items-center border-b px-4 lg:px-6">
                <SheetTitle>
                  <AppLogo />
                </SheetTitle>
              </SheetHeader>
              <nav className="grid gap-2 text-lg font-medium p-4">
                {navItems.map((item) => (
                  <Link
                    key={item.labelKey}
                    href={item.href}
                    className={`mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 ${pathname === item.href || (item.href !== `/${currentLocale}/dashboard` && pathname.startsWith(item.href)) ? 'bg-sidebar-accent text-sidebar-accent-foreground' : 'text-sidebar-foreground'} hover:text-primary hover:bg-sidebar-accent/80`}
                  >
                    <item.icon className="h-5 w-5" />
                    {getLabel(item.labelKey)}
                  </Link>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
          <div className="w-full flex-1">
            {/* Optional: Add a search bar or other header content here */}
          </div>
          <LanguageToggle />
          <ModeToggle />
          <Button variant="ghost" size="icon" className="rounded-full">
            <Bell className="h-5 w-5" />
            <span className="sr-only">Notifications</span>
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" size="icon" className="rounded-full">
                <UserCircle className="h-5 w-5" />
                <span className="sr-only">Toggle user menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>{profile?.displayName || 'My Account'}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild><Link href={`/${currentLocale}/dashboard/settings`}>Profile</Link></DropdownMenuItem>
              <DropdownMenuItem asChild><Link href={`/${currentLocale}/pricing`}>Billing</Link></DropdownMenuItem>
              <DropdownMenuItem asChild><Link href={`/${currentLocale}/dashboard/settings`}>Settings</Link></DropdownMenuItem>
              <DropdownMenuSeparator />
               <DropdownMenuItem asChild>
                {/* TODO: Implement actual logout logic */}
                <Link href={`/${currentLocale}/login`}>{getLabel('logout')} <LogOut className="ml-2 h-4 w-4" /></Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 bg-secondary/30 dark:bg-background">
          {children}
        </main>
      </div>
    </div>
  );
}
