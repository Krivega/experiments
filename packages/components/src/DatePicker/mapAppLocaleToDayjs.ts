/** Maps app locale keys (react-intl) to dayjs locale ids. */
export const mapAppLocaleToDayjs = (locale: string): string => {
  const map: Record<string, string> = {
    de: 'de',
    en: 'en',
    es: 'es',
    fr: 'fr',
    ru: 'ru',
    zh: 'zh-cn',
    'vi-VN': 'vi',
  };

  return map[locale] ?? 'en';
};
