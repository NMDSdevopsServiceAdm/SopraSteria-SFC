import { HttpClientTestingModule } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { UntypedFormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { BackService } from '@core/services/back.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { RegistrationService } from '@core/services/registration.service';
import { MockRegistrationService } from '@core/test-utils/MockRegistrationService';
import { RegistrationModule } from '@features/registration/registration.module';
import { SharedModule } from '@shared/shared.module';
import { fireEvent, render } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';

import { TypeOfEmployerComponent } from './type-of-employer.component';

describe('TypeOfEmployerComponent', () => {
  async function setup(registrationFlow = true) {
    const { fixture, getByText, getAllByText, queryByText, getByLabelText, getByTestId, queryByTestId } = await render(
      TypeOfEmployerComponent,
      {
        imports: [
          SharedModule,
          RegistrationModule,
          RouterTestingModule,
          HttpClientTestingModule,
          FormsModule,
          ReactiveFormsModule,
        ],
        providers: [
          BackService,
          {
            provide: RegistrationService,
            useClass: MockRegistrationService,
          },
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
          UntypedFormBuilder,
        ],
      },
    );

    const injector = getTestBed();
    const router = injector.inject(Router) as Router;
    const establishmentService = injector.inject(EstablishmentService) as EstablishmentService;
    const establishmentServiceSpy = spyOn(establishmentService, 'updateTypeOfEmployer').and.callThrough();

    const routerSpy = spyOn(router, 'navigate');
    routerSpy.and.returnValue(Promise.resolve(true));

    const component = fixture.componentInstance;

    return {
      fixture,
      component,
      routerSpy,
      establishmentServiceSpy,
      getAllByText,
      queryByText,
      getByText,
      getByLabelText,
      getByTestId,
      queryByTestId,
    };
  }

  it('should render TypeOfEmployerComponent', async () => {
    const { component } = await setup();

    expect(component).toBeTruthy();
  });

  it('should render the default question when the workplace has not been manually entered', async () => {
    const { getByText } = await setup();

    expect(getByText('What type of employer is your workplace?')).toBeTruthy();
  });

  it('should render the workplace and user account progress bars', async () => {
    const { getByTestId } = await setup();

    expect(getByTestId('progress-bar-1')).toBeTruthy();
    expect(getByTestId('progress-bar-2')).toBeTruthy();
  });

  it('should not render the progress bars when accessed from outside the flow', async () => {
    const { queryByTestId } = await setup(false);

    expect(queryByTestId('progress-bar-1')).toBeFalsy();
    expect(queryByTestId('progress-bar-2')).toBeFalsy();
  });

  it('should show the page title and radio buttons', async () => {
    const { getByText, getByLabelText } = await setup();

    expect(getByText(`What type of employer is your workplace?`)).toBeTruthy();
    expect(getByLabelText('Local authority (adult services)')).toBeTruthy();
    expect(getByLabelText('Local authority (generic, other)')).toBeTruthy();
    expect(getByLabelText('Private sector')).toBeTruthy();
    expect(getByLabelText('Voluntary, charity, not for profit')).toBeTruthy();
    expect(getByLabelText('Other')).toBeTruthy();
  });

  it('should show the continue button when inside the flow', async () => {
    const { getByText } = await setup();

    expect(getByText('Continue')).toBeTruthy();
  });

  it('should show the Save and return button and a cancel link when inside the flow', async () => {
    const { component, fixture, getByText } = await setup();

    component.insideFlow = false;
    fixture.detectChanges();

    expect(getByText('Save and return')).toBeTruthy();
    expect(getByText('Cancel')).toBeTruthy();
  });

  it('should prefill the form when the value has previously be filled in', async () => {
    const { component, fixture } = await setup();

    component.registrationService.typeOfEmployer$.next({ value: 'Private Sector' });
    component.ngOnInit();
    fixture.detectChanges();

    const form = component.form;
    const radioBtn = fixture.nativeElement.querySelector('input[id="employerType-2"]');
    const otherInputDiv = fixture.nativeElement.querySelector('div[id="conditional-employerType-conditional-1"]');

    expect(radioBtn.checked).toBeTruthy();
    expect(otherInputDiv.getAttribute('class')).toContain('hidden');
    expect(form.value).toEqual({ employerType: 'Private Sector', other: null });
  });

  it('should prefill the form when the value has previously be filled in', async () => {
    const { component, fixture } = await setup();

    component.registrationService.typeOfEmployer$.next({ value: 'Other', other: 'other employer type' });
    component.ngOnInit();
    fixture.detectChanges();

    const form = component.form;
    const otherRadioBtn = fixture.nativeElement.querySelector('input[id="employerType-4"]');
    const otherInput = fixture.nativeElement.querySelector('input[id="other"]');
    const otherInputDiv = fixture.nativeElement.querySelector('div[id="conditional-employerType-conditional-1"]');

    expect(otherRadioBtn.checked).toBeTruthy();
    expect(otherInput.value).toEqual('other employer type');
    expect(otherInputDiv.getAttribute('class')).not.toContain('hidden');
    expect(form.value).toEqual({ employerType: 'Other', other: 'other employer type' });
  });

  describe('submitting form', () => {
    it('should navigate to select-main-service when the Local authority (adult services) radio button is selected and the continue button clicked when in the flow', async () => {
      const { fixture, component, getByText, getByLabelText, routerSpy } = await setup();

      const radioButton = getByLabelText('Local authority (adult services)');
      fireEvent.click(radioButton);
      fixture.detectChanges();

      const submitButton = getByText('Continue');
      fireEvent.click(submitButton);
      fixture.detectChanges();

      expect(component.form.valid).toBeTruthy();
      expect(component.registrationService.typeOfEmployer$.value).toEqual({
        value: 'Local Authority (adult services)',
      });
      expect(routerSpy).toHaveBeenCalledWith(['registration', 'select-main-service']);
    });

    it('should navigate to confirm-details when the Local authority (adult services) radio button is selected and the continue button clicked when not in the flow', async () => {
      const { fixture, component, getByText, getByLabelText, routerSpy } = await setup(false);

      component.returnToConfirmDetails = { url: ['registration', 'confirm-details'] };
      const radioButton = getByLabelText('Local authority (adult services)');
      fireEvent.click(radioButton);
      fixture.detectChanges();

      const submitButton = getByText('Save and return');
      fireEvent.click(submitButton);
      fixture.detectChanges();

      expect(component.form.valid).toBeTruthy();
      expect(routerSpy).toHaveBeenCalledWith(['registration/confirm-details']);
    });

    it('should navigate to select-main-service when the Local authority (generic, other) radio button is selected and the continue button clicked', async () => {
      const { fixture, component, getByText, getByLabelText, routerSpy } = await setup();

      const radioButton = getByLabelText('Local authority (generic, other)');
      fireEvent.click(radioButton);
      fixture.detectChanges();

      const submitButton = getByText('Continue');
      fireEvent.click(submitButton);
      fixture.detectChanges();

      expect(component.form.valid).toBeTruthy();
      expect(component.registrationService.typeOfEmployer$.value).toEqual({ value: 'Local Authority (generic/other)' });
      expect(routerSpy).toHaveBeenCalledWith(['registration', 'select-main-service']);
    });

    it('should navigate to select-main-service when the Private sector radio button is selected and the continue button clicked', async () => {
      const { fixture, component, getByText, getByLabelText, routerSpy } = await setup();

      const radioButton = getByLabelText('Private sector');
      fireEvent.click(radioButton);
      fixture.detectChanges();

      const submitButton = getByText('Continue');
      fireEvent.click(submitButton);
      fixture.detectChanges();

      expect(component.form.valid).toBeTruthy();
      expect(component.registrationService.typeOfEmployer$.value).toEqual({ value: 'Private Sector' });
      expect(routerSpy).toHaveBeenCalledWith(['registration', 'select-main-service']);
    });

    it('should navigate to select-main-service when the Voluntary, charity, not for profit radio button is selected and the continue button clicked', async () => {
      const { fixture, component, getByText, getByLabelText, routerSpy } = await setup();

      const radioButton = getByLabelText('Voluntary, charity, not for profit');
      fireEvent.click(radioButton);
      fixture.detectChanges();

      const submitButton = getByText('Continue');
      fireEvent.click(submitButton);
      fixture.detectChanges();

      expect(component.form.valid).toBeTruthy();
      expect(component.registrationService.typeOfEmployer$.value).toEqual({ value: 'Voluntary / Charity' });
      expect(routerSpy).toHaveBeenCalledWith(['registration', 'select-main-service']);
    });

    it('should navigate to select-main-service when the Other radio button is selected and the continue button clicked', async () => {
      const { fixture, component, getByText, getByLabelText, routerSpy } = await setup();

      const radioButton = getByLabelText('Other');
      fireEvent.click(radioButton);
      fixture.detectChanges();

      const submitButton = getByText('Continue');
      fireEvent.click(submitButton);
      fixture.detectChanges();

      expect(component.form.valid).toBeTruthy();
      expect(component.registrationService.typeOfEmployer$.value).toEqual({ value: 'Other', other: null });
      expect(routerSpy).toHaveBeenCalledWith(['registration', 'select-main-service']);
    });

    it('should navigate to select-main-service when the Other radio button is selected, the optional input filled out and the continue button clickedt', async () => {
      const { fixture, component, getByText, getByLabelText, routerSpy } = await setup();

      const radioButton = getByLabelText('Other');
      fireEvent.click(radioButton);
      fixture.detectChanges();

      const input = 'some employer type';
      const employerTypeInput = getByLabelText('Other employer type (optional)');
      userEvent.type(employerTypeInput, input);

      const submitButton = getByText('Continue');
      fireEvent.click(submitButton);
      fixture.detectChanges();

      expect(component.form.valid).toBeTruthy();
      expect(component.registrationService.typeOfEmployer$.value).toEqual({
        value: 'Other',
        other: 'some employer type',
      });
      expect(routerSpy).toHaveBeenCalledWith(['registration', 'select-main-service']);
    });
  });

  describe('Error messages', () => {
    it('should show an error if no selection is made and the form is submitted', async () => {
      const { fixture, getByText, getAllByText } = await setup();

      const submitButton = getByText('Continue');
      fireEvent.click(submitButton);
      fixture.detectChanges();

      const errorMessages = getAllByText('Select the type of employer');
      expect(errorMessages.length).toEqual(2);
    });

    it('should show an error if Other is selected and the inputted employer type is greater than 120 characters', async () => {
      const { fixture, getByText, getAllByText, getByLabelText } = await setup();

      const otherRadioBtn = getByLabelText('Other');

      fireEvent.click(otherRadioBtn);
      fixture.detectChanges();

      const longString =
        'ThisIsALongStringThisIsALongStringThisIsALongStringThisIsALongStringThisIsALongStringThisIsALongStringThisIsALongStringThisIsALongString';
      const employerTypeInput = getByLabelText('Other employer type (optional)');
      userEvent.type(employerTypeInput, longString);

      const submitButton = getByText('Continue');
      fireEvent.click(submitButton);
      fixture.detectChanges();

      const errorMessages = getAllByText('Other Employer type must be 120 characters or less');
      expect(errorMessages.length).toEqual(2);
    });
  });
});
