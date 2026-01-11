import { getDictionary, Locale } from '@/lib/i18n'
import { Hero } from '@/components/sections/Hero'
import { Stats } from '@/components/sections/Stats'
import { Testimonials } from '@/components/sections/Testimonials'
import { Features } from '@/components/sections/Features'
import { AdminDemo } from '@/components/sections/AdminDemo'
import { AdminPanelShowcase } from '@/components/sections/AdminPanelShowcase'
import { TargetAudience } from '@/components/sections/TargetAudience'
import { HowItWorks } from '@/components/sections/HowItWorks'
import { Monetization } from '@/components/sections/Monetization'
import { IntegrationPricing } from '@/components/sections/IntegrationPricing'
import { FAQ } from '@/components/sections/FAQ'
import { Footer } from '@/components/sections/Footer'
import { Navigation } from '@/components/Navigation'

export default async function LocalePage({
    params,
}: {
    params: Promise<{ locale: string }>
}) {
    const { locale } = await params
    const dict = await getDictionary(locale as Locale)

    return (
        <main className="min-h-screen bg-[var(--background)]">
            <Navigation dict={dict.nav} locale={locale} />
            <Hero dict={dict.hero} locale={locale} />
            <Stats dict={dict.stats} />
            <Testimonials dict={dict.testimonials} />
            <Features dict={dict.features} />
            <AdminDemo dict={dict.adminDemo} />
            <AdminPanelShowcase dict={dict.adminShowcase} />
            <TargetAudience dict={dict.targetAudience} />
            <Monetization dict={dict.monetization} />
            <HowItWorks dict={dict.howItWorks} />
            <IntegrationPricing dict={dict.integration} />
            <FAQ dict={dict.faq} />
            <Footer dict={dict.footer} />
        </main>
    )
}
