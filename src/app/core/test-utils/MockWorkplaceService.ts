import { Injectable } from '@angular/core';
import { LocationAddress } from '@core/model/location.model';
import { Service, ServiceGroup } from '@core/model/services.model';
import { WorkplaceService } from '@core/services/workplace.service';
import { BehaviorSubject, Observable, of } from 'rxjs';

@Injectable()
export class MockWorkplaceService extends WorkplaceService {
  public locationAddresses$: BehaviorSubject<Array<LocationAddress>> = new BehaviorSubject([
    {
      postalCode: 'ABC 123',
      addressLine1: '1 Street',
      county: 'Greater Manchester',
      locationName: 'Name',
      townCity: 'Manchester',
      locationId: '123',
    },
    {
      postalCode: 'ABC 123',
      addressLine1: '2 Street',
      county: 'Greater Manchester',
      locationName: 'Test Care Home',
      townCity: 'Manchester',
      locationId: '12345',
    },
  ]);

  public selectedLocationAddress$: BehaviorSubject<LocationAddress> = new BehaviorSubject({
    postalCode: 'ABC 123',
    addressLine1: '1 Street',
    addressLine2: 'Second Line',
    addressLine3: 'Third Line',
    county: 'Greater Manchester',
    locationName: 'Test Care Home',
    townCity: 'Manchester',
    locationId: '123',
  });

  public getServicesByCategory(isRegulated: boolean): Observable<Array<ServiceGroup>> {
    return of([
      {
        category: 'Category 1',
        services: [
          {
            id: 1,
            isCQC: true,
            name: 'Name',
          },
        ],
      },
    ]);
  }
}

@Injectable()
export class MockWorkplaceServiceWithMainService extends MockWorkplaceService {
  public selectedWorkplaceService$: BehaviorSubject<Service> = new BehaviorSubject({
    id: 1,
    name: 'Shared lives',
    isCqc: true,
  });
}
