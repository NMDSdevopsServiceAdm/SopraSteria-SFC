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
import { MockRegistrationsService } from '@core/test-utils/MockRegistrationsService';
import { MockSwitchWorkplaceService } from '@core/test-utils/MockSwitchWorkplaceService';
import { FeatureFlagsService } from '@shared/services/feature-flags.service';
import { SharedModule } from '@shared/shared.module';
import { fireEvent, render } from '@testing-library/angular';
import { of } from 'rxjs';

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
              paramMap: {
                get() {
                  'uidForAddedWorkplace';
                },
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
    expect(queryAllByText('Test Workplace', { exact: false }).length).toBe(2);
  });

  it('should display the workplace address', async () => {
    const { getByText } = await setup();

    expect(getByText('Address line 1', { exact: false })).toBeTruthy();
    expect(getByText('Somewhere', { exact: false })).toBeTruthy();
    expect(getByText('Third Line Place', { exact: false })).toBeTruthy();
    expect(getByText('ABC123', { exact: false })).toBeTruthy();
    expect(getByText('Wessex', { exact: false })).toBeTruthy();
    expect(getByText('Nowhereville', { exact: false })).toBeTruthy();
  });

  it('should display the provider ID and location ID', async () => {
    const { getByText } = await setup();

    const locationId = '1234';
    const provid = '15111';

    expect(getByText(locationId, { exact: false })).toBeTruthy();
    expect(getByText(provid, { exact: false })).toBeTruthy();
  });

  it('should display the date and time that the request was received', async () => {
    const { getByText } = await setup();

    const receivedDate = 'Received 1/1/2021 12:00am';

    expect(getByText(receivedDate, { exact: false })).toBeTruthy();
  });

  it('should call navigateToWorkplace in switchWorkplaceService when the parentId link is clicked', async () => {
    const { fixture, getByText } = await setup();

    const switchWorkplaceService = TestBed.inject(SwitchWorkplaceService);

    const switchWorkplaceServiceSpy = spyOn(switchWorkplaceService, 'navigateToWorkplace');

    const parentIdLink = getByText('6311133333333', { exact: false });
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

        form.controls['nmdsId'].setValue('');
        form.controls['nmdsId'].markAsDirty();

        fireEvent.click(getByText('Save this ID'));

        fixture.detectChanges();

        expect(form.valid).toBeFalsy();
        expect(getByText('To update, enter a valid workplace ID', { exact: false })).toBeTruthy();
      });

      it('shows length error message if workplace ID is shorter than 8 characters', async () => {
        const { component, fixture, getByText } = await setup();

        const form = component.workplaceIdForm;

        form.controls['nmdsId'].setValue('A1');
        form.controls['nmdsId'].markAsDirty();

        fireEvent.click(getByText('Save this ID'));

        fixture.detectChanges();

        expect(form.valid).toBeFalsy();
        expect(getByText('Workplace ID must be 8 characters long', { exact: false })).toBeTruthy();
      });

      it('shows length error message if workplace ID is longer than 8 characters', async () => {
        const { component, fixture, getByText } = await setup();

        const form = component.workplaceIdForm;

        form.controls['nmdsId'].setValue('A123123123');
        form.controls['nmdsId'].markAsDirty();

        fireEvent.click(getByText('Save this ID'));

        fixture.detectChanges();

        expect(form.valid).toBeFalsy();
        expect(getByText('Workplace ID must be 8 characters long', { exact: false })).toBeTruthy();
      });

      it('validates that a Workplace ID must start with an uppercase letter', async () => {
        const { component, fixture, getByText } = await setup();

        const form = component.workplaceIdForm;

        form.controls['nmdsId'].setValue('a1231231');
        form.controls['nmdsId'].markAsDirty();

        fireEvent.click(getByText('Save this ID'));

        fixture.detectChanges();

        expect(form.valid).toBeFalsy();
        expect(getByText('Workplace ID must start with an uppercase letter', { exact: false })).toBeTruthy();
      });
    });
  });
});
