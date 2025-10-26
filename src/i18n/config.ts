import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translation files
import commonKo from './locales/ko/common.json';
import commonEn from './locales/en/common.json';
import navigationKo from './locales/ko/navigation.json';
import navigationEn from './locales/en/navigation.json';
import categoriesKo from './locales/ko/categories.json';
import categoriesEn from './locales/en/categories.json';
import formsKo from './locales/ko/forms.json';
import formsEn from './locales/en/forms.json';
import adminKo from './locales/ko/admin.json';
import adminEn from './locales/en/admin.json';
import pagesKo from './locales/ko/pages.json';
import pagesEn from './locales/en/pages.json';

const resources = {
  ko: {
    common: commonKo,
    navigation: navigationKo,
    categories: categoriesKo,
    forms: formsKo,
    admin: adminKo,
    pages: pagesKo,
  },
  en: {
    common: commonEn,
    navigation: navigationEn,
    categories: categoriesEn,
    forms: formsEn,
    admin: adminEn,
    pages: pagesEn,
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    defaultNS: 'common',
    fallbackLng: 'ko',
    lng: 'ko', // 기본 언어: 한글
    
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'i18nextLng',
    },

    interpolation: {
      escapeValue: false,
    },

    react: {
      useSuspense: false,
    },
  });

export default i18n;

