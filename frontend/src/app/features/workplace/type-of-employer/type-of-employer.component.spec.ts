import { HttpClientTestingModule } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { UntypedFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { provideRouter, Router, RouterModule } from '@angular/router';
import { EstablishmentService } from '@core/services/establishment.service';
import {
  MockEstablishmentServiceWithNoEmployerType,
  MockEstablishmentServiceWithOverrides,
} from '@core/test-utils/MockEstablishmentService';
import { SharedModule } from '@shared/shared.module';
import { fireEvent, render } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';

import { TypeOfEmployerComponent } from './type-of-employer.component';

describe('TypeOfEmployerComponent', () => {
  const optionsWithoutOther = [
    { value: 'Local Authority (adult services)', text: 'Local authority (adult services)' },
    { value: 'Local Authority (generic/other)', text: 'Local authority (generic, other)' },
    { value: 'Private Sector', text: 'Private sector' },
    { value: 'Voluntary / Charity', text: 'Voluntary, charity, not for profit' },
  ];
  async function setup(overrides: any = {}) {
    const setupTools = await render(TypeOfEmployerComponent, {
      imports: [SharedModule, RouterModule, HttpClientTestingModule, ReactiveFormsModule],
      providers: [
        UntypedFormBuilder,
        provideRouter([]),
        {
          provide: EstablishmentService,
          useFactory: overrides.mockEstablishment
            ? MockEstablishmentServiceWithOverrides.factory(overrides.establishment)
            : MockEstablishmentServiceWithNoEmployerType.factory(
                overrides.employerTypeHasValue ?? true,
                overrides.owner ?? 'Workplace',
              ),
        },
      ],
    });

    const component = setupTools.fixture.componentInstance;
    const injector = getTestBed();
    const establishmentService = injector.inject(EstablishmentService) as EstablishmentService;
    const establishmentServiceSpy = spyOn(establishmentService, 'updateEstablishmentFieldWithAudit').and.callThrough();
    const router = injector.inject(Router) as Router;
    const routerSpy = spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));

    return {
      component,
      ...setupTools,
      establishmentServiceSpy,
      establishmentService,
      routerSpy,
    };
  }

  it('should render the TypeOfEmployer component', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should show the page title with the establishment name in it', async () => {
    const { component, getByText } = await setup();
    const establishmentName = component.establishment.name;
    expect(getByText(`What type of employer are you?`)).toBeTruthy();
  });

  it('should show the save and continue button when there is not a return value', async () => {
    const { getByText } = await setup();

    expect(getByText('Save and continue')).toBeTruthy();
  });

  optionsWithoutOther.forEach((answer) => {
    it(`should submit the form with the correct value when the ${answer.text} radio button is selected and the form is submitted`, async () => {
      const { fixture, getByText, getByLabelText, establishmentServiceSpy } = await setup();

      const radioButton = getByLabelText(answer.text);
      fireEvent.click(radioButton);
      fixture.detectChanges();

      const submitButton = getByText('Save and continue');
      fireEvent.click(submitButton);
      fixture.detectChanges();

      expect(establishmentServiceSpy).toHaveBeenCalledWith('mocked-uid', 'EmployerType', {
        employerType: { value: answer.value },
      });
    });
  });

  it('should submit the form with the correct value when the Other radio button is selected and the form is submitted with no optional input', async () => {
    const { fixture, getByText, getByLabelText, establishmentServiceSpy } = await setup();

    const radioButton = getByLabelText('Other');
    fireEvent.click(radioButton);
    fixture.detectChanges();

    const submitButton = getByText('Save and continue');
    fireEvent.click(submitButton);
    fixture.detectChanges();

    expect(establishmentServiceSpy).toHaveBeenCalledWith('mocked-uid', 'EmployerType', {
      employerType: { value: 'Other', other: null },
    });
  });

  it('should submit the form with the correct value when the Other radio button is selected and the form is submitted and there is an optional input', async () => {
    const { fixture, getByText, getByLabelText, establishmentServiceSpy } = await setup();

    const radioButton = getByLabelText('Other');
    fireEvent.click(radioButton);
    fixture.detectChanges();

    const input = 'some employer type';
    const employerTypeInput = getByLabelText('Other employer type (optional)');
    userEvent.type(employerTypeInput, input);

    const submitButton = getByText('Save and continue');
    fireEvent.click(submitButton);
    fixture.detectChanges();

    expect(establishmentServiceSpy).toHaveBeenCalledWith('mocked-uid', 'EmployerType', {
      employerType: { value: 'Other', other: 'some employer type' },
    });
  });

  it('should show an error if no selection is made and the form is submitted', async () => {
    const { fixture, getByText, getAllByText } = await setup();

    const submitButton = getByText('Save and continue');
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

    const submitButton = getByText('Save and continue');
    fireEvent.click(submitButton);
    fixture.detectChanges();

    const errorMessages = getAllByText('Other Employer type must be 120 characters or less');
    expect(errorMessages.length).toEqual(2);
  });

  it('should navigate back to dashboard when navigated to from login', async () => {
    const { fixture, getByText, getByLabelText, routerSpy, component, establishmentService } = await setup({
      employerTypeHasValue: false,
    });

    spyOn(establishmentService, 'getEstablishment').and.callThrough();

    const radioButton = getByLabelText('Voluntary, charity, not for profit');
    fireEvent.click(radioButton);
    const submitButton = getByText('Continue to homepage');
    fireEvent.click(submitButton);
    component.establishment.dataOwner;

    fixture.detectChanges();
    expect(routerSpy).toHaveBeenCalledWith(['/dashboard']);
  });

  it('should navigate back to dashboard when navigated to sub from employer type question', async () => {
    const overrides = { employerTypeHasValue: false, owner: 'parent' };
    const { fixture, getByText, getByLabelText, routerSpy, component, establishmentService } = await setup(overrides);

    spyOn(establishmentService, 'getEstablishment').and.callThrough();

    const radioButton = getByLabelText('Private sector');
    fireEvent.click(radioButton);
    const submitButton = getByText('Continue to homepage');
    fireEvent.click(submitButton);
    component.establishment.dataOwner;

    fixture.detectChanges();

    expect(routerSpy).toHaveBeenCalledWith(['/workplace', 'mocked-uid']);
  });

  describe('Other textbox', () => {
    optionsWithoutOther.forEach((answer) => {
      it(`should not show when ${answer.text} is selected`, async () => {
        const { fixture, getByLabelText, getByTestId, establishmentService } = await setup();
        spyOn(establishmentService, 'getEstablishment').and.callThrough();

        const radioButton = getByLabelText(answer.text);
        fireEvent.click(radioButton);
        fixture.detectChanges();

        expect(getByTestId('conditionalTextBox').getAttribute('class')).toContain('govuk-radios__conditional--hidden');
      });
    });

    it('should show when "Other" is selected', async () => {
      const { fixture, getByTestId, getByLabelText, establishmentService } = await setup();
      spyOn(establishmentService, 'getEstablishment').and.callThrough();

      const radioButton = getByLabelText('Other');
      fireEvent.click(radioButton);
      fixture.detectChanges();

      expect(getByTestId('conditionalTextBox').getAttribute('class')).not.toContain(
        'govuk-radios__conditional--hidden',
      );
    });

    it('should show when "Other" was the previously saved answer', async () => {
      const overrides = { mockEstablishment: true, establishment: { value: 'Other', other: 'some employer type' } };
      const { getByTestId, establishmentService } = await setup(overrides);
      spyOn(establishmentService, 'getEstablishment').and.callThrough();

      expect(getByTestId('conditionalTextBox').getAttribute('class')).not.toContain(
        'govuk-radios__conditional--hidden',
      );
    });
  });
});
