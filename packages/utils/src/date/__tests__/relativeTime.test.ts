/// <reference types="jest" />
import { relativeTime } from '..';

const SYSTEM_TIMESTAMP = 1_574_169_191_000;

const second = 1000;
const minute = second * 60;
const hour = minute * 60;
const day = hour * 24;
const week = day * 7;
const month = day * 30;
const year = day * 365;

const RU = 'ru';
const EN = 'en';
const DE = 'de';
const ES = 'es';
const FR = 'fr';
const ZH = 'zh';

describe('relativeTime', () => {
  jest.useFakeTimers().setSystemTime(SYSTEM_TIMESTAMP);

  it('just now', () => {
    const relativeNow = relativeTime({ timestamp: SYSTEM_TIMESTAMP, locale: RU });
    const relativeNowLesThanSecond = relativeTime({
      timestamp: SYSTEM_TIMESTAMP - second + 1,
      locale: RU,
    });

    expect(relativeNow).toBe('сейчас');
    expect(relativeNowLesThanSecond).toBe('сейчас');
  });

  it('after second', () => {
    const relativeSecond = relativeTime({
      timestamp: SYSTEM_TIMESTAMP - second,
      locale: RU,
    });
    const relativeSecond02 = relativeTime({
      timestamp: SYSTEM_TIMESTAMP - second * 2,
      locale: RU,
    });
    const relativeSecond59 = relativeTime({
      timestamp: SYSTEM_TIMESTAMP - second * 59,
      locale: RU,
    });

    expect(relativeSecond).toBe('1 секунду назад');
    expect(relativeSecond02).toBe('2 секунды назад');
    expect(relativeSecond59).toBe('59 секунд назад');
  });

  it('after minute', () => {
    const relativeMinute = relativeTime({ timestamp: SYSTEM_TIMESTAMP - minute, locale: RU });
    const relativeMinute02 = relativeTime({ timestamp: SYSTEM_TIMESTAMP - minute * 2, locale: RU });
    const relativeMinute59 = relativeTime({
      timestamp: SYSTEM_TIMESTAMP - minute * 59,
      locale: RU,
    });

    expect(relativeMinute).toBe('1 минуту назад');
    expect(relativeMinute02).toBe('2 минуты назад');
    expect(relativeMinute59).toBe('59 минут назад');
  });

  it('after hour', () => {
    const relativeHour = relativeTime({ timestamp: SYSTEM_TIMESTAMP - hour, locale: RU });
    const relativeHour08 = relativeTime({ timestamp: SYSTEM_TIMESTAMP - hour * 8, locale: RU });
    const relativeHour23 = relativeTime({ timestamp: SYSTEM_TIMESTAMP - hour * 23, locale: RU });

    expect(relativeHour).toBe('1 час назад');
    expect(relativeHour08).toBe('8 часов назад');
    expect(relativeHour23).toBe('23 часа назад');
  });

  it('after days', () => {
    const relativeDays = relativeTime({ timestamp: SYSTEM_TIMESTAMP - day, locale: RU });
    const relativeDays02 = relativeTime({ timestamp: SYSTEM_TIMESTAMP - day * 2, locale: RU });
    const relativeDays03 = relativeTime({ timestamp: SYSTEM_TIMESTAMP - day * 3, locale: RU });
    const relativeDays6 = relativeTime({ timestamp: SYSTEM_TIMESTAMP - day * 6, locale: RU });

    expect(relativeDays).toBe('вчера');
    expect(relativeDays02).toBe('позавчера');
    expect(relativeDays03).toBe('3 дня назад');
    expect(relativeDays6).toBe('6 дней назад');
  });

  it('after week', () => {
    const relativeWeeks = relativeTime({ timestamp: SYSTEM_TIMESTAMP - week, locale: RU });
    const relativeWeeks04 = relativeTime({ timestamp: SYSTEM_TIMESTAMP - week * 4, locale: RU });

    expect(relativeWeeks).toBe('на прошлой неделе');
    expect(relativeWeeks04).toBe('4 недели назад');
  });

  it('after month', () => {
    const relativeMonth = relativeTime({ timestamp: SYSTEM_TIMESTAMP - month, locale: RU });
    const relativeMonth02 = relativeTime({ timestamp: SYSTEM_TIMESTAMP - month * 2, locale: RU });
    const relativeMonth11 = relativeTime({ timestamp: SYSTEM_TIMESTAMP - month * 11, locale: RU });

    expect(relativeMonth).toBe('в прошлом месяце');
    expect(relativeMonth02).toBe('2 месяца назад');
    expect(relativeMonth11).toBe('11 месяцев назад');
  });

  it('through second', () => {
    const relativeSecond = relativeTime({ timestamp: SYSTEM_TIMESTAMP + second, locale: RU });
    const relativeSecond02 = relativeTime({ timestamp: SYSTEM_TIMESTAMP + second * 2, locale: RU });
    const relativeSecond59 = relativeTime({
      timestamp: SYSTEM_TIMESTAMP + second * 59,
      locale: RU,
    });

    expect(relativeSecond).toBe('через 1 секунду');
    expect(relativeSecond02).toBe('через 2 секунды');
    expect(relativeSecond59).toBe('через 59 секунд');
  });

  it('through minute', () => {
    const relativeMinute = relativeTime({ timestamp: SYSTEM_TIMESTAMP + minute, locale: RU });
    const relativeMinute02 = relativeTime({ timestamp: SYSTEM_TIMESTAMP + minute * 2, locale: RU });
    const relativeMinute59 = relativeTime({
      timestamp: SYSTEM_TIMESTAMP + minute * 59,
      locale: RU,
    });

    expect(relativeMinute).toBe('через 1 минуту');
    expect(relativeMinute02).toBe('через 2 минуты');
    expect(relativeMinute59).toBe('через 59 минут');
  });

  it('through hour', () => {
    const relativeHour = relativeTime({ timestamp: SYSTEM_TIMESTAMP + hour, locale: RU });
    const relativeHour08 = relativeTime({ timestamp: SYSTEM_TIMESTAMP + hour * 8, locale: RU });
    const relativeHour23 = relativeTime({ timestamp: SYSTEM_TIMESTAMP + hour * 23, locale: RU });

    expect(relativeHour).toBe('через 1 час');
    expect(relativeHour08).toBe('через 8 часов');
    expect(relativeHour23).toBe('через 23 часа');
  });

  it('through days', () => {
    const relativeDays = relativeTime({ timestamp: SYSTEM_TIMESTAMP + day, locale: RU });
    const relativeDays02 = relativeTime({ timestamp: SYSTEM_TIMESTAMP + day * 2, locale: RU });
    const relativeDays03 = relativeTime({ timestamp: SYSTEM_TIMESTAMP + day * 3, locale: RU });
    const relativeDays6 = relativeTime({ timestamp: SYSTEM_TIMESTAMP + day * 6, locale: RU });

    expect(relativeDays).toBe('завтра');
    expect(relativeDays02).toBe('послезавтра');
    expect(relativeDays03).toBe('через 3 дня');
    expect(relativeDays6).toBe('через 6 дней');
  });

  it('through week', () => {
    const relativeWeeks = relativeTime({ timestamp: SYSTEM_TIMESTAMP + week, locale: RU });
    const relativeWeeks04 = relativeTime({ timestamp: SYSTEM_TIMESTAMP + week * 4, locale: RU });

    expect(relativeWeeks).toBe('на следующей неделе');
    expect(relativeWeeks04).toBe('через 4 недели');
  });

  it('through month', () => {
    const relativeMonth = relativeTime({ timestamp: SYSTEM_TIMESTAMP + month, locale: RU });
    const relativeMonth02 = relativeTime({ timestamp: SYSTEM_TIMESTAMP + month * 2, locale: RU });
    const relativeMonth11 = relativeTime({ timestamp: SYSTEM_TIMESTAMP + month * 11, locale: RU });

    expect(relativeMonth).toBe('в следующем месяце');
    expect(relativeMonth02).toBe('через 2 месяца');
    expect(relativeMonth11).toBe('через 11 месяцев');
  });

  it('through more than one year', () => {
    const relativeYears = relativeTime({ timestamp: SYSTEM_TIMESTAMP + year, locale: RU });
    const relativeYears02 = relativeTime({ timestamp: SYSTEM_TIMESTAMP + year * 2, locale: RU });
    const relativeYears100 = relativeTime({ timestamp: SYSTEM_TIMESTAMP + year * 100, locale: RU });

    expect(relativeYears).toBe('в следующем году');
    expect(relativeYears02).toBe('через 2 года');
    expect(relativeYears100).toBe('через 100 лет');
  });

  it('in English', () => {
    const relativeNow = relativeTime({ timestamp: SYSTEM_TIMESTAMP, locale: EN });
    const relativeSecond = relativeTime({ timestamp: SYSTEM_TIMESTAMP - second, locale: EN });
    const relativeMinute = relativeTime({ timestamp: SYSTEM_TIMESTAMP - minute, locale: EN });
    const relativeHour = relativeTime({ timestamp: SYSTEM_TIMESTAMP - hour, locale: EN });
    const relativeDays = relativeTime({ timestamp: SYSTEM_TIMESTAMP - day, locale: EN });
    const relativeWeeks = relativeTime({ timestamp: SYSTEM_TIMESTAMP - week, locale: EN });
    const relativeMonth = relativeTime({ timestamp: SYSTEM_TIMESTAMP - month, locale: EN });
    const relativeYears = relativeTime({ timestamp: SYSTEM_TIMESTAMP - year, locale: EN });

    expect(relativeNow).toBe('now');
    expect(relativeSecond).toBe('1 second ago');
    expect(relativeMinute).toBe('1 minute ago');
    expect(relativeHour).toBe('1 hour ago');
    expect(relativeDays).toBe('yesterday');
    expect(relativeWeeks).toBe('last week');
    expect(relativeMonth).toBe('last month');
    expect(relativeYears).toBe('last year');
  });

  it('in German', () => {
    const relativeNow = relativeTime({ timestamp: SYSTEM_TIMESTAMP, locale: DE });
    const relativeSecond = relativeTime({ timestamp: SYSTEM_TIMESTAMP - second, locale: DE });
    const relativeMinute = relativeTime({ timestamp: SYSTEM_TIMESTAMP - minute, locale: DE });
    const relativeHour = relativeTime({ timestamp: SYSTEM_TIMESTAMP - hour, locale: DE });
    const relativeDays = relativeTime({ timestamp: SYSTEM_TIMESTAMP - day, locale: DE });
    const relativeWeeks = relativeTime({ timestamp: SYSTEM_TIMESTAMP - week, locale: DE });
    const relativeMonth = relativeTime({ timestamp: SYSTEM_TIMESTAMP - month, locale: DE });
    const relativeYears = relativeTime({ timestamp: SYSTEM_TIMESTAMP - year, locale: DE });

    expect(relativeNow).toBe('jetzt');
    expect(relativeSecond).toBe('vor 1 Sekunde');
    expect(relativeMinute).toBe('vor 1 Minute');
    expect(relativeHour).toBe('vor 1 Stunde');
    expect(relativeDays).toBe('gestern');
    expect(relativeWeeks).toBe('letzte Woche');
    expect(relativeMonth).toBe('letzten Monat');
    expect(relativeYears).toBe('letztes Jahr');
  });

  it('in Spain', () => {
    const relativeNow = relativeTime({ timestamp: SYSTEM_TIMESTAMP, locale: ES });
    const relativeSecond = relativeTime({ timestamp: SYSTEM_TIMESTAMP - second, locale: ES });
    const relativeMinute = relativeTime({ timestamp: SYSTEM_TIMESTAMP - minute, locale: ES });
    const relativeHour = relativeTime({ timestamp: SYSTEM_TIMESTAMP - hour, locale: ES });
    const relativeDays = relativeTime({ timestamp: SYSTEM_TIMESTAMP - day, locale: ES });
    const relativeWeeks = relativeTime({ timestamp: SYSTEM_TIMESTAMP - week, locale: ES });
    const relativeMonth = relativeTime({ timestamp: SYSTEM_TIMESTAMP - month, locale: ES });
    const relativeYears = relativeTime({ timestamp: SYSTEM_TIMESTAMP - year, locale: ES });

    expect(relativeNow).toBe('ahora');
    expect(relativeSecond).toBe('hace 1 segundo');
    expect(relativeMinute).toBe('hace 1 minuto');
    expect(relativeHour).toBe('hace 1 hora');
    expect(relativeDays).toBe('ayer');
    expect(relativeWeeks).toBe('la semana pasada');
    expect(relativeMonth).toBe('el mes pasado');
    expect(relativeYears).toBe('el año pasado');
  });

  it('in French', () => {
    const relativeNow = relativeTime({ timestamp: SYSTEM_TIMESTAMP, locale: FR });
    const relativeSecond = relativeTime({ timestamp: SYSTEM_TIMESTAMP - second, locale: FR });
    const relativeMinute = relativeTime({ timestamp: SYSTEM_TIMESTAMP - minute, locale: FR });
    const relativeHour = relativeTime({ timestamp: SYSTEM_TIMESTAMP - hour, locale: FR });
    const relativeDays = relativeTime({ timestamp: SYSTEM_TIMESTAMP - day, locale: FR });
    const relativeWeeks = relativeTime({ timestamp: SYSTEM_TIMESTAMP - week, locale: FR });
    const relativeMonth = relativeTime({ timestamp: SYSTEM_TIMESTAMP - month, locale: FR });
    const relativeYears = relativeTime({ timestamp: SYSTEM_TIMESTAMP - year, locale: FR });

    expect(relativeNow).toBe('maintenant');
    expect(relativeSecond).toBe('il y a 1 seconde');
    expect(relativeMinute).toBe('il y a 1 minute');
    expect(relativeHour).toBe('il y a 1 heure');
    expect(relativeDays).toBe('hier');
    expect(relativeWeeks).toBe('la semaine dernière');
    expect(relativeMonth).toBe('le mois dernier');
    expect(relativeYears).toBe('l’année dernière');
  });

  it('in Chinese', () => {
    const relativeNow = relativeTime({ timestamp: SYSTEM_TIMESTAMP, locale: ZH });
    const relativeSecond = relativeTime({ timestamp: SYSTEM_TIMESTAMP - second, locale: ZH });
    const relativeMinute = relativeTime({ timestamp: SYSTEM_TIMESTAMP - minute, locale: ZH });
    const relativeHour = relativeTime({ timestamp: SYSTEM_TIMESTAMP - hour, locale: ZH });
    const relativeDays = relativeTime({ timestamp: SYSTEM_TIMESTAMP - day, locale: ZH });
    const relativeWeeks = relativeTime({ timestamp: SYSTEM_TIMESTAMP - week, locale: ZH });
    const relativeMonth = relativeTime({ timestamp: SYSTEM_TIMESTAMP - month, locale: ZH });
    const relativeYears = relativeTime({ timestamp: SYSTEM_TIMESTAMP - year, locale: ZH });

    expect(relativeNow).toBe('现在');
    expect(relativeSecond).toBe('1秒钟前');
    expect(relativeMinute).toBe('1分钟前');
    expect(relativeHour).toBe('1小时前');
    expect(relativeDays).toBe('昨天');
    expect(relativeWeeks).toBe('上周');
    expect(relativeMonth).toBe('上个月');
    expect(relativeYears).toBe('去年');
  });

  it('Should calculate relative time with difference from timestamp', () => {
    const withUpper10Seconds = relativeTime({
      timestamp: SYSTEM_TIMESTAMP,
      locale: RU,
      current: SYSTEM_TIMESTAMP - second * 10,
    });
    const withLess10Seconds = relativeTime({
      timestamp: SYSTEM_TIMESTAMP,
      locale: RU,
      current: SYSTEM_TIMESTAMP + second * 10,
    });

    expect(withUpper10Seconds).toBe('через 10 секунд');
    expect(withLess10Seconds).toBe('10 секунд назад');
  });
});
