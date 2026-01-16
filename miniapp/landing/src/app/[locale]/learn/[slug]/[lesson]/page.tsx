import { getDictionary, Locale } from '@/lib/i18n'
import LessonClient from '../LessonClient'

export default async function LessonPage({
    params
}: {
    params: Promise<{ locale: string; slug: string; lesson: string }>
}) {
    const { locale, slug, lesson } = await params
    const dict = await getDictionary(locale as Locale)
    const lessonId = parseInt(lesson, 10)

    return (
        <LessonClient
            dict={dict}
            locale={locale}
            courseSlug={slug}
            lessonId={lessonId}
        />
    )
}
