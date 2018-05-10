import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import 'rxjs/add/operator/toPromise';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';

import { Logger } from '../shared/logger';
import { ENV } from '../../environments/environment.default';

import { ServerIsOkAction } from './components/server-status/server-status.reducer';

import {
  HttpStatus,
  ServerErrorResponse,
  ServerFieldError,
  ServerInternalError,
  ServerNonFieldError,
  ServerUnknownError,
  ServerUnreachableError
} from './api-errors';

import { ServerStatusTracker } from './server-status-tracker';

enum HttpContentType {
  ApplicationJson = 'application/json'
}

/**
 * BaseApiService provides basic HTTP API call capability.
 */
@Injectable()
export class BaseApiService {

  protected static isInternalErrorStatus(status: number): boolean {
    return status >= 500 && status <= 599;
  }

  constructor(
    protected http: HttpClient,
    protected logger: Logger,
    protected serverStatus: ServerStatusTracker) {
  }

  protected request<ResponseType>(method: string, apiPath: string, data?: any): Promise<ResponseType> {
    // For help on how to use HttpClient see https://angular.io/guide/http

    // Prepare the header and the body
    const httpOptions = {
      headers: new HttpHeaders({
        // TODO: are standard HTTP headers defined as a constant anywhere?
        'Content-Type': HttpContentType.ApplicationJson
      }),
      body: data ? JSON.stringify(data) : undefined
    };

    const url = ENV.apiUrl + apiPath;

    return this.http.request<ResponseType>(method, url, httpOptions)
      .toPromise()
      .then(response => {
        // Successful response. Let ServerStatus know about it.
        this.serverStatus.dispatch(new ServerIsOkAction());
        return response;
      })
      .catch(e => {
        this.processResponseError(e, method, url);
        throw e;
      });
  }

  protected processResponseError(e: any, method: string, url: string): void {
    this.logger.error(`API request ${method.toUpperCase()} ${url} failed:`, JSON.stringify(e));

    if (e instanceof HttpErrorResponse) {
      if (!e.status) {
        // No response at all, probably no network connection or server is down.
        throw new ServerUnreachableError();
      } else {
        // We have a response, check the status.
        switch (e.status) {
          case HttpStatus.badRequest:
            if (e.error.non_field_errors) {
              // The request was bad but not related to fields
              throw new ServerNonFieldError(e.status, e.error.non_field_errors);
            }
            // The request had invalid fields
            throw new ServerFieldError(e.error);

          case HttpStatus.unauthorized:
            throw new ServerErrorResponse(e.status, e.error);

          default:
            if (BaseApiService.isInternalErrorStatus(e.status)) {
              throw new ServerInternalError();
            }
        }
      }
    }

    // Server returned something we don't understand or some other unexpected error happened.
    throw new ServerUnknownError();
  }

  protected get<ResponseType>(apiPath: string): Promise<ResponseType> {
    return this.request<ResponseType>('get', apiPath);
  }

  protected post<ResponseType>(apiPath: string, data: any): Promise<ResponseType> {
    return this.request<ResponseType>('post', apiPath, data);
  }

  uploadFile(formData: FormData): Promise<ResponseType> {
    const url = `${ENV.apiUrl}common/image/upload`;

    return this.http.post<ResponseType>(url, formData)
      .toPromise()
      .catch(e => {
        this.logger.error('API request failed:', e);
        throw e;
      });
  }
}
