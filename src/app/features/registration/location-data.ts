import { InMemoryDbService } from 'angular-in-memory-web-api';

import { Location } from './location';

export class LocationtData implements InMemoryDbService {

  createDb() {
    const locations: Location[] = [
      {
        "id": 1,
        "locationId": "1-1000210669",
        "locationName": "Kingswood House Nursing Home",
        "addressLine1": "21-23",
        "addressLine2": "Chapel Park Road",
        "townCity": "St Leonards On Sea",
        "county": "East Sussex",
        "postalCode": "TN37 6HR"
      },
      {
        "id": 2,
        "locationId": "1-1000270393",
        "locationName": "Red Kite Home Care",
        "addressLine1": "14",
        "addressLine2": "111 High Street",
        "townCity": "Slough",
        "county": "Berkshire",
        "postalCode": "SL1 7JZ"
      },
      {
        "id": 3,
        "locationId": "1-1000312641",
        "locationName": "Human Support Group Limited - Sale",
        "addressLine1": "59",
        "addressLine2": "Cross Street",
        "townCity": "Sale",
        "county": "Cheshire",
        "postalCode": "M33 7HF"
      },
      {
        "id": 4,
        "locationId": "1-1000401911",
        "locationName": "Little Haven",
        "addressLine1": "133",
        "addressLine2": "Wellmeadow Road",
        "townCity": "London",
        "county": "London",
        "postalCode": "SE6 1HP"
      },
      {
        "id": 5,
        "locationId": "1-1000587219",
        "locationName": "Highlands Borders Care Home",
        "addressLine1": "22 Salutary Mount",
        "addressLine2": "Heavitree",
        "townCity": "Exeter",
        "county": "Devon",
        "postalCode": "EX1 2QE"
      }
    ];
    return { locations };
  }
}
