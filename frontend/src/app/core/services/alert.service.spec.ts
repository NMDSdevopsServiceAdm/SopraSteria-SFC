import { TestBed } from '@angular/core/testing';

import { AlertService } from './alert.service';
import { NavigationStart, Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { WindowRef } from './window.ref';

describe('AlertService', () => {
  let service: AlertService;
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [],
      providers: [AlertService, WindowRef, Router],
    });
    service = TestBed.inject(AlertService);
    router = TestBed.inject(Router);
  });

  it('should create the service', () => {
    expect(service).toBeTruthy();
  });

  it('should remove existing alert on page change', async () => {
    const removeAlertSpy = spyOn(service, 'removeAlert');

    const routerEvent$ = router.events as BehaviorSubject<any>;
    routerEvent$.next(new NavigationStart(1, '/test/mock/page/url'));

    expect(removeAlertSpy).toHaveBeenCalled();
  });
});
