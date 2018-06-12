import { Action, createFeatureSelector, createSelector } from '@ngrx/store';

import { ServiceCategory, ServiceItem } from '~/core/stylist-service/stylist-models';

export enum servicesActionTypes {
  LOAD = 'SERVICES_LOAD',
  LOAD_SUCCESS = 'SERVICES_LOAD_SUCCESS',
  LOAD_ERROR = 'SERVICES_LOAD_ERROR',
  SELECT_SERVICE = 'SERVICES_SELECT_SERVICE',
  CLEAR_SELECTED_SERVICE = 'SERVICES_CLEAR_SELECTED_SERVICE'
}

export interface ServicesState {
  loaded: boolean;
  categories: ServiceCategory[];
  selectedService?: ServiceItem;
}

const initialState: ServicesState = {
  loaded: false,
  categories: [],
  selectedService: undefined
};

export class LoadAction implements Action {
  readonly type = servicesActionTypes.LOAD;
}

export class LoadSuccessAction implements Action {
  readonly type = servicesActionTypes.LOAD_SUCCESS;
  constructor(public categories: ServiceCategory[]) { }
}

export class LoadErrorAction implements Action {
  readonly type = servicesActionTypes.LOAD_ERROR;
  constructor(public error: Error) { }
}

export class SelectServiceAction implements Action {
  readonly type = servicesActionTypes.SELECT_SERVICE;
  constructor(public service: ServiceItem) { }
}

export class ClearSelectedServiceAction implements Action {
  readonly type = servicesActionTypes.CLEAR_SELECTED_SERVICE;
}

type Actions =
  | LoadAction
  | LoadSuccessAction
  | LoadErrorAction
  | SelectServiceAction
  | ClearSelectedServiceAction;

export function servicesReducer(state: ServicesState = initialState, action: Actions): ServicesState {
  switch (action.type) {
    case servicesActionTypes.LOAD_SUCCESS:
      return {
        ...state,
        loaded: true,
        categories: action.categories
      };

    case servicesActionTypes.SELECT_SERVICE:
      return {
        ...state,
        selectedService: action.service
      };

    case servicesActionTypes.CLEAR_SELECTED_SERVICE:
      return {
        ...state,
        selectedService: undefined
      };

    default:
      return state;
  }
}

export const selectService = createFeatureSelector<ServicesState>('service');

export const selectCategories = createSelector(
  selectService,
  (state: ServicesState): ServiceCategory[] => state.categories
);

export const selectSortedServices = createSelector(
  selectCategories,
  (categories: ServiceCategory[]): ServiceCategory[] =>
    categories.map(category => ({
      ...category,
      services:
        category.services
          .slice() // remove freeze from services
          .sort((serviceA, serviceB) => {
            // from lowest to highest price
            return serviceA.base_price - serviceB.base_price;
          })
    }))
);

export const selectCategorisedServices = createSelector(
  selectSortedServices,
  (categories: ServiceCategory[]) => categories
);

export const selectSelectedService = createSelector(
  selectService,
  (state: ServicesState): ServiceItem | undefined => state.selectedService
);
