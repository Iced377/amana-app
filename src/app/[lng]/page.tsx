
// Make this a client component to use usePathname or pass locale as prop if server-side
"use client"; 
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { ShieldCheck, Lock, Users, UploadCloud, BrainCircuit, Package } from "lucide-react";
import Image from "next/image";
import { ModeToggle } from "@/components/mode-toggle";
import { usePathname } from 'next/navigation'; 
import { fallbackLng, locales, type LocaleTypes } from '@/locales/settings'; 
import { AppLogo } from "@/components/AppLogo";

export default function HomePage() {
  const pathname = usePathname();
  let currentLocale: LocaleTypes = fallbackLng; 

  if (pathname) {
    const segments = pathname.split('/');
    if (segments.length > 1 && locales.includes(segments[1] as LocaleTypes)) {
      currentLocale = segments[1] as LocaleTypes;
    }
  }
  
  return (
    <div className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <AppLogo />
          <div className="flex items-center gap-2">
            <ModeToggle />
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
        <section className="py-12 md:py-24 lg:py-32 bg-gradient-to-b from-background to-secondary/30">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                    Secure Your Digital Legacy with Amana
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    Safeguard your important documents, precious memories, and final wishes. Ensure your digital assets are passed on securely and privately to your loved ones.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Button asChild size="lg">
                    <Link href={`/${currentLocale}/signup`}>Get Started for Free</Link>
                  </Button>
                  <Button asChild variant="outline" size="lg">
                    <Link href={`/${currentLocale}/#features`}>Learn More</Link>
                  </Button>
                </div>
              </div>
              <Image
                src="https://picsum.photos/600/400?grayscale"
                alt="Abstract representation of digital legacy"
                width={600}
                height={400}
                className="mx-auto aspect-video overflow-hidden rounded-xl object-cover sm:w-full lg:order-last lg:aspect-square shadow-lg"
                data-ai-hint="digital security abstract"
              />
            </div>
          </div>
        </section>

        <section id="features" className="py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-secondary px-3 py-1 text-sm text-secondary-foreground">Key Features</div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Everything You Need to Protect Your Legacy</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Amana provides a comprehensive suite of tools to manage and secure your digital assets for the future.
                </p>
              </div>
            </div>
            <div className="mx-auto grid items-start gap-8 sm:max-w-4xl sm:grid-cols-2 md:gap-12 lg:max-w-5xl lg:grid-cols-3">
              <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-md">
                      <UploadCloud className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle>Secure Upload Vault</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Upload documents, images, and videos to your personal vault for safekeeping.
                  </p>
                </CardContent>
              </Card>
              <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3">
                     <div className="p-2 bg-primary/10 rounded-md">
                       <BrainCircuit className="h-6 w-6 text-primary" />
                     </div>
                    <CardTitle>AI-Powered File Tagging</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    AI automatically tags files (e.g., 'Insurance', 'Will', 'Personal') for easy organization.
                  </p>
                </CardContent>
              </Card>
              <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardHeader className="pb-4">
                   <div className="flex items-center gap-3">
                     <div className="p-2 bg-primary/10 rounded-md">
                       <Users className="h-6 w-6 text-primary" />
                     </div>
                    <CardTitle>Beneficiary Management</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Assign files to specific beneficiaries. Manage who receives what, ensuring your wishes are honored.
                  </p>
                </CardContent>
              </Card>
              <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-md">
                      <Lock className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle>Death Trigger Mechanism</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Allow trusted contacts to initiate the process of distributing your digital assets according to your plans.
                  </p>
                </CardContent>
              </Card>
               <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-md">
                      <Package className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle>Secure Storage</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Your data is stored securely with robust infrastructure and access controls.
                  </p>
                </CardContent>
              </Card>
               <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-md">
                       <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-primary"><path d="M17 14V4.5C17 3.67 16.33 3 15.5 3H11.5C10.67 3 10 3.67 10 4.5V10L7.12 14.12C6.43 15.01 7.01 16.27 8 16.63V19.5C8 20.33 8.67 21 9.5 21H14.5C15.33 21 16 20.33 16 19.5V16.63C16.99 16.27 17.57 15.01 16.88 14.12L14 10V4.5H15.5V10L17 14Z"/><path d="M12 15L12 16"/></svg>
                    </div>
                    <CardTitle>Islamic Mode</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Optional mode to tailor features according to Islamic inheritance principles (Wasiyyah, Faraid).
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section className="py-12 md:py-24 lg:py-32 bg-secondary/30">
          <div className="container grid items-center justify-center gap-4 px-4 text-center md:px-6">
            <div className="space-y-3">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
                Ready to Secure Your Digital Future?
              </h2>
              <p className="mx-auto max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Join Amana today and gain peace of mind knowing your digital legacy is protected.
              </p>
            </div>
            <div className="mx-auto w-full max-w-sm space-y-2">
              <Button asChild size="lg" className="w-full">
                <Link href={`/${currentLocale}/signup`}>Sign Up Now</Link>
              </Button>
              <p className="text-xs text-muted-foreground">
                Free to start. No credit card required.
                 <Link href={`/${currentLocale}/pricing`} className="text-primary hover:underline ml-1">View plans</Link>
              </p>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t">
        <div className="container flex flex-col items-center justify-between gap-4 py-10 md:h-24 md:flex-row md:py-0">
          <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
            <AppLogo iconSize={6} textSize="text-base" showText={false} />
            <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
              &copy; {new Date().getFullYear()} Amana. All rights reserved.
            </p>
          </div>
          <nav className="flex gap-4 sm:gap-6">
            <Link href={`/${currentLocale}/security-info`} className="text-sm hover:underline underline-offset-4">Security</Link>
            <Link href={`/${currentLocale}/info-help`} className="text-sm hover:underline underline-offset-4">Help</Link>
            <Link href={`/${currentLocale}/terms`} className="text-sm hover:underline underline-offset-4">Terms of Service</Link>
            <Link href={`/${currentLocale}/privacy`} className="text-sm hover:underline underline-offset-4">Privacy Policy</Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
