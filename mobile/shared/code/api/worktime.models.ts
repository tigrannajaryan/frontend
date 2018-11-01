// API models for stylist working days and hours

export interface Workday {
  label: string;
  weekday_iso: number; // 1..7
  is_available: boolean;
  work_start_at: string; // time of day formatted as hh:mm:ss
  work_end_at: string;   // time of day formatted as hh:mm:ss
}

export interface Worktime {
  weekdays: Workday[];
}
