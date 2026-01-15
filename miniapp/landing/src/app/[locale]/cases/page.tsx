import { getDictionary } from '@/dictionaries'
import CasesClientPage from './CasesClientPage'

export default async function CasesPage({
    params,
}: {
    params: Promise<{ locale: string }>
}) {
    const { locale } = await params
    const dict = await getDictionary(locale)

    return <CasesClientPage dict={dict} locale={locale} />
}
