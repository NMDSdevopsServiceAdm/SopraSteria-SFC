import { AllServicesResponse, ServiceGroup } from '@core/model/services.model';
import { BehaviorSubject, Observable } from 'rxjs';
import { Establishment, LocalIdentifiersRequest, LocalIdentifiersResponse, UpdateJobsRequest } from '@core/model/establishment.model';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, isDevMode } from '@angular/core';
import { map } from 'rxjs/operators';
import { URLStructure } from '@core/model/url.model';

import { DataSharingRequest, SharingOptionsModel } from '../model/data-sharing.model';
import { PostServicesModel } from '../model/postServices.model';

interface EstablishmentApiResponse {
  id: number;
  name: string;
}

interface ShareOptionsResponse extends EstablishmentApiResponse {
  share: SharingOptionsModel;
}

interface EmployerTypeResponse {
  id: number;
  name: string;
  employerType: {
    value: string;
    other?: string;
  };
}

interface EmployerTypeRequest {
  employerType: {
    value: string;
    other?: string;
  };
}

@Injectable({
  providedIn: 'root',
})
export class EstablishmentService {
  private _establishment$: BehaviorSubject<Establishment> = new BehaviorSubject<Establishment>(null);
  public establishment$: Observable<Establishment> = this._establishment$.asObservable();
  private returnTo$ = new BehaviorSubject<URLStructure>(null);
  public previousEstablishmentId: number;
  public isSameLoggedInUser: boolean;

  constructor(private http: HttpClient) {}

  private _establishmentId: number = null;

  public checkIfSameLoggedInUser(establishmentId: number): void {
    if (!this.previousEstablishmentId || this.previousEstablishmentId !== establishmentId) {
      this.previousEstablishmentId = establishmentId;
      this.isSameLoggedInUser = false;
    } else {
      this.isSameLoggedInUser = true;
    }
  }

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

  public getAllServices(establishmentId): Observable<ServiceGroup[]> {
    const params = new HttpParams().set('all', 'true');
    return this.http
      .get<AllServicesResponse>(`/api/establishment/${establishmentId}/services`, { params })
      .pipe(map(res => res.allOtherServices));
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

  public get returnTo(): URLStructure {
    return this.returnTo$.value;
  }

  public setReturnTo(returnTo: URLStructure) {
    this.returnTo$.next(returnTo);
  }

  getEstablishment(id: string) {
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
    return this.http.get<any>(`/api/establishment/${this.establishmentId}/jobs`);
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

  getEmployerType() {
    return this.http.get<EmployerTypeResponse>(`/api/establishment/${this.establishmentId}/employerType`);
  }

  updateServiceUsers(establishmentId, data) {
    return this.http.post<any>(`/api/establishment/${establishmentId}/serviceUsers`, data);
  }

  updateTypeOfEmployer(establishmentId, data: EmployerTypeRequest) {
    return this.http.post<EmployerTypeResponse>(`/api/establishment/${establishmentId}/employerType`, data);
  }

  updateOtherServices(establishmentId, data: PostServicesModel) {
    return this.http.post<PostServicesModel>(`/api/establishment/${establishmentId}/services`, data);
  }

  updateDataSharing(establishmentId, data: DataSharingRequest): Observable<any> {
    return this.http.post<Establishment>(`/api/establishment/${establishmentId}/share`, data);
  }

  updateLocalAuthorities(establishmentId, data) {
    return this.http.post<Establishment>(`/api/establishment/${establishmentId}/localAuthorities`, data);
  }

  updateJobs(establishmentId, data: UpdateJobsRequest): Observable<Establishment> {
    return this.http.post<Establishment>(`/api/establishment/${establishmentId}/jobs`, data);
  }

  public updateLocalIdentifiers(request: LocalIdentifiersRequest): Observable<LocalIdentifiersResponse> {
    return this.http.put<LocalIdentifiersResponse>(
      `/api/establishment/${this.establishmentId}/localIdentifier`,
      request
    );
  }
}
