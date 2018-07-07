import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';

import { ServicesPricesParams, StylistServiceProvider } from '~/core/stylist-service/stylist-service';
import { withLoader } from '~/core/utils/loading';
import { showAlert } from '~/core/utils/alert';
import { Logger } from '~/shared/logger';

import {
  appointmentDatesActionTypes,
  AppointmentDatesState,
  GetDatesAction,
  GetDatesErrorAction,
  GetDatesSuccessAction
} from '~/appointment/appointment-date/appointment-dates.reducer';
import { map, switchMap } from 'rxjs/operators';
import { defer } from 'rxjs/internal/observable/defer';

@Injectable()
export class AppointmentDatesEffects {

  @Effect() getDates = this.actions
    .pipe(
      ofType(appointmentDatesActionTypes.GET_DATES),
      map((action: GetDatesAction) => action),
      switchMap(action => defer(withLoader(async () => {
        try {
          const params: ServicesPricesParams = {
            service_uuid: action.service.uuid
          };
          if (action.client && action.client.uuid) {
            params.client_uuid = action.client.uuid;
          }
          const {prices} = await this.stylistService.getServicesPricesByDate(params);
          return new GetDatesSuccessAction(prices);
        } catch (error) {
          showAlert(
            'An error occurred',
            'Loading of dates failed',
            [{
              text: 'Retry',
              handler: () => this.store.dispatch(new GetDatesAction(action.service, action.client))
            }]
          );
          const logger = new Logger();
          logger.error(error);
          return new GetDatesErrorAction(error);
        }
      })))
    );

  constructor(
    private actions: Actions,
    private stylistService: StylistServiceProvider,
    private store: Store<AppointmentDatesState>
  ) {
  }
}
