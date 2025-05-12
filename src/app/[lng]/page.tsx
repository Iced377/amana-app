
// src/app/[lng]/page.tsx
"use client"; 
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { ShieldCheck, Lock, Users, UploadCloud, BrainCircuit, Package, BookOpen, MessageSquare, HeartHandshake, CalendarClock, Globe, CheckCircle, Info, MoonStar, MessageCircleHeart } from "lucide-react";
import Image from "next/image";
import { ModeToggle } from "@/components/mode-toggle";
import { LanguageToggle } from "@/components/language-toggle"; // Import LanguageToggle
import { usePathname } from 'next/navigation'; 
import { fallbackLng, locales, type LocaleTypes } from '@/locales/settings'; 
import { AppLogo } from "@/components/AppLogo";
import { useTranslation } from '@/locales/client';
import { cn } from "@/lib/utils";

const featureIcons = {
  upload: UploadCloud,
  tag: BrainCircuit,
  decide: ShieldCheck,
  deliver: Package,
};

const carouselItems = [
  { src: "https://picsum.photos/seed/secureletter/400/300", altKey: "altLetter", hint: "secure message" },
  { src: "https://picsum.photos/seed/protectedfamily/400/300", altKey: "altFamilyPhoto", hint: "protected memories" },
  { src: "https://picsum.photos/seed/privatevideo/400/300", altKey: "altVideoMessage", hint: "private video" },
  { src: "https://picsum.photos/seed/spiritualpeace/400/300", altKey: "altQuranVerse", hint: "spiritual peace" },
];

const differentiators = [
  "differentiatorPosthumousSharing",
  "differentiatorAIEmotion",
  "differentiatorLangSupport",
  "differentiatorLegacyCalendar",
  "differentiatorSmartVault",
  "differentiatorSecureComms" // New feature added
];

