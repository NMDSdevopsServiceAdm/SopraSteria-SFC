import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { SortByService } from '@core/services/sortBy.service';
import { TabsService } from '@core/services/tabs.service';

@Injectable()
export class MockSortByService extends SortByService {
  public useLocalStorageValuesForSort = false;

  public static factory(overrides: any = {}) {
    return (router: Router, tabsService: TabsService) => {
      const service = new MockSortByService(router, tabsService);
      service.useLocalStorageValuesForSort = overrides?.useLocalStorageValuesForSort;
      return service;
    };
  }

  public returnLocalStorageForSort() {
    return this.useLocalStorageValuesForSort
      ? {
          staffSummarySortValue: 'lastUpdateNewest',
          staffSummarySearchTerm: 'Ma',
          staffSummaryIndex: '0',
        }
      : {
          staffSummarySortValue: null,
          staffSummarySearchTerm: null,
          staffSummaryIndex: null,
        };
  }
}
