import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class BaseHeadersInterceptor implements HttpInterceptor {
  intercept(request: HttpRequest<any>,
            next: HttpHandler): Observable<HttpEvent<any>> {

    const cloned = request.clone({
      headers: request.headers.set("Content-Type", "application/json")
    })

    return next.handle(cloned)
  }
}
