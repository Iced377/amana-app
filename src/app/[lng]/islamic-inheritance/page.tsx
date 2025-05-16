"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Landmark, BookOpen, Info, Users } from "lucide-react";
import Link from "next/link";
import { useUserPreferences } from "@/context/UserPreferencesContext";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import Image from "next/image";
import type { LocaleTypes } from "@/locales/settings";

export default function IslamicInheritancePage() {
  const { profile, isLoading } = useUserPreferences();
  const router = useRouter();
  const pathname = usePathname();
  const currentLocale = (pathname.split('/')[1] || 'en') as LocaleTypes;

  useEffect(() => {
    if (!isLoading && profile?.mode !== 'islamic') {
      console.warn("Accessing Islamic Inheritance page without Islamic mode enabled.");
      // Uncomment below if you want to redirect users without Islamic mode
      // router.push(`/${currentLocale}/dashboard`);
    }
  }, [profile, isLoading, router, currentLocale]);

  if (isLoading) return <p>Loading Islamic inheritance settings...</p>;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold md:text-3xl flex items-center gap-2">
          <Landmark className="h-8 w-8 text-primary" /> Islamic Inheritance Planning (Wasiyyah &amp; Faraid)
        </h1>
        <p className="text-muted-foreground">
          Tools and information to help you plan your legacy according to Islamic principles.
        </p>
      </div>

      <Card className="shadow-md bg-amber-50 dark:bg-amber-900/30 border-amber-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-amber-700 dark:text-amber-300">
            <Info className="h-6 w-6" /> Important Disclaimer
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-amber-700 dark:text-amber-400">
            Amana provides informational tools and guidance. We are not qualified to offer legal or religious advice.
            <strong> Always consult with a qualified Islamic scholar and a legal professional </strong>
            specializing in Islamic estate planning to ensure your arrangements are compliant and legally sound in your jurisdiction.
          </p>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>Wasiyyah (Bequest)</CardTitle>
            <CardDescription>
              Designate up to one-third of your estate for non-heirs or charitable causes.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              The Wasiyyah is a voluntary bequest that allows you to specify how a portion of your assets should be distributed. This section will help you document your Wasiyyah intentions.
            </p>
            <Image
              src="https://picsum.photos/seed/wasiyyah/400/200"
              alt="Islamic calligraphy for Wasiyyah"
              width={400}
              height={200}
              className="rounded-md object-cover"
              data-ai-hint="Islamic calligraphy scroll"
            />
            <Button disabled>Document Your Wasiyyah (Coming Soon)</Button>
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>Faraid (Obligatory Shares)</CardTitle>
            <CardDescription>
              Understand the fixed shares for designated heirs as per Islamic law.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Faraid outlines the specific shares of your estate that must be distributed to your rightful Islamic heirs (e.g., spouse, children, parents). This section will provide information and tools to help identify heirs and their potential shares.
            </p>
            <Image
              src="https://picsum.photos/seed/faraid/400/200"
              alt="Diagram representing Faraid distribution"
              width={400}
              height={200}
              className="rounded-md object-cover"
              data-ai-hint="family tree diagram"
            />
            <Button disabled>Faraid Calculator &amp; Heir Identification (Coming Soon)</Button>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-6 w-6 text-primary" /> Identifying Your Islamic Heirs
          </CardTitle>
          <CardDescription>
            List potential heirs according to Islamic guidelines.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Use this section to list individuals who may be considered your Islamic heirs (warathah). This information can be used with Faraid calculation tools and for your legal advisor.
          </p>
          <div className="p-4 border rounded-md bg-secondary/30">
            <p className="text-muted-foreground">
              Heir management tools coming soon. (e.g., Add Spouse, Add Son, Add Daughter, Add Father, Add Mother, etc.)
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-primary" /> Learn More
          </CardTitle>
          <CardDescription>
            Resources for understanding Islamic inheritance.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            It's highly recommended to educate yourself on these important matters.
          </p>
          <Button variant="link" asChild>
            <Link href={`/${currentLocale}/info-help#islamic-inheritance`}>
              Read Our Guide on Islamic Inheritance
            </Link>
          </Button>
          <p className="text-xs text-muted-foreground">
            (This will link to relevant sections in the Info &amp; Help page.)
          </p>
          <p className="text-sm text-muted-foreground">
            Consider these external resources (Amana is not responsible for external content):
          </p>
          <ul className="list-disc list-inside text-sm space-y-1 pl-4">
            <li>
              <Link href="#" className="text-primary hover:underline">
                Resource on Wasiyyah (Example Link)
              </Link>
            </li>
            <li>
              <Link href="#" className="text-primary hover:underline">
                Resource on Faraid (Example Link)
              </Link>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
