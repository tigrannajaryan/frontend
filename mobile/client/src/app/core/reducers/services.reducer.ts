import { Action, createFeatureSelector, createSelector } from '@ngrx/store';

import { RequestState } from '~/core/api/request.models';
import { ApiError } from '~/core/api/errors.models';
import { ServiceCategoryModel, ServiceModel } from '~/core/api/services.models';

export enum servicesActionTypes {
  GET_STYLIST_SERVICES = 'SERVICES_GET_STYLIST_SERVICES',
  GET_STYLIST_SERVICES_LOADING = 'SERVICES_GET_STYLIST_SERVICES_LOADING',
  GET_STYLIST_SERVICES_ERROR = 'SERVICES_GET_STYLIST_SERVICES_ERROR',
  GET_STYLIST_SERVICES_SUCCESS = 'SERVICES_GET_STYLIST_SERVICES_SUCCESS'
}

export class GetStylistServicesAction implements Action {
  readonly type = servicesActionTypes.GET_STYLIST_SERVICES;
  readonly requestState = RequestState.NotStarted;
  constructor(public stylistUuid: string) {}
}

export class GetStylistServicesLoadingAction implements Action {
  readonly type = servicesActionTypes.GET_STYLIST_SERVICES_LOADING;
  readonly requestState = RequestState.Loading;
}

export class GetStylistServicesErrorAction implements Action {
  readonly type = servicesActionTypes.GET_STYLIST_SERVICES_ERROR;
  readonly requestState = RequestState.Failed;
  constructor(public errors: ApiError[]) {}
}

export class GetStylistServicesSuccessAction implements Action {
  readonly type = servicesActionTypes.GET_STYLIST_SERVICES_SUCCESS;
  readonly requestState = RequestState.Succeeded;
  constructor(
    public stylistUuid: string,
    public serviceCategories: ServiceCategoryModel[]
  ) {}
}

type Actions =
  | GetStylistServicesAction
  | GetStylistServicesLoadingAction
  | GetStylistServicesErrorAction
  | GetStylistServicesSuccessAction;

interface ServiceCategoriesByStylist {
  [stylistUuid: string]: ServiceCategoryModel[];
}

export interface ServicesState {
  stylistUuid?: string;

  serviceCategories: ServiceCategoriesByStylist;

  // TODO: in oreder to prevent race condition problems
  // place requestState, errors and requestTimestamp
  // inside serviceCategoriesMeta hash
  requestState: RequestState;
  errors?: ApiError[];
}

const initialState = {
  stylistUuid: undefined,
  serviceCategories: {},
  requestState: RequestState.NotStarted
};

export function servicesReducer(state: ServicesState = initialState, action: Actions): ServicesState {
  switch (action.type) {
    case servicesActionTypes.GET_STYLIST_SERVICES:
      return {
        ...state,
        stylistUuid: action.stylistUuid,

        // reset
        requestState: RequestState.NotStarted,
        errors: undefined
      };

    case servicesActionTypes.GET_STYLIST_SERVICES_LOADING:
      return {
        ...state,
        requestState: action.requestState
      };

    case servicesActionTypes.GET_STYLIST_SERVICES_ERROR:
      return {
        ...state,
        requestState: action.requestState,
        errors: action.errors
      };

    case servicesActionTypes.GET_STYLIST_SERVICES_SUCCESS:
      return {
        ...state,
        requestState: action.requestState,
        serviceCategories: {
          ...state.serviceCategories,
          [action.stylistUuid]: action.serviceCategories
        }
      };

    default:
      return state;
  }
}

export const servicesPath = 'services';

const selectServicesFromState = createFeatureSelector<ServicesState>(servicesPath);

export const selectRequestedStylistUuid = createSelector(
  selectServicesFromState,
  (state: ServicesState): string | undefined => state.stylistUuid
);

export const selectServiceCategories = createSelector(
  selectServicesFromState,
  (state: ServicesState): ServiceCategoriesByStylist => state.serviceCategories
);

export const selectStylistServiceCategories = (stylistUuid: string) => createSelector(
  selectServiceCategories,
  (serviceCategories: ServiceCategoriesByStylist): ServiceCategoryModel[] | undefined => serviceCategories[stylistUuid]
);

export const selectStylistCategory = (stylistUuid: string, categorytUuid: string) => createSelector(
  selectStylistServiceCategories(stylistUuid),
  (categories?: ServiceCategoryModel[]): ServiceCategoryModel | undefined =>
    categories && categories.find((category: ServiceCategoryModel) => category.uuid === categorytUuid)
);

export const selectStylistCategoryServices = (stylistUuid: string, categorytUuid: string) => createSelector(
  selectStylistCategory(stylistUuid, categorytUuid),
  (category?: ServiceCategoryModel): ServiceModel[] | undefined => category && category.services
);
