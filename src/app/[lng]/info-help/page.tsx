
"use client"; // Required for usePathname

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { AppLogo } from "@/components/AppLogo";
import { BookOpen, ShieldQuestion, MessageSquare, FileText, LifeBuoy, HelpCircle } from "lucide-react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { fallbackLng, locales, type LocaleTypes } from '@/locales/settings';

const faqs = [
  {
    question: "How is my data secured?",
    answer: "We prioritize your data's security. All communication with our servers uses HTTPS/TLS encryption. We employ secure cloud infrastructure with industry-standard protections. For account access, we offer Two-Factor Authentication (2FA). Currently, files are uploaded securely to our servers but are not client-side encrypted on your device before upload. We are working on re-introducing client-side encryption for an added layer of privacy where only you can decrypt your files."
  },
  {
    question: "What is the difference between Islamic Mode and Conventional Mode?",
    answer: "Conventional Mode offers standard digital legacy planning. Islamic Mode (Wasiyyah/Faraid) aims to provide tools and information aligned with Islamic inheritance principles. This may include specific terminology, guidance on asset distribution according to Shariah, and flagging of non-compliant assets. *This feature is under development and should be used in consultation with a qualified Islamic scholar for legal and religious accuracy.*"
  },
  {
    question: "What documents should I prepare for my digital legacy?",
    answer: "Consider uploading your will, insurance policies, property deeds, investment details, important contracts, digital account credentials (stored securely), personal letters, photos, and videos. Our AI tagging can help you categorize them."
  },
  {
    question: "How are files shared with beneficiaries after my passing?",
    answer: "You designate trusted contacts who can initiate the 'death trigger'. Upon verification of your passing (a process we take very seriously), your designated beneficiaries will receive secure access ONLY to the specific files and information you assigned to them."
  },
  {
    question: "Can I change my beneficiaries or assigned files later?",
    answer: "Yes, you have full control to add, remove, or modify beneficiaries and their assigned assets at any time through your dashboard as long as you have access to your account."
  },
  {
    question: "What happens if I forget my password?",
    answer: "We use standard secure password recovery methods. It's crucial to keep your password and any recovery information safe. For features involving client-side encryption (if re-enabled in the future), losing your password AND recovery key could mean permanent loss of access to those specific encrypted files."
  }
];

export default function InfoHelpPage() {
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

      <main className="flex-1 py-12 md:py-20 lg:py-28">
        <div className="container px-4 md:px-6">
          <div className="text-center mb-12">
            <LifeBuoy className="h-16 w-16 text-primary mx-auto mb-4" />
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
              Information & Help Center
            </h1>
            <p className="mt-4 max-w-3xl mx-auto text-muted-foreground md:text-xl">
              Find answers to your questions, learn about digital legacy planning, and understand how Guardian Angel works.
            </p>
          </div>

          <div className="grid gap-12 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-8">
              <Card className="shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><BookOpen className="h-6 w-6 text-primary" /> Educational Resources</CardTitle>
                  <CardDescription>Learn more about securing your digital future.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Understanding Data Security</h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      Learn about account security, 2FA, and best practices for keeping your digital information safe. File uploads are stored securely on our servers.
                    </p>
                    <Image src="https://picsum.photos/seed/datasecurity/600/200" alt="Data security concept" width={600} height={200} className="rounded-lg object-cover aspect-[3/1]" data-ai-hint="cyber security lock" />
                     <Button variant="link" asChild className="mt-2"><Link href={`/${currentLocale}/security-info`}>Read more on our security</Link></Button>
                  </div>
                  <hr/>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Islamic vs. Conventional Inheritance</h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      An overview of key differences and considerations. For Islamic mode, we aim to align with principles like Wasiyyah (bequest) and Faraid (obligatory shares).
                      <em className="block mt-1 text-xs">Note: Guardian Angel provides tools, not legal or religious advice. Always consult qualified professionals.</em>
                    </p>
                     <div className="aspect-video bg-muted rounded-lg flex items-center justify-center my-2" data-ai-hint="inheritance infographic">
                        <p className="text-muted-foreground">Islamic Inheritance Info [Video/Infographic Placeholder]</p>
                    </div>
                  </div>
                  <hr/>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">What to Prepare Before Death</h3>
                     <p className="text-sm text-muted-foreground mb-2">
                      A checklist of important documents (wills, insurance), digital assets (photos, accounts), and personal messages to consider organizing in your vault.
                    </p>
                    <div className="bg-accent/20 p-4 rounded-md text-sm">
                        <ul className="list-disc list-inside space-y-1">
                            <li>Legal documents: Will, Power of Attorney, Trusts.</li>
                            <li>Financial Information: Bank accounts, investments, debts, insurance policies.</li>
                            <li>Digital Accounts: Login credentials for emails, social media (consider a password manager link).</li>
                            <li>Personal Files: Photos, videos, letters, final messages.</li>
                            <li>Instructions: Funeral wishes, care for pets, specific bequests.</li>
                        </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-md" id="contact">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><MessageSquare className="h-6 w-6 text-primary" /> Contact Support</CardTitle>
                  <CardDescription>Need further assistance? We're here to help.</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    If you can't find the answer in our FAQs or educational resources, please reach out to our support team.
                  </p>
                  <Button>Email Support</Button>
                  <p className="text-xs text-muted-foreground mt-2">
                    We typically respond within 24-48 business hours. For urgent security concerns, please mark your email as URGENT.
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-1 space-y-6">
               <Card className="shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><HelpCircle className="h-6 w-6 text-primary" /> Quick Links</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col space-y-2">
                    <Button variant="outline" asChild><Link href={`/${currentLocale}/pricing`}>View Pricing Plans</Link></Button>
                    <Button variant="outline" asChild><Link href={`/${currentLocale}/security-info`}>Our Security Measures</Link></Button>
                    <Button variant="outline" asChild><Link href={`/${currentLocale}/dashboard/settings`}>Account Settings</Link></Button>
                </CardContent>
              </Card>
              <Card className="shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><ShieldQuestion className="h-6 w-6 text-primary" /> Frequently Asked Questions</CardTitle>
                </CardHeader>
                <CardContent>
                  <Accordion type="single" collapsible className="w-full">
                    {faqs.map((faq, index) => (
                      <AccordionItem value={`item-${index}`} key={index}>
                        <AccordionTrigger>{faq.question}</AccordionTrigger>
                        <AccordionContent className="text-sm text-muted-foreground">
                          {faq.answer}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
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
            <Link href={`/${currentLocale}/pricing`} className="text-sm hover:underline underline-offset-4">Pricing</Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}

