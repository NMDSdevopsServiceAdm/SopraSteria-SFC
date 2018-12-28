import { Injectable } from "@angular/core"
import { HttpClient, HttpHeaders } from "@angular/common/http"
import { BehaviorSubject } from "rxjs"
import { catchError, debounceTime, map } from "rxjs/operators"
import { FormBuilder, FormGroup } from "@angular/forms"

import { HttpErrorHandler } from "./http-error-handler.service"

@Injectable({
  providedIn: "root"
})
export class EstablishmentService {

  constructor(private http: HttpClient, private httpErrorHandler: HttpErrorHandler) {}

  get establishmentId() {
    // TODO replace with commented code
    // return this.establishmentId
    return 184
  }

  setEstablishmentId(value) {
    Object.defineProperty(this, "establishmentId", { value, writable: false })
  }

  private getOptions() {
    let headers = new HttpHeaders()
    headers = headers.append("Authorization", this.establishmentId.toString())
    headers = headers.append("Content-Type", "application/json")
    return { headers }
  }

  /*
   * GET /api/establishment/:establishmentId/capacity/?all=[true|false]
   */
  getCapacity(all=false) {
    return this.http.get<any>(`/api/establishment/${this.establishmentId}/capacity?all=${all}`, this.getOptions())
      .pipe(
        debounceTime(500),
        map(res => res.capacities),
        catchError(this.httpErrorHandler.handleHttpError))
  }

  /*
   * POST /api/establishment/:establishmentId/capacity
   */
  postCapacity(capacities) {
    const data = { capacities }
    return this.http.post<any>(`/api/establishment/${this.establishmentId}/capacity`, data, this.getOptions())
      .pipe(
        debounceTime(500),
        catchError(this.httpErrorHandler.handleHttpError))
  }

  /*
   * GET /api/establishment/:establishmentId/jobs
   */
  getJobs() {
    return this.http.get<any>(`/api/establishment/${this.establishmentId}/jobs`, this.getOptions()).pipe(
      debounceTime(500),
      map(res => res.jobs),
      catchError(this.httpErrorHandler.handleHttpError))
  }

  /*
   * GET /api/establishment/:establishmentId/jobs
   */
  getVacancies() {
    return this.http.get<any>(`/api/establishment/${this.establishmentId}/jobs`, this.getOptions()).pipe(
      debounceTime(500),
      map(res => res.jobs.Vacancies),
      catchError(this.httpErrorHandler.handleHttpError))
  }

  /*
   * POST /api/establishment/:establishmentId/jobs
   */
  postVacancies(vacancies) {
    const data = { jobs: { vacancies } }
    return this.http.post<any>(`/api/establishment/${this.establishmentId}/jobs`, data, this.getOptions()).pipe(
      debounceTime(500),
      catchError(this.httpErrorHandler.handleHttpError))
  }

  /*
   * GET /api/establishment/:establishmentId/jobs
   */
  getStarters() {
    return this.http.get<any>(`/api/establishment/${this.establishmentId}/jobs`, this.getOptions()).pipe(
      debounceTime(500),
      map(res => res.jobs.Starters),
      catchError(this.httpErrorHandler.handleHttpError))
  }

  /*
   * POST /api/establishment/:establishmentId/jobs
   */
  postStarters(starters) {
    const data = { jobs: { starters } }
    return this.http.post<any>(`/api/establishment/${this.establishmentId}/jobs`, data, this.getOptions())
      .pipe(
        debounceTime(500),
        catchError(this.httpErrorHandler.handleHttpError))
  }

  /*
   * GET /api/establishment/:establishmentId/jobs
   */
  getLeavers() {
    return this.http.get<any>(`/api/establishment/${this.establishmentId}/jobs`, this.getOptions()).pipe(
      debounceTime(500),
      map(res => res.jobs.Leavers),
      catchError(this.httpErrorHandler.handleHttpError))
  }

  /*
   * POST /api/establishment/:establishmentId/jobs
   */
  postLeavers(leavers) {
    const data = { jobs: { leavers } }
    return this.http.post<any>(`/api/establishment/${this.establishmentId}/jobs`, data, this.getOptions())
      .pipe(
        debounceTime(500),
        catchError(this.httpErrorHandler.handleHttpError))
  }
}
