import { Injectable } from '@angular/core';
import { LocationAddress } from '@core/model/location.model';
import { Service } from '@core/model/services.model';
import { URLStructure } from '@core/model/url.model';
import { BehaviorSubject } from 'rxjs';

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
  public postcode$: BehaviorSubject<string> = new BehaviorSubject(null);
  public workplaceNotFound$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  public returnTo$: BehaviorSubject<URLStructure> = new BehaviorSubject<URLStructure>(null);
  public invalidPostcodeEntered$: BehaviorSubject<string> = new BehaviorSubject(null);
  public manuallyEnteredWorkplaceName$: BehaviorSubject<boolean> = new BehaviorSubject(false);

  public isRegulated(): boolean {
    return this.isRegulated$.value;
  }

  public setReturnTo(returnTo: URLStructure): void {
    this.returnTo$.next(returnTo);
  }
}
