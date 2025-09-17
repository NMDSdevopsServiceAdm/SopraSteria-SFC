import { Injectable } from '@angular/core';
import { CookiePolicyService } from '@core/services/cookie-policy.service';
import { CookieService } from 'ngx-cookie-service';

type FactoryOverrides = {
  hasAnsweredCookiePreferences?: boolean;
  analyticCookiesAccepted?: boolean;
};

@Injectable()
export class MockCookiePolicyService extends CookiePolicyService {
  private _hasAnsweredCookiePreferences: boolean;
  private _analyticCookiesAccepted: boolean;

  public acceptAnalyticCookies() {
    this._hasAnsweredCookiePreferences = true;
    this._analyticCookiesAccepted = true;
  }

  public rejectAnalyticCookies() {
    this._hasAnsweredCookiePreferences = true;
    this._analyticCookiesAccepted = false;
  }

  public get analyticCookiesAccepted() {
    return this._analyticCookiesAccepted === true;
  }

  public get hasAnsweredCookiePreferences() {
    return this._hasAnsweredCookiePreferences === true;
  }

  public static factory(overrides: FactoryOverrides = {}) {
    return (cookieService: CookieService) => {
      const service = new MockCookiePolicyService(cookieService);

      if (overrides.hasAnsweredCookiePreferences) {
        service._hasAnsweredCookiePreferences = true;
      }

      if (overrides.analyticCookiesAccepted) {
        service._analyticCookiesAccepted = true;
      }

      return service;
    };
  }
}
