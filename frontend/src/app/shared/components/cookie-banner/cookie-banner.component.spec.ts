import { CookieBannerComponent } from './cookie-banner.component';
import { render } from '@testing-library/angular';
import { RouterModule } from '@angular/router';
import { CookiePolicyService } from '@core/services/cookie-policy.service';
import { MockCookiePolicyService } from '@core/test-utils/MockCookiePolicyService';

fdescribe('CookieBannerComponent', () => {
  const setup = async (overrides: any = {}) => {
    const setupTools = await render(CookieBannerComponent, {
      imports: [RouterModule],
      declarations: [],
      providers: [
        {
          provide: CookiePolicyService,
          useFactory: MockCookiePolicyService.factory(overrides),
        },
      ],
      componentProperties: {},
    });

    const component = setupTools.fixture.componentInstance;

    return { ...setupTools, component };
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

  xit('should show a link for cookie policy page', async () => {});
});
