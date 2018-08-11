import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { HttpParams } from '@angular/common/http/src/params';
import 'rxjs/add/operator/toPromise';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';

import { Logger } from '~/shared/logger';
import { ENV } from '../../environments/environment.default';

import {
  HttpStatus,
  ServerErrorResponse,
  ServerFieldError,
  ServerInternalError,
  ServerNonFieldError,
  ServerUnknownError,
  ServerUnreachableError
} from '~/shared/api-errors';

import { ServerStatusErrorType, ServerStatusTracker } from '~/shared/server-status-tracker';
import { HighLevelErrorCode } from '~/shared/api-error-codes';

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

  protected request<ResponseType>(method: string, apiPath: string, data?: any, queryParams?: HttpParams): Promise<ResponseType> {
    // For help on how to use HttpClient see https://angular.io/guide/http

    // Prepare the header and the body
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': HttpContentType.ApplicationJson
      }),
      body: data ? JSON.stringify(data) : undefined,
      params: queryParams
    };

    const url = ENV.apiUrl + apiPath;

    return this.http.request<ResponseType>(method, url, httpOptions)
      .toPromise()
      .catch(e => {
        this.processResponseError(e, method, url);
        throw e;
      });
  }

  protected processResponseError(e: any, method: string, url: string): void {
    this.logger.error(`Error in response to API request ${method.toUpperCase()} ${url} failed:`, JSON.stringify(e));

    if (e instanceof HttpErrorResponse) {
      if (!e.status) {
        // No response at all, probably no network connection or server is down.
        this.serverStatus.notify({ type: ServerStatusErrorType.noConnection });
        throw new ServerUnreachableError();
      } else {
        // We have a response, check the status.
        switch (e.status) {
          case HttpStatus.badRequest:
            if (e.error.non_field_errors.length > 0) {
              // The request was bad but not related to fields
              throw new ServerNonFieldError(e.status, e.error.non_field_errors);
            } else if (Object.keys(e.error.field_errors).length > 0) {
              // The request had invalid fields
              throw new ServerFieldError(e.error.field_errors);
            } else if (
              e.error.code === HighLevelErrorCode.err_authentication_failed ||
              e.error.code === HighLevelErrorCode.err_unauthorized
            ) {
              throw new ServerErrorResponse(e.status, e.error);
            } else {
              throw new ServerUnknownError(e.message);
            }

          case HttpStatus.notFound:
          case HttpStatus.methodNotSupported:
            this.serverStatus.notify({ type: ServerStatusErrorType.clientRequestError });
            throw new ServerErrorResponse(e.status, e.error);

          case HttpStatus.unauthorized:
            this.serverStatus.notify({ type: ServerStatusErrorType.unauthorized });
            throw new ServerErrorResponse(e.status, e.error);

          default:
            if (BaseApiService.isInternalErrorStatus(e.status)) {
              this.serverStatus.notify({ type: ServerStatusErrorType.internalServerError });
              throw new ServerInternalError(e.message);
            } else {
              this.serverStatus.notify({ type: ServerStatusErrorType.unknownServerError });
              throw new ServerUnknownError(e.message);
            }
        }
      }
    }

    // Server returned something we don't understand or some other unexpected error happened.
    this.serverStatus.notify({ type: ServerStatusErrorType.unknownServerError });
    throw new ServerUnknownError();
  }

  protected get<ResponseType>(apiPath: string, queryParams?: HttpParams): Promise<ResponseType> {
    return this.request<ResponseType>('get', apiPath, undefined, queryParams);
  }

  protected post<ResponseType>(apiPath: string, data: any): Promise<ResponseType> {
    return this.request<ResponseType>('post', apiPath, data);
  }

  protected patch<ResponseType>(apiPath: string, data: any): Promise<ResponseType> {
    return this.request<ResponseType>('patch', apiPath, data);
  }

  protected delete<ResponseType>(apiPath: string): Promise<ResponseType> {
    return this.request<ResponseType>('delete', apiPath);
  }

  uploadFile<ResponseType>(formData: FormData): Promise<ResponseType> {
    const url = `${ENV.apiUrl}common/image/upload`;

    return this.http.post<ResponseType>(url, formData)
      .toPromise()
      .catch(e => {
        this.logger.error('API request failed:', JSON.stringify(e));
        throw e;
      });
  }
}
