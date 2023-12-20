import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { EmployerType } from '@core/model/establishment.model';
import { LocationAddress } from '@core/model/location.model';
import { LoginCredentials } from '@core/model/login-credentials.model';
import { EstablishmentExistsResponse } from '@core/model/registration.model';
import { SecurityDetails } from '@core/model/security-details.model';
import { Service } from '@core/model/services.model';
import { RegistrationService } from '@core/services/registration.service';
import { BehaviorSubject, Observable, of } from 'rxjs';

const lessThanFiveLocationAddresses = [
  {
    postalCode: 'ABC 123',
    addressLine1: '1 Street',
    addressLine2: 'Second Line',
    addressLine3: 'Third Line',
    county: 'Greater Manchester',
    locationName: 'Workplace Name',
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
];

const moreThanFourLocationAddresses = [
  {
    postalCode: 'ABC 123',
    addressLine1: '1 Street',
    addressLine2: 'Second Line',
    addressLine3: 'Third Line',
    county: 'Greater Manchester',
    locationName: 'Workplace Name',
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
  {
    postalCode: 'ABC 123',
    addressLine1: '3 Street',
    county: 'Greater Manchester',
    locationName: 'Test Care Home 2',
    townCity: 'Manchester',
    locationId: '7809',
  },
  {
    postalCode: 'ABC 123',
    addressLine1: '4 Street',
    county: 'Greater Manchester',
    locationName: 'Test Care Home 3',
    townCity: 'Manchester',
    locationId: '1098',
  },
  {
    postalCode: 'ABC 123',
    addressLine1: '5 Street',
    county: 'Greater Manchester',
    locationName: 'Test Care Home 4',
    townCity: 'Manchester',
    locationId: '7394',
  },
];

@Injectable()
export class MockRegistrationService extends RegistrationService {
  public loginCredentials$: BehaviorSubject<LoginCredentials> = new BehaviorSubject({
    username: 'testUser',
    password: '',
  });
  public securityDetails$: BehaviorSubject<SecurityDetails> = new BehaviorSubject({
    securityQuestion: 'What is your favourite colour?',
    securityQuestionAnswer: 'Blue',
  });

  public selectedWorkplaceService$: BehaviorSubject<Service> = new BehaviorSubject(null);
  public locationAddresses$: BehaviorSubject<Array<LocationAddress>> = new BehaviorSubject(
    lessThanFiveLocationAddresses,
  );

  public selectedLocationAddress$: BehaviorSubject<LocationAddress> = new BehaviorSubject({
    postalCode: 'ABC 123',
    addressLine1: '1 Street',
    addressLine2: 'Second Line',
    addressLine3: 'Third Line',
    county: 'Greater Manchester',
    locationName: 'Workplace Name',
    townCity: 'Manchester',
    locationId: '123',
  });

  public invalidPostcodeEntered$: BehaviorSubject<string> = new BehaviorSubject('ABC 123');
  public postcodeOrLocationId$: BehaviorSubject<string> = new BehaviorSubject(null);
  public totalStaff$: BehaviorSubject<any> = new BehaviorSubject(null);
  public typeOfEmployer$: BehaviorSubject<EmployerType> = new BehaviorSubject(null);

  public static factory(typeOfEmployer: EmployerType = { value: 'Private Sector' }, manyLocationAddresses = false) {
    return (http: HttpClient) => {
      const service = new MockRegistrationService(http);
      service.typeOfEmployer$.next(typeOfEmployer);
      manyLocationAddresses && service.locationAddresses$.next(moreThanFourLocationAddresses);
      return service;
    };
  }

  public getUsernameDuplicate(username: string): Observable<any> {
    return of({ status: username === 'duplicate' ? '1' : '0' });
  }

  public checkIfEstablishmentExists(locationId: string): Observable<EstablishmentExistsResponse> {
    return of({ exists: false });
  }
}

@Injectable()
export class MockRegistrationServiceWithMainService extends MockRegistrationService {
  public loginCredentials$: BehaviorSubject<LoginCredentials> = new BehaviorSubject({
    username: 'testUser',
    password: 'Passw0rd',
  });

  public selectedWorkplaceService$: BehaviorSubject<Service> = new BehaviorSubject({
    id: 123,
    isCQC: true,
    name: 'Name of service',
    other: true,
    otherName: 'Hello!',
  });

  public totalStaff$: BehaviorSubject<any> = new BehaviorSubject('4');

  public static factory(typeOfEmployer: EmployerType = { value: 'Private Sector' }) {
    return (http: HttpClient) => {
      const service = new MockRegistrationServiceWithMainService(http);
      service.typeOfEmployer$.next(typeOfEmployer);
      return service;
    };
  }
}
