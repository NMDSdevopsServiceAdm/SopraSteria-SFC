import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ErrorDefinition } from '@core/model/errorSummary.model';
import { LocationAddress } from '@core/model/location.model';
import { Service, ServiceGroup } from '@core/model/services.model';
import { URLStructure } from '@core/model/url.model';
import { AddWorkplaceRequest, AddWorkplaceResponse } from '@core/model/workplace.model';
import { BehaviorSubject, Observable } from 'rxjs';

import { WorkplaceInterfaceService } from './workplace-interface.service';

@Injectable({
  providedIn: 'root',
})
export class WorkplaceService extends WorkplaceInterfaceService {
  constructor(private http: HttpClient) {
    super();
  }

  public returnTo$ = new BehaviorSubject<URLStructure>(null);
  public addWorkplaceFlow$: BehaviorSubject<string> = new BehaviorSubject(null);
  public addWorkplaceInProgress$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  public serverErrorsMap: ErrorDefinition[] = [
    {
      name: 400,
      message: 'Data validation error.',
    },
  ];

  public getServicesByCategory(isRegulated: boolean): Observable<Array<ServiceGroup>> {
    return this.http.get<Array<ServiceGroup>>(`/api/services/byCategory?cqc=${isRegulated}`);
  }

  public getAllMandatoryTrainings(establishmentId: number): Observable<any> {
    return this.http.get(`/api/establishment/${establishmentId}/mandatoryTraining/all`);
  }

  public addWorkplace(establishmentuid: string, request: AddWorkplaceRequest): Observable<AddWorkplaceResponse> {
    return this.http.post<AddWorkplaceResponse>(`/api/establishment/${establishmentuid}`, request);
  }

  public generateAddWorkplaceRequest(locationAddress: LocationAddress, service: Service): AddWorkplaceRequest {
    return {
      addressLine1: locationAddress.addressLine1,
      addressLine2: locationAddress.addressLine2,
      addressLine3: locationAddress.addressLine3,
      county: locationAddress.county,
      isRegulated: service.isCQC,
      ...(locationAddress.locationId && { locationId: locationAddress.locationId }),
      locationName: locationAddress.locationName,
      mainService: service.name,
      postalCode: locationAddress.postalCode,
      townCity: locationAddress.townCity,
    };
  }

  public setReturnTo(returnTo: URLStructure): void {
    this.returnTo$.next(returnTo);
  }
}
