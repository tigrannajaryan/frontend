import { ActionReducer, ActionReducerMap, MetaReducer } from '@ngrx/store';
import { storeLogger } from 'ngrx-store-logger';

import { ENV } from '~/../environments/environment.default';

import { authPath, authReducer, resetOnLogoutReducer } from '~/core/reducers/auth.reducer';
import { profilePath, profileReducer } from '~/core/reducers/profile.reducer';
import { stylistsPath, stylistsReducer } from '~/core/reducers/stylists.reducer';
import { servicesPath, servicesReducer } from '~/core/reducers/services.reducer';

/**
 * storeFreeze prevents state from being mutated. When mutation occurs, an
 * exception will be thrown. This is useful during development mode to
 * ensure that none of the reducers accidentally mutates the state.
 */
import { storeFreeze } from 'ngrx-store-freeze';

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
export const reducers: ActionReducerMap<State> = {};
reducers[authPath] = authReducer;
reducers[profilePath] = profileReducer;
reducers[stylistsPath] = stylistsReducer;
reducers[servicesPath] = servicesReducer;

/**
 * Use meta reducer to log all actions.
 */
export function logger(reducer: ActionReducer<State>): ActionReducer<State> {
  return storeLogger()(reducer);
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
