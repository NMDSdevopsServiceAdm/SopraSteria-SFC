import { Injectable } from "@angular/core"
import { HttpClient } from "@angular/common/http"
import { catchError, debounceTime, map } from "rxjs/operators"

import { HttpErrorHandler } from "./http-error-handler.service"

import { FeedbackModel } from '../model/feedback.model';

@Injectable({
  providedIn: "root"
})
export class FeedbackService {
  constructor(private http: HttpClient, private httpErrorHandler: HttpErrorHandler) {}

  // returns browser's native 'window' object
  get _window() : any {
    return window;
  }

  get window() : any {
    return this._window;
  }

  /*
   * POST /api/feedback
   */
  post(feedback: FeedbackModel) {
    const options = {
      headers: {
        "Content-Type": "application/json"
      }
    }

    return this.http.post<any>("/api/feedback", feedback, options)
      .pipe(
        debounceTime(500),
        catchError(this.httpErrorHandler.handleHttpError))
  }
}
