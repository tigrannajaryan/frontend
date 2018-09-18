import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { HttpParams } from '@angular/common/http/src/params';
import { Observable } from 'rxjs/Observable';

import { ENV } from '~/environments/environment.default';

import { ApiRequestOptions, processApiResponseError } from '~/shared/api-errors';
import { ApiRequest, ApiResponse } from '~/core/api/base.models';
import { AppModule } from '~/app.module';
import { ServerStatusTracker } from '~/shared/server-status-tracker';
import { Logger } from '~/shared/logger';

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

    return this.prepareResponse(method, url,
      http.request<ResponseType>(method, url, httpOptions), options
    );
  }

  /**
   * Always return { response, error } to suppress the catch of an outside subscription.
   */
  protected prepareResponse<ResponseType>(
    method: string, url: string,
    httpResponse: Observable<ResponseType>,
    options: ApiRequestOptions): Observable<ApiResponse<ResponseType>> {

    return (
      httpResponse
        .map(response => ({ response }))
        .catch(err => {

          const logger = AppModule.injector.get(Logger);
          logger.error(`Error in response to API request ${method.toUpperCase()} ${url} failed:`, JSON.stringify(err));

          const { error, notifyTracker } = processApiResponseError(err, options);

          if (notifyTracker) {
            // there is a server status error, notify status tracker about it
            const serverStatus = AppModule.injector.get(ServerStatusTracker);
            serverStatus.notify(error);
          }

          // and return the error for callers to process if they are interested
          return Observable.of({ response: undefined, error });
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

  uploadFile<ResponseType>(formData: FormData): Promise<ResponseType> {
    const url = `${ENV.apiUrl}common/image/upload`;

    const http = AppModule.injector.get(HttpClient);
    return http.post<ResponseType>(url, formData)
      .toPromise()
      .catch(e => {
        const logger = AppModule.injector.get(Logger);
        logger.error('API request failed:', JSON.stringify(e));
        throw e;
      });
  }
}
