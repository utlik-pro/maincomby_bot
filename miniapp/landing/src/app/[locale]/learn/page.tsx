import { getDictionary, Locale } from '@/lib/i18n'
import LearnClientPage from './LearnClientPage'

export default async function LearnPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const dict = await getDictionary(locale as Locale)

  return <LearnClientPage dict={dict} locale={locale} />
}
