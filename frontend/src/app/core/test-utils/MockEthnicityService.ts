import { Injectable } from '@angular/core';
import { EthnicityResponse } from '@core/model/ethnicity.model';
import { EthnicityService } from '@core/services/ethnicity.service';
import { Observable, of } from 'rxjs';

@Injectable()
export class MockEthnicityService extends EthnicityService {
  public getEthnicities(): Observable<EthnicityResponse> {
    return of({
      list: [
        { id: 1, ethnicity: 'English, Welsh, Scottish, Northen Irish or British', group: 'White' },
        { id: 2, ethnicity: 'white ethnicity 2', group: 'White' },
        { id: 3, ethnicity: 'Mixed / multiple ethnic groups 3', group: 'Mixed' },
        { id: 4, ethnicity: 'Mixed / multiple ethnic groups 4', group: 'Mixed' },
        { id: 5, ethnicity: 'Mixed / multiple ethnic groups 5', group: 'Mixed' },
        { id: 6, ethnicity: 'Any other Mixed or Multiple ethnic background', group: 'Mixed' },
        { id: 7, ethnicity: 'Asian / Asian British 7', group: 'Asian' },
        { id: 8, ethnicity: 'Asian / Asian British 8', group: 'Asian' },
        {
          id: 9,
          ethnicity: 'Black / African / Caribbean / Black British 9',
          group: 'Black',
        },
        {
          id: 10,
          ethnicity: 'Black / African / Caribbean / Black British 10',
          group: 'Black',
        },
        {
          id: 11,
          ethnicity: 'Any other Black, African or Caribbean background',
          group: 'Black',
        },
        { id: 12, ethnicity: 'Other ethnic group 12', group: 'Other' },
        { id: 13, ethnicity: 'Other ethnic group 13', group: 'Other' },
      ],
      byGroup: {
        White: [
          { id: 1, ethnicity: 'English, Welsh, Scottish, Northen Irish or British' },
          { id: 2, ethnicity: 'white ethnicity 2' },
        ],
        'Mixed / multiple ethnic groups': [
          { id: 3, ethnicity: 'Mixed / multiple ethnic groups 3' },
          { id: 4, ethnicity: 'Mixed / multiple ethnic groups 4' },
          { id: 5, ethnicity: 'Mixed / multiple ethnic groups 5' },
          { id: 6, ethnicity: 'Any other Mixed or Multiple ethnic background' },
        ],
        'Asian / Asian British': [
          { id: 7, ethnicity: 'Asian / Asian British 7' },
          { id: 8, ethnicity: 'Asian / Asian British 8' },
        ],
        'Black / African / Caribbean / Black British': [
          {
            id: 9,
            ethnicity: 'Black / African / Caribbean / Black British 9',
          },
          {
            id: 10,
            ethnicity: 'Black / African / Caribbean / Black British 10',
          },
          {
            id: 11,
            ethnicity: 'Any other Black, African or Caribbean background',
            group: 'Black',
          },
        ],
        'Other ethnic group': [
          { id: 12, ethnicity: 'Other ethnic group 12' },
          { id: 13, ethnicity: 'Other ethnic group 13' },
        ],
      },
    });
  }
}
