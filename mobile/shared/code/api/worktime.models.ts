// API models for stylist working days and hours

export interface WorkdayAvailability {
  // Canonically we use is_available in Workdays API. Appointment’s one-day API introduced is_working_day.
  // All these changes means we should use either is_available or is_working_day.
  is_available?: boolean;
  is_working_day?: boolean;
}

export interface Workday extends WorkdayAvailability {
  label: string;
  weekday_iso: number; // 1..7
  work_start_at: string; // time of day formatted as hh:mm:ss
  work_end_at: string;   // time of day formatted as hh:mm:ss
  has_appointments?: boolean;
}

export type Weekdays = Workday[];

export interface Worktime {
  weekdays: Weekdays;
}
