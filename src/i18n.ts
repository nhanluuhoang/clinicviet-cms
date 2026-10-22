import { z } from 'zod'
import i18n from 'i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import { initReactI18next } from 'react-i18next'
import { en, vi } from 'zod/locales'
import enTranslation from './locales/en/translation.json'
import viTranslation from './locales/vi/translation.json'

const resources = {
  en: {
    translation: enTranslation,
  },
  vi: {
    translation: viTranslation,
  },
}

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'vi',
    supportedLngs: ['vi', 'en'],
    detection: {
      order: ['localStorage'],
      caches: ['localStorage'],
    },
    interpolation: {
      escapeValue: false,
    },
  })

export default i18n

export function getLocale(): string {
  return i18n.resolvedLanguage?.startsWith('en') ? 'en-US' : 'vi-VN'
}

z.config(i18n.resolvedLanguage?.startsWith('en') ? en() : vi())
i18n.on('languageChanged', (language) => {
  z.config(language.startsWith('en') ? en() : vi())
})
