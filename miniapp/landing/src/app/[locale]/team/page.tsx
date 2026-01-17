import { getDictionary, Locale } from '@/lib/i18n'
import TeamClientPage from './TeamClientPage'

export default async function TeamPage({
    params,
}: {
    params: Promise<{ locale: string }>
}) {
    const { locale } = await params
    const dict = await getDictionary(locale as Locale)

    return <TeamClientPage dict={dict} locale={locale} />
}
