import { Injectable } from '@angular/core';
import { Actions, Effect } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { AlertController, LoadingController } from 'ionic-angular';

import { AppointmentDatesServiceMock } from '~/appointment/appointment-date/appointment-dates-service-mock';
import { Logger } from '~/shared/logger';

import {
  appointmentDatesActionTypes,
  AppointmentDatesState,
  GetDatesAction,
  GetDatesSuccessAction,
  selectAppointmentDates
} from '~/appointment/appointment-date/appointment-dates.reducer';

@Injectable()
export class AppointmentDatesEffects {

  @Effect() getDates = this.actions
    .ofType(appointmentDatesActionTypes.GET_DATES)
    .map((action: GetDatesAction) => action)
    .withLatestFrom(this.store.select(selectAppointmentDates))
    .filter(([action, { loaded }]) => !loaded)
    .map(([action]): GetDatesAction => action)
    .switchMap(action => Observable.defer(async () => {
      const loader = this.loadingCtrl.create();
      loader.present();
      try {
        const days = await this.appointmentDatesService.getDates(action.client);
        return new GetDatesSuccessAction(days);
      } catch (error) {
        const logger = new Logger();
        logger.error(error);
        const alert = this.alertCtrl.create({
          title: 'An error occurred',
          subTitle: 'Loading of dates failed',
          buttons: [
            'Dismiss',
            {
              text: 'Retry',
              handler: () => this.store.dispatch(new GetDatesAction(action.client))
            }
          ]
        });
        alert.present();
      } finally {
        loader.dismiss();
      }
    }));

  constructor(
    private actions: Actions,
    private alertCtrl: AlertController,
    private loadingCtrl: LoadingController,
    private appointmentDatesService: AppointmentDatesServiceMock,
    private store: Store<AppointmentDatesState>
  ) {
  }
}
