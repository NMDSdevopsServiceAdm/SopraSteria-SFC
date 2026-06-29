import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { Router, RouterModule } from '@angular/router';
import { BackLinkService } from '@core/services/backLink.service';
import { SharedModule } from '@shared/shared.module';
import { render } from '@testing-library/angular';

import { AccountManagementModule } from '../account-management.module';
import { YourAccountComponent } from './your-account.component';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { MockBreadcrumbService } from '@core/test-utils/MockBreadcrumbService';
import { UserService } from '@core/services/user.service';
import { MockUserService } from '@core/test-utils/MockUserService';
import { within } from '@testing-library/dom';
import { UserDetails } from '@core/model/userDetails.model';
import { Roles } from '@core/model/roles.enum';
import userEvent from '@testing-library/user-event';

fdescribe('YourAccountComponent', () => {
  const mockLoggedInUser: UserDetails = {
    uid: 'mocked-uid',
    email: 'test@developer.com',
    fullname: 'John Smith',
    jobTitle: 'Developer',
    phone: '01234567890',
    role: Roles.Edit,
    securityQuestion: 'Not relevant',
    securityQuestionAnswer: 'Not relevant',
    lastLoggedInFromLogin: '2026-06-01T12:34:56.000Z',
    userResearchInviteResponse: null,
    viewedUserResearchQuestion: true,
  };

  async function setup(overrides: any = {}) {
    const loggedInUser = overrides?.loggedInUser ?? mockLoggedInUser;
    const setupTools = await render(YourAccountComponent, {
      imports: [SharedModule, RouterModule, AccountManagementModule],
      providers: [
        BackLinkService,
        {
          provide: BreadcrumbService,
          useClass: MockBreadcrumbService,
        },
        { provide: UserService, useFactory: MockUserService.factoryWithOverrides({ loggedInUser }) },
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    const injector = getTestBed();
    const router = injector.inject(Router) as Router;
    const component = setupTools.fixture.componentInstance;

    const routerSpy = spyOn(router, 'navigateByUrl');
    routerSpy.and.returnValue(Promise.resolve(true));

    return {
      ...setupTools,
      component,
      router,
      routerSpy,
    };
  }

  it('should show a h1 heading', async () => {
    const { getByRole } = await setup();

    const heading = getByRole('heading', { level: 1 });
    expect(heading.textContent).toEqual('My account details');
  });

  it('should show a User research sessions row', async () => {
    const { getByText } = await setup();

    const label = getByText('User research sessions');
    expect(label).toBeTruthy();

    const row = label.closest('div.govuk-summary-list__row') as HTMLElement;

    const addLink = within(row).getByRole('link', { name: /Add/ }) as HTMLAnchorElement;
    expect(addLink).toBeTruthy();
    expect(addLink.href).toContain('/account-management/user-research-invite');
  });

  it('should show a NEW icon and Add Link when user have not answered and have not seen the user research invite question', async () => {
    const loggedInUser = {
      ...mockLoggedInUser,
      userResearchInviteResponse: null,
      viewedUserResearchQuestion: false,
    };
    const { getByText } = await setup({ loggedInUser });

    const label = getByText('User research sessions');
    expect(label).toBeTruthy();

    const row = label.closest('div.govuk-summary-list__row') as HTMLElement;

    const newPillIcon = within(row).queryByTestId('new-pill');
    expect(newPillIcon).toBeTruthy();
  });

  it('should not show the NEW icon if user have seen the user research invite question', async () => {
    const loggedInUser = {
      ...mockLoggedInUser,
      viewedUserResearchQuestion: true,
    };
    const { getByText } = await setup({ loggedInUser });

    const label = getByText('User research sessions');
    expect(label).toBeTruthy();

    const row = label.closest('div.govuk-summary-list__row') as HTMLElement;

    const newPillIcon = within(row).queryByTestId('new-pill');
    expect(newPillIcon).toBeFalsy();

    const addLink = within(row).getByRole('link', { name: /Add/ }) as HTMLAnchorElement;
    expect(addLink.href).toContain('/account-management/user-research-invite');
  });

  ['Yes', 'No'].forEach((answer) => {
    it('should show a change link and hide the NEW icon if user have answered the user research invite question', async () => {
      const loggedInUser = {
        ...mockLoggedInUser,
        viewedUserResearchQuestion: false,
        userResearchInviteResponse: answer,
      };

      const { getByText } = await setup({ loggedInUser });

      const label = getByText('User research sessions');
      expect(label).toBeTruthy();

      const row = label.closest('div.govuk-summary-list__row') as HTMLElement;

      const newPillIcon = within(row).queryByTestId('new-pill');
      expect(newPillIcon).toBeFalsy();

      const changeLink = within(row).getByRole('link', { name: /Change/ }) as HTMLAnchorElement;
      expect(changeLink.href).toContain('/account-management/user-research-invite');
    });
  });

  it('should update the user flag for "viewedUserResearchQuestion" when user clicked the Add link', async () => {
    const { getByText } = await setup();

    const label = getByText('User research sessions');
    expect(label).toBeTruthy();

    const row = label.closest('div.govuk-summary-list__row') as HTMLElement;

    const addLink = within(row).getByRole('link', { name: /Add/ }) as HTMLAnchorElement;
    userEvent.click(addLink);

    expect();
  });
});
