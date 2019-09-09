import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ErrorDefinition } from '@core/model/errorSummary.model';
import { LocationAddress } from '@core/model/location.model';
import { Service, ServiceGroup } from '@core/model/services.model';
import { AddWorkplaceRequest, AddWorkplaceResponse } from '@core/model/workplace.model';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class WorkplaceService {
  constructor(private http: HttpClient) {}
  public addWorkplaceFlow$: BehaviorSubject<string> = new BehaviorSubject(null);
  public addWorkplaceInProgress$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  public locationAddresses$: BehaviorSubject<Array<LocationAddress>> = new BehaviorSubject(null);
  public isRegulated$: BehaviorSubject<boolean> = new BehaviorSubject(null);
  public newWorkplaceUid: string;
  public selectedLocationAddress$: BehaviorSubject<LocationAddress> = new BehaviorSubject(null);
  public selectedWorkplaceService$: BehaviorSubject<Service> = new BehaviorSubject(null);
  public manuallyEnteredWorkplace$: BehaviorSubject<boolean> = new BehaviorSubject(null);
  public serverErrorsMap: ErrorDefinition[] = [
    {
      name: 400,
      message: 'Data validation error.',
    },
  ];

  public isRegulated(): boolean {
    return this.isRegulated$.value;
  }

  public getServicesByCategory(isRegulated: boolean): Observable<Array<ServiceGroup>> {
    return this.http.get<Array<ServiceGroup>>(`/api/services/byCategory?cqc=${isRegulated}`);
  }

  public addWorkplace(establishmentuid: string, request: AddWorkplaceRequest): Observable<AddWorkplaceResponse> {
    return this.http.post<AddWorkplaceResponse>(`/api/establishment/${establishmentuid}`, request);
  }

  public generateAddWorkplaceRequest(locationAddress: LocationAddress, service: Service): AddWorkplaceRequest {
    return {
      addressLine1: locationAddress.addressLine1,
      addressLine2: locationAddress.addressLine2,
      county: locationAddress.county,
      isRegulated: service.isCQC,
      ...(locationAddress.locationId && { locationId: locationAddress.locationId }),
      locationName: locationAddress.locationName,
      mainService: service.name,
      postalCode: locationAddress.postalCode,
      townCity: locationAddress.townCity,
    };
  }
}
