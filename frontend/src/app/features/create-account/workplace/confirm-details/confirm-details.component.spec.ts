import { provideHttpClient } from '@angular/common/http';
import { HttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { RegistrationService } from '@core/services/registration.service';
import { UserService } from '@core/services/user.service';
import { MockFeatureFlagsService } from '@core/test-utils/MockFeatureFlagService';
import { MockRegistrationServiceWithMainService } from '@core/test-utils/MockRegistrationService';
import { MockUserService } from '@core/test-utils/MockUserService';
import { RegistrationModule } from '@features/registration/registration.module';
import { FeatureFlagsService } from '@shared/services/feature-flags.service';
import { SharedModule } from '@shared/shared.module';
import { fireEvent, render } from '@testing-library/angular';
import { of } from 'rxjs';

import { ConfirmDetailsComponent } from './confirm-details.component';
import { InviteResponse } from '@core/model/userDetails.model';

describe('ConfirmDetailsComponent', () => {
  async function setup(overrides: any = {}) {
    const registrationFlow = overrides?.registrationFlow ?? true;
    const termsAndConditionsCheckboxValue = overrides?.termsAndConditionsCheckbox ?? null;

    const setupTools = await render(ConfirmDetailsComponent, {
      imports: [SharedModule, RegistrationModule, FormsModule, ReactiveFormsModule],
      providers: [
        {
          provide: RegistrationService,
          useFactory: MockRegistrationServiceWithMainService.factoryWithOverrides({
            termsAndConditionsCheckboxValue,
          }),
          deps: [HttpClient],
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
                    path: registrationFlow ? 'registration' : 'confirm-details',
                  },
                ],
              },
            },
          },
        },
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    const injector = getTestBed();
    const router = injector.inject(Router) as Router;

    const routerSpy = spyOn(router, 'navigate');
    routerSpy.and.returnValue(Promise.resolve(true));

    const registrationService = injector.inject(RegistrationService) as RegistrationService;

    const postRegistrationSpy = spyOn(registrationService, 'postRegistration');
    postRegistrationSpy.and.returnValue(of({ userStatus: 'PENDING' }));

    const component = setupTools.fixture.componentInstance;

    return {
      ...setupTools,
      component,
      routerSpy,
      postRegistrationSpy,
    };
  }

  it('should create ConfirmDetailsComponent', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should have the title Check your details before you submit them', async () => {
    const { queryByText } = await setup();
    const expectedTitle = 'Check these details before you submit them';

    expect(queryByText(expectedTitle, { exact: false })).toBeTruthy();
  });

  it('should display the text to agree to terms and conditions', async () => {
    const { getAllByText } = await setup();
    const expectedText = 'I agree to the ';
    const termsAndConditionsLink = 'terms and conditions';

    expect(getAllByText(expectedText, { exact: false })).toBeTruthy();
    expect(getAllByText(termsAndConditionsLink, { exact: false })).toBeTruthy();
  });

  describe('validation', () => {
    it('should show an error message when pressing submit without agreeing to terms and conditions', async () => {
      const { queryByText, getByText, getAllByText, postRegistrationSpy } = await setup();
      const expectedErrorMessage = 'Confirm that you agree to the terms and conditions';

      const submitButton = getByText('Submit details');
      fireEvent.click(submitButton);

      expect(queryByText('There is a problem')).toBeTruthy();
      expect(getAllByText(expectedErrorMessage, { exact: false }).length).toBe(2);
      expect(postRegistrationSpy).not.toHaveBeenCalled();
    });

    it('should preselect the terms and conditions checkbox if it is set to true in the service', async () => {
      const { getByTestId } = await setup({ termsAndConditionsCheckbox: true });

      const termsAndConditionsCheckbox = getByTestId('checkbox') as HTMLInputElement;

      expect(termsAndConditionsCheckbox.checked).toBeTrue();
    });

    it('should not preselect the terms and conditions checkbox if it is set to false in the service', async () => {
      const { getByTestId } = await setup({ termsAndConditionsCheckbox: false });

      const termsAndConditionsCheckbox = getByTestId('checkbox') as HTMLInputElement;

      expect(termsAndConditionsCheckbox.checked).toBeFalse();
    });

    it('should update the value of termsAndConditionsCheckbox$ in the service when the checkbox is clicked', async () => {
      const { component, getByTestId } = await setup();

      expect(component.registrationService.termsAndConditionsCheckbox$.value).toBe(null);

      const termsAndConditionsCheckbox = getByTestId('checkbox') as HTMLInputElement;
      fireEvent.click(termsAndConditionsCheckbox);

      expect(termsAndConditionsCheckbox.checked).toBeTrue();
      expect(component.registrationService.termsAndConditionsCheckbox$.value).toBe(true);

      fireEvent.click(termsAndConditionsCheckbox);

      expect(termsAndConditionsCheckbox.checked).toBeFalse();
      expect(component.registrationService.termsAndConditionsCheckbox$.value).toBe(false);
    });

    it('should not show an error on submit when termsAndConditionsCheckbox is ticked from prefill', async () => {
      const { getByTestId, getByText, postRegistrationSpy, queryByText } = await setup({
        termsAndConditionsCheckbox: true,
      });

      const termsAndConditionsCheckbox = getByTestId('checkbox') as HTMLInputElement;
      expect(termsAndConditionsCheckbox.checked).toBeTrue();

      const submitButton = getByText('Submit details');

      fireEvent.click(submitButton);

      expect(queryByText('There is a problem')).toBeFalsy();
      expect(postRegistrationSpy).toHaveBeenCalled();
    });

    it('should show an error on submit when termsAndConditionsCheckbox is ticked from prefill but unticked by user', async () => {
      const { getByTestId, getByText, postRegistrationSpy, queryByText } = await setup({
        termsAndConditionsCheckbox: true,
      });

      const termsAndConditionsCheckbox = getByTestId('checkbox') as HTMLInputElement;
      expect(termsAndConditionsCheckbox.checked).toBeTrue();

      fireEvent.click(termsAndConditionsCheckbox);
      expect(termsAndConditionsCheckbox.checked).toBeFalse();

      const submitButton = getByText('Submit details');

      fireEvent.click(submitButton);

      expect(queryByText('There is a problem')).toBeTruthy();
      expect(postRegistrationSpy).not.toHaveBeenCalled();
    });
  });

  it('should call the save function to create account when pressing submit after agreeing to terms and conditions', async () => {
    const { fixture, getByText, getByTestId, postRegistrationSpy } = await setup();

    const termsAndConditionsCheckbox = getByTestId('checkbox');
    const submitButton = getByText('Submit details');

    fireEvent.click(termsAndConditionsCheckbox);
    fireEvent.click(submitButton);

    expect(fixture.componentInstance.form.invalid).toBeFalsy();
    expect(postRegistrationSpy).toHaveBeenCalled();
  });

  describe('Submitting registration', () => {
    it('should call postRegistration with establishment data', async () => {
      const { getByText, getByTestId, postRegistrationSpy } = await setup();

      const termsAndConditionsCheckbox = getByTestId('checkbox');
      const submitButton = getByText('Submit details');

      fireEvent.click(termsAndConditionsCheckbox);
      fireEvent.click(submitButton);

      expect(postRegistrationSpy.calls.mostRecent().args[0].establishment).toEqual({
        postalCode: 'ABC 123',
        addressLine1: '1 Street',
        addressLine2: 'Second Line',
        addressLine3: 'Third Line',
        county: 'Greater Manchester',
        locationName: 'Workplace Name',
        townCity: 'Manchester',
        locationId: '123',
        mainService: 'Name of service',
        mainServiceOther: 'Hello!',
        isRegulated: null,
        numberOfStaff: '4',
        typeOfEmployer: { value: 'Private Sector' },
      });
    });

    it('should call postRegistration with user data', async () => {
      const { getByText, getByTestId, postRegistrationSpy } = await setup();

      const termsAndConditionsCheckbox = getByTestId('checkbox');
      const submitButton = getByText('Submit details');

      fireEvent.click(termsAndConditionsCheckbox);
      fireEvent.click(submitButton);

      expect(postRegistrationSpy.calls.mostRecent().args[0].user).toEqual({
        uid: 'mocked-uid',
        email: 'john@test.com',
        fullname: 'John Doe',
        jobTitle: 'Software Engineer',
        phone: '01234 345634',
        username: 'testUser',
        password: 'Passw0rd',
        securityQuestion: 'What is your favourite colour?',
        securityQuestionAnswer: 'Blue',
        userResearchInviteResponse: InviteResponse.Yes,
      });
    });
  });
});
