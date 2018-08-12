import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

import { Workday, Worktime } from './worktime.models';
import { WorktimeApi } from './worktime.api';
import { convertMinsToHrsMins, Time, TimeRange } from '~/shared/time';
import { WeekdayIso } from '~/shared/weekday';
import { Logger } from '~/shared/logger';
import { PageNames } from '~/core/page-names';
import { loading } from '~/core/utils/loading';

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
class VisualWeekCard {
  constructor(
    readonly workStartAt: string,
    readonly workEndAt: string,
    readonly weekdays: VisualWeekday[]) { }

  calcDurationInMins(): number {
    try {
      const timeRange = new TimeRange(
        new Time(this.workStartAt),
        new Time(this.workEndAt));

      return timeRange.durationInMins();
    } catch (e) {
      // For visualization purposes invalid time range
      // should be shown as zero duration.
      return 0;
    }
  }

  getDurationStr(): string {
    return convertMinsToHrsMins(this.calcDurationInMins());
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

@IonicPage({ segment: 'worktime' })
@Component({
  selector: 'page-worktime-component',
  templateUrl: 'worktime.component.html'
})
export class WorktimeComponent {
  protected PageNames = PageNames;
  isProfile?: Boolean;

  cards: VisualWeekCard[] = [];

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
      WorktimeComponent.createWeekdays(enabled)
    );
  }

  constructor(
    private api: WorktimeApi,
    private navCtrl: NavController,
    private navParams: NavParams,
    private logger: Logger) {}

  async ionViewWillLoad(): Promise<void> {
    this.isProfile = Boolean(this.navParams.get('isProfile'));

    this.loadInitialData();
  }

  @loading
  async loadInitialData(): Promise<void> {
    // Load data from backend and show it
    const worktime = await this.api.getWorktime();
    this.cards = this.api2presentation(worktime);
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
    this.cards.push(WorktimeComponent.createCard(false));
  }

  deleteCard(index: number): void {
    this.cards.splice(index, 1);

    this.autoSave();
  }

  onContinue(): void {
    if (!this.isProfile) {
      // Continue registration on the next page
      this.navCtrl.push(PageNames.DiscountsInfo, {});
      this.autoSave();
    }
  }

  async autoSave(): Promise<void> {
    // Save to backend
   this.api.setWorktime(this.presentation2api(this.cards));
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
            WorktimeComponent.createWeekdays(false)
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
      cardsArray.push(WorktimeComponent.createCard(true));
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
