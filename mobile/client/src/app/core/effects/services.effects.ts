import { Injectable } from '@angular/core';
import { Actions, Effect } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';

// import { LOADING_DELAY } from '~/core/api/request.models';
import { ServicesServiceMock } from '~/core/api/services-service.mock';
import {
  GetStylistServicesAction,
  GetStylistServicesErrorAction,
  GetStylistServicesSuccessAction,
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
        // TODO: force to update?
        return Observable.of(new GetStylistServicesSuccessAction(action.stylistUuid, stylistCategories));
      }
      const params: GetStylistServicesParams = {
        stylist_uuid: action.stylistUuid
      };
      return (
        this.servicesService.getStylistServices(params)
          .map(({ response, errors }) => {
            if (errors) {
              // TODO: might return wrong errors in race condition, should be fixed
              return new GetStylistServicesErrorAction(errors);
            }
            return new GetStylistServicesSuccessAction(response.stylist_uuid, response.categories);
          })
      );
    });

  // @Effect({ dispatch: false }) getStylistServicesLoading = this.actions
  //   .ofType(servicesActionTypes.GET_STYLIST_SERVICES_LOADING)
  //   .delay(LOADING_DELAY)
  //   .withLatestFrom(this.store)
  //   .map(([action, store]) => {
  //     if (!selectRequestCodeSucceeded(store)) {
  //       this.store.dispatch(new RequestCodeLoadingAction());
  //     }
  //   });

  constructor(
    private actions: Actions,
    private servicesService: ServicesServiceMock,
    private store: Store<ServicesState>
  ) {
  }
}
