import { TestBed } from '@angular/core/testing';

import { SortByService } from './sortBy.service';
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

    it('should call localStorage', () => {
      const localStorageSpy = spyOn(localStorage, 'removeItem');

      service.clearLocalStorageForSort();
      expect(localStorageSpy).toHaveBeenCalledTimes(4);
    });

    it('should return the values from localStorage', () => {
      const localStorageSpy = spyOn(localStorage, 'getItem');

      service.returnLocalStorageForSort();

      expect(localStorageSpy).toHaveBeenCalledTimes(4);
    });
  });
});
