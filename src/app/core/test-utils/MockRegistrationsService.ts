import { Injectable } from '@angular/core';
import { RegistrationsService } from '@core/services/registrations.service';
import * as moment from 'moment';
import { of } from 'rxjs';

@Injectable()
export class MockRegistrationsService extends RegistrationsService {
  public getSingleRegistration(): any {
    return of({
      created: moment.utc('01/01/2021').format('D/M/YYYY h:mma'),
      username: 'testuser',
      establishment: {
        id: 'abc',
        name: 'Test Workplace',
        isRegulated: true,
        nmdsId: '1234111',
        address: 'Address line 1',
        address2: 'Somewhere',
        address3: 'Third Line Place',
        postcode: 'ABC123',
        town: 'Nowhereville',
        county: 'Wessex',
        locationId: '1234',
        provid: '15111',
        mainService: 'Care services',
        parentId: '6311133333333',
        status: 'PENDING',
        uid: 'uidForAddedWorkplace',
      },
    });
  }
}
