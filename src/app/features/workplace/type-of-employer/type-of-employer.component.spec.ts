import { HttpClientTestingModule } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { EstablishmentService } from '@core/services/establishment.service';
import { MockEstablishmentServiceWithNoEmployerType } from '@core/test-utils/MockEstablishmentService';
import { SharedModule } from '@shared/shared.module';
import { fireEvent, render } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';

import { TypeOfEmployerComponent } from './type-of-employer.component';

describe('TypeOfEmployerComponent', () => {
  async function setup() {
    const { fixture, getByText, getAllByText, getByLabelText } = await render(TypeOfEmployerComponent, {
      imports: [SharedModule, RouterModule, RouterTestingModule, HttpClientTestingModule, ReactiveFormsModule],
      providers: [
        FormBuilder,
        {
          provide: EstablishmentService,
          useClass: MockEstablishmentServiceWithNoEmployerType,
        },
      ],
    });

    const component = fixture.componentInstance;
    const injector = getTestBed();
    const establishmentService = injector.inject(EstablishmentService) as EstablishmentService;
    const establishmentServiceSpy = spyOn(establishmentService, 'updateTypeOfEmployer').and.callThrough();
    return {
      component,
      fixture,
      getByText,
      getAllByText,
      getByLabelText,
      establishmentServiceSpy,
    };
  }

  it('should render the TypeOfEmployer component', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should show the page title with the establishment name in it', async () => {
    const { component, getByText } = await setup();
    const establishmentName = component.establishment.name;
    expect(getByText(`What type of employer is ${establishmentName}?`)).toBeTruthy();
  });

  it('should show the save and continue button when there is not a return value', async () => {
    const { getByText } = await setup();

    expect(getByText('Save and continue')).toBeTruthy();
  });

  it('should submit the form with the correct value when the Local authority (adult services) radio button is selected and the form is submitted', async () => {
    const { fixture, getByText, getByLabelText, establishmentServiceSpy } = await setup();

    const radioButton = getByLabelText('Local authority (adult services)');
    fireEvent.click(radioButton);
    fixture.detectChanges();

    const submitButton = getByText('Save and continue');
    fireEvent.click(submitButton);
    fixture.detectChanges();

    expect(establishmentServiceSpy).toHaveBeenCalledWith('mocked-uid', {
      employerType: { value: 'Local Authority (adult services)' },
    });
  });

  it('should submit the form with the correct value when the Local authority (generic, other) radio button is selected and the form is submitted', async () => {
    const { fixture, getByText, getByLabelText, establishmentServiceSpy } = await setup();

    const radioButton = getByLabelText('Local authority (generic, other)');
    fireEvent.click(radioButton);
    fixture.detectChanges();

    const submitButton = getByText('Save and continue');
    fireEvent.click(submitButton);
    fixture.detectChanges();

    expect(establishmentServiceSpy).toHaveBeenCalledWith('mocked-uid', {
      employerType: { value: 'Local Authority (generic/other)' },
    });
  });

  it('should submit the form with the correct value when the Private sector radio button is selected and the form is submitted', async () => {
    const { fixture, getByText, getByLabelText, establishmentServiceSpy } = await setup();

    const radioButton = getByLabelText('Private sector');
    fireEvent.click(radioButton);
    fixture.detectChanges();

    const submitButton = getByText('Save and continue');
    fireEvent.click(submitButton);
    fixture.detectChanges();

    expect(establishmentServiceSpy).toHaveBeenCalledWith('mocked-uid', {
      employerType: { value: 'Private Sector' },
    });
  });

  it('should submit the form with the correct value when the Voluntary, charity, not for profit radio button is selected and the form is submitted', async () => {
    const { fixture, getByText, getByLabelText, establishmentServiceSpy } = await setup();

    const radioButton = getByLabelText('Voluntary, charity, not for profit');
    fireEvent.click(radioButton);
    fixture.detectChanges();

    const submitButton = getByText('Save and continue');
    fireEvent.click(submitButton);
    fixture.detectChanges();

    expect(establishmentServiceSpy).toHaveBeenCalledWith('mocked-uid', {
      employerType: { value: 'Voluntary / Charity' },
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

    expect(establishmentServiceSpy).toHaveBeenCalledWith('mocked-uid', {
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

    expect(establishmentServiceSpy).toHaveBeenCalledWith('mocked-uid', {
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
});
