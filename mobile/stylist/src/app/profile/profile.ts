import * as moment from 'moment';

import { Component } from '@angular/core';
import { DatePipe } from '@angular/common';
import { AlertController, IonicPage } from 'ionic-angular';

import { getTodayWeekdayISO, WEEKDAY_FULL_NAMES } from '~/shared/weekday';

import { loading } from '~/core/utils/loading';
import { StylistServiceProvider } from '~/core/stylist-service/stylist-service';
import { TableData } from '~/core/components/made-table/made-table';
import { StylistProfile, WorkdayInSummary } from '~/core/stylist-service/stylist-models';
import { PageNames } from '~/core/page-names';

@IonicPage()
@Component({
  selector: 'page-profile',
  templateUrl: 'profile.html'
})
export class ProfileComponent {
  protected PageNames = PageNames;
  profile?: StylistProfile;
  services?: TableData;
  worktime?: TableData;
  allServicesCount?: number;
  today?: WorkdayInSummary;
  totalAppointmentsThisWeek?: number;

  constructor(
    private alertCtrl: AlertController,
    private stylistService: StylistServiceProvider,
    private datePipe: DatePipe
  ) {
  }

  ionViewWillEnter(): void {
    this.loadStylistSummary();
  }

  getServicesTableData(services): TableData {
    return {
      header: ['Service', 'Price'],
      body: services.map(({name, base_price}) => ([name, `$${base_price}`]))
    };
  }

  getWorktimeTableData(worktime): TableData {
    return {
      header: ['Day', 'Working hours', 'Visits count'],
      body:
        worktime
          .filter(day => day.is_available)
          .sort((a, b) => a.weekday_iso - b.weekday_iso) // from 1 (Monday) to 7 (Sunday)
          .map(({weekday_iso, work_end_at, work_start_at, booked_appointments_count}) => ([
            WEEKDAY_FULL_NAMES[weekday_iso],
            `${this.formatTime(work_start_at)} – ${this.formatTime(work_end_at)}`,
            booked_appointments_count
          ]))
    };
  }

  /**
   * Formats hh:mm time string to h:mmaaaaa, e.g. 16:00 –> 4:00a
   * @param  time hh:mm
   * @return      h:mmaaaaa
   */
  formatTime(time: string): string {
    return this.datePipe.transform(moment(time, 'hh:mm'), 'h:mmaaaaa');
  }

  @loading
  async loadStylistSummary(): Promise<void> {
    try {
      const data = await this.stylistService.getStylistSummary();

      this.profile = data.profile;
      this.profile.profile_photo_url = `url(${this.profile.profile_photo_url})`;

      this.services = this.getServicesTableData(data.services);
      this.allServicesCount = data.services_count;

      this.worktime = this.getWorktimeTableData(data.worktime);

      const todayWeekdayISO = getTodayWeekdayISO();

      this.today = data.worktime.find(day => day.weekday_iso === todayWeekdayISO);
      this.totalAppointmentsThisWeek = data.total_week_appointments_count;
    } catch (e) {
      const alert = this.alertCtrl.create({
        title: 'Loading stylist summary failed',
        subTitle: e.message,
        buttons: ['Dismiss']
      });
      alert.present();
    }
  }
}
