import { getDictionary, Locale } from '@/lib/i18n'
import CourseDetailClient from './CourseDetailClient'

export default async function CourseDetailPage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
    const { locale, slug } = await params
    const dict = await getDictionary(locale as Locale)

    return <CourseDetailClient dict={dict} locale={locale} slug={slug} />
}
