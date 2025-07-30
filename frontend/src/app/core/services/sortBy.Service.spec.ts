import { TestBed } from '@angular/core/testing';

import { SortByService } from './sortBy.service';
import { NavigationStart, Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { TabsService } from './tabs.service';
import { MockTabsService } from '@core/test-utils/MockTabsService';

describe('SortByService', () => {
  let service: SortByService;
  let router: Router;
  let tab: string;

  const setUpTab = (selectedTab: string) => {
    tab = selectedTab;
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [],
      providers: [
        SortByService,
        Router,
        {
          provide: TabsService,
          useFactory: MockTabsService.factory(tab),
        },
      ],
    });
    service = TestBed.inject(SortByService);
    router = TestBed.inject(Router);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('clearLocalStorage', () => {
    it('should not be called when the url includes "staff-record"', () => {
      const clearLocalStorageSpy = spyOn(service, 'clearLocalStorage');

      const routerEvent$ = router.events as BehaviorSubject<any>;
      routerEvent$.next(new NavigationStart(2, '/workplace/staff-uid/staff-record/url'));

      expect(clearLocalStorageSpy).not.toHaveBeenCalled();
    });

    it('should be called when the url does not include "staff-record"', () => {
      const clearLocalStorageSpy = spyOn(service, 'clearLocalStorage');

      const routerEvent$ = router.events as BehaviorSubject<any>;
      routerEvent$.next(new NavigationStart(2, '/workplace/uid/url'));

      expect(clearLocalStorageSpy).toHaveBeenCalled();
    });

    it('should not be called when the tab selected is "staff-records"', () => {
      const selectedTab = "staff-records"
      setUpTab(selectedTab)

      const clearLocalStorageSpy = spyOn(service, 'clearLocalStorage');

      const routerEvent$ = router.events as BehaviorSubject<any>;
      routerEvent$.next(new NavigationStart(2, `dashboard#${selectedTab}`));

      expect(clearLocalStorageSpy).not.toHaveBeenCalled();
    });

    it('should be called when the url is not "staff-records"', () => {
      const selectedTab = "workplace"
      setUpTab(selectedTab)

      const clearLocalStorageSpy = spyOn(service, 'clearLocalStorage');

      const routerEvent$ = router.events as BehaviorSubject<any>;
      routerEvent$.next(new NavigationStart(1, `dashboard#${selectedTab}`));

      expect(clearLocalStorageSpy).toHaveBeenCalled();
    });

    it('should call localStorage', () => {
      const localStorageSpy = spyOn(localStorage, 'removeItem');

      service.clearLocalStorage();
      expect(localStorageSpy).toHaveBeenCalledTimes(4);
    });
  });

  it('should set _totalWorkerCount', () => {
    const workerCount = 14;
    service.setInitialTotalWorkerCount(workerCount);

    expect(service.getInitialTotalWorkerCount()).toEqual(workerCount);
  });
});
