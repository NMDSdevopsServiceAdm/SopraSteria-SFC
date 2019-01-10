import { Injectable } from "@angular/core"
import { HttpClient } from "@angular/common/http"
import { BehaviorSubject } from "rxjs"
import { catchError, debounceTime, map } from "rxjs/operators"
import { FormBuilder, FormGroup } from "@angular/forms"

import { HttpErrorHandler } from "./http-error-handler.service"

@Injectable({
  providedIn: "root"
})
export class JobService {
  constructor(private http: HttpClient, private httpErrorHandler: HttpErrorHandler, private formBuilder: FormBuilder) {}

  /*
   * GET /api/jobs
   */
  getJobs() {
    return this.http.get<any>("/api/jobs")
      .pipe(map(res => res.jobs))
  }
}