export default function HomePage() {
  const pathname = usePathname();
  let currentLocale: LocaleTypes = fallbackLng; 

  if (pathname) {
    const segments = pathname.split('/');
    if (segments.length > 1 && locales.includes(segments[1] as LocaleTypes)) {
      currentLocale = segments[1] as LocaleTypes;
    }
  }
  const { t } = useTranslation(currentLocale, 'translation');
  
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <AppLogo />
          <div className="flex items-center gap-2">
            <LanguageToggle /> {/* Added LanguageToggle */}
            <ModeToggle />
            <Button asChild variant="ghost">
              <Link href={`/${currentLocale}/login`}>{t('login')}</Link>
            </Button>
            <Button asChild>
              <Link href={`/${currentLocale}/signup`}>{t('signUp')}</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-16 md:py-24 lg:py-32 bg-gradient-to-b from-background to-secondary/20 dark:from-background dark:to-secondary/10">
          <div className="container px-4 md:px-6">
            <div className="grid gap-8 lg:grid-cols-2 lg:gap-12 items-center">
              <div className="flex flex-col justify-center space-y-6 text-center lg:text-left">
                <h1 className="text-4xl font-bold tracking-tight sm:text-5xl xl:text-6xl/none">
                  {t('landingHeroTitle')}
                </h1>
                <p className="max-w-[600px] text-muted-foreground md:text-xl mx-auto lg:mx-0">
                  {t('landingHeroSubtitle')}
                </p>
                <div className="flex flex-col gap-3 min-[400px]:flex-row justify-center lg:justify-start">
                  <Button asChild size="lg" className="shadow-md">
                    <Link href={`/${currentLocale}/signup`}>{t('landingHeroCTAStartFree')}</Link>
                  </Button>
                  <Button asChild variant="outline" size="lg" className="shadow-sm">
                    <Link href={`/${currentLocale}/#how-it-works`}>{t('landingHeroCTAHowItWorks')}</Link>
                  </Button>
                </div>
                <div className="mt-4 text-center lg:text-left">
                    <span className="inline-flex items-center gap-2 rounded-full bg-green-100 dark:bg-green-900/30 px-4 py-2 text-sm font-medium text-green-700 dark:text-green-300">
                        <Lock className="h-4 w-4" /> {t('landingHeroBadgePrivate')}
                    </span>
                </div>
              </div>
              <Image
                src="https://picsum.photos/seed/arabiclegacy/600/500"
                alt={t('altCarLegacy')} 
                width={600}
                height={500}
                className="mx-auto aspect-[6/5] overflow-hidden rounded-xl object-cover sm:w-full shadow-xl"
                data-ai-hint="arabic manuscript calligraphy" 
              />
            </div>
          </div>
        </section>

        {/* Legacy Isn’t Just Documents */}
        <section className="py-16 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6 text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl mb-6">
              {t('landingNarrativeTitle')}
            </h2>
            <p className="max-w-3xl mx-auto text-muted-foreground md:text-xl mb-10">
              {t('landingNarrativeParagraph')}
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {carouselItems.map((item, index) => (
                <div key={index} className="aspect-square overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition-shadow">
                  <Image
                    src={item.src}
                    alt={t(item.altKey)}
                    width={200}
                    height={200}
                    className="object-cover w-full h-full"
                    data-ai-hint={item.hint}
                  />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section id="how-it-works" className="py-16 md:py-24 lg:py-32 bg-secondary/20 dark:bg-secondary/10">
          <div className="container px-4 md:px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">{t('landingHowItWorksTitle')}</h2>
            </div>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
              {[
                { id: 'upload', icon: featureIcons.upload, titleKey: 'landingHowItWorksUploadTitle', descKey: 'landingHowItWorksUploadDesc' },
                { id: 'tag', icon: featureIcons.tag, titleKey: 'landingHowItWorksTagTitle', descKey: 'landingHowItWorksTagDesc' },
                { id: 'decide', icon: featureIcons.decide, titleKey: 'landingHowItWorksDecideTitle', descKey: 'landingHowItWorksDecideDesc' },
                { id: 'deliver', icon: featureIcons.deliver, titleKey: 'landingHowItWorksDeliverTitle', descKey: 'landingHowItWorksDeliverDesc' },
              ].map((step) => {
                const Icon = step.icon;
                return (
                  <Card key={step.id} className="text-center shadow-lg hover:shadow-xl transition-shadow p-6">
                    <div className="flex justify-center mb-4">
                        <div className="p-3 bg-primary/10 rounded-full">
                            <Icon className="h-8 w-8 text-primary" />
                        </div>
                    </div>
                    <h3 className="text-xl font-semibold mb-2">{t(step.titleKey)}</h3>
                    <p className="text-sm text-muted-foreground">{t(step.descKey)}</p>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* New Image for Faith Section */}
        <section className="py-12 md:py-16 lg:py-20 bg-background">
          <div className="container px-4 md:px-6">
            <Image
              src="https://picsum.photos/seed/holybookstand/1200/400"
              alt={t('altHolyBookPlaceholder')}
              width={1200}
              height={400}
              className="w-full h-auto object-cover rounded-lg shadow-xl"
              data-ai-hint="holy book stand"
            />
          </div>
        </section>

        {/* Faith-Based Legacy Planning */}
        <section className="py-16 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="space-y-6 text-center lg:text-left"> 
                <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl text-center">
                  {t('landingFaithBasedTitle')}
                </h2>
                <p className="text-muted-foreground md:text-lg max-w-3xl mx-auto text-center">
                  {t('landingFaithBasedParagraph')}
                </p>
                <div className="flex justify-center">
                    <span className="inline-flex items-center gap-2 rounded-full bg-green-100 dark:bg-green-900/30 px-4 py-2 text-sm font-medium text-green-700 dark:text-green-300">
                        <MoonStar className="h-4 w-4" /> {t('landingFaithBasedBadgeCertified')}
                    </span>
                </div>
                 <p className="text-sm text-muted-foreground text-center">
                  {t('landingFaithBasedLanguagePrompt')}{' '}
                  <Link href={`/${currentLocale === 'en' ? 'ar' : 'en'}${pathname.substring(currentLocale.length +1 )}`} className="text-primary hover:underline">
                    {currentLocale === 'en' ? t('arabic') : t('english')}
                  </Link>
                </p>
              </div>
          </div>
        </section>

        {/* What Makes Amana Different */}
        <section id="features" className="py-16 md:py-24 lg:py-32 bg-secondary/20 dark:bg-secondary/10">
          <div className="container px-4 md:px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">{t('landingDifferentiatorsTitle')}</h2>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {differentiators.map((key, index) => (
                <Card key={index} className="p-6 shadow-lg hover:shadow-xl transition-shadow">
                  <div className="flex items-start gap-3">
                     {key === "differentiatorSecureComms" ? <MessageCircleHeart className="h-6 w-6 text-primary mt-1 flex-shrink-0" /> : <CheckCircle className="h-6 w-6 text-primary mt-1 flex-shrink-0" />}
                    <p className="text-muted-foreground">{t(key)}</p>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Start Free */}
        <section className="py-16 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6 text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl mb-4">
              {t('landingStartFreeTitle')}
            </h2>
            <p className="max-w-2xl mx-auto text-muted-foreground md:text-xl mb-8">
             {t('landingStartFreeParagraph')}
            </p>
            <div className="flex flex-col gap-3 sm:flex-row justify-center">
              <Button asChild variant="outline" size="lg" className="shadow-sm">
                <Link href={`/${currentLocale}/features`}>{t('landingStartFreeCTASample')}</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Final Callout */}
        <section className="py-16 md:py-24 lg:py-32 bg-primary text-primary-foreground">
          <div className="container px-4 md:px-6 text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl mb-6">
              {t('landingFinalCalloutTitle')}
            </h2>
            <div className="flex flex-col gap-3 sm:flex-row justify-center">
              <Button asChild size="lg" variant="secondary" className="shadow-md">
                <Link href={`/${currentLocale}/signup`}>{t('landingFinalCalloutCTABegin')}</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t bg-background">
        <div className="container flex flex-col items-center justify-between gap-4 py-10 md:h-24 md:flex-row md:py-0">
          <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
            <AppLogo iconSize={6} textSize="text-base" />
            <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
              &copy; {new Date().getFullYear()} {t('appName')}. {t('allRightsReserved')}.
            </p>
          </div>
          <nav className="flex gap-4 sm:gap-6">
            <Link href={`/${currentLocale}/security-info`} className="text-sm hover:underline underline-offset-4">{t('security')}</Link>
            <Link href={`/${currentLocale}/features`} className="text-sm hover:underline underline-offset-4">{t('featuresPageTitle')}</Link>
            <Link href={`/${currentLocale}/info-help`} className="text-sm hover:underline underline-offset-4">{t('help')}</Link>
            <Link href={`/${currentLocale}/terms`} className="text-sm hover:underline underline-offset-4">{t('termsOfService')}</Link>
            <Link href={`/${currentLocale}/privacy`} className="text-sm hover:underline underline-offset-4">{t('privacyPolicy')}</Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
