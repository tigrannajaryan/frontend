import { firstWeekday, lastWeekday, VisualWeekday, WeekdayIso } from '~/shared/weekday';
import { convertMinsToHrsMins, Time, TimeRange } from '~/shared/time';
import { WEEKDAY_SHORT_NAMES } from '../weekday';
import { Worktime } from '~/shared/api/worktime.models';
import { Logger } from '~/shared/logger';

/**
 * Represents a pair of [start, end] hours in string form.
 */
type HourRange = [string, string];

/**
 * Default start/end times for new worktime cards.
 */
export const defaultStartTime = '09:00'; // 24 hour hh:mm format
export const defaultEndTime = '17:00'; // 24 hour hh:mm format

/**
 * Represents a week card with start/end times and
 * the list of weekdays.
 */
export class VisualWeekCard {
  private static logger: Logger;
  readonly weekdays: VisualWeekday[];
  private _timeRange: TimeRange;
  private _workStartAt: string;
  private _workEndAt: string;

  get workStartAt(): string {
    return this._workStartAt;
  }

  set workStartAt(v: string) {
    this._workStartAt = v;
    this.recalcTimeRange();
  }

  get workEndAt(): string {
    return this._workEndAt;
  }

  set workEndAt(v: string) {
    this._workEndAt = v;
    this.recalcTimeRange();
  }

  /**
   * Create an array of 7 weekday elements.
   * @param enabled set all days to enabled or disabled state
   */
  static createWeekdays(enabled: boolean): VisualWeekday[] {
    const days: VisualWeekday[] = [];
    for (let i = firstWeekday; i <= lastWeekday; i++) {
      days.push({ weekdayIso: i, enabled, label: WeekdayIso[i] });
    }

    return days;
  }

  /**
   * Create a new card with all days enabled or disabled
   * and with the same start/end times.
   */
  static createCard(enabled: boolean, hourRange?: TimeRange): VisualWeekCard {
    return new VisualWeekCard(
        defaultStartTime,
        defaultEndTime,
        VisualWeekCard.createWeekdays(enabled),
        hourRange
    );
  }

  /**
   * Convert API data model to presentation model.
   */
  static worktime2presentation(data: Worktime): VisualWeekCard[] {

    const cardsMapByTime: Map<string, VisualWeekCard> = new Map();

    for (const weekday of data.weekdays) {
      if (!weekday.work_start_at || !weekday.work_end_at) {
        // Invalid data model entry. Ignore and skip.
        continue;
      }

      try {
        // Create a time range to use as the key of the map.
        const hourRange: HourRange = [weekday.work_start_at, weekday.work_end_at];
        const cardKey = hourRange.toString();

        let card: VisualWeekCard = cardsMapByTime.get(cardKey);
        if (!card) {
          const timeRange: TimeRange = new TimeRange(
              new Time(weekday.work_start_at),
              new Time(weekday.work_end_at));

          // We don't have a card for this time range. Create a new one.
          card = new VisualWeekCard(
              weekday.work_start_at,
              weekday.work_end_at,
              VisualWeekCard.createWeekdays(false),
              timeRange
          );
          cardsMapByTime.set(cardKey, card);
        }
        // Set the day in the card
        card.weekdays[weekday.weekday_iso - firstWeekday] = {
          weekdayIso: weekday.weekday_iso,
          label: WeekdayIso[weekday.weekday_iso],
          enabled: weekday.is_available
        };

      } catch (e) {
        // Ignore invalid response from api
        VisualWeekCard.logger.error(`Error decoding Worktime: ${e}`);
      }
    }

    const cardsArray: VisualWeekCard[] = [];

    // Convert the map to array of cards
    for (const [, card] of cardsMapByTime) {
      cardsArray.push(card);
    }

    if (cardsArray.length === 0) {
      // No cards in the input data, but must have at least one card
      // so create one with all days enabled.
      cardsArray.push(VisualWeekCard.createCard(true));
    }

    return cardsArray;
  }

  constructor(
      workStartAt: string,
      workEndAt: string,
      weekdays: VisualWeekday[],
      timeRange?: TimeRange
  ) {
    this._workStartAt = workStartAt;
    this._workEndAt = workEndAt;
    this._timeRange = timeRange;
    this.weekdays = weekdays.sort((a, b) => a.weekdayIso - b.weekdayIso);
    this.recalcTimeRange();
  }

  calcDurationInMins(): number {
    if (this._timeRange) {
      return this._timeRange.durationInMins();
    } else {
      // For visualization purposes invalid time range
      // should be shown as zero duration.
      return 0;
    }
  }

  getDurationStr(): string {
    return convertMinsToHrsMins(this.calcDurationInMins());
  }

  getSummaryStr(): string {
    if (this.weekdays.length < 1) {
      return '';
    }

    let result = '';

    let lastStart;
    for (let i = 0; i < this.weekdays.length;) {
      // Find next enabled day
      while (i < this.weekdays.length && !this.weekdays[i].enabled) {
        i++;
      }

      if (i < this.weekdays.length) {
        lastStart = this.weekdays[i];
      } else {
        // Couldn't find, end.
        break;
      }

      // Find next disabled day
      while (i < this.weekdays.length && this.weekdays[i].enabled) {
        i++;
      }

      // We now have a continuous enabled day block

      if (result) {
        // Add comma to previous result
        result = `${result}, `;
      }

      if (this.weekdays[i - 1].weekdayIso - lastStart.weekdayIso > 0) {
        // Block is more than day, use "Mon - Wed" format.
        // tslint:disable-next-line:prefer-template
        result = result +
            WEEKDAY_SHORT_NAMES[lastStart.weekdayIso] + ' - ' +
            WEEKDAY_SHORT_NAMES[this.weekdays[i - 1].weekdayIso];
      } else {
        // One day block, use "Mon" format.
        result = result +
            WEEKDAY_SHORT_NAMES[lastStart.weekdayIso];
      }
    }

    if (result && this._timeRange) {
      // Add time to the result
      result = `${result}: ${this._timeRange.toString()}`;
    }
    return result;
  }

  private recalcTimeRange(): void {
    try {
      this._timeRange = new TimeRange(
          new Time(this.workStartAt),
          new Time(this.workEndAt));
    } catch {
      this._timeRange = undefined;
    }
  }
}
