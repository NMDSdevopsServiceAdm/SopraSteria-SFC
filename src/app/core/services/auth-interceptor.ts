import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { API_PATTERN, ADD_USER_API } from '@core/constants/constants';
import { CreateAccountService } from '@core/services/create-account/create-account.service';
import { Observable } from 'rxjs/Observable';
import { AuthService } from './auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService, private createAccountService: CreateAccountService) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = this.getToken(request.url);

    if (token) {
      const cloned = request.clone({
        headers: request.headers.set('Authorization', token),
      });

      return next.handle(cloned);
    }

    return next.handle(request);
  }

  private getToken(requestUrl: string): string | null {
    let token;

    if (requestUrl === ADD_USER_API) {
      token = this.createAccountService.token;
    } else if (API_PATTERN.test(requestUrl)) {
      token = this.authService.token;
    }

    return token;
  }
}
