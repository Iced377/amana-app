
"use client"; 
// Marking as client component because it uses hooks like useUserPreferences and useTranslation

import type React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  FileText,
  Users,
  Share2,
  Settings,
  LogOut,
  UserCircle,
  Bell,
  ShieldCheck,
  Landmark, // Example for Islamic Mode specific item
  BookOpen, // For Info & Help
  DollarSign, // For Pricing
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
// import { Input } from '@/components/ui/input'; // Search bar commented out
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { AppLogo } from '@/components/AppLogo';
import { ModeToggle } from '@/components/mode-toggle';
import { useUserPreferences } from '@/context/UserPreferencesContext';
import { useTranslation } from '@/locales/client'; 

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { profile, language } = useUserPreferences();
  const { t } = useTranslation(language);
  const pathname = usePathname();
  const currentLocale = pathname.split('/')[1] || 'en';


  const navItems = [
    { href: `/${currentLocale}/dashboard`, labelKey: 'dashboardTitle', icon: Home },
    { href: `/${currentLocale}/dashboard/my-files`, labelKey: 'myFilesTitle', icon: FileText },
    { href: `/${currentLocale}/dashboard/beneficiaries`, labelKey: 'beneficiariesTitle', icon: Users },
    { href: `/${currentLocale}/dashboard/shared-upon-death`, labelKey: 'sharedUponDeathTitle', icon: Share2 },
    // Example: Conditional item for Islamic Mode
    ...(profile?.mode === 'islamic' ? [{ href: `/${currentLocale}/dashboard/islamic-inheritance`, labelKey: 'islamicInheritancePlanning', icon: Landmark }] : []),
    { href: `/${currentLocale}/dashboard/settings`, labelKey: 'settingsTitle', icon: Settings },
    { href: `/${currentLocale}/pricing`, labelKey: 'pricingTitle', icon: DollarSign },
    { href: `/${currentLocale}/info-help`, labelKey: 'infoHelpTitle', icon: BookOpen },
  ];
  
  // Fallback labels for keys not yet in translation files
  const getLabel = (key: string) => {
    const translated = t(key);
    if (translated === key) { // i18next returns key if not found
        switch (key) {
            case 'dashboardTitle': return 'Dashboard';
            case 'myFilesTitle': return 'My Files';
            case 'beneficiariesTitle': return 'Beneficiaries';
            case 'sharedUponDeathTitle': return 'Shared Upon Death';
            case 'settingsTitle': return 'Settings';
            case 'islamicInheritancePlanning': return 'Islamic Inheritance';
            case 'pricingTitle': return 'Pricing';
            case 'infoHelpTitle': return 'Info & Help';
            default: return key.replace(/([A-Z])/g, ' $1').trim(); // Basic fallback
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
          {/* Future: Account/Logout button */}
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
                <ShieldCheck className="h-5 w-5" /> 
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex flex-col bg-sidebar dark:bg-sidebar-dark">
              <nav className="grid gap-2 text-lg font-medium">
                <div className="flex h-16 items-center border-b px-4 mb-4">
                   <AppLogo />
                </div>
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
            {/* Optional: Search bar */}
          </div>
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
                <Link href={`/${currentLocale}/login`}>{t('logout')} <LogOut className="ml-2 h-4 w-4" /></Link>
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
