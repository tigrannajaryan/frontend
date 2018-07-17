import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';

import { AppModule } from '~/app.module';

import { ApiResponse } from '~/core/api/base.models';
import { ApiError } from '~/core/api/errors.models';
import { processApiResponseError } from '~/core/api/errors';
import { ApiCommonErrorAction } from '~/core/effects/api-common-errors.effects';

@Injectable()
export class BaseServiceMock {
  protected mockRequest<ResponseType>(responseMock: Observable<ResponseType>): Observable<ApiResponse<ResponseType>> {
    return (
      responseMock
        .map(response => ({ response }))
        .catch(error => {
          const errors = processApiResponseError(error);

          // Dispatch actions for errors handled by errors.effects.
          // A `delay is used to dispatch globally-handled errors only after errors’ array
          // returned and handled by the effect that had triggered this request.
          Observable.from(errors)
            .delay(0)
            .filter((err: ApiError) => err.handleGlobally)
            .combineLatest(Observable.of(AppModule.injector.get(Store)))
            .map(([err, store]) => store.dispatch(new ApiCommonErrorAction(err)))
            .subscribe();

          return Observable.of({ response: undefined, errors });
        })
    );
  }
}
