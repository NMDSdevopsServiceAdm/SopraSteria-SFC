import { HttpClientTestingModule } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { RegistrationService } from '@core/services/registration.service';
import { UserService } from '@core/services/user.service';
import { MockFeatureFlagsService } from '@core/test-utils/MockFeatureFlagService';
import { MockRegistrationServiceWithMainService } from '@core/test-utils/MockRegistrationService';
import { MockUserService } from '@core/test-utils/MockUserService';
import { RegistrationModule } from '@features/registration/registration.module';
import { FeatureFlagsService } from '@shared/services/feature-flags.service';
import { SharedModule } from '@shared/shared.module';
import { fireEvent, getByTestId, queryByText, render } from '@testing-library/angular';
import { BehaviorSubject, of } from 'rxjs';

import { ConfirmDetailsComponent } from './confirm-details.component';

describe('ConfirmDetailsComponent', () => {
  async function setup() {
    const { fixture, getByText, getByTestId, getAllByText, queryByText } = await render(ConfirmDetailsComponent, {
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
      ],
    });

    const injector = getTestBed();
    const router = injector.inject(Router) as Router;

    const spy = spyOn(router, 'navigate');
    spy.and.returnValue(Promise.resolve(true));

    const registrationService = injector.inject(RegistrationService) as RegistrationService;

    const postRegistrationSpy = spyOn(registrationService, 'postRegistration');
    postRegistrationSpy.and.returnValue(of({ userStatus: 'PENDING' }));

    const component = fixture.componentInstance;

    return {
      fixture,
      component,
      spy,
      getAllByText,
      queryByText,
      getByText,
      getByTestId,
      postRegistrationSpy,
    };
  }

  it('should create ConfirmDetailsComponent', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should have the title Check your details before you submit them', async () => {
    const { queryByText } = await setup();
    const expectedTitle = 'Check your details before you submit them';

    expect(queryByText(expectedTitle, { exact: false })).toBeTruthy();
  });

  it('should display the text to agree to terms and conditions', async () => {
    const { getAllByText } = await setup();
    const expectedText = 'I agree to the ';
    const termsAndConditionsLink = 'terms and conditions';

    expect(getAllByText(expectedText, { exact: false })).toBeTruthy();
    expect(getAllByText(termsAndConditionsLink, { exact: false })).toBeTruthy();
  });

  it('should show an error message when pressing submit without agreeing to terms and conditions', async () => {
    const { fixture, getByText, getAllByText } = await setup();
    const expectedErrorMessage = 'Confirm that you agree to the terms and conditions';

    const submitButton = getByText('Submit details');
    fireEvent.click(submitButton);

    expect(fixture.componentInstance.form.invalid).toBeTruthy();
    expect(getAllByText(expectedErrorMessage, { exact: false }).length).toBe(2);
  });

  it('should preselect the terms and conditions checkbox if it is set to true in the service', async () => {
    const { component } = await setup();

    component.registrationService.termsAndConditionsCheckbox$ = new BehaviorSubject(true);
    component.ngOnInit();

    expect(component.form.valid).toBeTruthy();
  });

  it('should not preselect the terms and conditions checkbox if it is set to false in the service', async () => {
    const { component } = await setup();

    component.registrationService.termsAndConditionsCheckbox$ = new BehaviorSubject(false);
    component.ngOnInit();

    expect(component.form.valid).toBeFalsy();
  });

  it('should update the value of termsAndConditionsCheckbox$ in the service when the checkbox is clicked', async () => {
    const { component, getByTestId } = await setup();

    const spy = spyOn(component, 'setTermsAndConditionsCheckbox').and.callThrough();

    component.registrationService.termsAndConditionsCheckbox$ = new BehaviorSubject(false);
    component.ngOnInit();

    const termsAndConditionsCheckbox = getByTestId('checkbox');
    fireEvent.click(termsAndConditionsCheckbox);

    expect(spy).toHaveBeenCalled();
    expect(component.registrationService.termsAndConditionsCheckbox$.value).toBe(true);
  });

  it('should call the save function to create account when pressing submit after agreeing to terms and conditions', async () => {
    const { component, fixture, getByText, getByTestId } = await setup();

    const termsAndConditionsCheckbox = getByTestId('checkbox');
    const submitButton = getByText('Submit details');
    const saveSpy = spyOn(component, 'save').and.returnValue(null);

    fireEvent.click(termsAndConditionsCheckbox);
    fireEvent.click(submitButton);

    expect(fixture.componentInstance.form.invalid).toBeFalsy();
    expect(saveSpy).toHaveBeenCalled();
  });

  it('should set the back link to `create-security-question`', async () => {
    const { component, fixture } = await setup();
    const backLinkSpy = spyOn(component.backService, 'setBackLink');

    component.setBackLink();
    fixture.detectChanges();

    expect(backLinkSpy).toHaveBeenCalledWith({
      url: ['registration', 'create-security-question'],
    });
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
        typeOfEmployer: { value: 'Other', other: 'other employer type' },
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
      });
    });
  });
});
