import { Injectable } from '@angular/core';
import dayjs from 'dayjs';
import { CookieService } from 'ngx-cookie-service';

type CookiePolicy = {
  essential: boolean;
  analytics: boolean;
};

enum Key {
  CookiesPolicy = 'cookies_policy',
  CookiesPreferencesSet = 'cookies_preferences_set',
}

@Injectable({
  providedIn: 'root',
})
export class CookiePolicyService {
  constructor(private cookieService: CookieService) {}

  public acceptAnalyticCookies() {
    this.setCookie(Key.CookiesPolicy, { essential: true, analytics: true });
    this.setCookie(Key.CookiesPreferencesSet, true);
  }

  public rejectAnalyticCookies() {
    this.setCookie(Key.CookiesPolicy, { essential: true, analytics: false });
    this.setCookie(Key.CookiesPreferencesSet, true);
  }

  public get analyticCookiesAccepted() {
    const cookiePolicy = this.getCookie(Key.CookiesPolicy) as CookiePolicy;
    return cookiePolicy?.analytics === true;
  }

  public get hasAnsweredCookiePreferences() {
    return this.getCookie(Key.CookiesPreferencesSet) === true;
  }

  private getCookie(key: string) {
    const value = this.cookieService.get(key);
    try {
      return JSON.parse(value);
    } catch {
      return null;
    }
  }

  private setCookie(key: string, value: string | boolean | object) {
    const valueAsString = typeof value === 'string' ? value : JSON.stringify(value);
    this.cookieService.set(key, valueAsString, {
      path: '/',
      secure: true,
      expires: dayjs(new Date()).add(1, 'year').toDate(),
    });
  }
}
