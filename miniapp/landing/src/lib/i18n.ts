import 'server-only'

export type Locale = 'ru' | 'en'

const dictionaries = {
  ru: () => import('@/dictionaries/ru.json').then((module) => module.default),
  en: () => import('@/dictionaries/en.json').then((module) => module.default),
}

export const getDictionary = async (locale: Locale) => {
  return dictionaries[locale]()
}

export const locales: Locale[] = ['ru', 'en']
export const defaultLocale: Locale = 'ru'
