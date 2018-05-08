import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import 'rxjs/add/operator/toPromise';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';

import { ENV } from '../environments/environment.default';
import { Logger } from '../app/shared/logger';

/**
 * AuthServiceProvider provides authentication against server API.
 */
@Injectable()
export class BaseServiceProvider {

  constructor(public http: HttpClient, public logger: Logger) {
  }

  protected request<ResponseType>(method: string, apiPath: string, data?: any): Promise<ResponseType> {
    // For help on how to use HttpClient see https://angular.io/guide/http

    const httpOptions = {
      headers: new HttpHeaders({
        // TODO: are standard HTTP headers defined as a constant anywhere?
        'Content-Type': 'application/json'
      }),
      body: data ? JSON.stringify(data) : undefined
    };

    const url = ENV.apiUrl + apiPath;

    return this.http.request<ResponseType>(method, url, httpOptions)
      .toPromise()
      .catch(e => {
        this.logger.error(`API request failed: ${e}`);
        throw e;
      });
  }

  protected get<ResponseType>(apiPath: string): Promise<ResponseType> {
    return this.request('get', apiPath);
  }

  protected post<ResponseType>(apiPath: string, data: any): Promise<ResponseType> {
    // For help on how to use HttpClient see https://angular.io/guide/http

    const httpOptions = {
      headers: new HttpHeaders({
        // TODO: are standard HTTP headers defined as a constant anywhere?
        'Content-Type': 'application/json'
      })
    };

    const url = ENV.apiUrl + apiPath;

    return this.http.post<ResponseType>(url, JSON.stringify(data), httpOptions)
      .toPromise()
      .catch(e => {
        throw e;
      });
  }

  uploadFile(formData: FormData): Promise<ResponseType> {
    const url = `${ENV.apiUrl}common/image/upload`;

    return this.http.post<ResponseType>(url, formData)
      .toPromise()
      .catch(e => {
        throw e;
      });
  }
}
