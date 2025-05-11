
"use client"; 

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Users, ShieldCheck, UploadCloud, Clock, HardDrive, Landmark, Info, Unlock, Star, Gift } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useUserPreferences } from "@/context/UserPreferencesContext";
import { usePathname } from "next/navigation";
import type { LocaleTypes } from "@/locales/settings";

export default function DashboardPage() {
  const { profile } = useUserPreferences();
  const pathname = usePathname();
  const currentLocale = (pathname.split('/')[1] || 'en') as LocaleTypes;

  const vaultSummary = {
    totalFiles: 0, // Example initial value, ideally fetched
    storageUsed: "0 GB", 
    lastUpdate: new Date().toLocaleDateString(profile?.language || 'en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
    beneficiariesCount: 0, // Example initial value
  };

  // TODO: Fetch actual summary data from Firestore or state

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold md:text-3xl">Dashboard</h1>
        <Button asChild>
          <Link href={`/${currentLocale}/dashboard/my-files`}>
            <UploadCloud className="mr-2 rtl:ml-2 h-4 w-4" /> Upload New File
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Files</CardTitle>
            <FileText className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{vaultSummary.totalFiles}</div>
            <p className="text-xs text-muted-foreground">items in your vault</p>
          </CardContent>
        </Card>
        <Card className="shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Storage Used</CardTitle>
            <HardDrive className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{vaultSummary.storageUsed}</div>
            <p className="text-xs text-muted-foreground">of 10 GB (example limit)</p>
          </CardContent>
        </Card>
        <Card className="shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Beneficiaries</CardTitle>
            <Users className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{vaultSummary.beneficiariesCount}</div>
            <p className="text-xs text-muted-foreground">people assigned</p>
          </CardContent>
        </Card>
        <Card className="shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last Updated</CardTitle>
            <Clock className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{vaultSummary.lastUpdate}</div>
            <p className="text-xs text-muted-foreground">last activity in vault</p>
          </CardContent>
        </Card>
      </div>

      {profile?.mode === 'islamic' && (
        <Card className="shadow-md hover:shadow-lg transition-shadow bg-primary/5 dark:bg-primary/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Landmark className="h-6 w-6 text-primary" /> Islamic Legacy Planning</CardTitle>
            <CardDescription>Access tools for Wasiyyah and Faraid considerations in line with Islamic principles.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3"> 
            <p className="text-sm text-muted-foreground">
              You are currently in Islamic Mode. This enables features tailored for Islamic inheritance.
            </p>
            {profile.sadaqahEnabled && (
              <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30 p-3 rounded-md">
                <Gift className="h-5 w-5" /> 
                <p>
                  Your subscription supports Sadaqah ({profile.sadaqahPercentage || 1}% contribution) for those in need. JazakAllah Khair! 🌟
                </p>
              </div>
            )}
            <div className="flex flex-wrap gap-2"> 
                <Button variant="outline" asChild>
                    <Link href={`/${currentLocale}/dashboard/islamic-inheritance`}>Go to Islamic Inheritance</Link>
                </Button>
                 <Button variant="link" asChild className="text-xs p-0 h-auto"> 
                    <Link href={`/${currentLocale}/dashboard/settings`}>Manage Settings &amp; Sadaqah</Link>
                 </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="shadow-md hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Unlock className="h-6 w-6 text-primary" /> Security Overview</CardTitle>
            <CardDescription>Your vault is protected with various security measures. Ensure your account settings are up to date.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
             <div className="flex items-center justify-between p-3 bg-green-100 dark:bg-green-900/50 rounded-lg">
                <div>
                    <h3 className="font-semibold text-green-700 dark:text-green-300">File Security</h3>
                    <p className="text-sm text-green-600 dark:text-green-400">Your files are stored securely. Manage visibility per file in "My Files".</p>
                </div>
                <ShieldCheck className="h-8 w-8 text-green-500" />
            </div>
            <p className="text-sm text-muted-foreground">
              Ensure you use a strong password and consider enabling Two-Factor Authentication (2FA) in settings for account-level security.
            </p>
            <Button variant="outline" asChild>
                <Link href={`/${currentLocale}/dashboard/settings`}>Manage Security Settings</Link>
            </Button>
          </CardContent>
        </Card>
        
        <Card className="shadow-md hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle>Get Started with Your Legacy</CardTitle>
            <CardDescription>Follow these steps to ensure your digital assets are prepared.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">1</div>
              <div>
                <h4 className="font-semibold">Upload Your Important Files</h4>
                <p className="text-sm text-muted-foreground">Documents, photos, videos - secure them all.</p>
                <Button variant="link" className="p-0 h-auto text-sm" asChild><Link href={`/${currentLocale}/dashboard/my-files`}>Go to My Files</Link></Button>
              </div>
            </div>
             <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">2</div>
              <div>
                <h4 className="font-semibold">Add Your Beneficiaries</h4>
                <p className="text-sm text-muted-foreground">Designate who receives your assets.</p>
                 <Button variant="link" className="p-0 h-auto text-sm" asChild><Link href={`/${currentLocale}/dashboard/beneficiaries`}>Manage Beneficiaries</Link></Button>
              </div>
            </div>
             <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">3</div>
              <div>
                <h4 className="font-semibold">Set Up Your Death Trigger</h4>
                <p className="text-sm text-muted-foreground">Ensure your legacy is passed on as intended.</p>
                 <Button variant="link" className="p-0 h-auto text-sm" asChild><Link href={`/${currentLocale}/dashboard/shared-upon-death`}>Configure Trigger</Link></Button>
              </div>
            </div>
            {profile?.mode === 'islamic' && (
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">4</div>
                  <div>
                    <h4 className="font-semibold">Review Islamic Inheritance</h4>
                    <p className="text-sm text-muted-foreground">Explore Wasiyyah and Faraid planning tools.</p>
                    <Button variant="link" className="p-0 h-auto text-sm" asChild><Link href={`/${currentLocale}/dashboard/islamic-inheritance`}>Go to Islamic Planning</Link></Button>
                  </div>
                </div>
            )}
          </CardContent>
        </Card>
      </div>
       <Card className="shadow-md hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle>Need Help?</CardTitle>
            <CardDescription>Find resources and support to make the most of Amana.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col sm:flex-row gap-4 items-start">
            <Image src="https://picsum.photos/300/200?watu" alt="Support illustration" width={200} height={133} className="rounded-lg object-cover" data-ai-hint="support helpdesk"/>
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Our comprehensive FAQ and support guides can help you navigate the app and plan your digital legacy effectively.
              </p>
              <div className="flex gap-2">
                <Button variant="outline" asChild><Link href={`/${currentLocale}/info-help`}>View FAQs &amp; Guides</Link></Button>
                <Button variant="outline" asChild><Link href={`/${currentLocale}/info-help#contact`}>Contact Support</Link></Button>
              </div>
            </div>
          </CardContent>
        </Card>
    </div>
  );
}
