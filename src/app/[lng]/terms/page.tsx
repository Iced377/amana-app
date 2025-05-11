
// src/app/[lng]/terms/page.tsx
"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { AppLogo } from "@/components/AppLogo";
import { usePathname } from "next/navigation";
import { fallbackLng, locales, type LocaleTypes } from '@/locales/settings';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TermsPage() {
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
              Terms of Service
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">Last Updated: {new Date().toLocaleDateString()}</p>
          </div>

          <Card className="max-w-4xl mx-auto shadow-md">
            <CardHeader>
                <CardTitle>Welcome to Amana!</CardTitle>
            </CardHeader>
            <CardContent>
                <ScrollArea className="h-[60vh] pr-4">
                    <div className="prose dark:prose-invert max-w-none text-muted-foreground">
                        <p>Please read these Terms of Service ("Terms", "Terms of Service") carefully before using the Amana application (the "Service") operated by Amana ("us", "we", or "our").</p>

                        <p>Your access to and use of the Service is conditioned on your acceptance of and compliance with these Terms. These Terms apply to all visitors, users, and others who access or use the Service.</p>

                        <p>By accessing or using the Service you agree to be bound by these Terms. If you disagree with any part of the terms then you may not access the Service.</p>

                        <h2 className="text-xl font-semibold mt-6 mb-2 text-foreground">1. Accounts</h2>
                        <p>When you create an account with us, you must provide us information that is accurate, complete, and current at all times. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account on our Service.</p>
                        <p>You are responsible for safeguarding the password that you use to access the Service and for any activities or actions under your password, whether your password is with our Service or a third-party service.</p>
                        <p>You agree not to disclose your password to any third party. You must notify us immediately upon becoming aware of any breach of security or unauthorized use of your account.</p>

                        <h2 className="text-xl font-semibold mt-6 mb-2 text-foreground">2. Intellectual Property</h2>
                        <p>The Service and its original content (excluding Content provided by users), features and functionality are and will remain the exclusive property of Amana and its licensors. The Service is protected by copyright, trademark, and other laws of both Bahrain and foreign countries. Our trademarks and trade dress may not be used in connection with any product or service without the prior written consent of Amana.</p>

                        <h2 className="text-xl font-semibold mt-6 mb-2 text-foreground">3. User Content</h2>
                        <p>Our Service allows you to post, link, store, share and otherwise make available certain information, text, graphics, videos, or other material ("Content"). You are responsible for the Content that you post to the Service, including its legality, reliability, and appropriateness.</p>
                        <p>By posting Content to the Service, you grant us the right and license to use, modify, publicly perform, publicly display, reproduce, and distribute such Content on and through the Service for the purpose of operating and providing the Service. You retain any and all of your rights to any Content you submit, post or display on or through the Service and you are responsible for protecting those rights.</p>
                        <p>You represent and warrant that: (i) the Content is yours (you own it) or you have the right to use it and grant us the rights and license as provided in these Terms, and (ii) the posting of your Content on or through the Service does not violate the privacy rights, publicity rights, copyrights, contract rights or any other rights of any person.</p>

                        <h2 className="text-xl font-semibold mt-6 mb-2 text-foreground">4. Subscriptions and Payments</h2>
                        <p>Some parts of the Service are billed on a subscription basis ("Subscription(s)"). You will be billed in advance on a recurring and periodic basis ("Billing Cycle"). Billing cycles are set either on a monthly, quarterly, or annual basis, depending on the type of subscription plan you select when purchasing a Subscription.</p>
                        <p>At the end of each Billing Cycle, your Subscription will automatically renew under the exact same conditions unless you cancel it or Amana cancels it. You may cancel your Subscription renewal either through your online account management page or by contacting Amana customer support team.</p>
                        <p>A valid payment method, including credit card or PayPal, is required to process the payment for your Subscription. You shall provide Amana with accurate and complete billing information including full name, address, state, zip code, telephone number, and a valid payment method information. By submitting such payment information, you automatically authorize Amana to charge all Subscription fees incurred through your account to any such payment instruments.</p>
                        <p>Should automatic billing fail to occur for any reason, Amana will issue an electronic invoice indicating that you must proceed manually, within a certain deadline date, with the full payment corresponding to the billing period as indicated on the invoice.</p>
                        <p><strong>VAT:</strong> For users in Bahrain, Value Added Tax (VAT) at the prevailing rate (currently 10%) may be applied to your subscription fees if our annual sales exceed the mandatory registration threshold as stipulated by Bahraini law (currently BHD 37,500, which is approximately USD 100,000). We will clearly indicate if VAT is included in your pricing at the time of purchase or on your invoice.</p>


                        <h2 className="text-xl font-semibold mt-6 mb-2 text-foreground">5. Fee Changes</h2>
                        <p>Amana, in its sole discretion and at any time, may modify the Subscription fees for the Subscriptions. Any Subscription fee change will become effective at the end of        the then-current Billing Cycle. Amana will provide you with a reasonable prior notice of any change in Subscription fees to give you an opportunity to terminate your Subscription before such change becomes effective.</p>
                        <p>Your continued use of the Service after the Subscription fee change comes into effect constitutes your agreement to pay the modified Subscription fee amount.</p>

                        <h2 className="text-xl font-semibold mt-6 mb-2 text-foreground">6. Refunds</h2>
                        <p>Except when required by law, paid Subscription fees are non-refundable. Certain refund requests for Subscriptions may be considered by Amana on a case-by-case basis and granted in sole discretion of Amana. We offer a 30-day money-back guarantee for new subscribers on paid plans.</p>

                        <h2 className="text-xl font-semibold mt-6 mb-2 text-foreground">7. Limitation Of Liability</h2>
                        <p>In no event shall Amana, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from (i) your access to or use of or inability to access or use the Service; (ii) any conduct or content of any third party on the Service; (iii) any content obtained from the Service; and (iv) unauthorized access, use or alteration of your transmissions or content, whether based on warranty, contract, tort (including negligence) or any other legal theory, whether or not we have been informed of the possibility of such damage, and even if a remedy set forth herein is found to have failed of its essential purpose.</p>
                        <p><strong>Disclaimer for Islamic Mode:</strong> The Islamic Mode feature in Amana, including tools related to Wasiyyah (bequest) and Faraid (Islamic inheritance calculation), is provided for informational and organizational purposes only. It is not intended to be, and should not be taken as, legal, financial, or religious advice. Islamic inheritance laws are complex and can vary based on jurisdiction and individual circumstances. Amana is not qualified to provide such advice. You are solely responsible for ensuring that your estate planning aligns with Islamic principles and applicable legal requirements. We strongly recommend consulting with qualified Islamic scholars and legal professionals specializing in Islamic estate planning before making any decisions based on information or tools provided by the Islamic Mode feature.</p>


                        <h2 className="text-xl font-semibold mt-6 mb-2 text-foreground">8. Disclaimer</h2>
                        <p>Your use of the Service is at your sole risk. The Service is provided on an "AS IS" and "AS AVAILABLE" basis. The Service is provided without warranties of any kind, whether express or implied, including, but not limited to, implied warranties of merchantability, fitness for a particular purpose, non-infringement or course of performance.</p>
                        <p>Amana its subsidiaries, affiliates, and its licensors do not warrant that a) the Service will function uninterrupted, secure or available at any particular time or location; b) any errors or defects will be corrected; c) the Service is free of viruses or other harmful components; or d) the results of using the Service will meet your requirements.</p>


                        <h2 className="text-xl font-semibold mt-6 mb-2 text-foreground">9. Governing Law</h2>
                        <p>These Terms shall be governed and construed in accordance with the laws of the Kingdom of Bahrain, without regard to its conflict of law provisions.</p>
                        <p>Our failure to enforce any right or provision of these Terms will not be considered a waiver of those rights. If any provision of these Terms is held to be invalid or unenforceable by a court, the remaining provisions of these Terms will remain in effect. These Terms constitute the entire agreement between us regarding our Service, and supersede and replace any prior agreements we might have between us regarding the Service.</p>

                        <h2 className="text-xl font-semibold mt-6 mb-2 text-foreground">10. Changes</h2>
                        <p>We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material we will try to provide at least 30 days notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion.</p>
                        <p>By continuing to access or use our Service after those revisions become effective, you agree to be bound by the revised terms. If you do not agree to the new terms, please stop using the Service.</p>

                        <h2 className="text-xl font-semibold mt-6 mb-2 text-foreground">Contact Us</h2>
                        <p>If you have any questions about these Terms, please contact us via the "Info & Help" section of the application or by emailing support@amana.app (example email).</p>
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
            <Link href={`/${currentLocale}/privacy`} className="text-sm hover:underline underline-offset-4">Privacy Policy</Link>
            <Link href={`/${currentLocale}/info-help`} className="text-sm hover:underline underline-offset-4">Help</Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
