// src/locales/client.tsx
'use client'

import type { ReactNode } from 'react';
import { useEffect, useState } from 'react'
import i18next from 'i18next'
import { I18nextProvider, initReactI18next, useTranslation as useTranslationOrg } from 'react-i18next'
import resourcesToBackend from 'i18next-resources-to-backend'
import LanguageDetector from 'i18next-browser-languagedetector'
import type { i18n as i18nType } from 'i18next'; // Import type for i18n
import { getOptions, locales, LocaleTypes } from './settings'

const runsOnServerSide = typeof window === 'undefined'

// Initialize i18next
i18next
  .use(initReactI18next)
  .use(LanguageDetector)
  .use(resourcesToBackend((language: string, namespace: string) => import(`./${language}/${namespace}.json`)))
  .init({
    ...getOptions(),
    lng: undefined, // Let LanguageDetector detect language
    detection: {
      order: ['path', 'htmlTag', 'cookie', 'navigator'], // Next.js App Router typically uses path
    },
    preload: runsOnServerSide ? locales : []
  })

interface I18nProviderClientProps {
  children: ReactNode;
  locale: LocaleTypes;
}

export function I18nProviderClient({ children, locale }: I18nProviderClientProps) {
  useEffect(() => {
    if (i18next.language !== locale) {
      i18next.changeLanguage(locale)
    }
  }, [locale])

  return <I18nextProvider i18n={i18next}>{children}</I18nextProvider>
}

// Re-export useTranslation with the correct type
export function useTranslation(lng?: LocaleTypes, ns?: string | string[], options?: Record<string, unknown>) {
  const ret = useTranslationOrg(ns, options)
  const { i18n } = ret

  useEffect(() => {
    if (runsOnServerSide && lng && i18n.resolvedLanguage !== lng) {
      i18n.changeLanguage(lng)
    }
  }, [lng, i18n])
  
  return ret;
}
