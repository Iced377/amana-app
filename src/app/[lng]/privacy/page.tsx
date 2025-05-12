
// src/app/[lng]/privacy/page.tsx
"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { AppLogo } from "@/components/AppLogo";
import { LanguageToggle } from "@/components/language-toggle"; // Import LanguageToggle
import { ModeToggle } from '@/components/mode-toggle'; // Import ModeToggle
import { usePathname } from "next/navigation";
import { fallbackLng, locales, type LocaleTypes } from '@/locales/settings';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function PrivacyPage() {
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
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
              Privacy Policy
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">Last Updated: {new Date().toLocaleDateString()}</p>
          </div>

          <Card className="max-w-4xl mx-auto shadow-md">
             <CardHeader>
                <CardTitle>Your Privacy Matters at Amana</CardTitle>
            </CardHeader>
            <CardContent>
                <ScrollArea className="h-[60vh] pr-4">
                    <div className="prose dark:prose-invert max-w-none text-muted-foreground">
                        <p>Amana ("us", "we", or "our") operates the Amana application (the "Service"). This page informs you of our policies regarding the collection, use, and disclosure of personal data when you use our Service and the choices you have associated with that data.</p>
                        <p>We use your data to provide and improve the Service. By using the Service, you agree to the collection and use of information in accordance with this policy. Unless otherwise defined in this Privacy Policy, terms used in this Privacy Policy have the same meanings as in our Terms of Service.</p>

                        <h2 className="text-xl font-semibold mt-6 mb-2 text-foreground">1. Information Collection and Use</h2>
                        <p>We collect several different types of information for various purposes to provide and improve our Service to you.</p>
                        
                        <h3 className="text-lg font-medium mt-4 mb-1 text-foreground">Types of Data Collected</h3>
                        <h4>Personal Data</h4>
                        <p>While using our Service, we may ask you to provide us with certain personally identifiable information that can be used to contact or identify you ("Personal Data"). Personally identifiable information may include, but is not limited to:</p>
                        <ul>
                            <li>Email address</li>
                            <li>First name and last name</li>
                            <li>Phone number (optional)</li>
                            <li>Usage Data (e.g., features used, interaction patterns)</li>
                            <li>Content you upload (e.g., documents, images, text for your legacy plan)</li>
                        </ul>

                        <h4>Usage Data</h4>
                        <p>We may also collect information on how the Service is accessed and used ("Usage Data"). This Usage Data may include information such as your computer's Internet Protocol address (e.g. IP address), browser type, browser version, the pages of our Service that you visit, the time and date of your visit, the time spent on those pages, unique device identifiers and other diagnostic data.</p>
                        
                        <h4>Tracking & Cookies Data</h4>
                        <p>We use cookies and similar tracking technologies to track the activity on our Service and hold certain information. Cookies are files with small amount of data which may include an anonymous unique identifier. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. However, if you do not accept cookies, you may not be able to use some portions of our Service.</p>


                        <h2 className="text-xl font-semibold mt-6 mb-2 text-foreground">2. Use of Data</h2>
                        <p>Amana uses the collected data for various purposes:</p>
                        <ul>
                            <li>To provide and maintain the Service</li>
                            <li>To notify you about changes to our Service</li>
                            <li>To allow you to participate in interactive features of our Service when you choose to do so</li>
                            <li>To provide customer care and support</li>
                            <li>To provide analysis or valuable information so that we can improve the Service</li>
                            <li>To monitor the usage of the Service</li>
                            <li>To detect, prevent and address technical issues</li>
                            <li>To manage your subscription and process payments</li>
                            <li>To facilitate the core functionality of legacy planning, including storing your data for posthumous release to designated beneficiaries according to your instructions.</li>
                        </ul>

                        <h2 className="text-xl font-semibold mt-6 mb-2 text-foreground">3. Storage and Security of Your Data</h2>
                        <p>The security of your data is important to us. We use Firebase (a Google Cloud service) for backend infrastructure, including authentication, database (Firestore), and storage (Firebase Storage).</p>
                        <p><strong>Uploaded Files:</strong> Files you upload are stored in Firebase Storage. We are committed to securing these files. While we previously implemented client-side encryption, this feature is currently under review. Regardless, server-side security measures are in place to protect data at rest and in transit (HTTPS/TLS).</p>
                        <p><strong>Metadata:</strong> Information about your files, beneficiaries, and account settings is stored in Firestore, which employs robust security practices.</p>
                        <p>Remember that no method of transmission over the Internet, or method of electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your Personal Data, we cannot guarantee its absolute security.</p>

                        <h2 className="text-xl font-semibold mt-6 mb-2 text-foreground">4. Data Retention</h2>
                        <p>Amana will retain your Personal Data and uploaded Content only for as long as is necessary for the purposes set out in this Privacy Policy and to provide the Service. We will retain and use your Personal Data to the extent necessary to comply with our legal obligations (for example, if we are required to retain your data to comply with applicable laws), resolve disputes, and enforce our legal agreements and policies.</p>
                        <p>Upon account deletion, we will take steps to delete your information from our active systems within a reasonable timeframe, subject to backup retention policies and legal obligations.</p>


                        <h2 className="text-xl font-semibold mt-6 mb-2 text-foreground">5. Disclosure Of Data</h2>
                        <p>Amana may disclose your Personal Data in the good faith belief that such action is necessary to:</p>
                        <ul>
                            <li>To comply with a legal obligation</li>
                            <li>To protect and defend the rights or property of Amana</li>
                            <li>To prevent or investigate possible wrongdoing in connection with the Service</li>
                            <li>To protect the personal safety of users of the Service or the public</li>
                            <li>To protect against legal liability</li>
                        </ul>
                         <p><strong>Posthumous Sharing:</strong> The core purpose of Amana is to share your designated information with your designated beneficiaries after your passing, according to the triggers and permissions you set up. This is a fundamental part of the Service you agree to when using Amana.</p>


                        <h2 className="text-xl font-semibold mt-6 mb-2 text-foreground">6. Service Providers</h2>
                        <p>We may employ third party companies and individuals to facilitate our Service ("Service Providers"), to provide the Service on our behalf, to perform Service-related services or to assist us in analyzing how our Service is used. These third parties have access to your Personal Data only to perform these tasks on our behalf and are obligated not to disclose or use it for any other purpose. Examples include Firebase (for infrastructure) and potentially Stripe (for payment processing).</p>

                        <h2 className="text-xl font-semibold mt-6 mb-2 text-foreground">7. Your Data Protection Rights</h2>
                        <p>Amana aims to take reasonable steps to allow you to correct, amend, delete, or limit the use of your Personal Data.</p>
                        <p>If you wish to be informed what Personal Data we hold about you and if you want it to be removed from our systems, please contact us. You can typically manage much of your data through your account settings.</p>
                        <p>In certain circumstances, you have the following data protection rights:</p>
                        <ul>
                            <li>The right to access, update or to delete the information we have on you.</li>
                            <li>The right of rectification.</li>
                            <li>The right to object.</li>
                            <li>The right of restriction.</li>
                            <li>The right to data portability.</li>
                            <li>The right to withdraw consent.</li>
                        </ul>

                        <h2 className="text-xl font-semibold mt-6 mb-2 text-foreground">8. Children's Privacy</h2>
                        <p>Our Service does not address anyone under the age of 18 ("Children"). We do not knowingly collect personally identifiable information from anyone under the age of 18. If you are a parent or guardian and you are aware that your Children has provided us with Personal Data, please contact us. If we become aware that we have collected Personal Data from children without verification of parental consent, we take steps to remove that information from our servers.</p>

                        <h2 className="text-xl font-semibold mt-6 mb-2 text-foreground">9. Changes To This Privacy Policy</h2>
                        <p>We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page. We will let you know via email and/or a prominent notice on our Service, prior to the change becoming effective and update the "last updated" date at the top of this Privacy Policy.</p>
                        <p>You are advised to review this Privacy Policy periodically for any changes. Changes to this Privacy Policy are effective when they are posted on this page.</p>

                        <h2 className="text-xl font-semibold mt-6 mb-2 text-foreground">Contact Us</h2>
                        <p>If you have any questions about this Privacy Policy, please contact us:</p>
                        <ul>
                            <li>Through the "Info & Help" section of the application</li>
                            <li>By email: privacy@amana.app (example email)</li>
                        </ul>
                    </div>
                </ScrollArea>
            </CardContent>
          </Card>
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
            <Link href={`/${currentLocale}/terms`} className="text-sm hover:underline underline-offset-4">Terms of Service</Link>
            <Link href={`/${currentLocale}/info-help`} className="text-sm hover:underline underline-offset-4">Help</Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
