import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { HttpParams } from '@angular/common/http/src/params';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/first';

import { ENV } from '~/environments/environment.default';

import { ApiRequestOptions, processApiResponseError } from '~/shared/api-errors';
import { ApiRequest, ApiResponse } from '~/shared/api/base.models';
import { ServerStatusTracker } from '~/shared/server-status-tracker';
import { Logger } from '~/shared/logger';

@Injectable()
export class BaseService {

  constructor(
    private http: HttpClient,
    protected logger: Logger,
    private serverStatus: ServerStatusTracker) {
  }

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

    return this.prepareResponse(method, url,
      this.http.request<ResponseType>(method, url, httpOptions), options
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

          this.logger.error(`Error in response to API request ${method.toUpperCase()} ${url} failed:`, JSON.stringify(err));

          const { error, notifyTracker } = processApiResponseError(err, options);

          if (notifyTracker) {
            // there is a server status error, notify status tracker about it
            this.serverStatus.notify(error);
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

  protected put<ResponseType>(
    apiPath: string, data: any, queryParams?: HttpParams,
    options?: ApiRequestOptions): Observable<ApiResponse<ResponseType>> {

    return this.request<ResponseType>('put', apiPath, { data, queryParams }, options);
  }

  protected post<ResponseType>(
    apiPath: string, data: any, queryParams?: HttpParams,
    options?: ApiRequestOptions): Observable<ApiResponse<ResponseType>> {

    return this.request<ResponseType>('post', apiPath, { data, queryParams }, options);
  }

  protected patch<ResponseType>(
    apiPath: string, data: any, queryParams?: HttpParams,
    options?: ApiRequestOptions): Observable<ApiResponse<ResponseType>> {

    return this.request<ResponseType>('patch', apiPath, { data, queryParams }, options);
  }

  protected delete<ResponseType>(
    apiPath: string, options?: ApiRequestOptions): Observable<ApiResponse<ResponseType>> {

    return this.request<ResponseType>('delete', apiPath, undefined, options);
  }

  uploadFile<ResponseType>(formData: FormData): Observable<ApiResponse<ResponseType>> {
    const url = `${ENV.apiUrl}common/image/upload`;

    return this.prepareResponse('post', url, this.http.post<ResponseType>(url, formData), {});
  }
}

/**
 * Shortcut for getting the response of API call if you do not want
 * to subscribe to Observable, e.g.:
 * const { response, error } = await apiService.getProfile().get();
 */
function get<T>(this: Observable<T>): Promise<T> {
  return this.first().toPromise();
}

// Add get() function to Observable prototype.
Observable.prototype.get = get;

declare module 'rxjs/Observable' {
  interface Observable<T> {
    get: typeof get;
  }
}
