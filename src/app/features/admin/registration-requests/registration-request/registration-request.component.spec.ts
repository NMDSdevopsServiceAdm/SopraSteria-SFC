import { HttpErrorResponse } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { AlertService } from '@core/services/alert.service';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { RegistrationsService } from '@core/services/registrations.service';
import { SwitchWorkplaceService } from '@core/services/switch-workplace.service';
import { WindowRef } from '@core/services/window.ref';
import { MockBreadcrumbService } from '@core/test-utils/MockBreadcrumbService';
import { MockFeatureFlagsService } from '@core/test-utils/MockFeatureFlagService';
import { mockRegistration, MockRegistrationsService } from '@core/test-utils/MockRegistrationsService';
import { MockSwitchWorkplaceService } from '@core/test-utils/MockSwitchWorkplaceService';
import { FeatureFlagsService } from '@shared/services/feature-flags.service';
import { SharedModule } from '@shared/shared.module';
import { fireEvent, render } from '@testing-library/angular';
import { of, throwError } from 'rxjs';

import { RegistrationRequestComponent } from './registration-request.component';

describe('RegistrationRequestComponent', () => {
  async function setup() {
    const { fixture, getByText, queryAllByText } = await render(RegistrationRequestComponent, {
      imports: [
        SharedModule,
        RouterModule,
        RouterTestingModule,
        HttpClientTestingModule,
        FormsModule,
        ReactiveFormsModule,
      ],
      providers: [
        { provide: BreadcrumbService, useClass: MockBreadcrumbService },
        { provide: RegistrationsService, useClass: MockRegistrationsService },
        { provide: FeatureFlagsService, useClass: MockFeatureFlagsService },
        { provide: SwitchWorkplaceService, useClass: MockSwitchWorkplaceService },
        AlertService,
        WindowRef,
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              data: {
                registration: mockRegistration,
              },
            },
          },
        },
      ],
    });

    const component = fixture.componentInstance;
    return {
      component,
      fixture,
      getByText,
      queryAllByText,
    };
  }

  it('should render a RegistrationRequestComponent', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should display the workplace name twice (heading and name section)', async () => {
    const { queryAllByText } = await setup();

    const workplaceName = mockRegistration.establishment.name;

    expect(queryAllByText(workplaceName, { exact: false }).length).toBe(2);
  });

  it('should display the workplace address', async () => {
    const { getByText } = await setup();

    const address = mockRegistration.establishment.address;
    const address2 = mockRegistration.establishment.address2;
    const address3 = mockRegistration.establishment.address3;
    const postcode = mockRegistration.establishment.postcode;
    const town = mockRegistration.establishment.town;
    const county = mockRegistration.establishment.county;

    expect(getByText(address, { exact: false })).toBeTruthy();
    expect(getByText(address2, { exact: false })).toBeTruthy();
    expect(getByText(address3, { exact: false })).toBeTruthy();
    expect(getByText(postcode, { exact: false })).toBeTruthy();
    expect(getByText(town, { exact: false })).toBeTruthy();
    expect(getByText(county, { exact: false })).toBeTruthy();
  });

  it('should display the provider ID and location ID', async () => {
    const { getByText } = await setup();

    const locationId = mockRegistration.establishment.locationId;
    const provid = mockRegistration.establishment.provid;

    expect(getByText(locationId, { exact: false })).toBeTruthy();
    expect(getByText(provid, { exact: false })).toBeTruthy();
  });

  it('should display the date and time that the request was received', async () => {
    const { getByText } = await setup();

    const receivedDate = 'Received 1/1/2021 12:00am';

    expect(getByText(receivedDate, { exact: false })).toBeTruthy();
  });

  it('should display the main service', async () => {
    const { getByText } = await setup();

    const mainService = mockRegistration.establishment.mainService;

    expect(getByText(mainService, { exact: false })).toBeTruthy();
  });

  it('should display the user details when user registration', async () => {
    const { getByText } = await setup();

    const username = mockRegistration.username;
    const name = mockRegistration.name;
    const securityQuestion = mockRegistration.securityQuestion;
    const securityQuestionAnswer = mockRegistration.securityQuestionAnswer;
    const email = mockRegistration.email;
    const phone = mockRegistration.phone;

    expect(getByText(username, { exact: false })).toBeTruthy();
    expect(getByText(name, { exact: false })).toBeTruthy();
    expect(getByText(securityQuestion, { exact: false })).toBeTruthy();
    expect(getByText(securityQuestionAnswer, { exact: false })).toBeTruthy();
    expect(getByText(email, { exact: false })).toBeTruthy();
    expect(getByText(phone, { exact: false })).toBeTruthy();
  });

  it('should call navigateToWorkplace in switchWorkplaceService when the parentId link is clicked', async () => {
    const { fixture, getByText } = await setup();

    const switchWorkplaceService = TestBed.inject(SwitchWorkplaceService);

    const switchWorkplaceServiceSpy = spyOn(switchWorkplaceService, 'navigateToWorkplace');

    const parentId = mockRegistration.establishment.parentEstablishmentId;

    const parentIdLink = getByText(parentId, { exact: false });
    fireEvent.click(parentIdLink);

    fixture.detectChanges();

    expect(switchWorkplaceServiceSpy).toHaveBeenCalled();
  });

  describe('Updating workplace ID', () => {
    it('should have a success alert when delete is successful', async () => {
      const { component, fixture, getByText } = await setup();

      spyOn(component.registrationsService, 'updateWorkplaceId').and.returnValue(of({}));

      const alertService = TestBed.inject(AlertService);
      const alertServiceSpy = spyOn(alertService, 'addAlert').and.callThrough();

      const form = component.workplaceIdForm;

      form.controls['nmdsId'].setValue('A1234567');
      form.controls['nmdsId'].markAsDirty();

      fireEvent.click(getByText('Save this ID'));
      fixture.detectChanges();

      expect(alertServiceSpy).toHaveBeenCalledWith({
        type: 'success',
        message: 'The workplace ID has been successfully updated to A1234567',
      });
    });

    describe('Workplace ID validation', () => {
      it('displays enter a valid workplace ID message when box is empty', async () => {
        const { component, fixture, getByText } = await setup();

        const form = component.workplaceIdForm;
        const registrationsServiceSpy = spyOn(component.registrationsService, 'updateWorkplaceId');

        form.controls['nmdsId'].setValue('');
        form.controls['nmdsId'].markAsDirty();

        fireEvent.click(getByText('Save this ID'));

        fixture.detectChanges();

        expect(form.valid).toBeFalsy();
        expect(getByText('To update, enter a valid workplace ID', { exact: false })).toBeTruthy();
        expect(registrationsServiceSpy).not.toHaveBeenCalled();
      });

      it('shows length error message if workplace ID is shorter than 8 characters', async () => {
        const { component, fixture, getByText } = await setup();

        const form = component.workplaceIdForm;
        const registrationsServiceSpy = spyOn(component.registrationsService, 'updateWorkplaceId');

        form.controls['nmdsId'].setValue('A1');
        form.controls['nmdsId'].markAsDirty();

        fireEvent.click(getByText('Save this ID'));

        fixture.detectChanges();

        expect(form.valid).toBeFalsy();
        expect(getByText('Workplace ID must be 8 characters long', { exact: false })).toBeTruthy();
        expect(registrationsServiceSpy).not.toHaveBeenCalled();
      });

      it('shows length error message if workplace ID is longer than 8 characters', async () => {
        const { component, fixture, getByText } = await setup();

        const form = component.workplaceIdForm;
        const registrationsServiceSpy = spyOn(component.registrationsService, 'updateWorkplaceId');

        form.controls['nmdsId'].setValue('A123123123');
        form.controls['nmdsId'].markAsDirty();

        fireEvent.click(getByText('Save this ID'));

        fixture.detectChanges();

        expect(form.valid).toBeFalsy();
        expect(getByText('Workplace ID must be 8 characters long', { exact: false })).toBeTruthy();
        expect(registrationsServiceSpy).not.toHaveBeenCalled();
      });

      it('validates that a Workplace ID must start with an uppercase letter', async () => {
        const { component, fixture, getByText } = await setup();

        const form = component.workplaceIdForm;
        const registrationsServiceSpy = spyOn(component.registrationsService, 'updateWorkplaceId');

        form.controls['nmdsId'].setValue('a1231231');
        form.controls['nmdsId'].markAsDirty();

        fireEvent.click(getByText('Save this ID'));

        fixture.detectChanges();

        expect(form.valid).toBeFalsy();
        expect(getByText('Workplace ID must start with an uppercase letter', { exact: false })).toBeTruthy();
        expect(registrationsServiceSpy).not.toHaveBeenCalled();
      });
    });

    it('validates that a Workplace ID cannot be the same as an existing Workplace ID', async () => {
      const { component, fixture, getByText } = await setup();

      const form = component.workplaceIdForm;
      const mockErrorResponse = new HttpErrorResponse({
        status: 400,
        statusText: 'Bad Request',
        error: {
          nmdsId: 'This workplace ID (A1231231) belongs to another workplace, enter a different workplace ID',
        },
      });

      spyOn(component.registrationsService, 'updateWorkplaceId').and.returnValue(throwError(mockErrorResponse));

      form.controls['nmdsId'].setValue('A1231231');
      form.controls['nmdsId'].markAsDirty();

      fireEvent.click(getByText('Save this ID'));

      fixture.detectChanges();

      expect(
        getByText(`This workplace ID (A1231231) belongs to another workplace, enter a different workplace ID`),
      ).toBeTruthy();
    });
  });
});
