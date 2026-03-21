/// <reference types="jest" />
import { getTimer, msPerDay, msPerHour, msPerMinute, msPerSecond } from '..';

describe('getTimer', () => {
  it('minutes', () => {
    expect(getTimer({ durationMS: 0, maxPeriod: 'minutes' })).toBe(undefined);

    expect(getTimer({ durationMS: msPerSecond, maxPeriod: 'minutes' })).toEqual('00:01');
    expect(getTimer({ durationMS: msPerMinute - msPerSecond, maxPeriod: 'minutes' })).toEqual(
      '00:59',
    );

    expect(getTimer({ durationMS: msPerMinute, maxPeriod: 'minutes' })).toEqual('01:00');
    expect(getTimer({ durationMS: msPerMinute + msPerSecond * 10, maxPeriod: 'minutes' })).toEqual(
      '01:10',
    );
    expect(getTimer({ durationMS: msPerHour - 1, maxPeriod: 'minutes' })).toEqual('59:59');

    expect(getTimer({ durationMS: msPerHour, maxPeriod: 'minutes' })).toEqual('60:00');
    expect(getTimer({ durationMS: msPerHour * 20, maxPeriod: 'minutes' })).toEqual('60:00');
  });

  it('hours', () => {
    expect(getTimer({ durationMS: 0, maxPeriod: 'hours' })).toBe(undefined);

    expect(getTimer({ durationMS: msPerSecond, maxPeriod: 'hours' })).toEqual('00:00:01');
    expect(getTimer({ durationMS: msPerMinute - msPerSecond, maxPeriod: 'hours' })).toEqual(
      '00:00:59',
    );

    expect(getTimer({ durationMS: msPerMinute, maxPeriod: 'hours' })).toEqual('00:01:00');
    expect(getTimer({ durationMS: msPerMinute + msPerSecond * 10, maxPeriod: 'hours' })).toEqual(
      '00:01:10',
    );
    expect(getTimer({ durationMS: msPerHour - 1, maxPeriod: 'hours' })).toEqual('00:59:59');

    expect(getTimer({ durationMS: msPerHour, maxPeriod: 'hours' })).toEqual('01:00:00');
    expect(getTimer({ durationMS: msPerHour + msPerSecond, maxPeriod: 'hours' })).toEqual(
      '01:00:01',
    );
    expect(
      getTimer({ durationMS: msPerHour + msPerSecond + msPerMinute, maxPeriod: 'hours' }),
    ).toEqual('01:01:01');
    expect(getTimer({ durationMS: msPerDay - msPerSecond, maxPeriod: 'hours' })).toEqual(
      '23:59:59',
    );

    expect(getTimer({ durationMS: msPerDay, maxPeriod: 'hours' })).toEqual('24:00:00');
    expect(getTimer({ durationMS: msPerDay * 20, maxPeriod: 'hours' })).toEqual('24:00:00');
    expect(
      getTimer({
        durationMS: msPerDay * 2 + msPerMinute + msPerSecond,
        maxPeriod: 'hours',
        isHoursLimited: false,
      }),
    ).toEqual('48:01:01');
  });
});
