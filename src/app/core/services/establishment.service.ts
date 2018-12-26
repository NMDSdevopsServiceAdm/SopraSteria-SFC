import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, debounceTime } from 'rxjs/operators';

import { HttpErrorHandler } from "./http-error-handler.service"

@Injectable({
  providedIn: "root"
})
export class EstablishmentService {
  constructor(private http: HttpClient, private httpErrorHandler: HttpErrorHandler) {}

  // TODO implement separate /api/establishment/:establishmentId/jobs... calls
  // waiting for Warren acceptance
  /*
   * POST /api/establishment/:establishmentId/jobs
   */
  postVancacies(vacancies) {
    const establishmentId = 185 // TODO take this from local/session storage

    const options = {
      headers: {
        "Authorization": establishmentId,
        "Content-Type": "application/json"
      }
    }

    return this.http.post(`/api/establishment/${establishmentId}/jobs/vacancies`, vacancies, options)
      .pipe(
        debounceTime(500),
        catchError(this.httpErrorHandler.handleHttpError))
  }
}
