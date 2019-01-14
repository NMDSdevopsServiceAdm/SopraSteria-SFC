import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { Observable } from 'rxjs/Observable';

import { AuthService } from "./auth-service"


@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(
    private authService: AuthService
  ) {}

  intercept(request: HttpRequest<any>,
            next: HttpHandler): Observable<HttpEvent<any>> {
    const token = this.authService.token

    if (token) {
        // TODO: add bearer upon integrating JWT server side auth
        const cloned = request.clone({
            //headers: request.headers.set("Authorization", "Bearer " + idToken);
            headers: request.headers.set("Authorization", token)
        });

        return next.handle(cloned);
    }
    else {
        return next.handle(request);
    }
  }
}
