import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';

import { AuthService } from './auth.service';
import { API_PATTERN } from '@core/constants/constants';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService) { }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (API_PATTERN.test(request.url)) {
      const token = this.authService.token;

      if (token) {
        const cloned = request.clone({
          headers: request.headers.set('Authorization', token),
        });

        return next.handle(cloned);
      }
    }

    return next.handle(request);
  }
}
