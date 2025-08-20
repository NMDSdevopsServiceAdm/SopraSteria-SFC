import { TestBed } from '@angular/core/testing';

import { SortByService } from './sort-by.service';
import { NavigationStart, Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { TabsService } from './tabs.service';

describe('SortByService', () => {
  let service: SortByService;
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [],
      providers: [SortByService, Router, TabsService],
    });
    service = TestBed.inject(SortByService);
    router = TestBed.inject(Router);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('clearLocalStorage', () => {
    it('should not be called when the url includes "staff-record"', () => {
      const clearLocalStorageSpy = spyOn(service, 'clearLocalStorageForSort');

      const routerEvent$ = router.events as BehaviorSubject<any>;
      routerEvent$.next(new NavigationStart(2, '/workplace/staff-uid/staff-record/url'));

      expect(clearLocalStorageSpy).not.toHaveBeenCalled();
    });

    it('should be called when the url does not include "staff-record"', () => {
      const clearLocalStorageSpy = spyOn(service, 'clearLocalStorageForSort');

      const routerEvent$ = router.events as BehaviorSubject<any>;
      routerEvent$.next(new NavigationStart(2, '/workplace/uid/url'));

      expect(clearLocalStorageSpy).toHaveBeenCalled();
    });

    it('should remove localStorage when clearLocalStorageForSort is called', () => {
      const localStorageRemoveItemSpy = spyOn(localStorage, 'removeItem');
      const expectedKeys = ['staffSummarySortValue', 'staffSummarySearchTerm', 'staffSummaryIndex'];

      service.clearLocalStorageForSort();

      expect(localStorageRemoveItemSpy).toHaveBeenCalledTimes(expectedKeys.length);
      expectedKeys.forEach((key) => {
        expect(localStorageRemoveItemSpy).toHaveBeenCalledWith(key);
      });
    });

    it('should return the values from localStorage', () => {
      const localStorageGetItemSpy = spyOn(localStorage, 'getItem');
      const expectedKeys = ['staffSummarySortValue', 'staffSummarySearchTerm', 'staffSummaryIndex'];

      service.returnLocalStorageForSort();

      expect(localStorageGetItemSpy).toHaveBeenCalledTimes(expectedKeys.length);
      expectedKeys.forEach((key) => {
        expect(localStorageGetItemSpy).toHaveBeenCalledWith(key);
      });
    });
  });
});
