// src/app/[lng]/page.tsx
"use client"; 
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { ShieldCheck, Lock, Users, UploadCloud, BrainCircuit, Package, BookOpen, MessageSquare, HeartHandshake, CalendarClock, Globe, CheckCircle, Info, MoonStar } from "lucide-react";
import Image from "next/image";
import { ModeToggle } from "@/components/mode-toggle";
import { usePathname } from 'next/navigation'; 
import { fallbackLng, locales, type LocaleTypes } from '@/locales/settings'; 
import { AppLogo } from "@/components/AppLogo";
import { useTranslation } from '@/locales/client';
import { cn } from "@/lib/utils";

const featureIcons = {
  upload: UploadCloud,
  tag: BrainCircuit,
  decide: ShieldCheck,
  deliver: Package,
};

const carouselItems = [
  { src: "https://picsum.photos/seed/secureletter/400/300", altKey: "altLetter", hint: "secure message" },
  { src: "https://picsum.photos/seed/protectedfamily/400/300", altKey: "altFamilyPhoto", hint: "protected memories" },
  { src: "https://picsum.photos/seed/privatevideo/400/300", altKey: "altVideoMessage", hint: "private video" },
  { src: "https://picsum.photos/seed/safedocs/400/300", altKey: "altInsuranceDoc", hint: "safe documents" },
  { src: "https://picsum.photos/seed/spiritualpeace/400/300", altKey: "altQuranVerse", hint: "spiritual peace" },
];

const differentiators = [
  "differentiatorPosthumousSharing",
  "differentiatorAIEmotion",
  "differentiatorLangSupport",
  "differentiatorLegacyCalendar",
  "differentiatorSmartVault",
];

