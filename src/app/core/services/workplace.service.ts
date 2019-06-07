import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ServiceGroup } from '@core/model/workplace.model';
import { HttpClient } from '@angular/common/http';
import { LocationAddress } from '@core/model/location.model';

@Injectable({
  providedIn: 'root'
})
export class WorkplaceService {

  constructor(private http: HttpClient) {}

  public isRegulated(location: LocationAddress): boolean {
    return location.isRegulated === true || location.locationId ? true : false;
  }

  public getServicesByCategory(isRegulated: boolean): Observable<Array<ServiceGroup>> {
    return this.http.get<Array<ServiceGroup>>(`/api/services/byCategory?cqc=${isRegulated}`);
  }
}
