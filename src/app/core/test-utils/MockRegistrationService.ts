import { Injectable } from '@angular/core';
import { LocationAddress } from '@core/model/location.model';
import { RegistrationService } from '@core/services/registration.service';
import { BehaviorSubject, Observable, of } from 'rxjs';

@Injectable()
export class MockRegistrationService extends RegistrationService {
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

  public getUsernameDuplicate(username: string): Observable<any> {
    return of({ status: username === 'duplicate' ? '1' : '0' });
  }
}
