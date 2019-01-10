import { Injectable } from "@angular/core"
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from "@angular/common/http"
import { Observable } from "rxjs"
import { catchError, debounceTime, map } from "rxjs/operators"

import { HttpErrorHandler } from "./http-error-handler.service"

@Injectable()
export class ResponseHandlerInterceptor implements HttpInterceptor {

  constructor(private httpErrorHandler: HttpErrorHandler) {}
  
  intercept(
    request: HttpRequest<any>,
    next: HttpHandler): Observable<HttpEvent<any>> {

    return next.handle(request.clone())
      .pipe(
        debounceTime(500),
        catchError(this.httpErrorHandler.handleHttpError))
  }
}
