import { Injectable } from '@angular/core';
import { Actions, Effect } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';

import { LOADING_DELAY, RequestState } from '~/core/api/request.models';
import { ServicesService } from '~/core/api/services-service';
import {
  GetStylistServicesAction,
  GetStylistServicesErrorAction,
  GetStylistServicesLoadingAction,
  GetStylistServicesSuccessAction,
  selectServicesRequestState,
  selectStylistServiceCategories,
  servicesActionTypes,
  ServicesState
} from '~/core/reducers/services.reducer';
import { GetStylistServicesParams } from '~/core/api/services.models';

@Injectable()
export class ServicesEffects {

  @Effect() getStylistServices = this.actions
    .ofType(servicesActionTypes.GET_STYLIST_SERVICES)
    .map((action: GetStylistServicesAction) => action)
    .withLatestFrom(this.store)
    .switchMap(([action, state]) => {
      const stylistCategories = selectStylistServiceCategories(action.stylistUuid)(state);
      if (stylistCategories) { // already loaded
        return Observable.of(new GetStylistServicesSuccessAction(action.stylistUuid, stylistCategories));
      }
      const params: GetStylistServicesParams = {
        stylist_uuid: action.stylistUuid
      };
      return (
        this.servicesService.getStylistServices(params)
          .map(({ response, error }) => {
            if (error) {
              return new GetStylistServicesErrorAction(error);
            }
            return new GetStylistServicesSuccessAction(response.stylist_uuid, response.categories);
          })
      );
    });

  @Effect({ dispatch: false }) getStylistServicesLoading = this.actions
    .ofType(servicesActionTypes.GET_STYLIST_SERVICES)
    .delay(LOADING_DELAY)
    .withLatestFrom(this.store)
    .map(([action, store]) => {
      if (selectServicesRequestState(store) === RequestState.NotStarted) {
        this.store.dispatch(new GetStylistServicesLoadingAction());
      }
    });

  constructor(
    private actions: Actions,
    private servicesService: ServicesService,
    private store: Store<ServicesState>
  ) {
  }
}
