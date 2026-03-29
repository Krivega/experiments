import { actionsTranslations } from './actions';
import { errorsTranslations } from './errors';
import { labelsTranslations } from './labels';

const translations = {
  en: {
    ...actionsTranslations.en,
    ...labelsTranslations.en,
    ...errorsTranslations.en,
  },
  'vi-VN': {
    ...actionsTranslations['vi-VN'],
    ...labelsTranslations['vi-VN'],
    ...errorsTranslations['vi-VN'],
  },
  ru: {
    ...actionsTranslations.ru,
    ...labelsTranslations.ru,
    ...errorsTranslations.ru,
  },
  de: {
    ...actionsTranslations.de,
    ...labelsTranslations.de,
    ...errorsTranslations.de,
  },
  fr: {
    ...actionsTranslations.fr,
    ...labelsTranslations.fr,
    ...errorsTranslations.fr,
  },
  es: {
    ...actionsTranslations.es,
    ...labelsTranslations.es,
    ...errorsTranslations.es,
  },
  zh: {
    ...actionsTranslations.zh,
    ...labelsTranslations.zh,
    ...errorsTranslations.zh,
  },
};

export default translations;
