import { Metadata } from 'next'
import PrivacyClientPage from './PrivacyClientPage'
import { getDictionary, Locale } from '@/lib/i18n'

interface Props {
    params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { locale } = await params
    const isRussian = locale === 'ru'

    return {
        title: isRussian ? 'Политика конфиденциальности | MAIN' : 'Privacy Policy | MAIN',
        description: isRussian
            ? 'Политика конфиденциальности платформы MAIN'
            : 'Privacy Policy for MAIN platform',
    }
}

export default async function PrivacyPage({ params }: Props) {
    const { locale } = await params
    const dict = await getDictionary(locale as Locale)

    return <PrivacyClientPage dict={dict} locale={locale} />
}
