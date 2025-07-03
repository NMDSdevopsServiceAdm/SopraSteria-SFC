import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Params } from '@angular/router';
import { CareWorkforcePathwayUse, UpdateCareWorkforcePathwayUsePayload } from '@core/model/care-workforce-pathway.model';
import {
  adminMoveWorkplace,
  CancelOwnerShip,
  CareWorkforcePathwayWorkplaceAwareness,
  ChangeOwner,
  Establishment,
  LocalIdentifiersRequest,
  LocalIdentifiersResponse,
  mandatoryTraining,
  setPermission,
  UpdateJobsRequest,
} from '@core/model/establishment.model';
import { GetChildWorkplacesResponse } from '@core/model/my-workplaces.model';
import { AllServicesResponse, ServiceGroup } from '@core/model/services.model';
import { URLStructure } from '@core/model/url.model';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, mergeMap, tap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { PostServicesModel } from '../model/postServices.model';

interface EstablishmentApiResponse {
  id: number;
  name: string;
}

interface MainServiceRequest {
  cqc: boolean;
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

interface UpdateCareWorkforcePathwayUseResponse {
  id: number;
  uid: string;
  name: string;
  careWorkforcePathwayUse: CareWorkforcePathwayUse;
}

interface UpdateCareWorkforcePathwayWorkplaceAwarenessResponse {
  id: number;
  uid: string;
  name: string;
  careWorkforcePathwayWorkforceAwareness: CareWorkforcePathwayWorkplaceAwareness;
}

@Injectable({
  providedIn: 'root',
})
export class EstablishmentService {
  private _establishment$: BehaviorSubject<Establishment> = new BehaviorSubject<Establishment>(null);
  private returnTo$ = new BehaviorSubject<URLStructure>(null);
  private _primaryWorkplace$: BehaviorSubject<Establishment> = new BehaviorSubject<Establishment>(null);
  private _checkCQCDetailsBanner$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public previousEstablishmentId: string;
  public isSameLoggedInUser: boolean;
  public mainServiceCQC: boolean = null;
  private _employerTypeHasValue: boolean = null;
  private _standAloneAccount$: boolean;
  private _checkForChildWorkplaceChanges$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  constructor(private http: HttpClient) {}

  private _establishmentId: string = null;

  public get primaryWorkplace$(): Observable<Establishment> {
    return this._primaryWorkplace$.asObservable();
  }

  public get primaryWorkplace(): Establishment {
    return this._primaryWorkplace$.value;
  }

  public get employerTypeHasValue(): boolean {
    return this._employerTypeHasValue;
  }

  public get standAloneAccount(): boolean {
    return this._standAloneAccount$;
  }

  public set standAloneAccount(value: boolean) {
    this._standAloneAccount$ = value;
  }

  public get checkForChildWorkplaceChanges$(): Observable<boolean> {
    return this._checkForChildWorkplaceChanges$.asObservable();
  }

  public setCheckForChildWorkplaceChanges(value: boolean) {
    this._checkForChildWorkplaceChanges$.next(value);
  }

  public setEmployerTypeHasValue(hasValue: boolean) {
    this._employerTypeHasValue = hasValue;
  }

  public setPrimaryWorkplace(workplace: Establishment) {
    this._primaryWorkplace$.next(workplace);
  }

  public setWorkplace(workplace: Establishment) {
    this._establishment$.next(workplace);
  }

