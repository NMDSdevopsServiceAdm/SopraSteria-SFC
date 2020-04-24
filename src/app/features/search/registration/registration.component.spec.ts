import { HttpErrorResponse } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { RegistrationsService } from '@core/services/registrations.service';
import { FirstErrorPipe } from '@shared/pipes/first-error.pipe';
import { render } from '@testing-library/angular';
import { throwError } from 'rxjs';
import { spy } from 'sinon';

import { RegistrationComponent } from './registration.component';

describe('RegistrationComponent', () => {
  async function getRegistrationComponent() {
    const registration = {
      establishment: {
        id: 12345,
        nmdsId: 'W1234567',
      },
    };

    return await render(RegistrationComponent, {
      imports: [ReactiveFormsModule, HttpClientTestingModule],
      providers: [RegistrationsService],
      declarations: [FirstErrorPipe],
      componentProperties: {
        index: 0,
        handleRegistration: {
          emit: spy(),
        } as any,
        registration,
      },
    });
  }

  it('should create', async() => {
    const component = await getRegistrationComponent();

    expect(component).toBeTruthy();
  });

  it('should approve the registration of an Establishment', async () => {
    const { click, getByText, fixture } = await getRegistrationComponent();

    const { componentInstance: component } = fixture;

    const registrationApproval = spyOn(component.registrationsService, 'registrationApproval').and.callThrough();

    click(getByText('Approve'));

    expect(registrationApproval).toHaveBeenCalledWith({
      establishmentId: 12345,
      nmdsId: 'W1234567',
      approve: true,
    });
  });

  it('should reject the registration of an Establishment', async () => {
    const { click, getByText, fixture } = await getRegistrationComponent();

    const { componentInstance: component } = fixture;

    const registrationApproval = spyOn(component.registrationsService, 'registrationApproval').and.callThrough();

    click(getByText('Reject'));

    expect(registrationApproval).toHaveBeenCalledWith({
      establishmentId: 12345,
      nmdsId: 'W1234567',
      approve: false,
    });
  });

  it('should change the nmdsID for the registration of an Establishment', async () => {
    const { click, getByText, fixture, container, type } = await getRegistrationComponent();

    const { componentInstance: component } = fixture;

    const registrationApproval = spyOn(component.registrationsService, 'registrationApproval').and.callThrough();

    const nmdsIdInput = container.querySelector('input[name=nmdsid]') as HTMLElement;
    nmdsIdInput.nodeValue = '';

    type(nmdsIdInput, 'G1234567');
    click(getByText('Approve'));

    expect(registrationApproval).toHaveBeenCalledWith({
      establishmentId: 12345,
      nmdsId: 'G1234567',
      approve: true,
    });
  });

  describe('FormValidation', () => {
    it('validates a Workplace ID is required', async () => {
      const { getByText, fixture, container, type } = await getRegistrationComponent();
      const { componentInstance: component } = fixture;

      spyOn(component.registrationsService, 'registrationApproval').and.callThrough();
      spyOn(component.handleRegistration, 'emit').and.callThrough();

      const nmdsIdInput = container.querySelector('input[name=nmdsid]') as HTMLElement;
      nmdsIdInput.nodeValue = '';

      type(nmdsIdInput, '');

      expect(getByText('Enter a workplace ID.'));
      expect(component.registrationsService.registrationApproval).toHaveBeenCalledTimes(0);
    });

    it('validates the min length of a Workplace ID', async () => {
      const { getByText, fixture, container, type } = await getRegistrationComponent();
      const { componentInstance: component } = fixture;

      const registrationApproval = spyOn(component.registrationsService, 'registrationApproval').and.callThrough();

      const nmdsIdInput = container.querySelector('input[name=nmdsid]') as HTMLElement;
      nmdsIdInput.nodeValue = '';

      type(nmdsIdInput, 'W123456');

      expect(getByText('Workplace ID must be between 1 and 8 characters.'));
      expect(registrationApproval).toHaveBeenCalledTimes(0);
    });

    it('validates the max length of a Workplace ID', async () => {
      const { getByText, fixture, container, type } = await getRegistrationComponent();
      const { componentInstance: component } = fixture;

      const registrationApproval = spyOn(component.registrationsService, 'registrationApproval').and.callThrough();

      const nmdsIdInput = container.querySelector('input[name=nmdsid]') as HTMLElement;
      nmdsIdInput.nodeValue = '';

      type(nmdsIdInput, 'W12345678910');

      expect(getByText('Workplace ID must be between 1 and 8 characters.'));
      expect(registrationApproval).toHaveBeenCalledTimes(0);
    });

    it('validates that a Workplace ID must start with a letter', async () => {
      const { getByText, fixture, container, type } = await getRegistrationComponent();
      const { componentInstance: component } = fixture;

      const registrationApproval = spyOn(component.registrationsService, 'registrationApproval').and.callThrough();

      const nmdsIdInput = container.querySelector('input[name=nmdsid]') as HTMLElement;
      nmdsIdInput.nodeValue = '';

      type(nmdsIdInput, '12345678');

      expect(getByText('Workplace ID must start with an uppercase letter.'));
      expect(registrationApproval).toHaveBeenCalledTimes(0);
    });

    it('validates that a Workplace ID must start with an uppercase letter', async () => {
      const { getByText, fixture, container, type } = await getRegistrationComponent();
      const { componentInstance: component } = fixture;

      const registrationApproval = spyOn(component.registrationsService, 'registrationApproval').and.callThrough();

      const nmdsIdInput = container.querySelector('input[name=nmdsid]') as HTMLElement;
      nmdsIdInput.nodeValue = '';

      type(nmdsIdInput, 'w1234567');

      expect(getByText('Workplace ID must start with an uppercase letter.'));
      expect(registrationApproval).toHaveBeenCalledTimes(0);
    });

    it('validates that a Workplace ID cannot be the same as an existing Workplace ID', async () => {
      const { getByText, fixture, container, type, click } = await getRegistrationComponent();
      const { componentInstance: component } = fixture;

      const mockErrorResponse = new HttpErrorResponse({
        status: 400,
        statusText: 'Bad Request',
        error: {
          nmdsId: 'This workplace ID (W1234567) belongs to another workplace. Enter a different workplace ID.',
        }
      });

      spyOn(component.registrationsService, 'registrationApproval').and.returnValue(
        throwError(mockErrorResponse)
      );

      const nmdsIdInput = container.querySelector('input[name=nmdsid]') as HTMLElement;
      nmdsIdInput.nodeValue = '';

      type(nmdsIdInput, 'W1234567');
      click(getByText('Approve'));

      expect(getByText('This workplace ID (W1234567) belongs to another workplace. Enter a different workplace ID.'));
    });
  });
});
