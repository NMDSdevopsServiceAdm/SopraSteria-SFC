import { HttpClientTestingModule } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { RegistrationService } from '@core/services/registration.service';
import { UserService } from '@core/services/user.service';
import { MockFeatureFlagsService } from '@core/test-utils/MockFeatureFlagService';
import { MockRegistrationServiceWithMainService } from '@core/test-utils/MockRegistrationService';
import { MockUserService } from '@core/test-utils/MockUserService';
import { RegistrationModule } from '@features/registration/registration.module';
import { FeatureFlagsService } from '@shared/services/feature-flags.service';
import { SharedModule } from '@shared/shared.module';
import { fireEvent, queryByText, render } from '@testing-library/angular';

import { ConfirmAccountDetailsComponent } from './confirm-account-details.component';

describe('ConfirmAccountDetailsComponent', () => {
  async function setup() {
    const { fixture, getByText, getAllByText, queryByText } = await render(ConfirmAccountDetailsComponent, {
      imports: [
        SharedModule,
        RegistrationModule,
        RouterTestingModule,
        HttpClientTestingModule,
        FormsModule,
        ReactiveFormsModule,
      ],
      providers: [
        {
          provide: RegistrationService,
          useClass: MockRegistrationServiceWithMainService,
        },
        {
          provide: UserService,
          useClass: MockUserService,
        },
        { provide: FeatureFlagsService, useClass: MockFeatureFlagsService },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              parent: {
                url: [
                  {
                    path: 'registration',
                  },
                ],
              },
            },
          },
        },
        FormBuilder,
      ],
    });

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

  describe('Show password button', () => {
    it('should hide the password before clicking show', async () => {
      const { fixture, getByText } = await setup();

      const expectedHiddenPassword = '******';
      fixture.detectChanges();

      expect(getByText(expectedHiddenPassword)).toBeTruthy();
    });

    it('should display the password after clicking show', async () => {
      const { fixture, getByText, queryByText } = await setup();

      const expectedHiddenPassword = '******';
      const expectedShownPassword = 'Passw0rd';

      expect(queryByText(expectedHiddenPassword)).toBeTruthy();
      expect(queryByText(expectedShownPassword)).toBeFalsy();

      const showPasswordButton = getByText('Show password');
      fireEvent.click(showPasswordButton);
      fixture.detectChanges();

      expect(queryByText(expectedHiddenPassword)).toBeFalsy();
      expect(queryByText(expectedShownPassword)).toBeTruthy();
    });
  });

  describe('Change links', () => {
    it('should always display three change links', async () => {
      const { getAllByText } = await setup();

      const changeLinks = getAllByText('Change');

      expect(changeLinks.length).toEqual(3);
    });

    it('should set the change link for user info to `add-user-details`', async () => {
      const { getAllByText } = await setup();

      const changeUserDetailsLink = getAllByText('Change')[0];
      fireEvent.click(changeUserDetailsLink);

      expect(changeUserDetailsLink.getAttribute('href')).toBe('/registration/add-user-details');
    });

    it('should set the change link for login info to `username-password`', async () => {
      const { getAllByText } = await setup();

      const changeUserDetailsLink = getAllByText('Change')[1];
      fireEvent.click(changeUserDetailsLink);

      expect(changeUserDetailsLink.getAttribute('href')).toBe('/registration/username-password');
    });

    it('should set the change link for security info to `username-password`', async () => {
      const { getAllByText } = await setup();

      const changeSecurityQuestionLink = getAllByText('Change')[2];
      fireEvent.click(changeSecurityQuestionLink);

      expect(changeSecurityQuestionLink.getAttribute('href')).toBe('/registration/create-security-question');
    });
  });
});
