import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { HttpParams } from '@angular/common/http/src/params';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';

import { ENV } from '~/../environments/environment.default';

import { ApiRequest, ApiResponse } from '~/core/api/base.models';
import { ApiError } from '~/core/api/errors.models';
import { processApiResponseError } from '~/core/api/errors';
import { ApiCommonErrorAction } from '~/core/effects/api-common-errors.effects';

import { AppModule } from '~/app.module';

@Injectable()
export class BaseService {

  protected request<ResponseType>(method: string, apiPath: string, requestData: ApiRequest = {}): Observable<ApiResponse<ResponseType>> {
    const { data, queryParams, headers } = requestData;

    const additionalHeaders = {};
    if (headers) {
      headers.keys().forEach(key => {
        additionalHeaders[key] = headers.get(key);
      });
    }

    const url = `${ENV.apiUrl}${apiPath}`;
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        ...additionalHeaders
      }),
      body: data && JSON.stringify(data),
      params: queryParams
    };

    const http = AppModule.injector.get(HttpClient);

    return this.prepareResponse(
      http.request<ResponseType>(method, url, httpOptions)
    );
  }

  /**
   * Always return { response, errors } to suppress the catch of an outside subscription.
   */
  protected prepareResponse<ResponseType>(request: Observable<ResponseType>): Observable<ApiResponse<ResponseType>> {
    return (
      request
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

  protected get<ResponseType>(apiPath: string, queryParams?: HttpParams): Observable<ApiResponse<ResponseType>> {
    return this.request<ResponseType>('get', apiPath, { queryParams });
  }

  protected post<ResponseType>(apiPath: string, data: any, queryParams?: HttpParams): Observable<ApiResponse<ResponseType>> {
    return this.request<ResponseType>('post', apiPath, { data, queryParams });
  }

  protected delete<ResponseType>(apiPath: string): Observable<ApiResponse<ResponseType>> {
    return this.request<ResponseType>('delete', apiPath);
  }
}
