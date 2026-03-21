/// <reference types="jest" />
import { getRemainingTime } from '..';

describe('getRemainingTime', () => {
  const SYSTEM_TIMESTAMP = 1_574_169_191_000;
  const second = 1000;
  const minute = second * 60;
  const hour = minute * 60;
  const day = hour * 24;
  const week = day * 7;
  const month = day * 31;
  const year = day * 365;

  const RU = 'ru';
  const EN = 'en';
  const DE = 'de';
  const ES = 'es';
  const FR = 'fr';
  const ZH = 'zh';

  jest.useFakeTimers().setSystemTime(SYSTEM_TIMESTAMP);

  it('#1 seconds', () => {
    const durationFormatterRuSec = getRemainingTime(SYSTEM_TIMESTAMP + second * 20, RU);

    const durationFormatterENSec = getRemainingTime(SYSTEM_TIMESTAMP + second * 20, EN);

    const durationFormatterDESec = getRemainingTime(SYSTEM_TIMESTAMP + second * 20, DE);

    const durationFormatterESSec = getRemainingTime(SYSTEM_TIMESTAMP + second * 20, ES);

    const durationFormatterFRSec = getRemainingTime(SYSTEM_TIMESTAMP + second * 20, FR);

    const durationFormatterZHSec = getRemainingTime(SYSTEM_TIMESTAMP + second * 20, ZH);

    expect(durationFormatterRuSec).toBe('20 с');
    expect(durationFormatterENSec).toBe('20s');
    expect(durationFormatterDESec).toBe('20 Sek.');
    expect(durationFormatterESSec).toBe('20s');
    expect(durationFormatterFRSec).toBe('20s');
    expect(durationFormatterZHSec).toBe('20秒');
  });

  it('#2 minutes', () => {
    const minutesWithSeconds = SYSTEM_TIMESTAMP + minute * 5 + second * 10;
    const durationRuMin = getRemainingTime(SYSTEM_TIMESTAMP + minute * 5, RU);
    const durationRuMinWithSec = getRemainingTime(minutesWithSeconds, RU);

    const durationENMinWithSec = getRemainingTime(minutesWithSeconds, EN);

    const durationDEMinWithSec = getRemainingTime(minutesWithSeconds, DE);

    const durationESMinWithSec = getRemainingTime(minutesWithSeconds, ES);

    const durationFRMinWithSec = getRemainingTime(minutesWithSeconds, FR);

    const durationZHMinWithSec = getRemainingTime(minutesWithSeconds, ZH);

    expect(durationRuMin).toBe('5 мин');
    expect(durationRuMinWithSec).toBe('5 мин');
    expect(durationENMinWithSec).toBe('5m');
    expect(durationDEMinWithSec).toBe('5 Min.');
    expect(durationESMinWithSec).toBe('5min');
    expect(durationFRMinWithSec).toBe('5min');
    expect(durationZHMinWithSec).toBe('5分钟');
  });

  it('#3 hours', () => {
    const hourWithMinutes = SYSTEM_TIMESTAMP + hour + minute * 5;

    const durationRuHour = getRemainingTime(SYSTEM_TIMESTAMP + hour * 5, RU);
    const durationRuHourWithMinutes = getRemainingTime(hourWithMinutes, RU);

    const durationENHourWithMinutes = getRemainingTime(hourWithMinutes, EN);

    const durationDEHourWithMinutes = getRemainingTime(hourWithMinutes, DE);

    const durationESHourWithMinutes = getRemainingTime(hourWithMinutes, ES);

    const durationFRHourWithMinutes = getRemainingTime(hourWithMinutes, FR);

    const durationZHHourWithMinutes = getRemainingTime(hourWithMinutes, ZH);

    expect(durationRuHour).toBe('5 ч');
    expect(durationRuHourWithMinutes).toBe('1 ч 5 мин');
    expect(durationENHourWithMinutes).toBe('1h, 5m');
    expect(durationDEHourWithMinutes).toBe('1 Std., 5 Min.');
    expect(durationESHourWithMinutes).toBe('1h y 5min');
    expect(durationFRHourWithMinutes).toBe('1h et 5min');
    expect(durationZHHourWithMinutes).toBe('1小时5分钟');
  });

  it('#4 days', () => {
    const daysWithSecondsLessHour = SYSTEM_TIMESTAMP + day * 2 + minute * 5;
    const daysWithHours = SYSTEM_TIMESTAMP + day * 2 + hour * 5;

    const durationRuDaysWithSecondsLessHour = getRemainingTime(daysWithSecondsLessHour, RU);
    const durationRuDaysWithSecondsHour = getRemainingTime(daysWithHours, RU);

    const durationENdaysWithHours = getRemainingTime(daysWithHours, EN);

    const durationDEdaysWithHours = getRemainingTime(daysWithHours, DE);

    const durationESdaysWithHours = getRemainingTime(daysWithHours, ES);

    const durationFRdaysWithHours = getRemainingTime(daysWithHours, FR);

    const durationZHdaysWithHours = getRemainingTime(daysWithHours, ZH);

    expect(durationRuDaysWithSecondsLessHour).toBe('2 д.');
    expect(durationRuDaysWithSecondsHour).toBe('2 д. 5 ч');
    expect(durationENdaysWithHours).toBe('2d, 5h');
    expect(durationDEdaysWithHours).toBe('2 T, 5 Std.');
    expect(durationESdaysWithHours).toBe('2d y 5h');
    expect(durationFRdaysWithHours).toBe('2j et 5h');
    expect(durationZHdaysWithHours).toBe('2天5小时');
  });

  it('#5 days more then week', () => {
    const daysMoreThenWeekWithSecondsLessHour = SYSTEM_TIMESTAMP + week * 2 + minute * 5;
    const daysMoreThenWeekWithHours = SYSTEM_TIMESTAMP + week * 2 + hour * 5;

    const durationRuDaysWithSecondsLessHour = getRemainingTime(
      daysMoreThenWeekWithSecondsLessHour,
      RU,
    );
    const durationRuDaysWithSecondsHour = getRemainingTime(daysMoreThenWeekWithHours, RU);

    const durationENdaysWithHours = getRemainingTime(daysMoreThenWeekWithHours, EN);

    const durationDEdaysWithHours = getRemainingTime(daysMoreThenWeekWithHours, DE);

    const durationESdaysWithHours = getRemainingTime(daysMoreThenWeekWithHours, ES);

    const durationFRdaysWithHours = getRemainingTime(daysMoreThenWeekWithHours, FR);

    const durationZHdaysWithHours = getRemainingTime(daysMoreThenWeekWithHours, ZH);

    expect(durationRuDaysWithSecondsLessHour).toBe('14 д.');
    expect(durationRuDaysWithSecondsHour).toBe('14 д. 5 ч');
    expect(durationENdaysWithHours).toBe('14d, 5h');
    expect(durationDEdaysWithHours).toBe('14 T, 5 Std.');
    expect(durationESdaysWithHours).toBe('14d y 5h');
    expect(durationFRdaysWithHours).toBe('14j et 5h');
    expect(durationZHdaysWithHours).toBe('14天5小时');
  });

  it('#6 days more then month', () => {
    const daysMoreThenMonthWithSecondsLessHour = SYSTEM_TIMESTAMP + month * 2 + minute * 5;
    const daysMoreThenMonthWithDaysAndHours = SYSTEM_TIMESTAMP + month * 2 + day * 3 + hour * 5;

    const durationRuDaysWithSecondsLessHour = getRemainingTime(
      daysMoreThenMonthWithSecondsLessHour,
      RU,
    );
    const durationRuDaysWithSecondsHour = getRemainingTime(daysMoreThenMonthWithDaysAndHours, RU);

    const durationENdaysWithHours = getRemainingTime(daysMoreThenMonthWithDaysAndHours, EN);

    const durationDEdaysWithHours = getRemainingTime(daysMoreThenMonthWithDaysAndHours, DE);

    const durationESdaysWithHours = getRemainingTime(daysMoreThenMonthWithDaysAndHours, ES);

    const durationFRdaysWithHours = getRemainingTime(daysMoreThenMonthWithDaysAndHours, FR);

    const durationZHdaysWithHours = getRemainingTime(daysMoreThenMonthWithDaysAndHours, ZH);

    expect(durationRuDaysWithSecondsLessHour).toBe('2 м.');
    expect(durationRuDaysWithSecondsHour).toBe('2 м. 3 д. 5 ч');
    expect(durationENdaysWithHours).toBe('2m, 3d, 5h');
    expect(durationDEdaysWithHours).toBe('2 M, 3 T und 5 Std.');
    expect(durationESdaysWithHours).toBe('2m, 3d, 5h');
    expect(durationFRdaysWithHours).toBe('2m., 3j et 5h');
    expect(durationZHdaysWithHours).toBe('2个月3天5小时');
  });

  it('#7 more than a year', () => {
    const leftTillConferenceEndWeek = getRemainingTime(SYSTEM_TIMESTAMP + year, RU);

    expect(leftTillConferenceEndWeek).toBe(undefined);
  });

  it('#8 path current = Date.now()', () => {
    const daysWithSecondsLessHour = SYSTEM_TIMESTAMP + day * 2 + minute * 5;
    const daysWithHours = SYSTEM_TIMESTAMP + day * 2 + hour * 5;

    const durationRuDaysWithSecondsLessHour = getRemainingTime(daysWithSecondsLessHour, RU, {
      now: Date.now(),
    });
    const durationRuDaysWithSecondsHour = getRemainingTime(daysWithHours, RU, { now: Date.now() });

    expect(durationRuDaysWithSecondsLessHour).toBe('2 д.');
    expect(durationRuDaysWithSecondsHour).toBe('2 д. 5 ч');
  });

  it('#9 time in the past', () => {
    const durationFormatterRuSec = getRemainingTime(SYSTEM_TIMESTAMP - second * 20, RU);

    const durationFormatterENSec = getRemainingTime(SYSTEM_TIMESTAMP - second * 20, EN);

    const durationFormatterDESec = getRemainingTime(SYSTEM_TIMESTAMP - second * 20, DE);

    const durationFormatterESSec = getRemainingTime(SYSTEM_TIMESTAMP - second * 20, ES);

    const durationFormatterFRSec = getRemainingTime(SYSTEM_TIMESTAMP - second * 20, FR);

    const durationFormatterZHSec = getRemainingTime(SYSTEM_TIMESTAMP - second * 20, ZH);

    expect(durationFormatterRuSec).toBe('20 с');
    expect(durationFormatterENSec).toBe('20s');
    expect(durationFormatterDESec).toBe('20 Sek.');
    expect(durationFormatterESSec).toBe('20s');
    expect(durationFormatterFRSec).toBe('20s');
    expect(durationFormatterZHSec).toBe('20秒');
  });

  it('#10 time in the past with isOnlyInFuture', () => {
    const durationFormatterRuSec = getRemainingTime(SYSTEM_TIMESTAMP - second * 20, RU, {
      isOnlyInFuture: true,
    });

    const durationFormatterENSec = getRemainingTime(SYSTEM_TIMESTAMP - second * 20, EN, {
      isOnlyInFuture: true,
    });

    const durationFormatterDESec = getRemainingTime(SYSTEM_TIMESTAMP - second * 20, DE, {
      isOnlyInFuture: true,
    });

    const durationFormatterESSec = getRemainingTime(SYSTEM_TIMESTAMP - second * 20, ES, {
      isOnlyInFuture: true,
    });

    const durationFormatterFRSec = getRemainingTime(SYSTEM_TIMESTAMP - second * 20, FR, {
      isOnlyInFuture: true,
    });

    const durationFormatterZHSec = getRemainingTime(SYSTEM_TIMESTAMP - second * 20, ZH, {
      isOnlyInFuture: true,
    });

    expect(durationFormatterRuSec).toBe('0 с');
    expect(durationFormatterENSec).toBe('0s');
    expect(durationFormatterDESec).toBe('0 Sek.');
    expect(durationFormatterESSec).toBe('0s');
    expect(durationFormatterFRSec).toBe('0s');
    expect(durationFormatterZHSec).toBe('0秒');
  });
});
