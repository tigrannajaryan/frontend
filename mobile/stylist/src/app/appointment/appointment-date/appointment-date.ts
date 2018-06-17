import * as moment from 'moment';

import { Component, ViewChild } from '@angular/core';
import { Store } from '@ngrx/store';
import { IonicPage, NavController } from 'ionic-angular';
import { Observable } from 'rxjs/Observable';

import { componentUnloaded } from '~/core/utils/component-unloaded';

import {
  AppointmentDatesState,
  GetDatesAction,
  select2WeeksDays,
  SelectDateAction
} from '~/appointment/appointment-date/appointment-dates.reducer';
import { AppointmentDate } from '~/appointment/appointment-date/appointment-dates-service-mock';

@IonicPage()
@Component({
  selector: 'page-appointment-date',
  templateUrl: 'appointment-date.html'
})
export class AppointmentDateComponent {
  private moment = moment;
  private days: AppointmentDate[];

  constructor(
    private navCtrl: NavController,
    private store: Store<AppointmentDatesState>
  ) {
  }

  ionViewDidEnter(): void {
    this.store
      .select(select2WeeksDays)
      .takeUntil(componentUnloaded(this))
      .subscribe(days => {
        this.days = days;
      });

    this.store.dispatch(new GetDatesAction());
  }

  select(date: AppointmentDate): void {
    this.store.dispatch(new SelectDateAction(date));
    this.navCtrl.pop();
  }
}
