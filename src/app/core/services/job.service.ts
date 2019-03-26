import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { catchError, debounceTime, map } from 'rxjs/operators';

import { HttpErrorHandler } from './http-error-handler.service';

@Injectable({
  providedIn: 'root',
})
export class JobService {
  constructor(private http: HttpClient, private httpErrorHandler: HttpErrorHandler, private formBuilder: FormBuilder) {}

  /*
   * GET /api/jobs
   */
  getJobs() {
    const options = {
      headers: {
        'Content-Type': 'application/json',
      },
    };

    return this.http.get<any>('/api/jobs', options).pipe(
      debounceTime(500),
      map(res => res.jobs),
      catchError(this.httpErrorHandler.handleHttpError)
    );
  }
}
