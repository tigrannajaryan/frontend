import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Actions, Effect } from '@ngrx/effects';
import { Observable } from 'rxjs';

import { StylistServiceProvider } from '~/core/stylist-service/stylist-service';
import { withLoader } from '~/core/utils/loading';
import { showAlert } from '~/core/utils/alert';
import { Logger } from '~/shared/logger';

import {
  LoadAction,
  LoadErrorAction,
  LoadSuccessAction,
  servicesActionTypes,
  ServicesState
} from './services.reducer';

@Injectable()
export class ServicesEffects {

  @Effect() load = this.actions
    .ofType(servicesActionTypes.LOAD)
    .map((action: LoadAction) => action)
    .switchMap(() => Observable.defer(withLoader(async () => {
      try {
        const { categories } = await this.stylistService.getStylistServices();
        return new LoadSuccessAction(categories);
      } catch (error) {
        showAlert(
          'An error occurred',
          'Loading of services failed',
          [{
            text: 'Retry',
            handler: () => this.store.dispatch(new LoadAction())
          }]
        );
        const logger = new Logger();
        logger.error(error);
        return new LoadErrorAction(error);
      }
    })));

  constructor(
    private actions: Actions,
    private store: Store<ServicesState>,
    private stylistService: StylistServiceProvider
  ) {
  }

}
