import { Injectable } from "@angular/core"
import { HttpClient, HttpErrorResponse } from "@angular/common/http"
import { Router } from "@angular/router"
import { Observable, BehaviorSubject } from "rxjs"
import { catchError, debounceTime, map } from "rxjs/operators"
import { ErrorObservable } from "rxjs-compat/observable/ErrorObservable"
import { FormBuilder, FormGroup } from "@angular/forms"

import { HttpErrorHandler } from "./http-error-handler.service"
import { Message } from "../model/message.model"
import { Job } from "../model/job.model"

@Injectable({
  providedIn: "root"
})
export class JobService {
  constructor(private http: HttpClient, private httpErrorHandler: HttpErrorHandler, private formBuilder: FormBuilder) {}

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
        catchError(this.httpErrorHandler.handleHttpError))
  }
}
