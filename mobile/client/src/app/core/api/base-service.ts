import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { HttpParams } from '@angular/common/http/src/params';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';

import { ENV } from '~/../environments/environment.default';

import { processApiResponseError } from '~/shared/api-errors';
import { ApiRequest, ApiResponse } from '~/core/api/base.models';
import { ApiCommonErrorAction } from '~/core/effects/api-common-errors.effects';
import { AppModule } from '~/app.module';
import { ServerStatusTracker } from '~/shared/server-status-tracker';

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
   * Always return { response, error } to suppress the catch of an outside subscription.
   */
  protected prepareResponse<ResponseType>(httpResponse: Observable<ResponseType>): Observable<ApiResponse<ResponseType>> {
    return (
      httpResponse
        .map(response => ({ response }))
        .catch(error => {
          const { apiError, serverStatusError } = processApiResponseError(error);

          if (serverStatusError) {
            // there is a server status error, notify status tracker about it
            const serverStatus = AppModule.injector.get(ServerStatusTracker);
            serverStatus.notify(serverStatusError);
          }

          if (apiError.handleGlobally()) {
            const store = AppModule.injector.get(Store);
            // Dispatch actions for errors handled by errors.effects.
            store.dispatch(new ApiCommonErrorAction(apiError));
          }

          // and return the error for callers to process if they are interested
          return Observable.of({ response: undefined, error: apiError });
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
