import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import * as moment from 'moment';
import { TodayService } from '~/today/today.service';
import { Appointment } from '~/today/today.models';
import { loading } from '~/core/utils/loading';
import { showAlert } from '~/core/utils/alert';
import { StylistProfile } from '~/core/stylist-service/stylist-models';
import { Observable } from '../../../node_modules/rxjs';
import { LoadProfileAction, ProfileState, selectProfile } from '~/today/user-header/profile.reducer';
import { Store } from '@ngrx/store';
import { TodayState } from '~/today/today.reducer';

export interface Upcoming {
  totalAppointments: number;
  upcomingAppointments: UpcomingAppointments[];
}
export interface UpcomingAppointments {
  day: string; // ISO 8601 YYYY-MM-DD
  appointments: Appointment[];
}

@IonicPage({ segment: 'upcoming' })
@Component({
  selector: 'page-upcoming',
  templateUrl: 'upcoming.component.html'
})
export class UpcomingComponent {
  protected profile: Observable<StylistProfile>;
  protected upcoming: Upcoming;

  /***
   * Convert appointments to appointments by date representation (UpcomingAppointments).
   * This method relies on appointments to be sorted before passed down as a param.
   * If we retrieve appointments from the API it always returns sorted list of appointments.
   * @param {[]} appointments = a sorted list of appointments obtained from the API.
   * @returns {Upcoming}
   */
  static buildUpcomingData(appointments: Appointment[]): Upcoming {
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

      const response = await this.todayService.getAppointments(new Date()) as Appointment[];

      this.upcoming = UpcomingComponent.buildUpcomingData(response);
    } catch (e) {
      showAlert('Loading stylist summary failed', e.message);
    }
  }
}
