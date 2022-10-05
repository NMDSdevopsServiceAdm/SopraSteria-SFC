import { Injectable } from '@angular/core';
import { EthnicityResponse } from '@core/model/ethnicity.model';
import { EthnicityService } from '@core/services/ethnicity.service';
import { Observable, of } from 'rxjs';

@Injectable()
export class MockEthnicityService extends EthnicityService {
  public getEthnicities(): Observable<EthnicityResponse> {
    return of({
      list: [
        { id: 1, ethnicity: 'white ethnicity 1', group: 'White' },
        { id: 2, ethnicity: 'white ethnicity 2', group: 'White' },
        { id: 3, ethnicity: 'Mixed / multiple ethnic groups 3', group: 'Mixed' },
        { id: 4, ethnicity: 'Mixed / multiple ethnic groups 4', group: 'Mixed' },
        { id: 5, ethnicity: 'Asian / Asian British 5', group: 'Asian' },
        { id: 6, ethnicity: 'Asian / Asian British 6', group: 'Asian' },
        {
          id: 7,
          ethnicity: 'Black / African / Caribbean / Black British 7',
          group: 'Black',
        },
        {
          id: 8,
          ethnicity: 'Black / African / Caribbean / Black British 8',
          group: 'Black',
        },
        { id: 9, ethnicity: 'Other ethnic group 9', group: 'Other' },
        { id: 10, ethnicity: 'Other ethnic group 10', group: 'Other' },
      ],
      byGroup: {
        White: [
          { id: 1, ethnicity: 'white ethnicity 1' },
          { id: 2, ethnicity: 'white ethnicity 2' },
        ],
        'Mixed / multiple ethnic groups': [
          { id: 3, ethnicity: 'Mixed / multiple ethnic groups 3' },
          { id: 4, ethnicity: 'Mixed / multiple ethnic groups 4' },
        ],
        'Asian / Asian British': [
          { id: 5, ethnicity: 'Asian / Asian British 5' },
          { id: 6, ethnicity: 'Asian / Asian British 6' },
        ],
        'Black / African / Caribbean / Black British': [
          {
            id: 7,
            ethnicity: 'Black / African / Caribbean / Black British 7',
          },
          {
            id: 8,
            ethnicity: 'Black / African / Caribbean / Black British 8',
          },
        ],
        'Other ethnic group': [
          { id: 9, ethnicity: 'Other ethnic group 9' },
          { id: 10, ethnicity: 'Other ethnic group 10' },
        ],
      },
    });
  }
}
