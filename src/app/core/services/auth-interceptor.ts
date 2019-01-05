import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor() {}

  intercept(request: HttpRequest<any>,
            next: HttpHandler): Observable<HttpEvent<any>> {
    
    // read the token from local storage
    const idToken = localStorage.getItem("auth-token");

    if (idToken) {
        // TODO: add bearer upon integrating JWT server side auth
        const cloned = request.clone({
            //headers: request.headers.set("Authorization", "Bearer " + idToken);
            headers: request.headers.set("Authorization", idToken)
        });

        return next.handle(cloned);
    }
    else {
        return next.handle(request);
    }
  }
}