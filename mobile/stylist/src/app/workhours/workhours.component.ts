import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';

import { Workday, Worktime } from '~/shared/api/worktime.models';
import { WorktimeApi } from '~/core/api/worktime.api';
import { convertMinsToHrsMins, Time, TimeRange } from '~/shared/time';
import { WEEKDAY_SHORT_NAMES, WeekdayIso } from '~/shared/weekday';
import { Logger } from '~/shared/logger';
import { getProfileStatus, updateProfileStatus } from '~/shared/storage/token-utils';
import { StylistProfileStatus } from '~/shared/api/stylist-app.models';

import { PageNames } from '~/core/page-names';
import { loading } from '~/shared/utils/loading';

const firstWeekday = WeekdayIso.Mon;
const lastWeekday = WeekdayIso.Sun;

/**
 * Represents one weekday box inside a week card
 */
interface VisualWeekday {
  weekdayIso: WeekdayIso;
  label: string;
  enabled: boolean;
}

/**
 * Represents a week card with start/end times and
 * the list of weekdays.
 */
export class VisualWeekCard {
  readonly weekdays: VisualWeekday[];
  private timeRange: TimeRange;
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

  constructor(
    workStartAt: string,
    workEndAt: string,
    weekdays: VisualWeekday[]
  ) {
    this._workStartAt = workStartAt;
    this._workEndAt = workEndAt;
    this.recalcTimeRange();
    this.weekdays = weekdays.sort((a, b) => a.weekdayIso - b.weekdayIso);
  }

  calcDurationInMins(): number {
    if (this.timeRange) {
      return this.timeRange.durationInMins();
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

    if (result && this.timeRange) {
      // Add time to the result
      result = `${result}: ${this.timeRange.toString()}`;
    }
    return result;
  }

  private recalcTimeRange(): void {
    try {
      this.timeRange = new TimeRange(
        new Time(this.workStartAt),
        new Time(this.workEndAt));
    } catch {
      this.timeRange = undefined;
    }
  }
}

/**
 * Default start/end times for new worktime cards.
 */
export const defaultStartTime = '09:00'; // 24 hour hh:mm format
export const defaultEndTime = '17:00'; // 24 hour hh:mm format

/**
 * Represents a pair of [start, end] hours in string form.
 */
type HourRange = [string, string];

export interface WorkHoursComponentParams {
  isRootPage?: boolean;
}

@Component({
  selector: 'page-hours',
  templateUrl: 'workhours.component.html'
})
export class WorkHoursComponent {
  protected PageNames = PageNames;
  params: WorkHoursComponentParams;

  cards: VisualWeekCard[] = [];
  isLoading = false;

  /**
   * Create an array of 7 weekday elements.
   * @param enabled set all days to enabled or disabled state
   */
  private static createWeekdays(enabled: boolean): VisualWeekday[] {
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
  private static createCard(enabled: boolean): VisualWeekCard {
    return new VisualWeekCard(
      defaultStartTime,
      defaultEndTime,
      WorkHoursComponent.createWeekdays(enabled)
    );
  }

  constructor(
    private api: WorktimeApi,
    private logger: Logger,
    private navCtrl: NavController,
    private navParams: NavParams
  ) { }

  async ionViewWillLoad(): Promise<void> {
    await this.loadInitialData();
    await this.performInitialSaving(); // if needed
  }

  async loadInitialData(): Promise<void> {
    this.params = this.navParams.get('params') as WorkHoursComponentParams;
    // Load data from backend and show it
    const { response } = await loading(this, this.api.getWorktime().get());
    if (response) {
      this.cards = this.api2presentation(response);
    }
  }

  /**
   * Click handler for weekday box. Toggles the state of the day.
   */
  toggleWeekday(toogleDay: VisualWeekday): void {
    // If the day is to be enabled, disable the same day
    // from all other cards first.
    if (!toogleDay.enabled) {
      for (const card of this.cards) {
        for (const day of card.weekdays) {
          if (day.weekdayIso === toogleDay.weekdayIso) {
            day.enabled = false;
            break;
          }
        }
      }
    }
    // Now toggle the day
    toogleDay.enabled = !toogleDay.enabled;

    this.autoSave();
  }

  addNewCard(): void {
    this.cards.push(WorkHoursComponent.createCard(false));
  }

  deleteCard(index: number): void {
    this.cards.splice(index, 1);

    this.autoSave();
  }

  onContinue(): void {
    if (!(this.params && this.params.isRootPage)) {
      // Continue registration on the next page
      this.navCtrl.push(PageNames.DiscountsWeekday);
      this.autoSave();
    }
  }

  autoSave(): void {
    // Save to backend
    this.api.setWorktime(this.presentation2api(this.cards)).get();
  }

  private async performInitialSaving(): Promise<void> {
    const profileStatus = await getProfileStatus() as StylistProfileStatus;
    if (profileStatus && !profileStatus.has_business_hours_set) {
      const { response } = await this.api.setWorktime(this.presentation2api(this.cards)).get();
      if (response) {
        await updateProfileStatus({
          ...profileStatus,
          has_business_hours_set: true
        });
      }
    }
  }

  /**
   * Convert API data model to presentation model.
   */
  private api2presentation(data: Worktime): VisualWeekCard[] {

    const cardsMapByTime: Map<string, VisualWeekCard> = new Map();

    for (const weekday of data.weekdays) {
      if (!weekday.work_start_at || !weekday.work_end_at) {
        // Invalid data model entry. Ignore and skip.
        continue;
      }

      try {
        // Create a time range to use as the key of the map.
        const timeRange: HourRange = [weekday.work_start_at, weekday.work_end_at];
        const cardKey = timeRange.toString();

        let card: VisualWeekCard = cardsMapByTime.get(cardKey);
        if (!card) {
          // We don't have a card for this time range. Create a new one.
          card = new VisualWeekCard(
            weekday.work_start_at,
            weekday.work_end_at,
            WorkHoursComponent.createWeekdays(false)
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
        this.logger.error(`Error decoding Worktime: ${e}`);
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
      cardsArray.push(WorkHoursComponent.createCard(true));
    }

    return cardsArray;
  }

  /**
   * Convert the presentation layer cards to API data models.
   */
  // tslint:disable-next-line:prefer-function-over-method
  private presentation2api(cards: VisualWeekCard[]): Worktime {

    // Create all disabled weekdays first
    const weekdays: Workday[] = [];

    for (let i = firstWeekday; i <= lastWeekday; i++) {
      weekdays.push({
        label: WeekdayIso[i],
        weekday_iso: i,
        work_start_at: undefined,
        work_end_at: undefined,
        is_available: false
      });
    }

    const worktime: Worktime = { weekdays };

    // Now enable all weekdays that are enabled on any card
    // and set correct times for them.
    for (const card of cards) {
      for (const weekday of card.weekdays) {
        if (weekday.enabled) {
          const day: Workday = {
            label: WeekdayIso[weekday.weekdayIso],
            weekday_iso: weekday.weekdayIso,
            work_start_at: card.workStartAt,
            work_end_at: card.workEndAt,
            is_available: weekday.enabled
          };
          worktime.weekdays[weekday.weekdayIso - firstWeekday] = day;
        }
      }
    }

    return worktime;
  }
}
