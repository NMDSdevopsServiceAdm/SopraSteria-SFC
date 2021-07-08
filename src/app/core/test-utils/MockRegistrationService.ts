import { Injectable } from '@angular/core';
import { LocationAddress } from '@core/model/location.model';
import { RegistrationService } from '@core/services/registration.service';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class MockRegistrationService extends RegistrationService {
  public locationAddresses$: BehaviorSubject<Array<LocationAddress>> = new BehaviorSubject([
    {
      postalCode: 'ABC 123',
      addressLine1: '1 Street',
      county: 'Greater Manchester',
      locationName: 'Name',
      townCity: 'Manchester',
    },
  ]);
}
