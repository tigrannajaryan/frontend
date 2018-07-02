import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { Observable } from '../../../node_modules/rxjs';
import { Store } from '@ngrx/store';
import * as moment from 'moment';

import { TodayService } from '~/today/today.service';
import { Appointment, AppointmentParams } from '~/today/today.models';
import { loading } from '~/core/utils/loading';
import { showAlert } from '~/core/utils/alert';
import { StylistProfile } from '~/core/stylist-service/stylist-models';
import { LoadProfileAction, ProfileState, selectProfile } from '~/today/user-header/profile.reducer';
import { TodayState } from '~/today/today.reducer';
import { UpcomingHistory, UpcomingHistoryNavParams } from '~/upcoming-history/upcoming-history.model';

@IonicPage({ segment: 'upcoming' })
@Component({
  selector: 'page-upcoming',
  templateUrl: 'upcoming-history.component.html'
})
export class UpcomingHistoryComponent {
  @ViewChild('content') content: any;
  protected profile: Observable<StylistProfile>;
  protected upcoming: UpcomingHistory;
  protected params: UpcomingHistoryNavParams;

  /***
   * Convert appointments to appointments by date representation (UpcomingHistoryAppointments).
   * This method relies on appointments to be sorted before passed down as a param.
   * If we retrieve appointments from the API it always returns sorted list of appointments.
   * @param {[]} appointments = a sorted list of appointments obtained from the API.
   * @returns {UpcomingHistory}
   */
  static buildUpcomingData(appointments: Appointment[]): UpcomingHistory {
    return {
      totalAppointments: appointments.length,
      upcomingAppointments:
        appointments.reduce((appointmentsByDay, appointment) => {
          const day = moment(appointment.datetime_start_at).format('YYYY-MM-DD');
          let last = appointmentsByDay[appointmentsByDay.length - 1];

          if (last === undefined || last.day !== day) {
            last = { day, appointments: [] };
            appointmentsByDay.push(last);
          }
          last.appointments.push(appointment);

          return appointmentsByDay;
        }, [])
    };
  }

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private todayService: TodayService,
    private store: Store<TodayState & ProfileState>
  ) {
  }

  ionViewDidEnter(): void {
    this.init();
  }

  @loading
  async init(): Promise<void> {
    try {
      this.profile = this.store.select(selectProfile);
      // Load profile info
      this.store.dispatch(new LoadProfileAction());

      this.params = this.navParams.data as UpcomingHistoryNavParams;

      const appointmentParams: AppointmentParams = {};
      if (this.params && this.params.isHistory) {
        appointmentParams.date_to = new Date();
      } else {
        appointmentParams.date_from = new Date();
      }

      const response = await this.todayService.getAppointments(appointmentParams) as Appointment[];

      this.upcoming = UpcomingHistoryComponent.buildUpcomingData(response);

      // scroll to the bottom of the page if this is History page
      if (this.params && this.params.isHistory) {
        setTimeout(() => {
          this.content.scrollToBottom(300);
        });
      }
    } catch (e) {
      showAlert('Loading stylist summary failed', e.message);
    }
  }
}
