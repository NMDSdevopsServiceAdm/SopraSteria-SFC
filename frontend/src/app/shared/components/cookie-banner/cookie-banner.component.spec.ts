import { getTestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AnalyticCookiesService } from '@core/services/analytic-cookies.service';
import { CookiePolicyService } from '@core/services/cookie-policy.service';
import { UserService } from '@core/services/user.service';
import { WindowToken } from '@core/services/window';
import { MockCookiePolicyService } from '@core/test-utils/MockCookiePolicyService';
import { MockRouter } from '@core/test-utils/MockRouter';
import { render } from '@testing-library/angular';

import { CookieBannerComponent } from './cookie-banner.component';

describe('CookieBannerComponent', () => {
  const setup = async (overrides: any = {}) => {
    const analyticCookiesServiceSpy = jasmine.createSpy();

    const loggedInUser = overrides?.loggedInUser === undefined ? { role: 'Edit' } : overrides?.loggedInUser;
    const cookiePolicyServicesOverrides = {
      hasAnsweredCookiePreferences: overrides?.hasAnsweredCookiePreferences ?? false,
      analyticCookiesAccepted: overrides?.analyticCookiesAccepted ?? false,
    };
    const currentUrl = overrides?.currentUrl ?? '';

    const setupTools = await render(CookieBannerComponent, {
      imports: [RouterModule],
      declarations: [],
      providers: [
        {
          provide: CookiePolicyService,
          useFactory: MockCookiePolicyService.factory(cookiePolicyServicesOverrides),
        },
        {
          provide: ActivatedRoute,
          useValue: {},
        },
        {
          provide: AnalyticCookiesService,
          useValue: { startGoogleAnalyticsTracking: analyticCookiesServiceSpy },
        },
        {
          provide: UserService,
          useValue: { loggedInUser },
        },
        { provide: WindowToken, useValue: {} },
        { provide: Router, useFactory: MockRouter.factory({ url: currentUrl }) },
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

  describe('when accept buttons is pressed: ', () => {
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

  describe('criteria of showing cookie banner: ', () => {
    it('should not show up when user has not logged in', async () => {
      const { queryByTestId } = await setup({ loggedInUser: null });

      expect(queryByTestId('cookie-banner')).toBeFalsy();
    });

    it('should not show up when user already answered their cookie preferences', async () => {
      const { queryByTestId } = await setup({ hasAnsweredCookiePreferences: true });

      expect(queryByTestId('cookie-banner')).toBeFalsy();
    });

    it('should not show up on cookie policy page', async () => {
      const { queryByTestId } = await setup({ currentUrl: '/cookie-policy' });

      expect(queryByTestId('cookie-banner')).toBeFalsy();
    });

    it('should not show up on admin panel', async () => {
      const { queryByTestId } = await setup({ currentUrl: '/sfcadmin/search/workplace' });

      expect(queryByTestId('cookie-banner')).toBeFalsy();
    });

    it('should show up when user has logged in and has not answer their cookie preferences', async () => {
      const { queryByTestId } = await setup();

      expect(queryByTestId('cookie-banner')).toBeTruthy();
    });

    it('should show up for non-login user, if the current page is the first question of "Create an account" journey', async () => {
      const { queryByTestId } = await setup({
        loggedInUser: null,
        currentUrl: '/registration/regulated-by-cqc',
      });

      expect(queryByTestId('cookie-banner')).toBeTruthy();
    });
  });

  describe('trigger google analytics on page load: ', () => {
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
