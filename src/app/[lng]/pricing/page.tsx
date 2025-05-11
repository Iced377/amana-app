
"use client"; // Required for usePathname

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, ShieldCheck, Star, Gift } from "lucide-react"; // Added Gift
import Link from "next/link";
import { AppLogo } from "@/components/AppLogo"; // AppLogo import
import { usePathname } from "next/navigation"; // For currentLocale
import { fallbackLng, locales, type LocaleTypes } from '@/locales/settings'; // For currentLocale

const plans = [
  {
    name: "Monthly",
    price: "$9.99",
    billingCycle: "/month",
    features: ["Secure 10 GB Storage", "AI File Tagging", "Beneficiary Management", "Death Trigger", "Email Support"],
    cta: "Choose Monthly",
    popular: false,
  },
  {
    name: "Quarterly",
    price: "$19.99",
    billingCycle: "/quarter",
    originalPrice: "$29.97",
    savings: "Save 33%",
    features: ["Secure 25 GB Storage", "All Monthly Features", "Priority Email Support", "Early Access to New Features"],
    cta: "Choose Quarterly",
    popular: true,
  },
  {
    name: "Yearly",
    price: "$199.99",
    billingCycle: "/year",
    originalPrice: "$239.88", 
    savings: "Save ~17% vs Quarterly", 
    features: ["Secure 100 GB Storage", "All Quarterly Features", "Phone & Chat Support", "Advanced Security Options"],
    cta: "Choose Yearly",
    popular: false,
  },
    {
    name: "Bi-Yearly",
    price: "$299.99",
    billingCycle: "/2 years",
    savings: "Best Value: Save ~25% vs Yearly",
    features: ["Secure 250 GB Storage", "All Yearly Features", "Dedicated Account Manager", "Customizable Reporting"],
    cta: "Choose Bi-Yearly",
    popular: false,
  },
  {
    name: "Lifetime",
    price: "$499.99",
    billingCycle: "one-time payment",
    features: ["Unlimited Storage (fair use)", "All Bi-Yearly Features", "Lifetime Updates & Support", "Exclusive Community Access"],
    cta: "Get Lifetime Access",
    popular: false,
    limited: "Limited to first 500 users!",
  },
];

export default function PricingPage() {
  const pathname = usePathname();
  let currentLocale: LocaleTypes = fallbackLng;

  if (pathname) {
    const segments = pathname.split('/');
    if (segments.length > 1 && locales.includes(segments[1] as LocaleTypes)) {
      currentLocale = segments[1] as LocaleTypes;
    }
  }
  
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
           <AppLogo /> {/* AppLogo now determines locale internally */}
          <div className="flex items-center gap-2">
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
                Choose a subscription that fits your needs and secure your digital legacy today. All paid plans come with a 30-day money-back guarantee.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 items-start">
              {plans.map((plan) => (
                <Card key={plan.name} className={`shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col ${plan.popular ? 'border-primary border-2 relative' : ''}`}>
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-3 py-1 text-sm font-semibold rounded-full shadow-md">
                      Popular
                    </div>
                  )}
                  <CardHeader className="pb-4 text-center">
                    <CardTitle className="text-2xl">{plan.name}</CardTitle>
                    {plan.limited && <p className="text-sm text-destructive font-semibold">{plan.limited}</p>}
                    <div className="mt-2">
                      <span className="text-4xl font-bold">{plan.price}</span>
                      <span className="text-muted-foreground">{plan.billingCycle}</span>
                    </div>
                    {plan.originalPrice && (
                      <p className="text-sm text-muted-foreground line-through">{plan.originalPrice}</p>
                    )}
                    {plan.savings && (
                      <p className="text-sm text-green-600 dark:text-green-400 font-medium">{plan.savings}</p>
                    )}
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <ul className="space-y-2">
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex items-start">
                          <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 shrink-0" />
                          <span className="text-sm text-muted-foreground">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  <CardFooter className="mt-auto">
                    <Button className="w-full" size="lg" variant={plan.popular ? 'default' : 'outline'}>
                      {plan.cta}
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>

            <Card className="mt-12 shadow-md bg-primary/5 dark:bg-primary/10 border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Gift className="h-6 w-6 text-primary"/> Support a Cause with Your Subscription</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Guardian Angel offers a Sadaqah (charitable giving) option for users in Islamic Mode. If you enable this feature in your account settings, a portion of your subscription fee will be automatically donated to support reputable charitable causes, such as those assisting orphans and widows.
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  This is an optional way to make your subscription even more meaningful. You can manage this preference at any time in your account settings after signing up.
                </p>
                 <Button variant="link" asChild className="p-0 h-auto mt-2">
                    <Link href={`/${currentLocale}/info-help#islamic-mode`}>Learn more about Islamic Mode</Link>
                 </Button>
              </CardContent>
            </Card>
            
            <div className="mt-16 text-center">
              <h2 className="text-2xl font-semibold">Already have an account?</h2>
              <p className="text-muted-foreground mt-2">
                You can upgrade your plan anytime from your dashboard settings.
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
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">Why Choose Guardian Angel?</h2>
                 <p className="mt-4 max-w-3xl mx-auto text-muted-foreground md:text-lg">
                    We are committed to providing a secure, reliable, and user-friendly platform for managing your digital legacy, with features designed for everyone, including options aligning with Islamic principles.
                </p>
            </div>
            <div className="mt-10 grid grid-cols-1 gap-8 md:grid-cols-3">
                <div className="flex flex-col items-center text-center">
                    <ShieldCheck className="h-12 w-12 text-primary mb-4" />
                    <h3 className="text-xl font-semibold">Bank-Level Security</h3>
                    <p className="mt-2 text-muted-foreground text-sm">Client-side encryption, 2FA, and robust infrastructure to protect your sensitive data.</p>
                </div>
                <div className="flex flex-col items-center text-center">
                    <Star className="h-12 w-12 text-primary mb-4" /> 
                    <h3 className="text-xl font-semibold">Inclusive by Design</h3>
                    <p className="mt-2 text-muted-foreground text-sm">Optional Islamic Mode for Wasiyyah and Faraid considerations, plus multi-language support including Arabic.</p>
                </div>
                <div className="flex flex-col items-center text-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary mb-4"><path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/><path d="M2 20h20"/><path d="M18 20a2 2 0 0 0 2-2V8l-4 4-4-4v10a2 2 0 0 0 2 2h4Z"/></svg>
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
              &copy; {new Date().getFullYear()} Guardian Angel. All rights reserved.
            </p>
          </div>
          <nav className="flex gap-4 sm:gap-6">
            <Link href={`/${currentLocale}/security-info`} className="text-sm hover:underline underline-offset-4">Security</Link>
            <Link href={`/${currentLocale}/info-help`} className="text-sm hover:underline underline-offset-4">Help</Link>
            <Link href="#" className="text-sm hover:underline underline-offset-4">Terms</Link> {/* Update to /${currentLocale}/terms when page exists */}
            <Link href="#" className="text-sm hover:underline underline-offset-4">Privacy</Link> {/* Update to /${currentLocale}/privacy when page exists */}
          </nav>
        </div>
      </footer>
    </div>
  );
}

