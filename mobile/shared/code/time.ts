import * as moment from 'moment';

/**
 * Represents time of a day.
 */
export class Time {
  readonly secondsSinceMidnight: number;
  private timeMoment: moment.Moment;

  constructor(str: string) {
    this.timeMoment = moment(str, 'HH:mm:ss');
    if (!this.timeMoment.isValid()) {
      throw Error('Invalid time');
    }

    const midnight = this.timeMoment.clone()
      .startOf('day');

    const diffSecs = this.timeMoment.diff(midnight, 'seconds');
    this.secondsSinceMidnight = diffSecs;
  }

  laterThan(other: Time): boolean {
    return this.secondsSinceMidnight > other.secondsSinceMidnight;
  }

  toString(): string {
    if (this.timeMoment.minutes()) {
      return this.timeMoment.format('h:mma');
    } else {
      return this.timeMoment.format('ha');
    }
  }
}

/**
 * Represents a pair of times of a day (a range).
 */
export class TimeRange {
  readonly start: Time;
  readonly end: Time;

  constructor(start: Time, end: Time) {
    if (start.laterThan(end)) {
      throw Error('start cannot be later than end');
    }
    this.start = start;
    this.end = end;
  }

  durationInMins(): number {
    return (this.end.secondsSinceMidnight - this.start.secondsSinceMidnight) / 60;
  }

  toString(): string {
    return `${this.start.toString()}-${this.end.toString()}`;
  }
}

export enum FormatType { ShortForm, LongForm }

/**
 * It get number in minutes and return converted string
 * input: 60
 * output: 1h 0m
 */
export function convertMinsToHrsMins(mins: number, format: FormatType = FormatType.LongForm): string {
  const h = Math.floor(mins / 60);
  const m = mins % 60;

  if (format === FormatType.ShortForm) {
    let result = h !== 0 ? `${h}h` : '';
    result += m !== 0 ? ` ${m < 10 ? '0' : ''}${m}m` : '';
    return result.trim();
  }

  return `${h}h ${m < 10 ? '0' : ''}${m}m`;
}