  public get establishment$() {
    if (this._establishment$.value !== null) {
      return this._establishment$.asObservable();
    }
    return this.getEstablishment(this.establishmentId.toString()).pipe(
      tap((establishment) => {
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
      this.setCheckCQCDetailsBanner(false);
    }
  }

  public resetState() {
    this._establishmentId = null;
    this._establishment$.next(null);
    this.standAloneAccount = false;
    this.setPrimaryWorkplace(null);
    this.setCheckCQCDetailsBanner(false);
  }

  public get establishmentId() {
    if (!this._establishmentId) {
      this._establishmentId = localStorage.getItem('establishmentId');
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
      .get<AllServicesResponse>(`${environment.appRunnerEndpoint}/api/establishment/${establishmentId}/services`, {
        params,
      })
      .pipe(map((res) => res.allOtherServices));
  }

  public get returnTo(): URLStructure {
    if (this.returnTo$.value) {
      return this.returnTo$.value;
    }
    const returnTo = localStorage.getItem('returnTo');
    if (returnTo) {
      this.returnTo$.next(JSON.parse(returnTo));
    }

    return this.returnTo$.value;
  }

  public setReturnTo(returnTo: URLStructure): void {
    localStorage.setItem('returnTo', JSON.stringify(returnTo));
    this.returnTo$.next(returnTo);
  }

  public returnIsSetToHomePage(): boolean {
    return (
      this.returnTo &&
      Array.isArray(this.returnTo.url) &&
      this.returnTo.url.length === 1 &&
      this.returnTo.url[0] === '/dashboard' &&
      this.returnTo.fragment === 'home'
    );
  }

  public get checkCQCDetailsBanner$(): Observable<boolean> {
    return this._checkCQCDetailsBanner$.asObservable();
  }

  public get checkCQCDetailsBanner(): boolean {
    return this._checkCQCDetailsBanner$.value;
  }

  public setCheckCQCDetailsBanner(data: boolean) {
    this._checkCQCDetailsBanner$.next(data);
  }

  getEstablishment(id: string, wdf: boolean = false) {
    const params = wdf ? new HttpParams().set('wdf', `${wdf}`) : null;
    return this.http.get<any>(`${environment.appRunnerEndpoint}/api/establishment/${id}`, { params });
  }

  getCapacity(establishmentId, all = false) {
    const params = new HttpParams().set('all', `${all}`);
    return this.http.get<any>(`${environment.appRunnerEndpoint}/api/establishment/${establishmentId}/capacity`, {
      params,
    });
  }

  updateCapacity(establishmentId, data) {
    return this.http.post<any>(`${environment.appRunnerEndpoint}/api/establishment/${establishmentId}/capacity`, data);
  }

  workplaceOrSubHasTrainingCertificates(workplaceUid: string) {
    return this.http.get<any>(
      `${environment.appRunnerEndpoint}/api/establishment/${workplaceUid}/hasTrainingCertificates`,
    );
  }

  getJobs() {
    return this.http.get<any>(`${environment.appRunnerEndpoint}/api/establishment/${this.establishmentId}/jobs`);
  }

  postStaff(workplaceUid: string, numberOfStaff: number) {
    return this.http.post<any>(
      `${environment.appRunnerEndpoint}/api/establishment/${workplaceUid}/staff/${numberOfStaff}`,
      null,
    );
  }

  getEstablishmentField(establishmentId: string, property: string) {
    return this.http.get<any>(
      `${environment.appRunnerEndpoint}/api/establishment/${establishmentId}/establishmentField/${property}`,
    );
  }

  updateEstablishmentFieldWithAudit(establishmentId: string, property: string, data: any) {
    return this.http.post<any>(
      `${environment.appRunnerEndpoint}/api/establishment/${establishmentId}/establishmentField/${property}`,
      data,
    );
  }

  public updateWorkplace(workplaceUid: string, data): Observable<any> {
    return this.http.put<any>(`${environment.appRunnerEndpoint}/api/establishment/${workplaceUid}`, data);
  }

  updateServiceUsers(establishmentId, data) {
    return this.http.post<any>(
      `${environment.appRunnerEndpoint}/api/establishment/${establishmentId}/serviceUsers`,
      data,
    );
  }

  updateOtherServices(establishmentId, data: PostServicesModel) {
    return this.http.post<PostServicesModel>(
      `${environment.appRunnerEndpoint}/api/establishment/${establishmentId}/services`,
      data,
    );
  }

  updateMainService(establishmentId: string, data: MainServiceRequest) {
    return this.http.post<MainServiceRequest>(
      `${environment.appRunnerEndpoint}/api/establishment/${establishmentId}/mainService`,
      data,
    );
  }

  updateSingleEstablishmentField(establishmentId: string, data: any): Observable<any> {
    return this.http.post<any>(
      `${environment.appRunnerEndpoint}/api/establishment/${establishmentId}/updateSingleEstablishmentField`,
      data,
    );
  }

  updateLocalAuthorities(establishmentId, data) {
    return this.http.post<Establishment>(
      `${environment.appRunnerEndpoint}/api/establishment/${establishmentId}/localAuthorities`,
      data,
    );
  }

  updateJobs(establishmentId: string, data: UpdateJobsRequest): Observable<Partial<Establishment>> {
    return this.http
      .post<Establishment>(`${environment.appRunnerEndpoint}/api/establishment/${establishmentId}/jobs`, data)
      .pipe(
        mergeMap((response) => {
          this.setState({ ...this.establishment, ...response });
          return of(response);
        }),
      );
  }

  updateWorkers(establishmentId, data) {
    return this.http.put<any>(`${environment.appRunnerEndpoint}/api/establishment/${establishmentId}/workers`, data);
  }

  public updateLocalIdentifiers(request: LocalIdentifiersRequest): Observable<LocalIdentifiersResponse> {
    return this.http.put<LocalIdentifiersResponse>(
      `${environment.appRunnerEndpoint}/api/establishment/${this.establishmentId}/localIdentifier`,
      request,
    );
  }

  updateLocationDetails(establishmentId, data: CQCLocationChangeRequest): Observable<any> {
    return this.http.post<Establishment>(
      `${environment.appRunnerEndpoint}/api/establishment/${establishmentId}/locationDetails`,
      data,
    );
  }

  updateCareWorkforcePathwayAwareness(establishmentId: string, data: any): Observable<any> {
    return this.http.post<UpdateCareWorkforcePathwayWorkplaceAwarenessResponse>(
      `${environment.appRunnerEndpoint}/api/establishment/${establishmentId}/careWorkforcePathway/careWorkforcePathwayAwareness`,
      data,
    );
  }

  public deleteWorkplace(workplaceUid: string): Observable<any> {
    return this.http.delete<any>(`${environment.appRunnerEndpoint}/api/establishment/${workplaceUid}`);
  }

  public isOwnWorkplace() {
    return !this.primaryWorkplace.isParent || this.primaryWorkplace.uid === this.establishment.uid;
  }

  public changeOwnership(establishmentId, data: ChangeOwner): Observable<Establishment> {
    return this.http.post<Establishment>(
      `${environment.appRunnerEndpoint}/api/establishment/${establishmentId}/ownershipChange`,
      data,
    );
  }
  public changeOwnershipDetails(establishmentId): Observable<any> {
    return this.http.get<any>(
      `${environment.appRunnerEndpoint}/api/establishment/${establishmentId}/ownershipChange/details`,
    );
  }

  public cancelOwnership(establishmentId, ownershipChangeId, data: CancelOwnerShip): Observable<Establishment> {
    return this.http.post<Establishment>(
      `${environment.appRunnerEndpoint}/api/establishment/${establishmentId}/ownershipChange/${ownershipChangeId}`,
      data,
    );
  }

  public setDataPermission(establishmentId, data: setPermission): Observable<Establishment> {
    return this.http.post<Establishment>(
      `${environment.appRunnerEndpoint}/api/establishment/${establishmentId}/dataPermissions`,
      data,
    );
  }
  //get all parent with Post code
  public getAllParentWithPostCode(): Observable<any> {
    return this.http.get<any>(`${environment.appRunnerEndpoint}/api/parentLinkingDetails/parents`);
  }

  //Send data for link to parent
  public setRequestToParentForLink(establishmentId, data: setPermission): Observable<Establishment> {
    return this.http.post<Establishment>(
      `${environment.appRunnerEndpoint}/api/establishment/${establishmentId}/linkToParent`,
      data,
    );
  }
  //Send data for link to parent
  public cancelRequestToParentForLink(establishmentId, data): Observable<Establishment> {
    return this.http.post<Establishment>(
      `${environment.appRunnerEndpoint}/api/establishment/${establishmentId}/linkToParent/cancel`,
      data,
    );
  }
  //Send data for de-link to parent
  public removeParentAssociation(establishmentId, data): Observable<Establishment> {
    return this.http.put<Establishment>(
      `${environment.appRunnerEndpoint}/api/establishment/${establishmentId}/linkToParent/delink`,
      data,
    );
  }

  //get request for link to parent
  public getRequestedLinkToParent(establishmentId, data) {
    return this.http.put<Establishment>(
      `${environment.appRunnerEndpoint}/api/establishment/${establishmentId}/linkToParent/requested`,
      data,
    );
  }

  //update mandatory training
  public createAndUpdateMandatoryTraining(establishmentId, data: mandatoryTraining) {
    return this.http.post<Establishment>(
      `${environment.appRunnerEndpoint}/api/establishment/${establishmentId}/mandatoryTraining`,
      data,
    );
  }

  //Move workplace as an admin
  public adminMoveWorkplace(data: adminMoveWorkplace): Observable<any> {
    return this.http.post<any>(`${environment.appRunnerEndpoint}/api/admin/move-workplace`, data);
  }

  public getCQCRegistrationStatus(locationID, requestParams): Observable<any> {
    let params = new HttpParams();

    params = params.set('postcode', `${requestParams.postcode}`);
    params = params.set('mainService', `${requestParams.mainService}`);

    return this.http.get<any>(`${environment.appRunnerEndpoint}/api/cqcStatusCheck/${locationID}`, { params });
  }

  public getExpiresSoonAlertDates(establishmentId: string): Observable<any> {
    return this.http.get<any>(
      `${environment.appRunnerEndpoint}/api/establishment/${establishmentId}/expiresSoonAlertDates`,
    );
  }

  public setExpiresSoonAlertDates(establishmentId: string, expiresSoonAlertDate: string): Observable<any> {
    return this.http.post<any>(
      `${environment.appRunnerEndpoint}/api/establishment/${establishmentId}/expiresSoonAlertDates`,
      { expiresSoonAlertDate },
    );
  }

  public removeParentStatus(data: any): Observable<any> {
    return this.http.post<any>(`${environment.appRunnerEndpoint}/api/admin/remove-parent-status`, data);
  }

  public getChildWorkplaces(establishmentId: string, queryParams?: Params): Observable<GetChildWorkplacesResponse> {
    return this.http
      .get<any>(`${environment.appRunnerEndpoint}/api/establishment/${establishmentId}/childWorkplaces`, {
        params: queryParams || {},
      })
      .pipe(map((data) => data));
  }

  public getCertificate(establishmentId: string, years: string): Observable<any> {
    return this.http.get<any>(
      `${environment.appRunnerEndpoint}/api/establishment/${establishmentId}/certificate/${years}`,
    );
  }

  public getMissingCqcLocations(requestParams): Observable<any> {
    let params = new HttpParams();

    params = params.set('provId', `${requestParams.provId}`);
    params = params.set('establishmentUid', `${requestParams.uid}`);
    params = params.set('establishmentId', `${requestParams.id}`);

    return this.http.get<any>(`${environment.appRunnerEndpoint}/api/missingCqcProviderLocations`, {
      params,
    });
  }

  public updateCareWorkforcePathwayUse(establishmentUid: string, payload: UpdateCareWorkforcePathwayUsePayload) {
    return this.http.post<UpdateCareWorkforcePathwayUseResponse>(
      `${environment.appRunnerEndpoint}/api/establishment/${establishmentUid}/careWorkforcePathway/careWorkforcePathwayUse`,
      payload,
    );
  }
}
