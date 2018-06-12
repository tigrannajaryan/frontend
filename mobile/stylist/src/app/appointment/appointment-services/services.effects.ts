import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Actions, Effect } from '@ngrx/effects';
import { Observable } from 'rxjs';

import { AlertController, LoadingController } from 'ionic-angular';

import { Logger } from '~/shared/logger';
import { StylistServiceProvider } from '~/core/stylist-service/stylist-service';

import {
  LoadAction,
  LoadErrorAction,
  LoadSuccessAction,
  selectService,
  servicesActionTypes,
  ServicesState
} from './services.reducer';

@Injectable()
export class ServicesEffects {

  @Effect() load = this.actions
    .ofType(servicesActionTypes.LOAD)
    .withLatestFrom(this.store.select(selectService))
    .filter(([action, { loaded }]) => !loaded)
    .switchMap(() => Observable.defer(async () => {
      const loader = this.loadingCtrl.create();
      loader.present();
      try {
        const { categories } = await this.stylistService.getStylistServices();
        return new LoadSuccessAction(categories);
      } catch (error) {
        const logger = new Logger();
        logger.error(error);
        const alert = this.alertCtrl.create({
          title: 'An error occurred',
          subTitle: 'Loading of services failed',
          buttons: [
            'Dismiss',
            {
              text: 'Retry',
              handler: () => this.store.dispatch(new LoadAction())
            }
          ]
        });
        alert.present();
        return new LoadErrorAction(error);
      } finally {
        loader.dismiss();
      }
    }));

  constructor(
    private actions: Actions,
    private alertCtrl: AlertController,
    private loadingCtrl: LoadingController,
    private store: Store<ServicesState>,
    private stylistService: StylistServiceProvider
  ) {
  }

}
