import { HttpEvent, HttpHandler, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { API_PATTERN } from '@core/constants/constants';
import { Observable } from 'rxjs/Observable';
import { catchError, debounceTime, delay, retryWhen, tap } from 'rxjs/operators';

import { HttpErrorHandler } from './http-error-handler.service';

@Injectable()
export class HttpInterceptor implements HttpInterceptor {
  constructor(private httpErrorHandler: HttpErrorHandler) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (API_PATTERN.test(request.url)) {
      const cloned = request.clone({ headers: request.headers.set('Content-Type', 'application/json') });

      return next.handle(cloned).pipe(
        debounceTime(500),
        retryWhen((errors) =>
          errors.pipe(
            // inside the retryWhen, use a tap operator to throw an error
            // if you don't want to retry
            tap((error) => {
              if (error.status !== 503) {
                throw error;
              }
            }),
            delay(500),
          ),
        ),
        catchError(this.httpErrorHandler.handleHttpError),
      );
    }

    return next.handle(request);
  }
}
