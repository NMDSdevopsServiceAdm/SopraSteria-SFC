import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { LocationAddress } from '@core/model/location.model';
import { Service, ServiceGroup } from '@core/model/services.model';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class WorkplaceService {
  constructor(private http: HttpClient) {}
  public addWorkplaceComplete$: BehaviorSubject<boolean> = new BehaviorSubject(null);
  public locationAddresses$: BehaviorSubject<Array<LocationAddress>> = new BehaviorSubject(null);
  public selectedLocationAddress$: BehaviorSubject<LocationAddress> = new BehaviorSubject(null);
  public selectedWorkplaceService$: BehaviorSubject<Service> = new BehaviorSubject(null);

  public isRegulated(location: LocationAddress): boolean {
    return location.isRegulated === true || location.locationId ? true : false;
  }

  public getServicesByCategory(isRegulated: boolean): Observable<Array<ServiceGroup>> {
    return this.http.get<Array<ServiceGroup>>(`/api/services/byCategory?cqc=${isRegulated}`);
  }
}
