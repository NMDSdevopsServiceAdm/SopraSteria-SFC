import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { JwtHelperService } from '@auth0/angular-jwt';
import { ADD_USER_API, API_PATTERN } from '@core/constants/constants';
import { CreateAccountService } from '@core/services/create-account/create-account.service';
import { throwError } from 'rxjs';
import { Observable } from 'rxjs/Observable';

import { AuthService } from './auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private jwt = new JwtHelperService();

  constructor(private authService: AuthService, private createAccountService: CreateAccountService) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = this.getToken(request.url);

    console.log(token);
    console.log(this.jwt.isTokenExpired(token));
    if (token) {
      if (this.jwt.isTokenExpired(token)) {
        this.authService.logout();
        // return throwError(new HttpErrorResponse({ error: 'Not Authorised', status: 403 }));
      }

      const cloned = request.clone({
        headers: request.headers.set('Authorization', token),
      });

      return next.handle(cloned);
    }

    return next.handle(request);
  }

  private getToken(requestUrl: string): string {
    if (requestUrl === ADD_USER_API) {
      return this.createAccountService.token;
    } else if (API_PATTERN.test(requestUrl)) {
      return this.authService.token;
    }

    return null;
  }
}
