import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { LocationAddress } from '@core/model/location.model';
import { EstablishmentExistsResponse } from '@core/model/registration.model';
import { Service } from '@core/model/services.model';
import { URLStructure } from '@core/model/url.model';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export abstract class WorkplaceInterfaceService {
  public locationAddresses$: BehaviorSubject<Array<LocationAddress>> = new BehaviorSubject(null);
  public isRegulated$: BehaviorSubject<boolean> = new BehaviorSubject(null);
  public isCqcRegulated$: BehaviorSubject<boolean> = new BehaviorSubject(null);
  public newWorkplaceUid: string;
  public selectedLocationAddress$: BehaviorSubject<LocationAddress> = new BehaviorSubject(null);
  public selectedWorkplaceService$: BehaviorSubject<Service> = new BehaviorSubject(null);
  public manuallyEnteredWorkplace$: BehaviorSubject<boolean> = new BehaviorSubject(null);
  public searchMethod$: BehaviorSubject<string> = new BehaviorSubject(null);
  public postcodeOrLocationId$: BehaviorSubject<string> = new BehaviorSubject(null);
  public totalStaff$: BehaviorSubject<string> = new BehaviorSubject(null);
  public postcode$: BehaviorSubject<string> = new BehaviorSubject(null);
  public workplaceNotFound$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  public returnTo$: BehaviorSubject<URLStructure> = new BehaviorSubject<URLStructure>(null);
  public invalidPostcodeEntered$: BehaviorSubject<string> = new BehaviorSubject(null);
  public manuallyEnteredWorkplaceName$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  public useDifferentLocationIdOrPostcode$: BehaviorSubject<boolean> = new BehaviorSubject(null);

  constructor(protected http: HttpClient) {}

  public isRegulated(): boolean {
    return this.isRegulated$.value;
  }

  public setReturnTo(returnTo: URLStructure): void {
    this.returnTo$.next(returnTo);
  }

  public checkIfEstablishmentExistsLocationId(locationID: string): Observable<EstablishmentExistsResponse> {
    return this.http.post<EstablishmentExistsResponse>(`/api/registration/establishmentExistsCheck/locationId`, {
      locationID,
    });
  }

  public checkIfEstablishmentExistsPostcodeAndName(postcodeAndName: {
    postcode: string;
    name: string;
  }): Observable<EstablishmentExistsResponse> {
    return this.http.post<EstablishmentExistsResponse>(
      `/api/registration/establishmentExistsCheck/postcodeAndName`,
      postcodeAndName,
    );
  }

  public resetService(): void {
    this.locationAddresses$.next(null);
    this.isRegulated$.next(null);
    this.isCqcRegulated$.next(null);
    this.newWorkplaceUid = null;
    this.selectedLocationAddress$.next(null);
    this.selectedWorkplaceService$.next(null);
    this.manuallyEnteredWorkplace$.next(null);
    this.searchMethod$.next(null);
    this.postcodeOrLocationId$.next(null);
    this.totalStaff$.next(null);
    this.postcode$.next(null);
    this.workplaceNotFound$.next(false);
    this.returnTo$.next(null);
    this.invalidPostcodeEntered$.next(null);
    this.manuallyEnteredWorkplaceName$.next(false);
    this.useDifferentLocationIdOrPostcode$.next(null);
  }
}
