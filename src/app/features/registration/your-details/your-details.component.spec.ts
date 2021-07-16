import { HttpClientTestingModule } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { Router, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { BackService } from '@core/services/back.service';
import { MockFeatureFlagsService } from '@core/test-utils/MockFeatureFlagService';
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
      ],
    });

    const injector = getTestBed();
    const router = injector.inject(Router) as Router;

    const spy = spyOn(router, 'navigate');
    spy.and.returnValue(Promise.resolve(true));

    return {
      component,
      spy,
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
      form.controls['phone'].setValue('0123457890');

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
      form.controls['phone'].setValue('0123457890');

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
      form.controls['phone'].setValue('0123457890');

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
      form.controls['phone'].setValue('0123457890');

      fireEvent.click(continueButton);

      expect(form.invalid).toBeTruthy();
      expect(component.getAllByText(errorMessage).length).toBe(2);
    });
  });
});
