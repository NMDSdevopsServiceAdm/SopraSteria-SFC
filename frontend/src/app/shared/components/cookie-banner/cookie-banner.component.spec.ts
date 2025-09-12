import { BehaviorSubject } from 'rxjs';

import { getTestBed } from '@angular/core/testing';
import { ActivatedRoute, NavigationEnd, Router, RouterModule } from '@angular/router';
import { AnalyticCookiesService } from '@core/services/analytic-cookies.service';
import { CookiePolicyService } from '@core/services/cookie-policy.service';
import { WindowToken } from '@core/services/window';
import { MockCookiePolicyService } from '@core/test-utils/MockCookiePolicyService';
import { render } from '@testing-library/angular';

import { CookieBannerComponent } from './cookie-banner.component';

describe('CookieBannerComponent', () => {
  const setup = async (overrides: any = {}) => {
    const analyticCookiesServiceSpy = jasmine.createSpy();

    const setupTools = await render(CookieBannerComponent, {
      imports: [RouterModule],
      declarations: [],
      providers: [
        {
          provide: CookiePolicyService,
          useFactory: MockCookiePolicyService.factory(overrides),
        },
        {
          provide: ActivatedRoute,
          useValue: {},
        },
        {
          provide: AnalyticCookiesService,
          useValue: { startGoogleAnalyticsTracking: analyticCookiesServiceSpy },
        },
        { provide: WindowToken, useValue: {} },
      ],
    });

    const component = setupTools.fixture.componentInstance;
    const injector = getTestBed();
    const cookiePolicyService = injector.inject(CookiePolicyService);
    const router = injector.inject(Router);

    return { ...setupTools, component, cookiePolicyService, router, analyticCookiesServiceSpy };
  };

  it('should create', async () => {
    const component = await setup();
    expect(component).toBeTruthy();
  });

  it('should not show up when user already answered their cookie preferences', async () => {
    const { queryByTestId } = await setup({ hasAnsweredCookiePreferences: true });

    expect(queryByTestId('cookie-banner')).toBeFalsy();
  });

  it('should show up when user has not answer their cookie preferences', async () => {
    const { queryByTestId } = await setup();

    expect(queryByTestId('cookie-banner')).toBeTruthy();
  });

  it('should show a heading', async () => {
    const { getByRole } = await setup();

    const expectedHeadingText = 'Cookies on the Adult Social Care Workforce Data Set';

    const heading = getByRole('heading', { level: 2 });
    expect(heading).toBeTruthy();
    expect(heading.textContent).toContain(expectedHeadingText);
  });

  it('should show a CTA button for accept and a button for reject', async () => {
    const { getByRole } = await setup();

    const acceptButton = getByRole('button', { name: 'Accept analytics cookies' });
    const rejectButton = getByRole('button', { name: 'Reject analytics cookies' });

    expect(acceptButton).toBeTruthy();
    expect(rejectButton).toBeTruthy();
  });

  it('should show a link to the cookie policy page', async () => {
    const { getByText } = await setup();

    const link = getByText('View cookies') as HTMLAnchorElement;

    expect(link.href).toContain('/cookie-policy');
  });

  describe('when accept buttons is pressed', () => {
    it('should set the cookie preferences and policy', async () => {
      const { getByRole, cookiePolicyService } = await setup();

      getByRole('button', { name: 'Accept analytics cookies' }).click();

      expect(cookiePolicyService.hasAnsweredCookiePreferences).toBeTrue();
      expect(cookiePolicyService.analyticCookiesAccepted).toBeTrue();
    });

    it('should close the banner', async () => {
      const { getByRole, fixture, queryByTestId } = await setup();

      getByRole('button', { name: 'Accept analytics cookies' }).click();

      fixture.detectChanges();

      expect(queryByTestId('cookie-banner')).toBeFalsy();
    });

    it('should trigger google analytic tracking', async () => {
      const { getByRole, analyticCookiesServiceSpy } = await setup();

      getByRole('button', { name: 'Accept analytics cookies' }).click();

      expect(analyticCookiesServiceSpy).toHaveBeenCalled();
    });
  });

  describe('when reject buttons is pressed', () => {
    it('should set the cookie preferences and policy', async () => {
      const { getByRole, cookiePolicyService } = await setup();

      getByRole('button', { name: 'Reject analytics cookies' }).click();

      expect(cookiePolicyService.hasAnsweredCookiePreferences).toBeTrue();
      expect(cookiePolicyService.analyticCookiesAccepted).toBeFalse();
    });

    it('should close the banner', async () => {
      const { getByRole, fixture, queryByTestId } = await setup();

      getByRole('button', { name: 'Reject analytics cookies' }).click();

      fixture.detectChanges();

      expect(queryByTestId('cookie-banner')).toBeFalsy();
    });
  });

  describe('pages that does not show cookie banner', () => {
    it('should not show up on cookie policy page', async () => {
      const { queryByTestId, router, fixture } = await setup();

      const routerEvent$ = router.events as BehaviorSubject<any>;
      routerEvent$.next(new NavigationEnd(2, '/cookie-policy', '/cookie-policy'));

      fixture.detectChanges();

      expect(queryByTestId('cookie-banner')).toBeFalsy();
    });

    it('should not show up on admin panel', async () => {
      const { queryByTestId, router, fixture } = await setup();

      const routerEvent$ = router.events as BehaviorSubject<any>;
      routerEvent$.next(new NavigationEnd(2, '/sfcadmin/search/workplace', '/sfcadmin/search/workplace'));

      fixture.detectChanges();

      expect(queryByTestId('cookie-banner')).toBeFalsy();
    });
  });

  describe('on page load', () => {
    it('should trigger google analytics if user has accepted analytic cookies', async () => {
      const { analyticCookiesServiceSpy } = await setup({ analyticCookiesAccepted: true });

      expect(analyticCookiesServiceSpy).toHaveBeenCalled();
    });

    it('should not trigger google analytics if user has not accepted analytic cookies', async () => {
      const { analyticCookiesServiceSpy } = await setup({ analyticCookiesAccepted: false });

      expect(analyticCookiesServiceSpy).not.toHaveBeenCalled();
    });
  });
});
