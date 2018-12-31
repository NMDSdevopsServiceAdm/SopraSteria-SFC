import { Injectable } from "@angular/core"
import { HttpClient, HttpHeaders } from "@angular/common/http"
import { BehaviorSubject } from "rxjs"
import { catchError, debounceTime, map } from "rxjs/operators"
import { FormBuilder, FormGroup } from "@angular/forms"

import { HttpErrorHandler } from "./http-error-handler.service"

import { ServicesModel } from '../model/services.model';
import { PostServicesModel } from '../model/postServices.model';
import { SharingOptionsModel } from '../model/sharingOptions.model';
import { LocalAuthorityModel } from '../model/localAuthority.model';

// local interface specifications for the request/response
interface EstablishmentApiResponse {
  id: number;
  name: string;
};
interface ShareOptionsRequest {
  share: SharingOptionsModel;
};
interface ShareOptionsResponse extends EstablishmentApiResponse {
  share: SharingOptionsModel;
};
interface ShareWithLocalAuthorityRequest {
  localAuthorities: LocalAuthorityModel[]
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

  private _establishmentId = null;
  private _establishmentToken = null;

  public set establishmentId(value:number) {
    this._establishmentId = value
  }
  public set establishmentToken(value) {
    this._establishmentToken = value
  }

  private getOptions() {
    let headers = new HttpHeaders()
    headers = headers.append("Authorization", this._establishmentToken)
    headers = headers.append("Content-Type", "application/json")
    return { headers }
  }

  /*
   * GET /api/establishment/:establishmentId/jobs
   */
  getJobs() {
    return this.http.get<any>(`/api/establishment/${this._establishmentId}/jobs`, this.getOptions()).pipe(
      debounceTime(500),
      map(res => res.jobs),
      catchError(this.httpErrorHandler.handleHttpError))
  }

  /*
   * GET /api/establishment/:establishmentId/jobs
   */
  getVacancies() {
    return this.http.get<any>(`/api/establishment/${this._establishmentId}/jobs`, this.getOptions()).pipe(
      debounceTime(500),
      map(res => res.jobs.Vacancies),
      catchError(this.httpErrorHandler.handleHttpError))
  }

  /*
   * POST /api/establishment/:establishmentId/jobs
   */
  postVacancies(vacancies) {
    const data = { jobs: { vacancies } }
    return this.http.post<any>(`/api/establishment/${this._establishmentId}/jobs`, data, this.getOptions()).pipe(
      debounceTime(500),
      catchError(this.httpErrorHandler.handleHttpError))
  }

  /*
   * GET /api/establishment/:establishmentId/jobs
   */
  getStarters() {
    return this.http.get<any>(`/api/establishment/${this._establishmentId}/jobs`, this.getOptions()).pipe(
      debounceTime(500),
      map(res => res.jobs.Starters),
      catchError(this.httpErrorHandler.handleHttpError))
  }

  /*
   * POST /api/establishment/:establishmentId/jobs
   */
  postStarters(starters) {
    const data = { jobs: { starters } }
    return this.http.post<any>(`/api/establishment/${this._establishmentId}/jobs`, data, this.getOptions())
      .pipe(
        debounceTime(500),
        catchError(this.httpErrorHandler.handleHttpError))
  }

  /*
   * GET /api/establishment/:establishmentId/jobs
   */
  getLeavers() {
    return this.http.get<any>(`/api/establishment/${this._establishmentId}/jobs`, this.getOptions()).pipe(
      debounceTime(500),
      map(res => res.jobs.Leavers),
      catchError(this.httpErrorHandler.handleHttpError))
  }

  /*
   * POST /api/establishment/:establishmentId/jobs
   */
  postLeavers(leavers) {
    const data = { jobs: { leavers } }
    return this.http.post<any>(`/api/establishment/${this._establishmentId}/jobs`, data, this.getOptions())
      .pipe(
        debounceTime(500),
        catchError(this.httpErrorHandler.handleHttpError))
  }

    /*
   * GET /api/establishment/:establishmentId/staff
   */
  getStaff() {
    return this.http.get<any>(`/api/establishment/${this._establishmentId}/staff`, this.getOptions()).pipe(
      debounceTime(500),
      map(res => res.numberOfStaff),
      catchError(this.httpErrorHandler.handleHttpError))
  }

  /*
   * POST /api/establishment/:establishmentId/staff/:staffNumber
   */
  postStaff(numberOfStaff) {
    return this.http.post<any>(`/api/establishment/${this._establishmentId}/staff/${numberOfStaff}`, null, this.getOptions())
      .pipe(
        debounceTime(500),
        catchError(this.httpErrorHandler.handleHttpError))
  }

  /*
   * Share With Local Authorities
   */
  getSharingOptions() {
    return this.http.get<ShareOptionsResponse>(`/api/establishment/${this._establishmentId}/share`, this.getOptions())
      .pipe(
        debounceTime(500),
        catchError(this.httpErrorHandler.handleHttpError))
  }
  postSharingOptions(shareOptions:SharingOptionsModel) {
    const postBody: ShareOptionsRequest = {
      share: shareOptions
    };
    return this.http.post<any>(`/api/establishment/${this._establishmentId}/share`, postBody, this.getOptions())
      .pipe(
        debounceTime(500),
        catchError(this.httpErrorHandler.handleHttpError))
  }

  /*
   * Share With Local Authorities
   */
  getLocalAuthorities() {
    return this.http.get<ShareWithLocalAuthorityResponse>(`/api/establishment/${this._establishmentId}/localAuthorities`, this.getOptions())
      .pipe(
        debounceTime(500),
        catchError(this.httpErrorHandler.handleHttpError))
  }
  postLocalAuthorities(authorities:LocalAuthorityModel[]) {
    const postBody : ShareWithLocalAuthorityRequest = {
      localAuthorities: authorities
    };
    return this.http.post<any>(`/api/establishment/${this._establishmentId}/localAuthorities`, postBody, this.getOptions())
      .pipe(
        debounceTime(500),
        catchError(this.httpErrorHandler.handleHttpError))
  }

  /*
   * Other Services
   */
  // GET all services [true:false]
  getAllServices() {
    return this.http.get<ServicesModel>(`/api/establishment/${this._establishmentId}/services?all=true`, this.getOptions())
      .pipe(
        debounceTime(500),
        catchError(this.httpErrorHandler.handleHttpError)
      );
  }
  getCurrentServices() {
    return this.http.get<ServicesModel>(`/api/establishment/${this._establishmentId}/services?all=false`, this.getOptions())
      .pipe(
        debounceTime(500),
        catchError(this.httpErrorHandler.handleHttpError)
      );
  }

  // POST other services
  postOtherServices(obj: PostServicesModel) {
    const $obj = { services: obj };
    return this.http.post<PostServicesModel>(`/api/establishment/${this._establishmentId}/services`, $obj, this.getOptions())
      .pipe(
        debounceTime(500),
        catchError(this.httpErrorHandler.handleHttpError)
      );
  }
  
}
