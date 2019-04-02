import { HttpClient } from '@angular/common/http';
import { Injectable, isDevMode } from '@angular/core';
import { map } from 'rxjs/operators';

import { LocalAuthorityModel } from '../model/localAuthority.model';
import { PostServicesModel } from '../model/postServices.model';
import { ServicesModel } from '../model/services.model';
import { SharingOptionsModel } from '../model/sharingOptions.model';

interface EstablishmentApiResponse {
  id: number;
  name: string;
}
interface ShareOptionsRequest {
  share: SharingOptionsModel;
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
  constructor(private http: HttpClient) {}

  private _establishmentId: number = null;

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

  getCapacity(all = false) {
    return this.http.get<any>(`/api/establishment/${this.establishmentId}/capacity?all=${all}`);
  }

  postCapacity(capacities) {
    const data = { capacities };
    return this.http.post<any>(`/api/establishment/${this.establishmentId}/capacity`, data);
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

  postSharingOptions(shareOptions: SharingOptionsModel) {
    const postBody: ShareOptionsRequest = {
      share: shareOptions,
    };
    return this.http.post<any>(`/api/establishment/${this.establishmentId}/share`, postBody);
  }

  getLocalAuthorities() {
    return this.http.get<ShareWithLocalAuthorityResponse>(
      `/api/establishment/${this.establishmentId}/localAuthorities`
    );
  }

  postLocalAuthorities(authorities: LocalAuthorityModel[]) {
    const postBody: ShareWithLocalAuthorityRequest = {
      localAuthorities: authorities,
    };
    return this.http.post<any>(`/api/establishment/${this.establishmentId}/localAuthorities`, postBody);
  }

  getEmployerType() {
    return this.http.get<EmployerTypeResponse>(`/api/establishment/${this.establishmentId}/employerType`);
  }

  postEmployerType(data) {
    return this.http.post<EmployerTypeResponse>(`/api/establishment/${this.establishmentId}/employerType`, data);
  }

  getAllServices() {
    return this.http.get<ServicesModel>(`/api/establishment/${this.establishmentId}/services?all=true`);
  }

  getCurrentServices() {
    return this.http.get<ServicesModel>(`/api/establishment/${this.establishmentId}/services?all=false`);
  }

  postOtherServices(obj: PostServicesModel) {
    return this.http.post<PostServicesModel>(`/api/establishment/${this.establishmentId}/services`, obj);
  }

  getAllServiceUsers() {
    return this.http.get<any>('/api/serviceUsers');
  }
}
