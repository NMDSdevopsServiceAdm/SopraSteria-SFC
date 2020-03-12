import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, isDevMode } from '@angular/core';
import {
  allMandatoryTrainingCategories,
  CancelOwnerShip,
  ChangeOwner,
  Establishment,
  LocalIdentifiersRequest,
  LocalIdentifiersResponse,
  mandatoryTraining,
  setPermission,
  UpdateJobsRequest,
} from '@core/model/establishment.model';
import { AllServicesResponse, ServiceGroup } from '@core/model/services.model';
import { URLStructure } from '@core/model/url.model';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';

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

interface MainServiceRequest {
  mainService: {
    id: number;
    name: string;
    other?: string;
  };
}
interface CQCLocationChangeRequest {
  addressLine1: string;
  addressLine2?: string;
  addressLine3?: string;
  county: string;
  isRegulated?: boolean;
  locationId?: string;
  locationName: string;
  mainService?: string;
  mainServiceOther?: string;
  postalCode: string;
  townCity: string;
}

@Injectable({
  providedIn: 'root',
})
export class EstablishmentService {
  private _establishment$: BehaviorSubject<Establishment> = new BehaviorSubject<Establishment>(null);
  private returnTo$ = new BehaviorSubject<URLStructure>(null);
  public previousEstablishmentId: string;
  public isSameLoggedInUser: boolean;
  private _primaryWorkplace$: BehaviorSubject<Establishment> = new BehaviorSubject<Establishment>(null);
  public isMandatoryTrainingView = new BehaviorSubject<boolean>(false);
  constructor(private http: HttpClient) {}

  private _establishmentId: string = null;

  public get primaryWorkplace$(): Observable<Establishment> {
    return this._primaryWorkplace$.asObservable();
  }

  public get primaryWorkplace(): Establishment {
    return this._primaryWorkplace$.value;
  }

  public setPrimaryWorkplace(workplace: Establishment) {
    this._primaryWorkplace$.next(workplace);
  }

  public get establishment$() {
    if (this._establishment$.value !== null) {
      return this._establishment$.asObservable();
    }
    return this.getEstablishment(this.establishmentId.toString()).pipe(
      tap(establishment => {
        this.setState(establishment);
      }),
    );
  }

  public get establishment() {
    return this._establishment$.value as Establishment;
  }

  setState(establishment) {
    this._establishment$.next(establishment);
    if (this.primaryWorkplace && establishment.uid === this.primaryWorkplace.uid) {
      this.setPrimaryWorkplace(this.establishment);
    }
  }

  public resetState() {
    this._establishmentId = null;
    this._establishment$.next(null);
    this.setPrimaryWorkplace(null);
  }

  public get establishmentId() {
    if (this._establishmentId) {
      return this._establishmentId;
    }

    this._establishmentId = localStorage.getItem('establishmentId');

    if (isDevMode()) {
      if (!this._establishmentId) {
        throw new TypeError('No establishmentId in local storage!');
      }
    }

    return this._establishmentId;
  }

  public set establishmentId(value: string) {
    this._establishmentId = value;
    localStorage.setItem('establishmentId', value.toString());
  }

  public getAllServices(establishmentId): Observable<ServiceGroup[]> {
    const params = new HttpParams().set('all', 'true');
    return this.http
      .get<AllServicesResponse>(`/api/establishment/${establishmentId}/services`, { params })
      .pipe(map(res => res.allOtherServices));
  }

  public get returnTo(): URLStructure {
    return this.returnTo$.value;
  }

  public setReturnTo(returnTo: URLStructure) {
    this.returnTo$.next(returnTo);
  }

  getEstablishment(id: string, wdf: boolean = false) {
    const params = wdf ? new HttpParams().set('wdf', `${wdf}`) : null;
    return this.http.get<any>(`/api/establishment/${id}`, { params });
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

  getStaff(establishmentuid: string) {
    return this.http.get<any>(`/api/establishment/${establishmentuid}/staff`).pipe(map(res => res.numberOfStaff));
  }

  postStaff(workplaceUid: string, numberOfStaff: number) {
    return this.http.post<any>(`/api/establishment/${workplaceUid}/staff/${numberOfStaff}`, null);
  }

  getSharingOptions() {
    return this.http.get<ShareOptionsResponse>(`/api/establishment/${this.establishmentId}/share`);
  }

  getEmployerType() {
    return this.http.get<EmployerTypeResponse>(`/api/establishment/${this.establishmentId}/employerType`);
  }

  public updateWorkplace(workplaceUid: string, data): Observable<any> {
    return this.http.put<any>(`/api/establishment/${workplaceUid}`, data);
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

  updateMainService(establishmentId: string, data: MainServiceRequest) {
    return this.http.post<MainServiceRequest>(`/api/establishment/${establishmentId}/mainService`, data);
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
      request,
    );
  }

  updateLocationDetails(establishmentId, data: CQCLocationChangeRequest): Observable<any> {
    return this.http.post<Establishment>(`/api/establishment/${establishmentId}/locationDetails`, data);
  }

  public deleteWorkplace(workplaceUid: string): Observable<any> {
    return this.http.delete<any>(`/api/establishment/${workplaceUid}`);
  }

  public isOwnWorkplace() {
    return !this.primaryWorkplace.isParent || this.primaryWorkplace.uid === this.establishment.uid;
  }

  public changeOwnership(establishmentId, data: ChangeOwner): Observable<Establishment> {
    return this.http.post<Establishment>(`/api/establishment/${establishmentId}/ownershipChange`, data);
  }
  public changeOwnershipDetails(establishmentId): Observable<any> {
    return this.http.get<any>(`/api/establishment/${establishmentId}/ownershipChange/details`);
  }

  public cancelOwnership(establishmentId, ownershipChangeId, data: CancelOwnerShip): Observable<Establishment> {
    return this.http.post<Establishment>(
      `/api/establishment/${establishmentId}/ownershipChange/${ownershipChangeId}`,
      data,
    );
  }

  public setDataPermission(establishmentId, data: setPermission): Observable<Establishment> {
    return this.http.post<Establishment>(`/api/establishment/${establishmentId}/dataPermissions`, data);
  }
  //get all parent with Post code
  public getAllParentWithPostCode(): Observable<any> {
    return this.http.get<any>(`/api/parentLinkingDetails/parents`);
  }

  //Send data for link to parent
  public setRequestToParentForLink(establishmentId, data: setPermission): Observable<Establishment> {
    return this.http.post<Establishment>(`/api/establishment/${establishmentId}/linkToParent`, data);
  }
  //Send data for link to parent
  public cancelRequestToParentForLink(establishmentId, data): Observable<Establishment> {
    return this.http.post<Establishment>(`/api/establishment/${establishmentId}/linkToParent/cancel`, data);
  }
  //Send data for de-link to parent
  public removeParentAssociation(establishmentId, data): Observable<Establishment> {
    return this.http.put<Establishment>(`/api/establishment/${establishmentId}/linkToParent/delink`, data);
  }
  //get all mandatory training
  public getAllMandatoryTrainings(establishmentId): Observable<allMandatoryTrainingCategories> {
    return this.http.get<allMandatoryTrainingCategories>(`/api/establishment/${establishmentId}/mandatoryTraining`);
  }
  //update mandatory training
  public updateMandatoryTraining(establishmentId, data: mandatoryTraining[]) {
    return this.http.post<Establishment>(`/api/establishment/${establishmentId}/mandatoryTraining`, data);
  }
}
