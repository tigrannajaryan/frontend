import { Action, ActionReducer, MetaReducer, State } from '@ngrx/store';
import { storeLogger } from 'ngrx-store-logger';

import { ENV } from '~/environments/environment.default';

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

/**
 * Use meta reducer to log all actions.
 */
export function logger(actionReducer: ActionReducer<State<{}>>): ActionReducer<State<{}>> {
  return storeLogger()(actionReducer);
}

export const USER_LOGOUT = 'APP_USER_LOGOUT';

// Next action and reducer used to reset state completely when user logs out
export class LogoutAction implements Action {
  readonly type = USER_LOGOUT;
  constructor(public onSuccess?: (...args: any[]) => any) {}
}

export function resetOnLogoutReducer(reducer: ActionReducer<State<{}>>): ActionReducer<State<{}>> {
  return (state: State<any>, action: any) => {
    if (action.type === USER_LOGOUT) {
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
export function getMetaReducers(): Array<MetaReducer<State<{}>>> {
  const metaReducers: Array<MetaReducer<State<{}>>> = [];

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
