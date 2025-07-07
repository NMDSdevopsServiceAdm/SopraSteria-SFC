import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ErrorDefinition } from '@core/model/errorSummary.model';
import { EmployerType } from '@core/model/establishment.model';
import { LocationAddress } from '@core/model/location.model';
import { Service, ServiceGroup } from '@core/model/services.model';
import { AddWorkplaceRequest, AddWorkplaceResponse } from '@core/model/workplace.model';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { WorkplaceInterfaceService } from './workplace-interface.service';

@Injectable({
  providedIn: 'root',
})
export class WorkplaceService extends WorkplaceInterfaceService {
  constructor(protected http: HttpClient) {
    super(http);
  }

  private _allWorkplaceSortValue: string;
  public addWorkplaceFlow$: BehaviorSubject<string> = new BehaviorSubject(null);
  public addWorkplaceInProgress$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  public serverErrorsMap: ErrorDefinition[] = [
    {
      name: 400,
      message: 'Data validation error.',
    },
  ];

  public getServicesByCategory(isRegulated: boolean): Observable<Array<ServiceGroup>> {
    return this.http.get<Array<ServiceGroup>>(
      `${environment.appRunnerEndpoint}/api/services/byCategory?cqc=${isRegulated}`,
    );
  }

  public getAllMandatoryTrainings(establishmentId: number): Observable<any> {
    return this.http.get(`${environment.appRunnerEndpoint}/api/establishment/${establishmentId}/mandatoryTraining/all`);
  }

  public addWorkplace(establishmentuid: string, request: AddWorkplaceRequest): Observable<AddWorkplaceResponse> {
    return this.http.post<AddWorkplaceResponse>(
      `${environment.appRunnerEndpoint}/api/establishment/${establishmentuid}`,
      request,
    );
  }

  public resetService(): void {
    super.resetService();

    this.addWorkplaceFlow$.next(null);
    this.addWorkplaceInProgress$.next(false);
  }

  public generateAddWorkplaceRequest(
    locationAddress: LocationAddress,
    service: Service,
    WorkplaceTotalStaff: string,
    employerTypeObject: EmployerType,
  ): AddWorkplaceRequest {
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
      totalStaff: WorkplaceTotalStaff,
      typeOfEmployer: employerTypeObject,
    };
  }

  public setAllWorkplaceSortValue(value: string) {
    this._allWorkplaceSortValue = value;
  }

  public getAllWorkplaceSortValue() {
    return this._allWorkplaceSortValue;
  }
}
