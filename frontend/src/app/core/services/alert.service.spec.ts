import { TestBed } from '@angular/core/testing';

import { AlertService } from './alert.service';
import { provideRouter, Router, Routes } from '@angular/router';
import { WindowRef } from './window.ref';
import { Component } from '@angular/core';
import { Alert } from '@core/model/alert.model';

describe('AlertService', () => {
  let service: AlertService;
  let router: Router;

  const mockAlert: Alert = {
    type: 'success',
    message: 'mock alert',
  };

  @Component({
    template: '<p>mock component for test</p>',
  })
  class MockDummyComponent {}

  const mockedRoutes: Routes = [
    {
      path: '',
      component: MockDummyComponent,
    },
    {
      path: 'test-page',
      component: MockDummyComponent,
    },
    {
      path: 'test-page-2',
      component: MockDummyComponent,
    },
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [],
      providers: [AlertService, WindowRef, provideRouter(mockedRoutes)],
    });
    service = TestBed.inject(AlertService);
    router = TestBed.inject(Router);
  });

  afterEach(() => {
    service.removeAlert();
  });

  it('should create the service', () => {
    expect(service).toBeTruthy();
  });

  describe('remove alert on navigation', async () => {
    it('should remove an existing alert on page navigation', async () => {
      const removeAlertSpy = spyOn(service, 'removeAlert').and.callThrough();

      service.addAlert(mockAlert);
      expect(service.hasAlert).toEqual(true);
      expect(service.currentAlert).toEqual(mockAlert);

      await router.navigate(['/test-page']);

      expect(removeAlertSpy).toHaveBeenCalled();
      expect(service.hasAlert).toEqual(false);
    });

    const testCases = [
      { situation: 'when there is no alert before navigation', alreadyHaveAlert: false },
      { situation: 'when already have an alert before navigation', alreadyHaveAlert: true },
    ];

    testCases.forEach((testCase) => {
      const { situation, alreadyHaveAlert } = testCase;

      describe(situation, () => {
        const mockOldAlert: Alert = {
          type: 'warning',
          message: 'an old alert that is not closed yet',
        };

        beforeEach(() => {
          if (alreadyHaveAlert) {
            service.addAlert(mockOldAlert);
          }
        });

        it('should not remove an alert that is added right after router.navigate() call', async () => {
          const removeAlertSpy = spyOn(service, 'removeAlert').and.callThrough();

          const navigationPromise = router.navigate(['/test-page']);
          service.addAlert(mockAlert);

          await navigationPromise;

          expect(removeAlertSpy).not.toHaveBeenCalled();
          expect(service.hasAlert).toEqual(true);
          expect(service.currentAlert).toEqual(mockAlert);

          // navigate again. this time it should remove the alert.
          await router.navigate(['/test-page-2']);

          expect(removeAlertSpy).toHaveBeenCalled();
          expect(service.hasAlert).toEqual(false);
        });

        it('should not remove an alert that is added within navigate.then() block', async () => {
          const removeAlertSpy = spyOn(service, 'removeAlert').and.callThrough();

          await router.navigate(['/test-page']).then(() => {
            service.addAlert(mockAlert);
          });

          if (alreadyHaveAlert) {
            // in case of alreadyHaveAlert, it will remove the old alert but not the incoming one
            expect(removeAlertSpy).toHaveBeenCalledTimes(1);
          } else {
            expect(removeAlertSpy).not.toHaveBeenCalled();
          }

          expect(service.hasAlert).toEqual(true);
          expect(service.currentAlert).toEqual(mockAlert);

          // navigate again. this time it should remove the alert.
          await router.navigate(['/test-page-2']);

          expect(removeAlertSpy).toHaveBeenCalled();
          expect(service.hasAlert).toEqual(false);
        });
      });
    });
  });
});
