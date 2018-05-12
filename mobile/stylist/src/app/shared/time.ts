import * as moment from 'moment';

/**
 * Represents time of a day.
 */
export class Time {
  readonly secondsSinceMidnight: number;

  constructor(str: string) {
    const m = moment(str, 'HH:mm:ss');
    if (!m.isValid()) {
      throw Error('Invalid time');
    }

    const midnight = m.clone()
      .startOf('day');

    const diffSecs = m.diff(midnight, 'seconds');
    this.secondsSinceMidnight = diffSecs;
  }

  laterThan(other: Time): boolean {
    return this.secondsSinceMidnight > other.secondsSinceMidnight;
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
}

/**
 * It get number in minutes and return converted string
 * input: 60
 * output: 1h 0m
 */
export function convertMinsToHrsMins(mins: number): string {
  const h = Math.floor(mins / 60);
  const m = mins % 60;

  return `${h}h ${m < 10 ? '0' : ''}${m}m`;
}
