import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { catchError, debounceTime } from "rxjs/operators"

import { HttpErrorHandler } from "./http-error-handler.service"

@Injectable()
export class GenericInterceptor implements HttpInterceptor {

  constructor(
    private httpErrorHandler: HttpErrorHandler
  ) {}
  
  intercept(request: HttpRequest<any>,
            next: HttpHandler): Observable<HttpEvent<any>> {

    const cloned = request.clone({
      headers: request.headers.set("Content-Type", "application/json")
    })

    return next.handle(cloned)
      .pipe(
        debounceTime(500),
        catchError(this.httpErrorHandler.handleHttpError))
  }
}
