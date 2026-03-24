import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { UntypedFormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { RegistrationService } from '@core/services/registration.service';
import { UserService } from '@core/services/user.service';
import {
  MockRegistrationServiceWithMainService, MockRegistrationServiceWithNegativeUserResearchInviteResponse,
  MockRegistrationServiceWithNoUserResearchInviteResponse,
} from '@core/test-utils/MockRegistrationService';
import { MockUserService } from '@core/test-utils/MockUserService';
import { RegistrationModule } from '@features/registration/registration.module';
import { SharedModule } from '@shared/shared.module';
import { render, within } from '@testing-library/angular';

import { ConfirmAccountDetailsComponent } from './confirm-account-details.component';

describe('ConfirmAccountDetailsComponent', () => {
  async function setup(registrationFlow = 'registration', userResearchInviteResponse = 'yes') {
    const mockServiceMap = {
      'yes': MockRegistrationServiceWithMainService,
      'no': MockRegistrationServiceWithNegativeUserResearchInviteResponse,
      'none': MockRegistrationServiceWithNoUserResearchInviteResponse,
    };

    const { fixture, getByText, getAllByText, queryByText, getByTestId } = await render(
      ConfirmAccountDetailsComponent,
      {
        imports: [SharedModule, RegistrationModule, FormsModule, ReactiveFormsModule],
        providers: [
          {
            provide: RegistrationService,
            useClass: mockServiceMap[userResearchInviteResponse],
          },
          {
            provide: UserService,
            useClass: MockUserService,
          },
          {
            provide: ActivatedRoute,
            useValue: {
              snapshot: {
                parent: {
                  url: [
                    {
                      path: registrationFlow ? 'confirm-details' : 'add-user-details',
                    },
                  ],
                },
              },
            },
          },
          UntypedFormBuilder,
          provideHttpClient(),
          provideHttpClientTesting(),
        ],
      },
    );

    const injector = getTestBed();
    const router = injector.inject(Router) as Router;

    const spy = spyOn(router, 'navigate');
    spy.and.returnValue(Promise.resolve(true));

    const component = fixture.componentInstance;

    return {
      fixture,
      component,
      spy,
      getAllByText,
      queryByText,
      getByText,
      getByTestId,
    };
  }

  it('should create ConfirmAccountDetailsComponent', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should show the user details', async () => {
    const { fixture, getByText } = await setup();

    const expectedFullName = 'John Doe';
    const expectedJobTitle = 'Software Engineer';
    const expectedEmailAddress = 'john@test.com';
    const expectedPhoneNumber = '01234 345634';

    fixture.detectChanges();

    expect(getByText(expectedFullName)).toBeTruthy();
    expect(getByText(expectedJobTitle)).toBeTruthy();
    expect(getByText(expectedEmailAddress)).toBeTruthy();
    expect(getByText(expectedPhoneNumber)).toBeTruthy();
  });

  it('should show the username', async () => {
    const { fixture, getByText } = await setup();

    const expectedUserName = 'testUser';
    fixture.detectChanges();

    expect(getByText(expectedUserName)).toBeTruthy();
  });

  it('should show the security question and answer', async () => {
    const { fixture, getByText } = await setup();

    const expectedSecurityQuestion = 'What is your favourite colour?';
    const expectedSecurityAnswer = 'Blue';
    fixture.detectChanges();

    expect(getByText(expectedSecurityQuestion)).toBeTruthy();
    expect(getByText(expectedSecurityAnswer)).toBeTruthy();
  });

  describe('User research sessions', ()=> {
    it('should show the summary list label', async () => {
      const { getByText } = await setup();
      const key = getByText('User research sessions');
      expect(key).toBeTruthy();
    });

    it('should show the value when yes has been chosen', async () => {
      const { getByText } = await setup();
      const response = getByText('Yes');
      expect(response).toBeTruthy();
    });

    it('should show the value when no has been chosen', async () => {
      const { getByText } = await setup('registration', 'no');
      const response = getByText('No');
      expect(response).toBeTruthy();
    });

    it('should show "-" as the value if the question has not been answered', async () => {
      const { getByText } = await setup('registration', 'none');
      const response = getByText('-');
      expect(response).toBeTruthy();
    });
  });

  describe('Change links', () => {
    it('should always display four change links', async () => {
      const { getAllByText } = await setup();

      const changeLinks = getAllByText('Change');

      expect(changeLinks.length).toEqual(4);
    });

    it('should set the change link for user info to `add-user-details`', async () => {
      const { getByTestId } = await setup();

      const userInfoSummaryList = within(getByTestId('userInfo'));
      const changeLink = userInfoSummaryList.getByText('Change');

      expect(changeLink.getAttribute('href')).toBe('/registration/confirm-details/add-user-details');
    });

    it('should set the change link for login info to `username-password`', async () => {
      const { getByTestId } = await setup();

      const loginInfoSummaryList = within(getByTestId('loginInfo'));
      const changeLink = loginInfoSummaryList.getByText('Change');

      expect(changeLink.getAttribute('href')).toBe('/registration/confirm-details/username-password');
    });

    it('should set the change link for security info to `username-password`', async () => {
      const { getByTestId } = await setup();

      const securityInfoSummaryList = within(getByTestId('securityInfo'));
      const changeLink = securityInfoSummaryList.getByText('Change');

      expect(changeLink.getAttribute('href')).toBe('/registration/confirm-details/create-security-question');
    });

    it('should set the change link for user research sessions to `user-research-invite`', async () => {
      const { getByTestId } = await setup();

      const userResearchInviteResponseInfoSummaryList = within(getByTestId('userResearchInviteResponseInfo'));
      const changeLink = userResearchInviteResponseInfoSummaryList.getByText('Change');

      expect(changeLink.getAttribute('href')).toBe('/registration/confirm-details/user-research-invite');
    });
  });
});
