import { Injectable } from "@angular/core"
import { HttpClient, HttpHeaders } from "@angular/common/http"
import { BehaviorSubject } from "rxjs"
import { catchError, debounceTime, map } from "rxjs/operators"
import { FormBuilder, FormGroup } from "@angular/forms"

import { HttpErrorHandler } from "./http-error-handler.service"

import { SharingOptionsModel } from '../model/sharingOptions.model';
import { LocalAuthorityModel } from '../model/localAuthority.model';

// local interface specifications for the request/response
interface EstablishmentApiResponse {
  id: number;
  name: string;
};
interface ShareOptionsResponse extends EstablishmentApiResponse {
  share: SharingOptionsModel;
};
interface ShareWithLocalAuthorityResponse extends EstablishmentApiResponse {
  primaryAuthority: LocalAuthorityModel;
  localAuthorities: LocalAuthorityModel[];
};

@Injectable({
  providedIn: "root"
})
export class EstablishmentService {

  constructor(private http: HttpClient, private httpErrorHandler: HttpErrorHandler) {}

  get establishmentId() {
    // TODO replace with commented code
    // return this.establishmentId
    return 1
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

    /*
   * GET /api/establishment/:establishmentId/staff
   */
  getStaff() {
    return this.http.get<any>(`/api/establishment/${this.establishmentId}/staff`, this.getOptions()).pipe(
      debounceTime(500),
      map(res => res.numberOfStaff),
      catchError(this.httpErrorHandler.handleHttpError))
  }

  /*
   * POST /api/establishment/:establishmentId/staff/:staffNumber
   */
  postStaff(numberOfStaff) {
    return this.http.post<any>(`/api/establishment/${this.establishmentId}/staff/${numberOfStaff}`, null, this.getOptions())
      .pipe(
        debounceTime(500),
        catchError(this.httpErrorHandler.handleHttpError))
  }

  getSharingOptions() {
    return this.http.get<ShareOptionsResponse>(`/api/establishment/${this.establishmentId}/share`, this.getOptions())
      .pipe(
        debounceTime(500),
        catchError(this.httpErrorHandler.handleHttpError))
  }

  /*
   * localAuthorities
   */
  getLocalAuthorities() {
    return this.http.get<ShareWithLocalAuthorityResponse>(`/api/establishment/${this.establishmentId}/localAuthorities`, this.getOptions())
      .pipe(
        debounceTime(500),
        catchError(this.httpErrorHandler.handleHttpError))
  }
  postLocalAuthorities(authorities:LocalAuthorityModel[]) {
    return this.http.post<any>(`/api/establishment/${this.establishmentId}/localAuthorities`, { localAuthorities: authorities }, this.getOptions())
      .pipe(
        debounceTime(500),
        catchError(this.httpErrorHandler.handleHttpError))
  }
}
