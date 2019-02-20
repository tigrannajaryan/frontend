import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';

import { ApiResponse } from '~/shared/api/base.models';
import { BaseServiceMock } from '~/shared/api/base.service.mock';

import { AddIntegrationRequest } from './integrations.api';

@Injectable()
export class IntegrationsApiMock extends BaseServiceMock {

  addIntegration(request: AddIntegrationRequest): Observable<ApiResponse<void>> {
    return this.mockRequest<void>(
      Observable.create(observer => {
        observer.next();
        observer.complete();
      })
    );
  }
}
