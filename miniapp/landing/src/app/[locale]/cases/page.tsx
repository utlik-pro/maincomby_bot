import { getDictionary, Locale } from '@/lib/i18n'
import CasesClientPage from './CasesClientPage'

export default async function CasesPage({
    params,
}: {
    params: Promise<{ locale: string }>
}) {
    const { locale } = await params
    const dict = await getDictionary(locale as Locale)

    return <CasesClientPage dict={dict} locale={locale} />
}
