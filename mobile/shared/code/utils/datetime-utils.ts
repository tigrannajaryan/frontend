import * as moment from 'moment';

/**
 * Returns the time portion of Moment as a number of hours since midnight.
 */
export function getHoursSinceMidnight(dateTime: moment.Moment): number {
  const dayStart = dateTime.clone().startOf('day');
  const hourOfDay = moment.duration(dateTime.diff(dayStart)).asHours();
  return hourOfDay;
}
