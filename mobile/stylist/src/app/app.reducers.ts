import {
  Action,
  ActionReducer,
  ActionReducerMap,
  MetaReducer
} from '@ngrx/store';
import { storeLogger } from 'ngrx-store-logger';

import { ENV } from '../environments/environment.default';

/**
 * storeFreeze prevents state from being mutated. When mutation occurs, an
 * exception will be thrown. This is useful during development mode to
 * ensure that none of the reducers accidentally mutates the state.
 */
import { storeFreeze } from 'ngrx-store-freeze';
import { homePath, homeReducer } from '~/core/reducers/home.reducer';
import { profileReducer, profileStatePath } from '~/core/reducers/profile.reducer';
import { servicePath, servicesReducer } from '~/core/reducers/services.reducer';
import { clientsPath, clientsReducer } from '~/core/reducers/clients.reducer';
import {
  appointmentDatesReducer,
  appointmentDatesStatePath
} from '~/core/reducers/appointment-dates.reducer';
import { serverStatusReducer, serverStatusStateName } from '~/shared/server-status/server-status.reducer';

/**
 * Every reducer module's default export is the reducer function itself. In
 * addition, each module should export a type or interface that describes
 * the state of the reducer plus any selector functions. The `* as`
 * notation packages up all of the exports into a single object.
 */

/**
 * As mentioned, we treat each reducer like a table in a database. This means
 * our top level state interface is just a map of keys to inner state types.
 */
// tslint:disable-next-line:no-empty-interface
export interface State {
}

/**
 * Our state is composed of a map of action reducer functions.
 * These reducer functions are called with each dispatched action
 * and the current or initial state and return a new immutable state.
 */
export const reducers: ActionReducerMap<State> = {
  [homePath]: homeReducer,
  [profileStatePath]: profileReducer,
  [servicePath]: servicesReducer,
  [clientsPath]: clientsReducer,
  [appointmentDatesStatePath]: appointmentDatesReducer,
  [serverStatusStateName]: serverStatusReducer
};

/**
 * Use meta reducer to log all actions.
 */
export function logger(reducer: ActionReducer<State>): ActionReducer<State> {
  return storeLogger()(reducer);
}

export enum appActionTypes {
  USER_LOGOUT = 'APP_USER_LOGOUT'
}

export class LogoutAction implements Action {
  readonly type = appActionTypes.USER_LOGOUT;
}

export function resetOnLogoutReducer(reducer: ActionReducer<State>): ActionReducer<State> {
  return (state: State, action: any) => {
    if (action.type === appActionTypes.USER_LOGOUT) {
      state = undefined;
    }
    return reducer(state, action);
  };
}

/**
 * By default, @ngrx/store uses combineReducers with the reducer map to compose
 * the root meta-reducer. To add more meta-reducers, provide an array of meta-reducers
 * that will be composed to form the root meta-reducer.
 */
export function getMetaReducers(): Array<MetaReducer<State>> {
  const metaReducers: Array<MetaReducer<State>> = [];

  if (!ENV.production) { // development and staging
    metaReducers.push(
      storeFreeze,
      logger
    );
  }

  // production
  metaReducers.push(
    resetOnLogoutReducer
  );

  return metaReducers;
}
