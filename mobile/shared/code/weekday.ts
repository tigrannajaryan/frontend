// Weekday ISO matchings
export enum WeekdayIso {
  Mon = 1, Tue, Wed, Thu, Fri, Sat, Sun
}

// To be used in calendars
export interface Weekday {
  isoWeekday: WeekdayIso; // from 1 (Mon) to 7 (Sun)
}

// To get weekday full name, e.g. WEEKDAY_FULL_NAMES[WeekdayIso.Fri]
export const WEEKDAY_FULL_NAMES = [undefined, 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export const WEEKDAY_SHORT_NAMES = [undefined, 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export const firstWeekday = WeekdayIso.Mon;
export const lastWeekday = WeekdayIso.Sun;

/**
 * Represents one weekday box inside a week card
 */
export interface VisualWeekday {
  weekdayIso: WeekdayIso;
  label: string;
  enabled: boolean;
}

/**
 * Get today’s weekday ISO value (from 1 to 7)
 * JS 0(Sun)..6(Sat) –> ISO 1(Mon)..7(Sun)
 * @return 1(Mon)..7(Sun)
 */
export function getTodayWeekdayISO(): number {
  return (new Date()).getDay() || 7;
}
