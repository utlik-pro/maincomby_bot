import { getDictionary, Locale } from '@/lib/i18n'
import { Hero } from '@/components/sections/Hero'
import { Features } from '@/components/sections/Features'
import { HowItWorks } from '@/components/sections/HowItWorks'
import { Stats } from '@/components/sections/Stats'
import { Pricing } from '@/components/sections/Pricing'
import { FAQ } from '@/components/sections/FAQ'
import { Contact } from '@/components/sections/Contact'
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
            <Features dict={dict.features} />
            <HowItWorks dict={dict.howItWorks} />
            <Stats dict={dict.stats} />
            <Pricing dict={dict.pricing} />
            <FAQ dict={dict.faq} />
            <Contact dict={dict.contact} />
            <Footer dict={dict.footer} />
        </main>
    )
}
