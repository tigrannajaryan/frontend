import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { AuthLocalData, getAuthLocalData } from '~/shared/storage/token-utils';

/**
 * AuthInterceptor gets the token from getToken() (token utils)
 * and adds it to the header of the request.
 */
@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Get the auth token from the service.
    return Observable
      .from(getAuthLocalData())
      .switchMap((tokenModel: AuthLocalData) => {
        // modify request headers
        const authReq = tokenModel ?
          req.clone({headers: req.headers.set('Authorization', `Token ${tokenModel.token}`)}) : req;
        return next.handle(authReq);
      });
  }
}
