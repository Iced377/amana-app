
"use client";

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, ShieldCheck, Star, Gift, Percent, Info } from "lucide-react"; // Added Info
import Link from "next/link";
import { AppLogo } from "@/components/AppLogo";
import { LanguageToggle } from "@/components/language-toggle"; // Import LanguageToggle
import { ModeToggle } from '@/components/mode-toggle'; // Import ModeToggle
import { usePathname } from "next/navigation";
import { fallbackLng, locales, type LocaleTypes } from '@/locales/settings';
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { cn } from '@/lib/utils';

const planDetails = {
  standard: {
    name: "Standard",
    monthlyPrice: 9.99,
    annualPrice: 99.99,
    features: [
      "Document vault with encryption",
      "Smart tagging (AI)",
      "Assign beneficiaries",
      "Visibility control (private, upon death, share immediately)",
      "10 GB storage"
    ],
    annualSavingsPercent: 17, 
  },
  premium: {
    name: "Premium",
    monthlyPrice: 19.99,
    annualPrice: 149.99,
    features: [
      "All Standard features, plus:",
      "Unlimited storage",
      "Posthumous file release via inactivity or trusted contact",
      "AI transcription of voice/video",
      "Sentiment detection on legacy messages",
      "Death trigger settings",
      "Islamic inheritance calculator",
      "Priority support"
    ],
    annualSavingsPercent: 37, 
    popular: true,
  },
  lifetime: {
    name: "Lifetime Plan",
    oneTimePrice: 399.00,
    features: [
      "All Premium features",
      "One-time payment, lifetime access",
      "Future updates included",
    ],
    badge: "Early Adopter — Lifetime Access",
    limitText: "Limited to first 200 users!",
  }
};


