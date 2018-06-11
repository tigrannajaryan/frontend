import { Action, createFeatureSelector, createSelector } from '@ngrx/store';

import { ServiceItem } from '~/core/stylist-service/stylist-models';

export enum servicesActionTypes {
  LOAD = 'SERVICES_LOAD',
  LOAD_SUCCESS = 'SERVICES_LOAD_SUCCESS',
  LOAD_ERROR = 'SERVICES_LOAD_ERROR',
  SELECT_SERVICE = 'SERVICES_SELECT_SERVICE'
}

export interface ServicesState {
  loaded: boolean;
  services: ServiceItem[];
  selectedService?: ServiceItem;
}

const initialState: ServicesState = {
  loaded: false,
  services: [],
  selectedService: undefined
};

export class LoadAction implements Action {
  readonly type = servicesActionTypes.LOAD;
}

export class LoadSuccessAction implements Action {
  readonly type = servicesActionTypes.LOAD_SUCCESS;
  constructor(public services: ServiceItem[]) { }
}

export class LoadErrorAction implements Action {
  readonly type = servicesActionTypes.LOAD_ERROR;
  constructor(public error: Error) { }
}

export class SelectServiceAction implements Action {
  readonly type = servicesActionTypes.SELECT_SERVICE;
  constructor(public service: ServiceItem) { }
}

type Actions =
  | LoadAction
  | LoadSuccessAction
  | LoadErrorAction
  | SelectServiceAction;

export function servicesReducer(state: ServicesState = initialState, action: Actions): ServicesState {
  switch (action.type) {
    case servicesActionTypes.LOAD_SUCCESS:
      return {
        ...state,
        loaded: true,
        services: action.services
      };

    case servicesActionTypes.SELECT_SERVICE:
      return {
        ...state,
        selectedService: action.service
      };

    default:
      return state;
  }
}

export const selectService = createFeatureSelector<ServicesState>('service');

export const selectServices = createSelector(
  selectService,
  (state: ServicesState): ServiceItem[] => state.services
);

export const selectSortedServices = createSelector(
  selectServices,
  (services): ServiceItem[] =>
    services
      .slice() // remove freeze from services
      .sort((serviceA, serviceB) => {
        // from lowest to highest price
        return serviceA.base_price - serviceB.base_price;
      })
);

export const selectCategorisedServices = createSelector(
  selectSortedServices,
  (state: ServiceItem[]) => state.reduce((categories, service) => {
    let category = categories.find(({uuid}) => uuid === service.category_uuid);
    if (!category) {
      const {category_name: name, category_uuid: uuid} = service;
      category = {name, uuid, services: []};
      categories.push(category);
    }
    category.services.push(service);
    return categories;
  }, [])
);

export const selectSelectedService = createSelector(
  selectService,
  (state: ServicesState): ServiceItem | undefined => state.selectedService
);
