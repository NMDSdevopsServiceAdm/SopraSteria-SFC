import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, BehaviorSubject } from 'rxjs';
import { catchError, debounceTime, map } from 'rxjs/operators';
import { ErrorObservable } from 'rxjs-compat/observable/ErrorObservable';
import { FormBuilder, FormGroup } from '@angular/forms'

import { RegistrationTrackerError } from '../model/registrationTrackerError.model';
import { Job } from '../model/job.model';

interface JobServiceModel {
  jobs: Job[],
}

@Injectable({
  providedIn: "root"
})
export class JobService {
  constructor(private http: HttpClient, private formBuilder: FormBuilder) {}

  public currentVacancies: BehaviorSubject<FormGroup> = new BehaviorSubject<FormGroup>(this.formBuilder.group({}))

  /*
   * GET /api/jobs
   */
  getJobs() {
    const options = {
      headers: {
        "Content-Type": "application/json"
      }
    }

    return this.http.get<any>(`/api/jobs`, options)
      .pipe(
        debounceTime(500),
        map(res => res.jobs),
        catchError(this.handleHttpError))
  }

  private handleHttpError(error: HttpErrorResponse): Observable<RegistrationTrackerError> {
    const dataError = new RegistrationTrackerError();
    dataError.message = error.message;
    dataError.success = error.error.success;
    dataError.friendlyMessage = error.error.message;
    return ErrorObservable.create(dataError);
  }
}
