// API models for stylist working days and hours

export interface WorkdayAvailability {
  is_available: boolean;
}

export interface Workday extends WorkdayAvailability {
  label: string;
  weekday_iso: number; // 1..7
  work_start_at: string; // time of day formatted as hh:mm:ss
  work_end_at: string;   // time of day formatted as hh:mm:ss
  has_appointments?: boolean;
}

export interface Worktime {
  weekdays: Workday[];
}
