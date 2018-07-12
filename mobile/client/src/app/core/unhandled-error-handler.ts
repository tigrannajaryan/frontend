import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';

import { ErrorAction } from '~/app.reducers';

export enum errorsActionTypes {
  UNHANDLED_ERROR = 'UNHANDLED_ERROR'
}

export class UnhandledErrorAction implements ErrorAction {
  readonly type = errorsActionTypes.UNHANDLED_ERROR;
  constructor(public errors: Error[]) {}
}

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
      this.store.dispatch(new UnhandledErrorAction([error]));
    });
  }
}
