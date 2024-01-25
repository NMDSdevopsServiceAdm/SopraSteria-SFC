import { Injectable } from '@angular/core';
import { LocationSearchResponse } from '@core/model/location.model';
import { LocationService } from '@core/services/location.service';
import { Observable, of } from 'rxjs';

@Injectable()
export class MockLocationService extends LocationService {
  public getLocationByPostcodeOrLocationID(postcodeOrLocationID: string): Observable<LocationSearchResponse> {
    if (postcodeOrLocationID === 'LS1 1AA') {
      return of({
        success: 1,
        locationdata: [
          {
            locationName: 'Hello Care',
            locationId: '1-2123313123',
            addressLine1: '123 Fake Ave',
            county: 'West Yorkshire',
            postalCode: 'LS1 1AA',
            townCity: 'Leeds',
          },
        ],
        searchmethod: 'postcode',
        message: 'Test',
      });
    } else {
      return of({
        success: 0,
        locationdata: [
          {
            locationName: 'Hello Care',
            locationId: '1-2123313123',
            addressLine1: '123 Fake Ave',
            county: 'West Yorkshire',
            postalCode: 'LS1 1AA',
            townCity: 'Leeds',
          },
          {
            locationName: 'Hello Care 2',
            locationId: '1-2123313124',
            addressLine1: '124 Fake Ave',
            county: 'West Yorkshire',
            postalCode: 'LS1 1AB',
            townCity: 'Leeds',
          },
        ],
        searchmethod: 'postcode',
        message: 'Test',
      });
    }
  }

  public getAddressesByPostCode(postcode: string): Observable<LocationSearchResponse> {
    if (postcode === 'LS1 1AA') {
      return of({
        success: 1,
        locationdata: [
          {
            locationName: 'Hello Care',
            locationId: '1-2123313123',
            addressLine1: '123 Fake Ave',
            county: 'West Yorkshire',
            postalCode: 'LS1 1AA',
            townCity: 'Leeds',
          },
        ],
        searchmethod: 'postcode',
        message: 'Test',
      });
    }
  }
}
