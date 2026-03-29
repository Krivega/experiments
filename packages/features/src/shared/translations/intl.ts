import { createIntl, createIntlCache } from 'react-intl';

import translations from './translations';

import type { PrimitiveType } from 'react-intl';
import type { TLanguage } from './typings';

// Кеш для интл
const cache = createIntlCache();

// Создаем интл экземпляр
const createIntlInstance = (locale: TLanguage) => {
  return createIntl(
    {
      locale,
      messages: translations[locale],
    },
    cache,
  );
};

// Текущий язык (по умолчанию русский)
const DEFAULT_LOCALE: TLanguage = 'ru';

// Глобальный интл экземпляр
let intlInstance = createIntlInstance(DEFAULT_LOCALE);

export const setLocale = (locale: TLanguage): void => {
  intlInstance = createIntlInstance(locale);
};

export const getLocale = () => {
  return intlInstance.locale;
};

export const formatMessage = (message: { id: string }, values?: Record<string, PrimitiveType>) => {
  return intlInstance.formatMessage(message, values);
};
