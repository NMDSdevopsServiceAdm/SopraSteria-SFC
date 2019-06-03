import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, isDevMode } from '@angular/core';
import { Establishment } from '@core/model/establishment.model';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { DataSharingRequest, SharingOptionsModel } from '../model/data-sharing.model';
import { LocalAuthorityModel } from '../model/localAuthority.model';
import { PostServicesModel } from '../model/postServices.model';
import { AllServicesResponse, ServiceGroup, ServicesModel } from '../model/services.model';

interface EstablishmentApiResponse {
  id: number;
  name: string;
}

interface ShareOptionsResponse extends EstablishmentApiResponse {
  share: SharingOptionsModel;
}
interface ShareWithLocalAuthorityRequest {
  localAuthorities: LocalAuthorityModel[];
}
interface ShareWithLocalAuthorityResponse extends EstablishmentApiResponse {
  primaryAuthority: LocalAuthorityModel;
  localAuthorities: LocalAuthorityModel[];
}

interface EmployerTypeResponse {
  id: number;
  name: string;
  employerType: string;
}

@Injectable({
  providedIn: 'root',
})
export class EstablishmentService {
  private _establishment$: BehaviorSubject<Establishment> = new BehaviorSubject<Establishment>(null);
  public establishment$: Observable<Establishment> = this._establishment$.asObservable();

  constructor(private http: HttpClient) {}

  private _establishmentId: number = null;

  public get establishment() {
    return this._establishment$.value as Establishment;
  }

  setState(establishment) {
    this._establishment$.next(establishment);
  }

  public set establishmentId(value: number) {
    this._establishmentId = value;
    localStorage.setItem('establishmentId', value.toString());
  }

  public get establishmentId() {
    if (this._establishmentId) {
      return this._establishmentId;
    }

    this._establishmentId = parseFloat(localStorage.getItem('establishmentId'));

    if (isDevMode()) {
      if (!this._establishmentId) {
        throw new TypeError('No establishmentId in local storage!');
      }
    }

    return this._establishmentId;
  }

  getEstablishment(id: number) {
    return this.http.get<any>(`/api/establishment/${id}`);
  }

  getCapacity(establishmentId, all = false) {
    const params = new HttpParams().set('all', `${all}`);
    return this.http.get<any>(`/api/establishment/${establishmentId}/capacity`, { params });
  }

  updateCapacity(establishmentId, data) {
    return this.http.post<any>(`/api/establishment/${establishmentId}/capacity`, data);
  }

  getJobs() {
    return this.http.get<any>(`/api/establishment/${this.establishmentId}/jobs`).pipe(map(res => res.jobs));
  }

  getVacancies() {
    return this.http.get<any>(`/api/establishment/${this.establishmentId}/jobs`).pipe(map(res => res.jobs.Vacancies));
  }

  postVacancies(vacancies) {
    const data = { jobs: { vacancies } };
    return this.http.post<any>(`/api/establishment/${this.establishmentId}/jobs`, data);
  }

  getStarters() {
    return this.http.get<any>(`/api/establishment/${this.establishmentId}/jobs`).pipe(map(res => res.jobs.Starters));
  }

  postStarters(starters) {
    const data = { jobs: { starters } };
    return this.http.post<any>(`/api/establishment/${this.establishmentId}/jobs`, data);
  }

  getLeavers() {
    return this.http.get<any>(`/api/establishment/${this.establishmentId}/jobs`).pipe(map(res => res.jobs.Leavers));
  }

  postLeavers(leavers) {
    const data = { jobs: { leavers } };
    return this.http.post<any>(`/api/establishment/${this.establishmentId}/jobs`, data);
  }

  getStaff() {
    return this.http.get<any>(`/api/establishment/${this.establishmentId}/staff`).pipe(map(res => res.numberOfStaff));
  }

  postStaff(numberOfStaff) {
    return this.http.post<any>(`/api/establishment/${this.establishmentId}/staff/${numberOfStaff}`, null);
  }

  getSharingOptions() {
    return this.http.get<ShareOptionsResponse>(`/api/establishment/${this.establishmentId}/share`);
  }

  getLocalAuthorities() {
    return this.http.get<ShareWithLocalAuthorityResponse>(
      `/api/establishment/${this.establishmentId}/localAuthorities`
    );
  }

  getEmployerType() {
    return this.http.get<EmployerTypeResponse>(`/api/establishment/${this.establishmentId}/employerType`);
  }

  getAllServices(establishmentId): Observable<ServiceGroup[]> {
    const params = new HttpParams().set('all', 'true');
    return this.http
      .get<AllServicesResponse>(`/api/establishment/${establishmentId}/services`, { params })
      .pipe(map(res => res.allOtherServices));
  }

  getCurrentServices() {
    return this.http.get<ServicesModel>(`/api/establishment/${this.establishmentId}/services?all=false`);
  }

  getAllServiceUsers() {
    return this.http.get<any>('/api/serviceUsers');
  }

  getServiceUsersChecked(establishmentId) {
    return this.http.get<any>(`/api/establishment/${establishmentId}/serviceUsers`);
  }

  postServiceUsers(establishmentId, data) {
    return this.http.post<any>(`/api/establishment/${establishmentId}/serviceUsers`, data);
  }

  updateTypeOfEmployer(establishmentId, data) {
    return this.http.post<EmployerTypeResponse>(`/api/establishment/${establishmentId}/employerType`, data);
  }

  updateOtherServices(establishmentId, data: PostServicesModel) {
    return this.http.post<PostServicesModel>(`/api/establishment/${establishmentId}/services`, data);
  }

  updateDataSharing(establishmentId, data: DataSharingRequest): Observable<any> {
    return this.http.post<any>(`/api/establishment/${establishmentId}/share`, data);
  }

  updateLocalAuthorities(establishmentId, data) {
    return this.http.post<any>(`/api/establishment/${establishmentId}/localAuthorities`, data);
  }
}