export default function HomePage() {
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
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <AppLogo />
          <div className="flex items-center gap-2">
            <ModeToggle />
            <Button asChild variant="ghost">
              <Link href={`/${currentLocale}/login`}>{t('login')}</Link>
            </Button>
            <Button asChild>
              <Link href={`/${currentLocale}/signup`}>{t('signUp')}</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-16 md:py-24 lg:py-32 bg-gradient-to-b from-background to-secondary/20 dark:from-background dark:to-secondary/10">
          <div className="container px-4 md:px-6">
            <div className="grid gap-8 lg:grid-cols-2 lg:gap-12 items-center">
              <div className="flex flex-col justify-center space-y-6 text-center lg:text-left">
                <h1 className="text-4xl font-bold tracking-tight sm:text-5xl xl:text-6xl/none">
                  {t('landingHeroTitle')}
                </h1>
                <p className="max-w-[600px] text-muted-foreground md:text-xl mx-auto lg:mx-0">
                  {t('landingHeroSubtitle')}
                </p>
                <div className="flex flex-col gap-3 min-[400px]:flex-row justify-center lg:justify-start">
                  <Button asChild size="lg" className="shadow-md">
                    <Link href={`/${currentLocale}/signup`}>{t('landingHeroCTAStartFree')}</Link>
                  </Button>
                  <Button asChild variant="outline" size="lg" className="shadow-sm">
                    <Link href={`/${currentLocale}/#how-it-works`}>{t('landingHeroCTAHowItWorks')}</Link>
                  </Button>
                </div>
                <div className="mt-4 text-center lg:text-left">
                    <span className="inline-flex items-center gap-2 rounded-full bg-green-100 dark:bg-green-900/30 px-4 py-2 text-sm font-medium text-green-700 dark:text-green-300">
                        <Lock className="h-4 w-4" /> {t('landingHeroBadgePrivate')}
                    </span>
                </div>
              </div>
              <Image
                src="https://picsum.photos/seed/peacefularabic/600/500"
                alt={t('altLegacyHero')}
                width={600}
                height={500}
                className="mx-auto aspect-[6/5] overflow-hidden rounded-xl object-cover sm:w-full shadow-xl"
                data-ai-hint="peaceful arabic"
              />
            </div>
          </div>
        </section>

        {/* Legacy Isn’t Just Documents */}
        <section className="py-16 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6 text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl mb-6">
              {t('landingNarrativeTitle')}
            </h2>
            <p className="max-w-3xl mx-auto text-muted-foreground md:text-xl mb-10">
              {t('landingNarrativeParagraph')}
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
              {carouselItems.map((item, index) => (
                <div key={index} className="aspect-square overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition-shadow">
                  <Image
                    src={item.src}
                    alt={t(item.altKey)}
                    width={200}
                    height={200}
                    className="object-cover w-full h-full"
                    data-ai-hint={item.hint}
                  />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section id="how-it-works" className="py-16 md:py-24 lg:py-32 bg-secondary/20 dark:bg-secondary/10">
          <div className="container px-4 md:px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">{t('landingHowItWorksTitle')}</h2>
            </div>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
              {[
                { id: 'upload', icon: featureIcons.upload, titleKey: 'landingHowItWorksUploadTitle', descKey: 'landingHowItWorksUploadDesc' },
                { id: 'tag', icon: featureIcons.tag, titleKey: 'landingHowItWorksTagTitle', descKey: 'landingHowItWorksTagDesc' },
                { id: 'decide', icon: featureIcons.decide, titleKey: 'landingHowItWorksDecideTitle', descKey: 'landingHowItWorksDecideDesc' },
                { id: 'deliver', icon: featureIcons.deliver, titleKey: 'landingHowItWorksDeliverTitle', descKey: 'landingHowItWorksDeliverDesc' },
              ].map((step) => {
                const Icon = step.icon;
                return (
                  <Card key={step.id} className="text-center shadow-lg hover:shadow-xl transition-shadow p-6">
                    <div className="flex justify-center mb-4">
                        <div className="p-3 bg-primary/10 rounded-full">
                            <Icon className="h-8 w-8 text-primary" />
                        </div>
                    </div>
                    <h3 className="text-xl font-semibold mb-2">{t(step.titleKey)}</h3>
                    <p className="text-sm text-muted-foreground">{t(step.descKey)}</p>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* Faith-Based Legacy Planning */}
        <section className="py-16 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="grid gap-8 lg:grid-cols-2 lg:gap-16 items-center">
              <div className="order-2 lg:order-1">
                <Image
                  src="https://picsum.photos/seed/serenelegacy/500/400"
                  alt={t('altIslamicFaith')}
                  width={500}
                  height={400}
                  className="rounded-xl object-cover shadow-xl"
                  data-ai-hint="serene guidance peaceful faith"
                />
              </div>
              <div className="space-y-6 order-1 lg:order-2 text-center lg:text-left">
                <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
                  {t('landingFaithBasedTitle')}
                </h2>
                <p className="text-muted-foreground md:text-lg">
                  {t('landingFaithBasedParagraph')}
                </p>
                <div className="flex justify-center lg:justify-start">
                    <span className="inline-flex items-center gap-2 rounded-full bg-green-100 dark:bg-green-900/30 px-4 py-2 text-sm font-medium text-green-700 dark:text-green-300">
                        <MoonStar className="h-4 w-4" /> {t('landingFaithBasedBadgeCertified')}
                    </span>
                </div>
                 <p className="text-sm text-muted-foreground text-center lg:text-left">
                  {t('landingFaithBasedLanguagePrompt')}{' '}
                  <Link href={`/${currentLocale === 'en' ? 'ar' : 'en'}${pathname.substring(3)}`} className="text-primary hover:underline">
                    {currentLocale === 'en' ? t('arabic') : t('english')}
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* What Makes Amana Different */}
        <section id="features" className="py-16 md:py-24 lg:py-32 bg-secondary/20 dark:bg-secondary/10">
          <div className="container px-4 md:px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">{t('landingDifferentiatorsTitle')}</h2>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {differentiators.map((key, index) => (
                <Card key={index} className="p-6 shadow-lg hover:shadow-xl transition-shadow">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                    <p className="text-muted-foreground">{t(key)}</p>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Start Free */}
        <section className="py-16 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6 text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl mb-4">
              {t('landingStartFreeTitle')}
            </h2>
            <p className="max-w-2xl mx-auto text-muted-foreground md:text-xl mb-8">
             {t('landingStartFreeParagraph')}
            </p>
            <div className="flex flex-col gap-3 sm:flex-row justify-center">
              <Button asChild variant="outline" size="lg" className="shadow-sm">
                <Link href={`/${currentLocale}/features`}>{t('landingStartFreeCTASample')}</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Final Callout */}
        <section className="py-16 md:py-24 lg:py-32 bg-primary text-primary-foreground">
          <div className="container px-4 md:px-6 text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl mb-6">
              {t('landingFinalCalloutTitle')}
            </h2>
            <div className="flex flex-col gap-3 sm:flex-row justify-center">
              <Button asChild size="lg" variant="secondary" className="shadow-md">
                <Link href={`/${currentLocale}/signup`}>{t('landingFinalCalloutCTABegin')}</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t bg-background">
        <div className="container flex flex-col items-center justify-between gap-4 py-10 md:h-24 md:flex-row md:py-0">
          <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
            <AppLogo iconSize={6} textSize="text-base" />
            <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
              &copy; {new Date().getFullYear()} {t('appName')}. {t('allRightsReserved')}.
            </p>
          </div>
          <nav className="flex gap-4 sm:gap-6">
            <Link href={`/${currentLocale}/security-info`} className="text-sm hover:underline underline-offset-4">{t('security')}</Link>
            <Link href={`/${currentLocale}/features`} className="text-sm hover:underline underline-offset-4">{t('featuresPageTitle')}</Link>
            <Link href={`/${currentLocale}/info-help`} className="text-sm hover:underline underline-offset-4">{t('help')}</Link>
            <Link href={`/${currentLocale}/terms`} className="text-sm hover:underline underline-offset-4">{t('termsOfService')}</Link>
            <Link href={`/${currentLocale}/privacy`} className="text-sm hover:underline underline-offset-4">{t('privacyPolicy')}</Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}

// Add keys to translation files:
// landingHeroTitle: "Your story deserves to outlive you."
// landingHeroSubtitle: "Preserve what truly matters. Amana helps you share your memories, instructions, and legacy — securely and in your own time."
// landingHeroCTAStartFree: "Start Free"
// landingHeroCTAHowItWorks: "How It Works"
// landingHeroBadgePrivate: "Private by default. Nothing shared unless you choose."
// altLegacyHero: "Symbolic image of a legacy being preserved and passed on."
// landingNarrativeTitle: "We don’t just leave assets. We leave meaning."
// landingNarrativeParagraph: "A whispered prayer. A recorded goodbye. A deed to your home. A letter for your daughter’s wedding. Amana lets you preserve these things — for the right people, at the right time."
// altLetter: "A handwritten letter"
// altFamilyPhoto: "A cherished family photograph"
// altVideoMessage: "A personal video message being recorded or played"
// altInsuranceDoc: "An important insurance document"
// altQuranVerse: "Calligraphy of a Quranic verse about remembrance or legacy"
// landingHowItWorksTitle: "How Amana Works"
// landingHowItWorksUploadTitle: "1. Securely Upload"
// landingHowItWorksUploadDesc: "Add your documents, videos, or voice notes. All stored securely with us."
// landingHowItWorksTagTitle: "2. Tag & Assign"
// landingHowItWorksTagDesc: "Choose who receives what, and when. Organize with smart AI-powered tags."
// landingHowItWorksDecideTitle: "3. Decide Visibility"
// landingHowItWorksDecideDesc: "Keep private, share now, or set for release only upon your passing."
// landingHowItWorksDeliverTitle: "4. Let Amana Deliver"
// landingHowItWorksDeliverDesc: "Through inactivity detection, trusted contact initiation, or your faith-based inheritance flow."
// landingFaithBasedTitle: "Built for Trust. Certified for Faith."
// landingFaithBasedParagraph: "Amana’s Islamic Mode was developed in consultation with certified Shariah Advisors, supporting major Islamic schools of thought. It includes inheritance logic (Faraid), Wasiyyah tools, and guidance for ethical digital closure."
// landingFaithBasedBadgeCertified: "Certified by Shariah Advisors"
// altIslamicFaith: "Image representing Islamic faith, like a mosque or prayer beads"
// landingFaithBasedLanguagePrompt: "View this page in"
// landingDifferentiatorsTitle: "When you're no longer here, your voice still can be."
// differentiatorPosthumousSharing: "Posthumous sharing via verified death triggers."
// differentiatorAIEmotion: "AI emotion detection for legacy messages (Premium)."
// differentiatorLangSupport: "Full Arabic and English support with RTL."
// differentiatorLegacyCalendar: "Legacy calendar: schedule messages for future key dates (Premium)."
// differentiatorSmartVault: "Smart vault for family guidance, legal peace, and spiritual clarity."
// landingStartFreeTitle: "Start building your legacy — it costs nothing to begin."
// landingStartFreeParagraph: "You can add your first memories, messages, and essential documents today. Upgrade only if you need more space or advanced features. Your privacy is always protected."
// landingStartFreeCTACreate: "Create My Vault"
// landingStartFreeCTASample: "View Features" // Changed from Sample Vault to Features page
// landingFinalCalloutTitle: "Start writing the part of your story they’ll read when you’re gone."
// landingFinalCalloutCTABegin: "Begin For Free"
// landingFinalCalloutCTAWhy: "Why Amana?"
// termsOfService: "Terms of Service"
// privacyPolicy: "Privacy Policy"

// For Arabic (ar/translation.json)
// landingHeroTitle: "قصتك تستحق أن تبقى بعدك."
// landingHeroSubtitle: "احفظ ما هو مهم حقًا. أمانة يساعدك على مشاركة ذكرياتك، تعليماتك، وإرثك - بأمان وفي الوقت الذي تختاره."
// landingHeroCTAStartFree: "ابدأ مجانًا"
// landingHeroCTAHowItWorks: "كيف يعمل"
// landingHeroBadgePrivate: "خاص تلقائيًا. لا شيء يُشارك إلا باختيارك."
// altLegacyHero: "صورة رمزية لإرث يتم الحفاظ عليه وتمريره."
// landingNarrativeTitle: "نحن لا نترك أصولًا فقط. نحن نترك معنى."
// landingNarrativeParagraph: "دعاءٌ يُهمس. وداعٌ مُسجل. صك ملكية منزلك. رسالة لزفاف ابنتك. أمانة يتيح لك الحفاظ على هذه الأشياء - للأشخاص المناسبين، في الوقت المناسب."
// altLetter: "رسالة مكتوبة بخط اليد"
// altFamilyPhoto: "صورة عائلية عزيزة"
// altVideoMessage: "رسالة فيديو شخصية يتم تسجيلها أو تشغيلها"
// altInsuranceDoc: "وثيقة تأمين هامة"
// altQuranVerse: "خط لآية قرآنية عن الذكر أو الإرث"
// landingHowItWorksTitle: "كيف يعمل أمانة"
// landingHowItWorksUploadTitle: "١. ارفع بأمان"
// landingHowItWorksUploadDesc: "أضف مستنداتك، مقاطع الفيديو، أو الملاحظات الصوتية. كلها مخزنة بأمان لدينا."
// landingHowItWorksTagTitle: "٢. علّم وعيّن"
// landingHowItWorksTagDesc: "اختر من يتلقى ماذا، ومتى. نظم باستخدام علامات ذكية مدعومة بالذكاء الاصطناعي."
// landingHowItWorksDecideTitle: "٣. قرر الرؤية"
// landingHowItWorksDecideDesc: "احتفظ بالخصوصية، شارك الآن، أو اضبط للإفراج فقط عند وفاتك."
// landingHowItWorksDeliverTitle: "٤. دع أمانة يوصل"
// landingHowItWorksDeliverDesc: "من خلال كشف عدم النشاط، مبادرة الاتصال الموثوق به، أو تدفق الميراث المبني على الإيمان."
// landingFaithBasedTitle: "مبني على الثقة. معتمد للإيمان."
// landingFaithBasedParagraph: "تم تطوير وضع أمانة الإسلامي بالتشاور مع مستشارين شرعيين معتمدين، ويدعم المذاهب الإسلامية الرئيسية. يتضمن منطق الميراث (الفرائض)، أدوات الوصية، وإرشادات للإغلاق الرقمي الأخلاقي."
// landingFaithBasedBadgeCertified: "معتمد من مستشارين شرعيين"
// altIslamicFaith: "صورة تمثل الإيمان الإسلامي، مثل مسجد أو مسبحة"
// landingFaithBasedLanguagePrompt: "اعرض هذه الصفحة باللغة"
// landingDifferentiatorsTitle: "عندما لا تكون هنا، صوتك لا يزال يمكن أن يكون."
// differentiatorPosthumousSharing: "مشاركة بعد الوفاة عبر مشغلات وفاة مُحققة."
// differentiatorAIEmotion: "كشف المشاعر بالذكاء الاصطناعي للرسائل المتروكة (بريميوم)."
// differentiatorLangSupport: "دعم كامل للغتين العربية والإنجليزية مع RTL."
// differentiatorLegacyCalendar: "تقويم الإرث: جدولة الرسائل لتواريخ رئيسية مستقبلية (بريميوم)."
// differentiatorSmartVault: "خزنة ذكية للإرشاد الأسري، السلام القانوني، والوضوح الروحي."
// landingStartFreeTitle: "ابدأ في بناء إرثك - لا يكلف شيئًا للبدء."
// landingStartFreeParagraph: "يمكنك إضافة ذكرياتك الأولى، رسائلك، ومستنداتك الأساسية اليوم. قم بالترقية فقط إذا كنت بحاجة إلى مساحة أكبر أو ميزات متقدمة. خصوصيتك محمية دائمًا."
// landingStartFreeCTACreate: "أنشئ خزنتي"
// landingStartFreeCTASample: "عرض الميزات"
// landingFinalCalloutTitle: "ابدأ بكتابة الجزء من قصتك الذي سيقرؤونه عندما ترحل."
// landingFinalCalloutCTABegin: "ابدأ مجانًا"
// landingFinalCalloutCTAWhy: "لماذا أمانة؟"
// termsOfService: "شروط الخدمة"
// privacyPolicy: "سياسة الخصوصية"