export default function PricingPage() {
  const pathname = usePathname();
  let currentLocale: LocaleTypes = fallbackLng;

  if (pathname) {
    const segments = pathname.split('/');
    if (segments.length > 1 && locales.includes(segments[1] as LocaleTypes)) {
      currentLocale = segments[1] as LocaleTypes;
    }
  }

  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annually'>('annually');

  const getDisplayedMonthlyRate = (plan: 'standard' | 'premium') => {
    return billingCycle === 'annually' 
      ? (planDetails[plan].annualPrice / 12) 
      : planDetails[plan].monthlyPrice;
  };
  
  const getBilledAsText = (plan: 'standard' | 'premium') => {
     if (billingCycle === 'annually') {
        return `Billed $${planDetails[plan].annualPrice.toFixed(2)} annually`;
     }
     return `Billed $${planDetails[plan].monthlyPrice.toFixed(2)} monthly`;
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
           <AppLogo /> 
          <div className="flex items-center gap-2">
            <LanguageToggle /> {/* Added LanguageToggle */}
            <ModeToggle /> {/* Added ModeToggle */}
            <Button asChild variant="ghost">
              <Link href={`/${currentLocale}/login`}>Login</Link>
            </Button>
            <Button asChild>
              <Link href={`/${currentLocale}/signup`}>Sign Up</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="py-12 md:py-20 lg:py-28">
          <div className="container px-4 md:px-6">
            <div className="text-center mb-12">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                Find the Perfect Plan for Your Peace of Mind
              </h1>
              <p className="mt-4 max-w-2xl mx-auto text-muted-foreground md:text-xl">
                Your legacy. Protected. Delivered when it matters most.
                Choose a subscription that fits your needs and secure your digital legacy today.
              </p>
            </div>

            <div className="flex justify-center items-center gap-4 mb-10">
              <Label htmlFor="billing-cycle-toggle" className={cn(billingCycle === 'monthly' ? 'text-primary font-semibold' : 'text-muted-foreground')}>Monthly</Label>
              <Switch
                id="billing-cycle-toggle"
                checked={billingCycle === 'annually'}
                onCheckedChange={(checked) => setBillingCycle(checked ? 'annually' : 'monthly')}
                aria-label="Toggle billing cycle"
              />
              <Label htmlFor="billing-cycle-toggle" className={cn(billingCycle === 'annually' ? 'text-primary font-semibold' : 'text-muted-foreground')}>
                Annually <span className="text-sm text-green-600 dark:text-green-400 font-medium"> (Save up to {planDetails.premium.annualSavingsPercent}%)</span>
              </Label>
            </div>


            <div className="grid grid-cols-1 gap-6 md:grid-cols-1 lg:grid-cols-3 items-stretch">
              {/* Standard Plan */}
              <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col">
                <CardHeader className="pb-4 text-center">
                  <CardTitle className="text-2xl">{planDetails.standard.name}</CardTitle>
                  <div className="mt-2">
                    <span className="text-4xl font-bold">${getDisplayedMonthlyRate('standard').toFixed(2)}</span>
                    <span className="text-muted-foreground">/month</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{getBilledAsText('standard')}</p>
                  {billingCycle === 'annually' && (
                     <p className="text-sm text-green-600 dark:text-green-400 font-medium mt-1">Save ~{planDetails.standard.annualSavingsPercent}%</p>
                  )}
                </CardHeader>
                <CardContent className="flex-grow">
                  <ul className="space-y-2">
                    {planDetails.standard.features.map((feature) => (
                      <li key={feature} className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 shrink-0" />
                        <span className="text-sm text-muted-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter className="mt-auto">
                  <Button className="w-full" size="lg" variant="outline">
                    Choose Plan
                  </Button>
                </CardFooter>
              </Card>

              {/* Premium Plan */}
              <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col border-primary border-2 relative">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-3 py-1 text-sm font-semibold rounded-full shadow-md">
                  Most Popular
                </div>
                <CardHeader className="pb-4 text-center pt-8">
                  <CardTitle className="text-2xl">{planDetails.premium.name}</CardTitle>
                  <div className="mt-2">
                    <span className="text-4xl font-bold">${getDisplayedMonthlyRate('premium').toFixed(2)}</span>
                    <span className="text-muted-foreground">/month</span>
                  </div>
                   <p className="text-xs text-muted-foreground mt-1">{getBilledAsText('premium')}</p>
                   {billingCycle === 'annually' && (
                     <p className="text-sm text-green-600 dark:text-green-400 font-medium mt-1">Save ~{planDetails.premium.annualSavingsPercent}%</p>
                  )}
                </CardHeader>
                <CardContent className="flex-grow">
                  <ul className="space-y-2">
                    {planDetails.premium.features.map((feature, index) => (
                      <li key={feature} className="flex items-start">
                         {index === 0 ? <Star className="h-5 w-5 text-yellow-500 mr-2 mt-0.5 shrink-0" /> : <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 shrink-0" /> }
                        <span className="text-sm text-muted-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter className="mt-auto">
                  <Button className="w-full" size="lg">
                    Choose Plan
                  </Button>
                </CardFooter>
              </Card>
              
              {/* Lifetime Plan */}
              <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col">
                 <CardHeader className="pb-4 text-center">
                   <div className="absolute -top-2.5 right-1.5 transform rotate-[15deg]">
                     <span className="inline-block bg-destructive text-destructive-foreground px-2 py-0.5 text-xs font-semibold rounded-full shadow-md">
                       {planDetails.lifetime.limitText}
                     </span>
                   </div>
                  <CardTitle className="text-2xl mt-2">{planDetails.lifetime.name}</CardTitle>
                   <p className="text-sm text-primary font-semibold mt-1">{planDetails.lifetime.badge}</p>
                  <div className="mt-2">
                    <span className="text-4xl font-bold">${planDetails.lifetime.oneTimePrice.toFixed(2)}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">One-time payment</p>
                </CardHeader>
                <CardContent className="flex-grow">
                  <ul className="space-y-2">
                    {planDetails.lifetime.features.map((feature) => (
                      <li key={feature} className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 shrink-0" />
                        <span className="text-sm text-muted-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter className="mt-auto">
                  <Button className="w-full" size="lg" variant="outline">
                    Get Lifetime Access
                  </Button>
                </CardFooter>
              </Card>
            </div>
            
            <div className="text-center mt-12 space-y-2">
                <p className="text-sm text-muted-foreground">
                    All prices are in USD.
                </p>
                 <p className="text-xs text-muted-foreground">
                    VAT at 10% may apply for customers in Bahrain.
                </p>
                <p className="text-xs text-muted-foreground">
                    30-day money-back guarantee on all paid plans.
                </p>
                <p className="text-sm text-muted-foreground mt-4">
                    <Link href={`/${currentLocale}/features`} className="text-primary hover:underline">
                        Compare all features in detail
                    </Link>
                </p>
            </div>

            <Card className="mt-12 shadow-md bg-primary/5 dark:bg-primary/10 border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Gift className="h-6 w-6 text-primary"/> Support a Cause with Your Subscription</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Amana offers a Sadaqah (charitable giving) option for users in Islamic Mode. If you enable this feature in your account settings, a portion of your subscription fee (1%, 5%, or 10%) will be automatically donated to support reputable charitable causes.
                </p>
                 <Button variant="link" asChild className="p-0 h-auto mt-2">
                    <Link href={`/${currentLocale}/dashboard/settings`}>Manage Sadaqah Settings</Link>
                 </Button>
              </CardContent>
            </Card>
            
            <div className="mt-16 text-center">
              <h2 className="text-2xl font-semibold">Already have an account?</h2>
              <p className="text-muted-foreground mt-2">
                You can manage your subscription anytime from your dashboard settings.
              </p>
              <Button asChild className="mt-4">
                <Link href={`/${currentLocale}/dashboard/settings`}>Go to Settings</Link>
              </Button>
            </div>

          </div>
        </section>
         <section className="py-12 md:py-20 bg-secondary/30">
          <div className="container px-4 md:px-6">
            <div className="text-center">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">Why Choose Amana?</h2>
                 <p className="mt-4 max-w-3xl mx-auto text-muted-foreground md:text-lg">
                    We are committed to providing a secure, reliable, and user-friendly platform for managing your digital legacy, with features designed for everyone, including options aligning with Islamic principles.
                </p>
            </div>
            <div className="mt-10 grid grid-cols-1 gap-8 md:grid-cols-3">
                <div className="flex flex-col items-center text-center">
                    <ShieldCheck className="h-12 w-12 text-primary mb-4" />
                    <h3 className="text-xl font-semibold">Robust Security</h3>
                    <p className="mt-2 text-muted-foreground text-sm">Secure infrastructure, 2FA, and data protection measures to protect your sensitive data.</p>
                </div>
                <div className="flex flex-col items-center text-center">
                    <Star className="h-12 w-12 text-primary mb-4" /> 
                    <h3 className="text-xl font-semibold">Inclusive by Design</h3>
                    <p className="mt-2 text-muted-foreground text-sm">Optional Islamic Mode for Wasiyyah and Faraid considerations, plus multi-language support including Arabic.</p>
                </div>
                <div className="flex flex-col items-center text-center">
                     <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-primary mb-4"><path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/><path d="M2 20h20"/><path d="M18 20a2 2 0 0 0 2-2V8l-4 4-4-4v10a2 2 0 0 0 2 2h4Z"/></svg>
                    <h3 className="text-xl font-semibold">Future-Proof Your Legacy</h3>
                    <p className="mt-2 text-muted-foreground text-sm">Comprehensive tools for beneficiary management, asset assignment, and secure post-humous distribution.</p>
                </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t">
        <div className="container flex flex-col items-center justify-between gap-4 py-10 md:h-24 md:flex-row md:py-0">
          <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
            <AppLogo iconSize={6} textSize="text-base" />
            <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
              &copy; {new Date().getFullYear()} Amana. All rights reserved.
            </p>
          </div>
          <nav className="flex gap-4 sm:gap-6">
            <Link href={`/${currentLocale}/security-info`} className="text-sm hover:underline underline-offset-4">Security</Link>
            <Link href={`/${currentLocale}/info-help`} className="text-sm hover:underline underline-offset-4">Help</Link>
            <Link href={`/${currentLocale}/terms`} className="text-sm hover:underline underline-offset-4">Terms</Link> 
            <Link href={`/${currentLocale}/privacy`} className="text-sm hover:underline underline-offset-4">Privacy</Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
