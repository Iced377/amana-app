
"use client"; // Required for usePathname

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ShieldCheck, Lock, KeyRound, DatabaseZap, Users, ShieldAlert, Info } from "lucide-react";
import Image from "next/image";
import { AppLogo } from "@/components/AppLogo";
import { LanguageToggle } from "@/components/language-toggle"; // Import LanguageToggle
import { ModeToggle } from '@/components/mode-toggle'; // Import ModeToggle
import { usePathname } from "next/navigation"; // For currentLocale
import { fallbackLng, locales, type LocaleTypes } from '@/locales/settings'; // For currentLocale


export default function SecurityInfoPage() {
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

      <main className="flex-1 py-12 md:py-20 lg:py-28">
        <div className="container px-4 md:px-6">
          <div className="text-center mb-12">
            <ShieldCheck className="h-16 w-16 text-primary mx-auto mb-4" />
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
              Why Amana is Safe
            </h1>
            <p className="mt-4 max-w-3xl mx-auto text-muted-foreground md:text-xl">
              Your trust and the security of your digital legacy are our highest priorities. We employ multiple layers of protection to safeguard your sensitive information.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Info className="h-6 w-6 text-primary" /> File Upload Security Note</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Files uploaded to your vault are stored securely. Our server-side storage is protected with industry best practices. We ensure that data at rest and in transit is handled with care.
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Lock className="h-6 w-6 text-primary" /> Account and Transmission Security</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  All data transmitted between your device and our servers is protected using HTTPS/TLS, ensuring it cannot be intercepted. Your account access is protected by your password, and we strongly recommend enabling Two-Factor Authentication (2FA).
                </p>
              </CardContent>
            </Card>
            
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><ShieldAlert className="h-6 w-6 text-primary" /> Two-Factor Authentication (2FA)</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Add an extra layer of security to your account by enabling 2FA. This requires a second form of verification (e.g., a code from your email or authenticator app) in addition to your password, making it significantly harder for unauthorized users to access your account.
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><DatabaseZap className="h-6 w-6 text-primary" /> Secure Infrastructure</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  We leverage robust cloud infrastructure (e.g., Firebase/Google Cloud) with industry-standard security practices, including regular security audits, intrusion detection systems, and data redundancy to protect against data loss and unauthorized access to our systems.
                </p>
              </CardContent>
            </Card>
            
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Users className="h-6 w-6 text-primary" /> Controlled Access &amp; Sharing</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                   You have complete control over who can access your information. Beneficiary assignments and the death trigger mechanism are designed to ensure that your assets are shared only with the individuals you designate, and only under the conditions you specify.
                </p>
              </CardContent>
            </Card>

             <Card className="shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-primary"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/><path d="m9 12 2 2 4-4"/></svg> Privacy by Design</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  We are committed to your privacy. We collect only the necessary data to provide our services and are transparent about how your information is used. 
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="mt-16 text-center">
            <h2 className="text-2xl font-semibold">Your Responsibility</h2>
            <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
              While we provide robust security measures, account security is a shared responsibility. Use a strong, unique password for Amana, enable 2FA, and be cautious about phishing attempts.
            </p>
            <Button asChild className="mt-6" size="lg">
              <Link href={`/${currentLocale}/signup`}>Create Your Secure Account</Link>
            </Button>
             <p className="mt-4">
                <Link href={`/${currentLocale}/dashboard/settings`} className="text-sm text-primary hover:underline">
                    Review your security settings
                </Link>
             </p>
          </div>
          
          <div className="mt-16">
            <Card className="bg-secondary/50">
                <CardContent className="p-6 flex flex-col md:flex-row items-center gap-6">
                    <Image src="https://picsum.photos/seed/securefuture/300/200" alt="Abstract security" width={200} height={133} className="rounded-lg object-cover" data-ai-hint="cyber security"/>
                    <div>
                        <h3 className="text-xl font-semibold mb-2">Continuous Improvement</h3>
                        <p className="text-muted-foreground text-sm">
                            The digital security landscape is always evolving. We are committed to continuously monitoring threats, updating our security practices, and incorporating new technologies to ensure Amana remains a safe haven for your digital legacy. If you have any security concerns or suggestions, please don't hesitate to <Link href={`/${currentLocale}/info-help#contact`} className="text-primary hover:underline">contact us</Link>.
                        </p>
                    </div>
                </CardContent>
            </Card>
          </div>

        </div>
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
            <Link href={`/${currentLocale}/info-help`} className="text-sm hover:underline underline-offset-4">Help Center</Link>
            <Link href={`/${currentLocale}/pricing`} className="text-sm hover:underline underline-offset-4">Pricing</Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
