import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';

import { ServerStatusActionsUnion, ServerStatusState } from './server-status/server-status.reducer';

/**
 * A helper class to work with server status state and its visual indicator.
 */
@Injectable()
export class ServerStatusTracker {

  constructor(private store: Store<ServerStatusState>) {}

  /**
   * Something happened with the status of the server.
   * @param action describes what exactly happened.
   */
  dispatch(action: ServerStatusActionsUnion): void {
    this.store.dispatch(action);
  }
}
