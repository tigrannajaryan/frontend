import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { HttpParams } from '@angular/common/http/src/params';
import { Observable } from 'rxjs';

import { ENV } from '~/../environments/environment.default';

import { ApiFieldAndNonFieldErrors, ApiRequestOptions, processApiResponseError } from '~/shared/api-errors';
import { ApiRequest, ApiResponse } from '~/core/api/base.models';
import { AppModule } from '~/app.module';
import { ServerStatusTracker } from '~/shared/server-status-tracker';

@Injectable()
export class BaseService {

  protected request<ResponseType>(
    method: string, apiPath: string, requestData: ApiRequest = {},
    options?: ApiRequestOptions): Observable<ApiResponse<ResponseType>> {

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
      http.request<ResponseType>(method, url, httpOptions), options
    );
  }

  /**
   * Always return { response, error } to suppress the catch of an outside subscription.
   */
  protected prepareResponse<ResponseType>(
    httpResponse: Observable<ResponseType>,
    options: ApiRequestOptions): Observable<ApiResponse<ResponseType>> {

    return (
      httpResponse
        .map(response => ({ response }))
        .catch(error => {
          const apiError = processApiResponseError(error);

          // Check if the caller requested to suppress ApiFieldAndNonFieldErrors generic handling, don't notify tracker
          const notifyTracker = !(apiError instanceof ApiFieldAndNonFieldErrors &&
            options && options.hideGenericAlertOnFieldAndNonFieldErrors);

          if (!notifyTracker) {
            // there is a server status error, notify status tracker about it
            const serverStatus = AppModule.injector.get(ServerStatusTracker);
            serverStatus.notify(apiError);
          }

          // and return the error for callers to process if they are interested
          return Observable.of({ response: undefined, error: apiError });
        })
    );
  }

  protected get<ResponseType>(
    apiPath: string, queryParams?: HttpParams,
    options?: ApiRequestOptions): Observable<ApiResponse<ResponseType>> {

    return this.request<ResponseType>('get', apiPath, { queryParams }, options);
  }

  protected post<ResponseType>(
    apiPath: string, data: any, queryParams?: HttpParams,
    options?: ApiRequestOptions): Observable<ApiResponse<ResponseType>> {

    return this.request<ResponseType>('post', apiPath, { data, queryParams }, options);
  }

  protected delete<ResponseType>(
    apiPath: string, options?: ApiRequestOptions): Observable<ApiResponse<ResponseType>> {

    return this.request<ResponseType>('delete', apiPath, undefined, options);
  }
}
