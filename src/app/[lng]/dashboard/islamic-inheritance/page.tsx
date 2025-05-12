"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Landmark, BookOpen, Info, Users, Calculator } from "lucide-react"; // Added Calculator icon
import Link from "next/link";
import { useUserPreferences } from "@/context/UserPreferencesContext";
import { useRouter, usePathname } from "next/navigation"; 
import { useEffect } from "react";
import Image from "next/image";
import type { LocaleTypes } from "@/locales/settings"; 
import { useTranslation } from "@/locales/client";


export default function IslamicInheritancePage() {
  const { profile, isLoading } = useUserPreferences();
  const router = useRouter();
  const pathname = usePathname(); 
  const currentLocale = (pathname.split('/')[1] || 'en') as LocaleTypes; 
  const { t } = useTranslation(currentLocale, "translation");


  useEffect(() => {
    if (!isLoading && profile?.mode !== 'islamic') {
      console.warn("Accessing Islamic Inheritance page without Islamic mode enabled.");
      // router.push(`/${currentLocale}/dashboard`); 
    }
  }, [profile, isLoading, router, currentLocale]);

  if (isLoading) return <p>{t('loadingIslamicSettings')}</p>;


  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold md:text-3xl flex items-center gap-2">
          <Landmark className="h-8 w-8 text-primary" /> {t('islamicInheritancePageTitle')}
        </h1>
        <p className="text-muted-foreground">
          {t('islamicInheritancePageDesc')}
        </p>
      </div>

      <Card className="shadow-md bg-primary/5 dark:bg-primary/20 border-primary/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-primary"><Calculator className="h-6 w-6" /> {t('faraidCalculatorIntroTitle')}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-primary/90 mb-4">
            {t('faraidCalculatorIntroDesc')}
          </p>
          <Button asChild>
            <Link href={`/${currentLocale}/dashboard/islamic-inheritance/calculator`}>
              <Calculator className="mr-2 rtl:ml-2 h-4 w-4" /> {t('goToFaraidCalculatorButton')}
            </Link>
          </Button>
        </CardContent>
      </Card>

      <Card className="shadow-md bg-amber-50 dark:bg-amber-900/30 border-amber-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-amber-700 dark:text-amber-300"><Info className="h-6 w-6" /> {t('importantDisclaimerTitle')}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-amber-700 dark:text-amber-400">
            {t('importantDisclaimerContent')}
          </p>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>{t('wasiyyahTitle')}</CardTitle>
            <CardDescription>{t('wasiyyahDesc')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {t('wasiyyahExplanation')}
            </p>
            <Image src="https://picsum.photos/seed/wasiyyah/400/200" alt={t('altWasiyyahCalligraphy')} width={400} height={200} className="rounded-md object-cover" data-ai-hint="Islamic calligraphy scroll"/>
            <Button disabled>{t('documentWasiyyahButton')} ({t('comingSoon')})</Button>
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>{t('faraidTitle')}</CardTitle>
            <CardDescription>{t('faraidDesc')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
             {t('faraidExplanation')}
            </p>
             <Image src="https://picsum.photos/seed/faraid/400/200" alt={t('altFaraidDiagram')} width={400} height={200} className="rounded-md object-cover" data-ai-hint="family tree diagram"/>
            <Button asChild>
                <Link href={`/${currentLocale}/dashboard/islamic-inheritance/calculator`}>
                     <Calculator className="mr-2 rtl:ml-2 h-4 w-4" /> {t('faraidCalculatorAndHeirButton')}
                </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
      
      <Card className="shadow-md">
        <CardHeader>
            <CardTitle className="flex items-center gap-2"><Users className="h-6 w-6 text-primary"/> {t('identifyHeirsTitle')}</CardTitle>
            <CardDescription>{t('identifyHeirsDesc')}</CardDescription>
        </CardHeader>
        <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
                {t('identifyHeirsExplanation')}
            </p>
            <div className="p-4 border rounded-md bg-secondary/30">
                <p className="text-muted-foreground">{t('heirManagementComingSoon')}</p>
            </div>
        </CardContent>
      </Card>

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><BookOpen className="h-6 w-6 text-primary" /> {t('learnMoreTitle')}</CardTitle>
          <CardDescription>{t('learnMoreDesc')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            {t('learnMoreEducationImportance')}
          </p>
          <Button variant="link" asChild><Link href={`/${currentLocale}/info-help#islamic-inheritance`}>{t('readOurGuideButton')}</Link></Button>
          <p className="text-xs text-muted-foreground">
            {t('infoHelpLinkNote')}
          </p>
          <p className="text-sm text-muted-foreground">{t('externalResourcesNote')}</p>
          <ul className="list-disc list-inside text-sm space-y-1 pl-4 rtl:pr-4 rtl:pl-0">
            <li><Link href="#" className="text-primary hover:underline">{t('wasiyyahResourceLinkExample')}</Link></li>
            <li><Link href="#" className="text-primary hover:underline">{t('faraidResourceLinkExample')}</Link></li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}