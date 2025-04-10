import { TestBed } from '@angular/core/testing';

import { AlertService } from './alert.service';
import { NavigationEnd, Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { WindowRef } from './window.ref';

describe('BackLinkService', () => {
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
    routerEvent$.next(new NavigationEnd(1, '/test/mock/page/url', '/test/mock/page/url'));

    expect(removeAlertSpy).toHaveBeenCalled();
  });
});
