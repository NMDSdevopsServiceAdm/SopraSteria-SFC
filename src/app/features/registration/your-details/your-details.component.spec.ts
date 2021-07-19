import { HttpClientTestingModule } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { Router, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { BackService } from '@core/services/back.service';
import { UserService } from '@core/services/user.service';
import { MockFeatureFlagsService } from '@core/test-utils/MockFeatureFlagService';
import { MockUserService } from '@core/test-utils/MockUserService';
import { FeatureFlagsService } from '@shared/services/feature-flags.service';
import { SharedModule } from '@shared/shared.module';
import { fireEvent, render } from '@testing-library/angular';

import { RegistrationModule } from '../registration.module';
import { YourDetailsComponent } from './your-details.component';

fdescribe('YourDetailsComponent', () => {
  async function setup() {
    const component = await render(YourDetailsComponent, {
      imports: [SharedModule, RouterModule, RouterTestingModule, HttpClientTestingModule, RegistrationModule],
      providers: [
        BackService,
        {
          provide: FeatureFlagsService,
          useClass: MockFeatureFlagsService,
        },
        {
          provide: UserService,
          useClass: MockUserService,
        },
      ],
    });

    const injector = getTestBed();
    const router = injector.inject(Router) as Router;
    const userService = injector.inject(UserService) as UserService;

    const spy = spyOn(router, 'navigate');
    spy.and.returnValue(Promise.resolve(true));

    return {
      component,
      spy,
      userService,
    };
  }

  it('should render a YourDetailsComponent', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should display errors for all inputs when the Continue button is clicked and the form is blank', async () => {
    const { component } = await setup();
    const form = component.fixture.componentInstance.form;
    const continueButton = component.getByText('Continue');
    const nameErrorMessage = 'Enter full name';
    const jobErrorMessage = 'Enter a job title';
    const emailErrorMessage = 'Enter an email address';
    const phoneErrorMessage = 'Enter a phone number';

    fireEvent.click(continueButton);

    expect(form.invalid).toBeTruthy();
    expect(component.getAllByText(nameErrorMessage).length).toBe(2);
    expect(component.getAllByText(jobErrorMessage).length).toBe(2);
    expect(component.getAllByText(emailErrorMessage).length).toBe(2);
    expect(component.getAllByText(phoneErrorMessage).length).toBe(2);
  });

  describe('Error messages for the name input', () => {
    it('should display a required error when the Continue button is clicked without a name', async () => {
      const { component } = await setup();
      const form = component.fixture.componentInstance.form;
      const continueButton = component.getByText('Continue');
      const errorMessage = 'Enter full name';

      form.controls['jobTitle'].setValue('job');
      form.controls['email'].setValue('name@email.com');
      form.controls['phone'].setValue('01234567890');

      fireEvent.click(continueButton);

      expect(form.invalid).toBeTruthy();
      expect(component.getAllByText(errorMessage).length).toBe(2);
    });

    it('should display a max length error when the Continue button is clicked and the name is over 120 characters', async () => {
      const { component } = await setup();
      const form = component.fixture.componentInstance.form;
      const continueButton = component.getByText('Continue');
      const errorMessage = 'Full name must be 120 characters or fewer';
      const longName =
        'ReallyLongNameReallyLongNameReallyLongNameReallyLongNameReallyLongNameReallyLongNameReallyLongNameReallyLongNameReallyLongName';

      form.controls['fullname'].setValue(longName);
      form.controls['jobTitle'].setValue('job');
      form.controls['email'].setValue('name@email.com');
      form.controls['phone'].setValue('01234567890');

      fireEvent.click(continueButton);

      expect(form.invalid).toBeTruthy();
      expect(component.getAllByText(errorMessage).length).toBe(2);
    });
  });

  describe('Error messages for the job title input', () => {
    it('should display a required error when the Continue button is clicked without a job title', async () => {
      const { component } = await setup();
      const form = component.fixture.componentInstance.form;
      const continueButton = component.getByText('Continue');
      const errorMessage = 'Enter a job title';

      form.controls['fullname'].setValue('name');
      form.controls['email'].setValue('name@email.com');
      form.controls['phone'].setValue('01234567890');

      fireEvent.click(continueButton);

      expect(form.invalid).toBeTruthy();
      expect(component.getAllByText(errorMessage).length).toBe(2);
    });

    it('should display a max length error when the Continue button is clicked and the job title is over 120 characters', async () => {
      const { component } = await setup();
      const form = component.fixture.componentInstance.form;
      const continueButton = component.getByText('Continue');
      const errorMessage = 'Job title must be 120 characters or fewer';
      const longName =
        'ReallyLongJobTitleReallyLongJobTitleReallyLongJobTitleReallyLongJobTitleReallyLongJobTitleReallyLongJobTitleReallyLongJobTitle';

      form.controls['fullname'].setValue('name');
      form.controls['jobTitle'].setValue(longName);
      form.controls['email'].setValue('name@email.com');
      form.controls['phone'].setValue('01234567890');

      fireEvent.click(continueButton);

      expect(form.invalid).toBeTruthy();
      expect(component.getAllByText(errorMessage).length).toBe(2);
    });
  });

  describe('Error messages for the email input', () => {
    it('should display a required error when the Continue button is clicked without an email', async () => {
      const { component } = await setup();
      const form = component.fixture.componentInstance.form;
      const continueButton = component.getByText('Continue');
      const errorMessage = 'Enter an email address';

      form.controls['fullname'].setValue('name');
      form.controls['jobTitle'].setValue('job');
      form.controls['phone'].setValue('01234567890');

      fireEvent.click(continueButton);

      expect(form.invalid).toBeTruthy();
      expect(component.getAllByText(errorMessage).length).toBe(2);
    });

    it('should display a max length error when the Continue button is clicked and the email is over 120 characters', async () => {
      const { component } = await setup();
      const form = component.fixture.componentInstance.form;
      const continueButton = component.getByText('Continue');
      const errorMessage = 'Email address must be 120 characters or fewer';
      const longEmail =
        'Really@LongEmailReallyLongEmailReallyLongEmailReallyLongEmailReallyLongEmailReallyLongEmailReallyLongEmailReallyLongEmail.com';

      form.controls['fullname'].setValue('name');
      form.controls['jobTitle'].setValue('job');
      form.controls['email'].setValue(longEmail);
      form.controls['phone'].setValue('01234567890');

      fireEvent.click(continueButton);

      expect(form.invalid).toBeTruthy();
      expect(component.getAllByText(errorMessage).length).toBe(2);
    });

    it('should display a pattern error when the Continue button is clicked and the input is not a valid email', async () => {
      const { component } = await setup();
      const form = component.fixture.componentInstance.form;
      const continueButton = component.getByText('Continue');
      const errorMessage = 'Enter the email address in the correct format, like name@example.com';
      const invalidEmail = 'Invalid email';

      form.controls['fullname'].setValue('name');
      form.controls['jobTitle'].setValue('job');
      form.controls['email'].setValue(invalidEmail);
      form.controls['phone'].setValue('01234567890');

      fireEvent.click(continueButton);

      expect(form.invalid).toBeTruthy();
      expect(component.getAllByText(errorMessage).length).toBe(2);
    });
  });

  describe('Error messages for the phone input', () => {
    it('should display a required error when the Continue button is clicked without a phone number', async () => {
      const { component } = await setup();
      const form = component.fixture.componentInstance.form;
      const continueButton = component.getByText('Continue');
      const errorMessage = 'Enter a phone number';

      form.controls['fullname'].setValue('name');
      form.controls['jobTitle'].setValue('job');
      form.controls['email'].setValue('name@email.com');

      fireEvent.click(continueButton);

      expect(form.invalid).toBeTruthy();
      expect(component.getAllByText(errorMessage).length).toBe(2);
    });

    it('should display a pattern error when the Continue button is clicked and the input is not a valid email', async () => {
      const { component } = await setup();
      const form = component.fixture.componentInstance.form;
      const continueButton = component.getByText('Continue');
      const errorMessage = 'Enter the phone number like 01632 960 001, 07700 900 982 or +44 0808 157 0192';
      const invalidPhoneNumber = '0124ab23d455';

      form.controls['fullname'].setValue('name');
      form.controls['jobTitle'].setValue('job');
      form.controls['email'].setValue('name@email.com');
      form.controls['phone'].setValue(invalidPhoneNumber);

      fireEvent.click(continueButton);

      expect(form.invalid).toBeTruthy();
      expect(component.getAllByText(errorMessage).length).toBe(2);
    });
  });

  it('should submit the form when it is valid and the continue button is clicked', async () => {
    const { component, userService } = await setup();
    const form = component.fixture.componentInstance.form;
    const continueButton = component.getByText('Continue');
    const updateState = spyOn(userService, 'updateState').and.callThrough();

    form.controls['fullname'].setValue('name');
    form.controls['jobTitle'].setValue('job');
    form.controls['email'].setValue('name@email.com');
    form.controls['phone'].setValue('01234567890');

    const formInputs = {
      fullname: 'name',
      jobTitle: 'job',
      email: 'name@email.com',
      phone: '01234567890',
    };

    fireEvent.click(continueButton);

    expect(form.valid).toBeTruthy();
    expect(updateState).toHaveBeenCalledWith(formInputs);
  });

  it('should submit and go to create-username-password url when the form is valid', async () => {
    const { component, spy } = await setup();
    const form = component.fixture.componentInstance.form;
    const continueButton = component.getByText('Continue');

    form.controls['fullname'].setValue('name');
    form.controls['jobTitle'].setValue('job');
    form.controls['email'].setValue('name@email.com');
    form.controls['phone'].setValue('01234567890');

    fireEvent.click(continueButton);

    expect(form.valid).toBeTruthy();
    expect(spy).toHaveBeenCalledWith(['registration', 'create-username-password']);
  });

  describe('setBackLink()', () => {
    it('should set the correct back link', async () => {
      const { component } = await setup();
      const backLinkSpy = spyOn(component.fixture.componentInstance.backService, 'setBackLink');

      component.fixture.componentInstance.setBackLink();
      component.fixture.detectChanges();

      expect(backLinkSpy).toHaveBeenCalledWith({
        url: ['registration', 'select-main-service'],
      });
    });
  });
});
