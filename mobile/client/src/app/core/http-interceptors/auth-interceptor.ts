import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { getToken } from '~/core/utils/token-utils';
import { AuthTokenModel } from '~/core/api/auth.models';

/**
 * AuthInterceptor gets the token from getToken() (token utils)
 * and adds it to the header of the request.
 */
@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Get the auth token from the service.
    return Observable
      .from(getToken())
      .switchMap((tokenModel: AuthTokenModel) => {
        // modify request headers
        const authReq = tokenModel ?
          req.clone({headers: req.headers.set('Authorization', `Token ${tokenModel.token}`)}) : req;
        return next.handle(authReq);
      });
  }
}
