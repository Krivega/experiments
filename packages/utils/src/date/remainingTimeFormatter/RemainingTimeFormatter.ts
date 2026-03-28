import {
  calculateDays,
  calculateHours,
  calculateMinutes,
  calculateMonths,
  calculateRemainingDays,
  calculateRemainingHours,
  calculateRemainingMinutes,
  calculateSeconds,
} from '../utils';

type TUnit = 'day' | 'hour' | 'minute' | 'month' | 'second';

class RemainingTimeFormatter {
  private readonly locale: string;

  public constructor(locale: string) {
    this.locale = locale;
  }

  public formatSeconds(elapsed: number): string {
    const seconds = calculateSeconds(elapsed);

    return this.formatTime(seconds, 'second');
  }

  public formatMinutes(elapsed: number): string {
    const minutes = calculateMinutes(elapsed);

    return this.formatTimeList([{ time: minutes, unit: 'minute' }]);
  }

  public formatHoursAndMinutes(elapsed: number): string {
    const hours = calculateHours(elapsed);
    const restMinutes = calculateRemainingMinutes(elapsed);

    return this.formatTimeList([
      { time: hours, unit: 'hour' },
      { time: restMinutes, unit: 'minute' },
    ]);
  }

  public formatDaysAndHours(elapsed: number): string {
    const days = calculateDays(elapsed);
    const restHours = calculateRemainingHours(elapsed);

    return this.formatTimeList([
      { time: days, unit: 'day' },
      { time: restHours, unit: 'hour' },
    ]);
  }

  public formatMonthsDaysAndHours(elapsed: number): string {
    const months = calculateMonths(elapsed);
    const restDays = calculateRemainingDays(elapsed);
    const restHours = calculateRemainingHours(elapsed);

    return this.formatTimeList([
      { time: months, unit: 'month' },
      { time: restDays, unit: 'day' },
      { time: restHours, unit: 'hour' },
    ]);
  }

  private readonly formatTime = (time: number, unit: TUnit) => {
    // Narrow `hour` strings drift across ICU/Node versions; `short` stays stable for every locale.
    const unitDisplay = unit === 'hour' ? 'short' : 'narrow';

    return Intl.NumberFormat(this.locale, { unit, style: 'unit', unitDisplay }).format(time);
  };

  private readonly formatTimeList = (timesLis: { time: number; unit: TUnit }[]): string => {
    const processedTimeList = timesLis.reduce<string[]>((accumulator, { time, unit }) => {
      if (time !== 0) {
        return [...accumulator, this.formatTime(time, unit)];
      }

      return accumulator;
    }, []);

    return new Intl.ListFormat(this.locale, { type: 'unit', style: 'short' }).format(
      processedTimeList,
    );
  };
}

export default RemainingTimeFormatter;
