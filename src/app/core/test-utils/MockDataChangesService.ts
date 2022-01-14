import { Injectable } from '@angular/core';
import { DataChanges } from '@core/model/data-change.model';
import { DataChangeService } from '@core/services/data-change.service';

@Injectable()
export class MockDataChangeService extends DataChangeService {
  public static dataChangeFactory(): DataChanges {
    return {
      data: [
        {
          title: 'datachange',
          content: 'Test content',
          id: 1,
          last_updated: new Date(),
        },
      ],
    };
  }
  public static dataChangeLastUpdatedFactory() {
    return {
      data: [
        {
          dataChangesLastUpdate: new Date(),
        },
      ],
    };
  }
}
