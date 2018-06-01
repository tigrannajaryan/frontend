import * as moment from 'moment';

import { Component } from '@angular/core';
import { DatePipe } from '@angular/common';
import { AlertController, IonicPage, LoadingController } from 'ionic-angular';

import { StylistServiceProvider } from '~/core/stylist-service/stylist-service';
import { TableData } from '~/core/components/made-table/made-table';
import { StylistProfile } from '~/core/stylist-service/stylist-models';

import { convertMinsToHrsMins, FormatType } from '~/shared/time';

export const WEEKDAY_FULL_NAMES = ['', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

@IonicPage()
@Component({
  selector: 'page-profile',
  templateUrl: 'profile.html'
})
export class ProfileComponent {
  profile: StylistProfile;
  services: TableData;
  worktime: TableData;
  allServicesCount: number;
  bookedHours: number;
  bookedMinutes: number;

  constructor(
    private alertCtrl: AlertController,
    private loadingCtrl: LoadingController,
    private stylistService: StylistServiceProvider,
    private datePipe: DatePipe
  ) {
  }

  async ionViewWillEnter(): Promise<void> {
    const loader = this.loadingCtrl.create();
    loader.present();
    try {
      await this.loadStylistSummary();
    } finally {
      loader.dismiss();
    }
  }

  getServicesTableData(services): TableData {
    return {
      header: ['Service', 'Duration', 'Price'],
      body: services.map(({name, duration_minutes, base_price}) => ([
        name,
        convertMinsToHrsMins(duration_minutes, FormatType.ShortForm),
        `$${base_price}`
      ]))
    };
  }

  getWorktimeTableData(worktime): TableData {
    return {
      header: ['Day', 'Working hours', 'Booked time'],
      body:
        worktime
          .filter(day => day.is_available)
          .map(({weekday_iso, work_end_at, work_start_at, booked_time_minutes}) => ([
            WEEKDAY_FULL_NAMES[weekday_iso],
            `${this.formatTime(work_start_at)} – ${this.formatTime(work_end_at)}`,
            convertMinsToHrsMins(booked_time_minutes, FormatType.ShortForm)
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

  async loadStylistSummary(): Promise<void> {
    try {
      const data = await this.stylistService.getStylistSummary();

      this.profile = data.profile;
      this.profile.profile_photo_url = `url(${this.profile.profile_photo_url})`;

      this.services = this.getServicesTableData(data.services);
      this.allServicesCount = data.services_count;

      this.worktime = this.getWorktimeTableData(data.worktime);

      this.bookedHours = Math.floor(data.total_week_booked_minutes / 60);
      this.bookedMinutes = data.total_week_booked_minutes % 60;

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
