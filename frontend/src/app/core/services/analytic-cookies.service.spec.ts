import { BehaviorSubject } from 'rxjs';

import { DOCUMENT } from '@angular/common';
import { HttpClient, provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Roles } from '@core/model/roles.enum';
import { MockEstablishmentServiceWithOverrides } from '@core/test-utils/MockEstablishmentService';
import { MockUserService } from '@core/test-utils/MockUserService';

import { Establishment } from '../../../mockdata/establishment.js';
import { AnalyticCookiesService } from './analytic-cookies.service';
import { EstablishmentService } from './establishment.service';
import { UserService } from './user.service';
import { WindowToken } from './window';

describe('AnalyticCookiesService', async () => {
  let mockEstablishmentObservable = new BehaviorSubject(null);
  let mockLoggedInUserObservable = new BehaviorSubject(null);

  const mockEstablishment = { ...Establishment, isParent: false, parentUid: undefined };

  const setup = async (overrides: any = {}) => {
    const establishment = overrides?.establishment ?? mockEstablishment;
    const userRole = overrides?.userRole ?? 'Edit';

    TestBed.configureTestingModule({
      providers: [
        { provide: WindowToken, useValue: {} },
        {
          provide: UserService,
          useFactory: MockUserService.factory(1, Roles.Edit),
          deps: [HttpClient],
        },
        {
          provide: EstablishmentService,
          useFactory: MockEstablishmentServiceWithOverrides.factory(),
        },
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    const service = TestBed.inject(AnalyticCookiesService);

    const establishmentService = TestBed.inject(EstablishmentService);
    mockEstablishmentObservable = new BehaviorSubject(establishment);
    spyOnProperty(establishmentService, 'establishmentObservable$').and.returnValue(mockEstablishmentObservable);

    const userService = TestBed.inject(UserService);
    mockLoggedInUserObservable = new BehaviorSubject({ role: userRole });
    spyOnProperty(userService, 'loggedInUser$').and.returnValue(mockLoggedInUserObservable);

    const document = TestBed.inject(DOCUMENT);
    document.head.innerHTML = ''; // reset document object

    const window = TestBed.inject(WindowToken) as Window;

    return { service, window, document };
  };

  it('should be created', async () => {
    const { service } = await setup();
    expect(service).toBeTruthy();
  });

  describe('startGoogleAnalyticsTracking', async () => {
    it('should inject a script tag for Google Tag Manager to <head>', async () => {
      const { service, document } = await setup();
      service.startGoogleAnalyticsTracking();

      const scriptTag = document.head.querySelector('script');

      expect(scriptTag).toBeTruthy();
      expect(scriptTag.type).toEqual('text/javascript');
    });

    it('should not inject the script tag twice if it is already there', async () => {
      const { service, document } = await setup();
      service.startGoogleAnalyticsTracking();
      service.startGoogleAnalyticsTracking();

      const allScriptTags = document.head.querySelectorAll('script');
      expect(allScriptTags.length).toEqual(1);
    });

    it('should push a gtm start event to window.dataLayer', async () => {
      const { service, window } = await setup();
      service.startGoogleAnalyticsTracking();

      expect(window.dataLayer).toContain({ 'gtm.start': jasmine.any(Number), event: 'gtm.js' });
    });

    describe('Pushing userType to dataLayer', async () => {
      it('should push the userType to dataLayer if user accepted analytic cookie', async () => {
        const { service, window } = await setup();

        service.startGoogleAnalyticsTracking();

        expect(window.dataLayer).toContain({ userType: 'Standalone' });
      });

      it('should not push the userType to dataLayer if user has not accepted analytic cookie', async () => {
        const { window } = await setup();

        expect(window.dataLayer).not.toContain({ userType: 'Standalone' });
      });

      const normalUserRoles = [Roles.Edit, Roles.Read];

      normalUserRoles.forEach((userRole) => {
        describe(`when user role is ${userRole}`, async () => {
          it('should push userType: "Parent" if isParent is true', async () => {
            const { service, window } = await setup({
              establishment: { ...mockEstablishment, isParent: true },
              userRole,
            });

            service.startGoogleAnalyticsTracking();

            expect(window.dataLayer).toContain({ userType: 'Parent' });
          });

          it('should push userType: "Sub" if there is a parentUid', async () => {
            const { service, window } = await setup({
              establishment: { ...mockEstablishment, parentUid: 'mock-uuid' },
              userRole,
            });

            service.startGoogleAnalyticsTracking();

            expect(window.dataLayer).toContain({ userType: 'Sub' });
          });

          it('should push userType: "Standalone" if neither case apply', async () => {
            const { service, window } = await setup({
              establishment: { mockEstablishment, isParent: false, parentUid: undefined },
              userRole,
            });

            service.startGoogleAnalyticsTracking();

            expect(window.dataLayer).toContain({ userType: 'Standalone' });
          });
        });
      });

      it('should not push userType Sub if user of Parent workplace view a Subsidiary workplace', async () => {
        const { service, window } = await setup({ establishment: { ...mockEstablishment, isParent: true } });

        service.startGoogleAnalyticsTracking();
        expect(window.dataLayer.length).toBe(2);
        expect(window.dataLayer.at(1)).toEqual({ userType: 'Parent' });

        mockEstablishmentObservable.next({ ...mockEstablishment, isParent: false, parentUid: 'mock-uid' });

        expect(window.dataLayer.length).toBe(2);
        expect(window.dataLayer).not.toContain({ userType: 'Sub' });
      });

      it('should push an updated userType if user logout and login again with another account', async () => {
        const { service, window } = await setup();

        service.startGoogleAnalyticsTracking();
        expect(window.dataLayer.length).toBe(2);
        expect(window.dataLayer.at(1)).toEqual({ userType: 'Standalone' });

        // emulate logout and login again with a Parent account
        mockEstablishmentObservable.next(null);
        mockLoggedInUserObservable.next(null);
        mockEstablishmentObservable.next({ ...mockEstablishment, isParent: true });
        mockLoggedInUserObservable.next({ role: 'Edit' });

        expect(window.dataLayer.length).toBe(3);
        expect(window.dataLayer.at(2)).toEqual({ userType: 'Parent' });
      });

      const adminUserRoles = [Roles.Admin, Roles.AdminManager];
      adminUserRoles.forEach((adminRole) => {
        describe(`when user role is ${adminRole}`, async () => {
          it('should push userType: "Admin"', async () => {
            const { service, window } = await setup({
              establishment: { mockEstablishment, isParent: false, parentUid: undefined },
              userRole: adminRole,
            });

            service.startGoogleAnalyticsTracking();

            expect(window.dataLayer).toContain({ userType: 'Admin' });
          });

          it('should push userType: "Admin" even if isParent is true', async () => {
            const { service, window } = await setup({
              establishment: { ...mockEstablishment, isParent: true },
              userRole: adminRole,
            });
            service.startGoogleAnalyticsTracking();

            expect(window.dataLayer).toContain({ userType: 'Admin' });
          });

          it('should push userType: "Admin" even if there is parentUid', async () => {
            const { service, window } = await setup({
              establishment: { ...mockEstablishment, parentUid: 'mock-uuid' },
              userRole: adminRole,
            });

            service.startGoogleAnalyticsTracking();

            expect(window.dataLayer).toContain({ userType: 'Admin' });
          });
        });
      });
    });
  });
});
