import { Injectable, isDevMode } from "@angular/core"
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

interface EmployerTypeResponse {
  id: number
  name: string
  employerType: string
}

interface Job {
  id: number,
  total: number,
  jobId: number,
  title: string
}

interface JobsResponse extends EstablishmentApiResponse {
  jobs: {
    Starters: Array<Job>,
    Leavers: Array<Job>,
    Vacancies: Array<Job>,
    TotalVacencies: number,
    TotalStarters: number,
    TotalLeavers: number
  }
}

@Injectable({
  providedIn: "root"
})
export class EstablishmentService {

  constructor(private http: HttpClient, private httpErrorHandler: HttpErrorHandler) {
    this._headers = new HttpHeaders();
    this._headers.set("Content-Type", "application/json")
  }

  private _headers = null;

  private _establishmentId: number = null

  public set establishmentId(value:number) {
    this._establishmentId = value
    localStorage.setItem("establishmentId", value.toString())
  }

  public get establishmentId() {
    if (this._establishmentId) {
      return this._establishmentId
    }

    this._establishmentId = parseFloat(localStorage.getItem("establishmentId"))

    if (isDevMode()) {
      if (!this._establishmentId) {
        throw new TypeError("No establishmentId in local storage!")
      }
    }

    return this._establishmentId
  }

  /*
   * GET /api/establishment/:establishmentId/capacity/?all=[true|false]
   */
  getCapacity(all=false) {
    return this.http.get<any>(`/api/establishment/${this.establishmentId}/capacity?all=${all}`)
  }

  /*
   * POST /api/establishment/:establishmentId/capacity
   */
  postCapacity(capacities) {
    const data = { capacities }
    return this.http.post<any>(`/api/establishment/${this.establishmentId}/capacity`, data)
  }

  /*
   * GET /api/establishment/:establishmentId/jobs
   */
  getJobs() {
    return this.http.get<JobsResponse>(`/api/establishment/${this.establishmentId}/jobs`)
      .pipe(map(res => res.jobs))
  }

  /*
   * GET /api/establishment/:establishmentId/jobs
   */
  getVacancies() {
    return this.http.get<JobsResponse>(`/api/establishment/${this.establishmentId}/jobs`)
      .pipe(map(res => res.jobs.Vacancies))
  }

  /*
   * POST /api/establishment/:establishmentId/jobs
   */
  postVacancies(vacancies) {
    const data = { jobs: { vacancies } }
    return this.http.post<any>(`/api/establishment/${this.establishmentId}/jobs`, data)
  }

  /*
   * GET /api/establishment/:establishmentId/jobs
   */
  getStarters() {
    return this.http.get<JobsResponse>(`/api/establishment/${this.establishmentId}/jobs`)
      .pipe(map(res => res.jobs.Starters))
  }

  /*
   * POST /api/establishment/:establishmentId/jobs
   */
  postStarters(starters) {
    const data = { jobs: { starters } }
    return this.http.post<any>(`/api/establishment/${this.establishmentId}/jobs`, data)
  }

  /*
   * GET /api/establishment/:establishmentId/jobs
   */
  getLeavers() {
    return this.http.get<JobsResponse>(`/api/establishment/${this.establishmentId}/jobs`)
      .pipe(map(res => res.jobs.Leavers))
  }

  /*
   * POST /api/establishment/:establishmentId/jobs
   */
  postLeavers(leavers) {
    const data = { jobs: { leavers } }
    return this.http.post<any>(`/api/establishment/${this.establishmentId}/jobs`, data)
  }

  /*
   * GET /api/establishment/:establishmentId/staff
   */
  getStaff() {
    return this.http.get<any>(`/api/establishment/${this.establishmentId}/staff`)
      .pipe(map(res => res.numberOfStaff))
  }

  /*
   * POST /api/establishment/:establishmentId/staff/:staffNumber
   */
  postStaff(numberOfStaff) {
    return this.http.post<any>(`/api/establishment/${this.establishmentId}/staff/${numberOfStaff}`, null)
  }

  /*
   * Share With Local Authorities
   */
  getSharingOptions() {
    return this.http.get<ShareOptionsResponse>(`/api/establishment/${this.establishmentId}/share`)
  }

  postSharingOptions(shareOptions:SharingOptionsModel) {
    const postBody: ShareOptionsRequest = {
      share: shareOptions
    };
    return this.http.post<any>(`/api/establishment/${this.establishmentId}/share`, postBody)
  }

  /*
   * Share With Local Authorities
   */
  getLocalAuthorities() {
    return this.http.get<ShareWithLocalAuthorityResponse>(`/api/establishment/${this.establishmentId}/localAuthorities`)
  }

  postLocalAuthorities(authorities:LocalAuthorityModel[]) {
    const postBody : ShareWithLocalAuthorityRequest = {
      localAuthorities: authorities
    };
    return this.http.post<any>(`/api/establishment/${this.establishmentId}/localAuthorities`, postBody)
  }

  /*
   * GET /api/establishment/:establishmentId/employerType
   */
  getEmployerType() {
    return this.http.get<EmployerTypeResponse>(`/api/establishment/${this.establishmentId}/employerType`)
  }

  /*
   * POST /api/establishment/:establishmentId/employerType
   */
  postEmployerType(data) {
    return this.http.post<EmployerTypeResponse>(`/api/establishment/${this.establishmentId}/employerType`, data)
  }

  /*
   * Other Services
   */
  // GET all services [true:false]
  getAllServices() {
    return this.http.get<ServicesModel>(`/api/establishment/${this.establishmentId}/services?all=true`)
  }

  getCurrentServices() {
    return this.http.get<ServicesModel>(`/api/establishment/${this.establishmentId}/services?all=false`)
  }

  // POST other services
  postOtherServices(obj: PostServicesModel) {
    const $obj = { services: obj };
    return this.http.post<PostServicesModel>(`/api/establishment/${this.establishmentId}/services`, $obj)
  }
}
