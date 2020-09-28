import { HttpErrorResponse } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { RegistrationsService } from '@core/services/registrations.service';
import { FirstErrorPipe } from '@shared/pipes/first-error.pipe';
import { render, fireEvent, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { throwError } from 'rxjs';
import { spy } from 'sinon';

import { RegistrationComponent } from './registration.component';

const testUsername = 'mr-twiggy';
const testEmail = 'mr.twiggy@cats.com';
const testNmdsId = 'W1234567';
const testWorkplaceId = 12345;
const newUserAccount = 'New-User-Account';
const registrationTypeIrrelevant = 'Registration-Type-Irrelevant';
const workplaceAddedByParent = 'Workplace-Added-By-Parent';

fdescribe('RegistrationComponent', () => {
  async function getRegistrationComponent(registrationType) {
    const registration = {
      email: null,
      username: null,
      establishment: {
        id: testWorkplaceId,
        nmdsId: testNmdsId,
      },
    };

    if (registrationType === newUserAccount) {
      registration.username = testUsername;
      registration.email = testEmail;
    }

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

  it('should create', async () => {
    const component = await getRegistrationComponent(registrationTypeIrrelevant);

    expect(component).toBeTruthy();
  });

  it('should be able to approve the registration of a workplace created by a parent', async () => {
    const { getByText, fixture } = await getRegistrationComponent(workplaceAddedByParent);

    const { componentInstance: component } = fixture;

    const registrationApproval = spyOn(component.registrationsService, 'registrationApproval').and.callThrough();

    fireEvent.click(getByText('Approve'));

    expect(registrationApproval).toHaveBeenCalledWith({
      establishmentId: testWorkplaceId,
      nmdsId: testNmdsId,
      approve: true,
    });
  });

  it('should be able to reject the registration of a workplace created by a parent', async () => {
    const { getByText, fixture } = await getRegistrationComponent(workplaceAddedByParent);

    const { componentInstance: component } = fixture;

    const registrationApproval = spyOn(component.registrationsService, 'registrationApproval').and.callThrough();

    fireEvent.click(getByText('Reject'));

    expect(registrationApproval).toHaveBeenCalledWith({
      establishmentId: testWorkplaceId,
      nmdsId: testNmdsId,
      approve: false,
    });
  });

  it('should be able to approve the registration of a workplace created via a new user account', async () => {
    const { getByText, fixture } = await getRegistrationComponent(newUserAccount);

    const { componentInstance: component } = fixture;

    const registrationApproval = spyOn(component.registrationsService, 'registrationApproval').and.callThrough();

    fireEvent.click(getByText('Approve'));

    expect(registrationApproval).toHaveBeenCalledWith({
      username: testUsername,
      nmdsId: testNmdsId,
      approve: true,
    });
  });

  it('should be able to reject the registration of a workplace created via a new user account', async () => {
    const { getByText, fixture } = await getRegistrationComponent(newUserAccount);

    const { componentInstance: component } = fixture;

    const registrationApproval = spyOn(component.registrationsService, 'registrationApproval').and.callThrough();

    fireEvent.click(getByText('Reject'));

    expect(registrationApproval).toHaveBeenCalledWith({
      username: testUsername,
      nmdsId: testNmdsId,
      approve: false,
    });
  });

  it('should change the nmdsID for the registration of a Workplace', async () => {
    const { getByText, fixture, container } = await getRegistrationComponent(registrationTypeIrrelevant);

    const { componentInstance: component } = fixture;

    const registrationApproval = spyOn(component.registrationsService, 'registrationApproval').and.callThrough();

    const nmdsIdInput = container.querySelector('input[name=nmdsid]') as HTMLElement;
    nmdsIdInput.nodeValue = '';

    const newNmdsId = 'G1234567';
    userEvent.type(nmdsIdInput, newNmdsId);
    fireEvent.click(getByText('Approve'));

    expect(registrationApproval).toHaveBeenCalledWith({
      establishmentId: testWorkplaceId,
      nmdsId: newNmdsId,
      approve: true,
    });
  });

  describe('FormValidation', () => {
    it('validates a Workplace ID is required', async () => {
      const { getByText, fixture, container } = await getRegistrationComponent(registrationTypeIrrelevant);
      const { componentInstance: component } = fixture;

      spyOn(component.registrationsService, 'registrationApproval').and.callThrough();
      spyOn(component.handleRegistration, 'emit').and.callThrough();

      const nmdsIdInput = container.querySelector('input[name=nmdsid]') as HTMLElement;
      nmdsIdInput.nodeValue = '';

      userEvent.type(nmdsIdInput, '');

      expect(getByText('Enter a workplace ID.'));
      expect(component.registrationsService.registrationApproval).toHaveBeenCalledTimes(0);
    });

    it('validates the min length of a Workplace ID', async () => {
      const { getByText, fixture, container } = await getRegistrationComponent(registrationTypeIrrelevant);
      const { componentInstance: component } = fixture;

      const registrationApproval = spyOn(component.registrationsService, 'registrationApproval').and.callThrough();

      const nmdsIdInput = container.querySelector('input[name=nmdsid]') as HTMLElement;
      nmdsIdInput.nodeValue = '';

      userEvent.type(nmdsIdInput, 'W123456');

      expect(getByText('Workplace ID must be between 1 and 8 characters.'));
      expect(registrationApproval).toHaveBeenCalledTimes(0);
    });

    it('validates the max length of a Workplace ID', async () => {
      const { getByText, fixture, container } = await getRegistrationComponent(registrationTypeIrrelevant);
      const { componentInstance: component } = fixture;

      const registrationApproval = spyOn(component.registrationsService, 'registrationApproval').and.callThrough();

      const nmdsIdInput = container.querySelector('input[name=nmdsid]') as HTMLElement;
      nmdsIdInput.nodeValue = '';

      userEvent.type(nmdsIdInput, 'W12345678910');

      expect(getByText('Workplace ID must be between 1 and 8 characters.'));
      expect(registrationApproval).toHaveBeenCalledTimes(0);
    });

    it('validates that a Workplace ID must start with a letter', async () => {
      const { getByText, fixture, container } = await getRegistrationComponent(registrationTypeIrrelevant);
      const { componentInstance: component } = fixture;

      const registrationApproval = spyOn(component.registrationsService, 'registrationApproval').and.callThrough();

      const nmdsIdInput = container.querySelector('input[name=nmdsid]') as HTMLElement;
      nmdsIdInput.nodeValue = '';

      userEvent.type(nmdsIdInput, '12345678');

      expect(getByText('Workplace ID must start with an uppercase letter.'));
      expect(registrationApproval).toHaveBeenCalledTimes(0);
    });

    it('validates that a Workplace ID must start with an uppercase letter', async () => {
      const { getByText, fixture, container } = await getRegistrationComponent(registrationTypeIrrelevant);
      const { componentInstance: component } = fixture;

      const registrationApproval = spyOn(component.registrationsService, 'registrationApproval').and.callThrough();

      const nmdsIdInput = container.querySelector('input[name=nmdsid]') as HTMLElement;
      nmdsIdInput.nodeValue = '';

      userEvent.type(nmdsIdInput, 'w1234567');

      expect(getByText('Workplace ID must start with an uppercase letter.'));
      expect(registrationApproval).toHaveBeenCalledTimes(0);
    });

    fit('validates that a Workplace ID cannot be the same as an existing Workplace ID', async () => {
      const { getByText, fixture, container } = await getRegistrationComponent(registrationTypeIrrelevant);
      const { componentInstance: component } = fixture;

      const mockErrorResponse = new HttpErrorResponse({
        status: 400,
        statusText: 'Bad Request',
        error: {
          nmdsId: 'This workplace ID (W1234567) belongs to another workplace. Enter a different workplace ID.',
        },
      });

      spyOn(component.registrationsService, 'registrationApproval').and.returnValue(throwError(mockErrorResponse));

      const nmdsIdInput = container.querySelector('input[name=nmdsid]') as HTMLElement;
      nmdsIdInput.nodeValue = '';

      await userEvent.type(nmdsIdInput, testNmdsId);
      fixture.detectChanges();
      fireEvent.click(getByText('Approve'));

      expect(
        screen.getByText(
          `This workplace ID (${testNmdsId}) belongs to another workplace. Enter a different workplace ID.`,
        ),
      );
    });
  });
});
