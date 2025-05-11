
"use client";

import type React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import Link from "next/link";
import { AppLogo } from "@/components/AppLogo";
import { Check, HelpCircle, X, ShieldCheck, Info } from "lucide-react";
import { usePathname } from "next/navigation";
import { fallbackLng, locales, type LocaleTypes } from '@/locales/settings';
import { useTranslation } from '@/locales/client';
import { cn } from "@/lib/utils";

interface FeatureDetail {
  id: string;
  nameKey: string;
  standard: string | boolean;
  premium: string | boolean;
  notesKey?: string;
  islamicOnly?: boolean; 
}

const featuresData: FeatureDetail[] = [
  { id: "vault", nameKey: "featureEncryptedVault", standard: true, premium: true, notesKey: "featureEncryptedVaultNote" },
  { id: "aiTagging", nameKey: "featureAiTagging", standard: true, premium: true, notesKey: "featureAiTaggingNote" },
  { id: "visibility", nameKey: "featureVisibilitySettings", standard: true, premium: true, notesKey: "featureVisibilitySettingsNote" },
  { id: "beneficiaries", nameKey: "featureAssignBeneficiaries", standard: true, premium: true, notesKey: "featureAssignBeneficiariesNote" },
  { id: "arabic", nameKey: "featureArabicSupport", standard: true, premium: true, notesKey: "featureArabicSupportNote" },
  { id: "islamicMode", nameKey: "featureIslamicMode", standard: true, premium: true, notesKey: "featureIslamicModeNote" },
  { id: "uploadLimit", nameKey: "featureUploadLimit", standard: "featureUploadLimitStandard", premium: "featureUploadLimitPremium", notesKey: "featureUploadLimitNote" },
  { id: "deathTrigger", nameKey: "featureDeathTrigger", standard: false, premium: true, notesKey: "featureDeathTriggerNote" },
  { id: "transcription", nameKey: "featureVoiceVideoTranscription", standard: false, premium: true, notesKey: "featureVoiceVideoTranscriptionNote" },
  { id: "toneDetection", nameKey: "featureEmotionalToneDetection", standard: false, premium: true, notesKey: "featureEmotionalToneDetectionNote" },
  { id: "islamicCalculator", nameKey: "featureIslamicCalculator", standard: false, premium: true, notesKey: "featureIslamicCalculatorNote", islamicOnly: true },
  { id: "prioritySupport", nameKey: "featurePrioritySupport", standard: false, premium: true, notesKey: "featurePrioritySupportNote" },
];

const FeatureValueDisplay: React.FC<{value: string | boolean, t: Function}> = ({ value, t }) => {
  if (typeof value === 'boolean') {
    return value ? <Check className="h-5 w-5 text-green-500" /> : <X className="h-5 w-5 text-red-500" />;
  }
  return <span className="text-sm">{t(value)}</span>;
};


export default function FeaturesPage() {
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
    <div className="flex flex-col min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <AppLogo />
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost">
              <Link href={`/${currentLocale}/login`}>{t('login')}</Link>
            </Button>
            <Button asChild>
              <Link href={`/${currentLocale}/signup`}>{t('signUp')}</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 py-12 md:py-20 lg:py-24">
        <div className="container px-4 md:px-6">
          <div className="text-center mb-12 md:mb-16">
             <div className="inline-block rounded-lg bg-primary/10 px-4 py-2 text-sm font-medium text-primary mb-4">
               {t('featuresCalloutText')}
            </div>
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
              {t('featuresPageTitle')}
            </h1>
            <p className="mt-4 max-w-3xl mx-auto text-muted-foreground md:text-xl">
              {t('featuresPageSubtitle')}
            </p>
          </div>

          {/* Mobile View: List of Cards/Sections */}
          <div className="md:hidden space-y-6">
            {featuresData.map((feature) => (
              <Card key={feature.id} className="shadow-md">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    {t(feature.nameKey)}
                    {feature.notesKey && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{t(feature.notesKey)} {feature.islamicOnly && `(${t('islamicModeOnlyNote')})`}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{t('standardPlanName')}:</span>
                    <FeatureValueDisplay value={feature.standard} t={t} />
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{t('premiumPlanName')}:</span>
                    <FeatureValueDisplay value={feature.premium} t={t} />
                  </div>
                  {feature.notesKey && (
                     <p className="text-xs text-muted-foreground pt-1 md:hidden">
                        {t(feature.notesKey)} {feature.islamicOnly && `(${t('islamicModeOnlyNote')})`}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Desktop View: Table */}
          <div className="hidden md:block">
            <Card className="shadow-xl">
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[35%] text-base">{t('featureColumnHeader')}</TableHead>
                      <TableHead className="text-center text-base">{t('standardPlanName')}</TableHead>
                      <TableHead className="text-center text-base relative">
                        {t('premiumPlanName')}
                        <span className="absolute top-0 right-0 -mt-3 transform translate-x-1/2 bg-primary text-primary-foreground px-2 py-0.5 text-xs font-semibold rounded-full">
                          {t('mostPopularBadge')}
                        </span>
                      </TableHead>
                      <TableHead className="w-[35%] text-base">{t('notesColumnHeader')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {featuresData.map((feature) => (
                      <TableRow key={feature.id}>
                        <TableCell className="font-medium">{t(feature.nameKey)}</TableCell>
                        <TableCell className="text-center">
                          <FeatureValueDisplay value={feature.standard} t={t} />
                        </TableCell>
                        <TableCell className="text-center">
                           <FeatureValueDisplay value={feature.premium} t={t} />
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {feature.notesKey ? t(feature.notesKey) : ''}
                          {feature.islamicOnly && (
                            <span className="block text-xs text-primary/80">
                              ({t('islamicModeOnlyNote')})
                            </span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>

          <div className="mt-12 text-center">
            <p className="text-muted-foreground mb-4">
                {t('readyToSecureLegacy')}
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Button size="lg" asChild>
                    <Link href={`/${currentLocale}/pricing`}>{t('viewPricingButton')}</Link>
                </Button>
            </div>
          </div>
           <Card className="mt-16 bg-secondary/50 border-primary/30">
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Info className="h-6 w-6 text-primary"/> {t('noteOnIslamicFeaturesTitle')}</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-muted-foreground">
                    {t('noteOnIslamicFeaturesDesc')}
                </p>
            </CardContent>
           </Card>
        </div>
      </main>

      <footer className="border-t mt-auto">
        <div className="container flex flex-col items-center justify-between gap-4 py-10 md:h-24 md:flex-row md:py-0">
          <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
            <AppLogo iconSize={6} textSize="text-base" />
            <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
              &copy; {new Date().getFullYear()} {t('appName')}. {t('allRightsReserved')}.
            </p>
          </div>
          <nav className="flex gap-4 sm:gap-6">
            <Link href={`/${currentLocale}/security-info`} className="text-sm hover:underline underline-offset-4">{t('security')}</Link>
            <Link href={`/${currentLocale}/pricing`} className="text-sm hover:underline underline-offset-4">{t('pricingTitle')}</Link>
            <Link href={`/${currentLocale}/info-help`} className="text-sm hover:underline underline-offset-4">{t('help')}</Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}

    