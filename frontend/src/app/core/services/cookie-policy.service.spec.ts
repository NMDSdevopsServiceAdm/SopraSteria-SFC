import { TestBed } from '@angular/core/testing';

import { CookiePolicyService } from './cookie-policy.service';
import { CookieService } from 'ngx-cookie-service';

fdescribe('CookiePolicyService', () => {
  let service: CookiePolicyService;
  let cookieService: CookieService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CookiePolicyService);
    cookieService = TestBed.inject(CookieService);

    cookieService.deleteAll();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('acceptAnalyticCookies', () => {
    it('should set "analytics": true in cookies_policy', () => {
      service.acceptAnalyticCookies();

      const cookiePolicyObject = JSON.parse(cookieService.get('cookies_policy'));
      expect(cookiePolicyObject.analytics).toEqual(true);
    });

    it('should set "cookies_preferences_set" to true', () => {
      service.acceptAnalyticCookies();
      expect(cookieService.get('cookies_preferences_set')).toEqual('true');
    });
  });

  describe('rejectAnalyticCookies', () => {
    it('should set "analytics": false in cookies_policy', () => {
      service.rejectAnalyticCookies();

      const cookiePolicyObject = JSON.parse(cookieService.get('cookies_policy'));
      expect(cookiePolicyObject.analytics).toEqual(false);
    });

    it('should set "cookies_preferences_set" to true', () => {
      service.rejectAnalyticCookies();
      expect(cookieService.get('cookies_preferences_set')).toEqual('true');
    });
  });

  describe('analyticCookiesAccepted', () => {
    it('should return true if user accepted analyticCookies', () => {
      service.acceptAnalyticCookies();

      expect(service.analyticCookiesAccepted).toEqual(true);
    });

    it('should return false if user rejected analyticCookies', () => {
      service.rejectAnalyticCookies();

      expect(service.analyticCookiesAccepted).toEqual(false);
    });

    it('should return false if user has not set their preference yet', () => {
      expect(service.analyticCookiesAccepted).toEqual(false);
    });
  });

  describe('hasAnsweredCookiePreferences', () => {
    it('should return true when user accepted analyticCookies', () => {
      service.acceptAnalyticCookies();

      expect(service.hasAnsweredCookiePreferences).toEqual(true);
    });

    it('should return true when user rejected analyticCookies', () => {
      service.rejectAnalyticCookies();

      expect(service.hasAnsweredCookiePreferences).toEqual(true);
    });

    it('should return false when user has not set their preference yet', () => {
      expect(service.hasAnsweredCookiePreferences).toEqual(false);
    });
  });
});
