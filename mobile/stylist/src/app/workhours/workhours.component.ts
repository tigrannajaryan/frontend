import { Component } from '@angular/core';
import { NavParams } from 'ionic-angular';
import * as moment from 'moment';

import { Workday, Worktime } from '~/shared/api/worktime.models';
import { WorktimeApi } from '~/core/api/worktime.api';
import { firstWeekday, lastWeekday, VisualWeekday, WeekdayIso } from '~/shared/weekday';
import { StylistProfile } from '~/shared/api/stylist-app.models';

import { PageNames } from '~/core/page-names';
import { loading } from '~/shared/utils/loading';
import { VisualWeekCard } from '~/shared/utils/worktime-utils';
import { ProfileDataStore } from '~/core/profile.data';

export interface WorkHoursComponentParams {
  isRootPage?: boolean;
}

@Component({
  selector: 'page-hours',
  templateUrl: 'workhours.component.html'
})
export class WorkHoursComponent {
  // Expose to the view:
  moment = moment;
  protected PageNames = PageNames;
  params: WorkHoursComponentParams;

  cards: VisualWeekCard[] = [];
  isLoading = false;

  constructor(
    public profileData: ProfileDataStore,
    private api: WorktimeApi,
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
      this.cards = VisualWeekCard.worktime2presentation(response);
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
    this.cards.push(VisualWeekCard.createCard(false));
  }

  deleteCard(index: number): void {
    this.cards.splice(index, 1);

    this.autoSave();
  }

  autoSave(): void {
    // Save to backendworkhours.component.ts
    this.api.setWorktime(this.presentation2api(this.cards)).get();
  }

  private async performInitialSaving(): Promise<void> {
    let profile: StylistProfile;
    const { response } = await this.profileData.get();
    if (response) {
      profile = response;
    }

    if (profile && profile.profile_status && !profile.profile_status.has_business_hours_set) {
      await this.api.setWorktime(this.presentation2api(this.cards)).get();
    }
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
