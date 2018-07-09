import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';

import { UnhandledErrorAction } from '~/core/reducers/errors.reducer';

/**
 * Custom unhandled error handler.
 * This handler class is installed in app.module.ts
 */
@Injectable()
export class UnhandledErrorHandler {

  constructor(
    private store: Store<any>
  ) {
  }

  /**
   * Called by Angular when an exception is not handled in the views, components, etc.
   * This is nice centralize place to handle all common errors.
   * See https://angular.io/api/core/ErrorHandler
   */
  handleError(error: Error): void {
    setTimeout(() => {
      this.store.dispatch(new UnhandledErrorAction(error));
    });
  }
}
