import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { SortByService } from '@core/services/sort-by.service';
import { TabsService } from '@core/services/tabs.service';

@Injectable()
export class MockSortByService extends SortByService {
  public useLocalStorageValuesForSort = false;
  public localStorageValuesForSort = {
    staffSummarySortValue: null,
    staffSummarySearchTerm: null,
    staffSummaryIndex: null,
    isSearchMaintained: null,
  };

  public static factory(overrides: any = {}) {
    return (router: Router, tabsService: TabsService) => {
      const service = new MockSortByService(router, tabsService);

      if (overrides?.localStorageValuesForSort) {
        service.localStorageValuesForSort = overrides.localStorageValuesForSort;
      }

      return service;
    };
  }

  public returnLocalStorageForSort() {
    return this.localStorageValuesForSort;
  }
}
