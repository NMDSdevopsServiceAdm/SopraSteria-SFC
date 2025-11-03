import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { BrowserModule } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { Establishment } from '@core/model/establishment.model';
import { EstablishmentService } from '@core/services/establishment.service';
import { establishmentBuilder, MockEstablishmentService } from '@core/test-utils/MockEstablishmentService';
import { SharedModule } from '@shared/shared.module';
import { render } from '@testing-library/angular';

import { WdfStaffMismatchMessageComponent } from './wdf-staff-mismatch-message.component';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { MockPermissionsService } from '@core/test-utils/MockPermissionsService';
import { PermissionType } from '@core/model/permissions.model';

describe('WdfStaffMismatchMessageComponent', () => {
  const setup = async (overrides: any = {}) => {
    const userPermissions: PermissionType[] = overrides.isReadOnlyUser ? [] : ['canEditEstablishment'];

    const setupTools = await render(WdfStaffMismatchMessageComponent, {
      imports: [BrowserModule, SharedModule],
      providers: [
        { provide: EstablishmentService, useClass: MockEstablishmentService },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              params: {
                establishmentuid: overrides.uidInParams ?? null,
              },
            },
          },
        },
        {
          provide: PermissionsService,
          useFactory: MockPermissionsService.factory(userPermissions),
        },
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
      componentProperties: {
        workplace: overrides.workplace ?? (establishmentBuilder() as Establishment),
        workerCount: 1,
      },
    });

    const component = setupTools.fixture.componentInstance;
    return { ...setupTools, component };
  };

  it('should create', async () => {
    const component = await setup();
    expect(component).toBeTruthy();
  });

  it('should show staff mismatch message if you have more staff than staff records', async () => {
    const { component, fixture } = await setup();
    component.workerCount = 9;
    component.workplace.numberOfStaff = 10;
    component.setMessage();
    fixture.detectChanges();

    const expectedStaffMismatchMessage = "You've 1 more staff than staff records.";
    const addRecordsMessage = 'add more records';
    expect(component.staffMismatchMessage).toEqual(expectedStaffMismatchMessage);
    expect(component.addOrDeleteRecordsMessage).toEqual(addRecordsMessage);
  });

  it('should show staff mismatch message if you have more staff records than staff', async () => {
    const { component, fixture } = await setup();
    component.workerCount = 5;
    component.workplace.numberOfStaff = 4;
    component.setMessage();
    fixture.detectChanges();

    const expectedStaffMismatchMessage = "You've 1 more staff record than staff.";
    const deleteRecordsMessage = 'delete some records';
    expect(component.staffMismatchMessage).toEqual(expectedStaffMismatchMessage);
    expect(component.addOrDeleteRecordsMessage).toEqual(deleteRecordsMessage);
  });

  it('should show staff mismatch message pluralized if you have more staff records than staff', async () => {
    const { component, fixture } = await setup();
    component.workerCount = 10;
    component.workplace.numberOfStaff = 4;
    component.setMessage();
    fixture.detectChanges();

    const expectedStaffMismatchMessage = "You've 6 more staff records than staff.";
    const deleteRecordsMessage = 'delete some records';
    expect(component.staffMismatchMessage).toEqual(expectedStaffMismatchMessage);
    expect(component.addOrDeleteRecordsMessage).toEqual(deleteRecordsMessage);
  });

  it('should not show a "Either change the total" message when total staff is zero', async () => {
    const { component, fixture, queryByText } = await setup();
    component.workerCount = 4;
    component.workplace.numberOfStaff = 0;
    component.setMessage();
    fixture.detectChanges();

    const expectedStaffMismatchMessage = "You've 4 more staff records than staff.";
    expect(component.staffMismatchMessage).toEqual(expectedStaffMismatchMessage);

    expect(queryByText('Either change the total', { exact: false })).toBeFalsy();
  });

  it('should show an orange flag if the user is meeting WDF overall but has made changes', async () => {
    const { component, fixture } = await setup();
    component.workerCount = 10;
    component.workplace.numberOfStaff = 9;
    component.overallWdfEligibility = true;
    component.setIcon();
    fixture.detectChanges();

    const orangeFlagIcon = 'flag-orange';
    expect(component.icon).toEqual(orangeFlagIcon);
  });

  it('should show a red flag if the user is not meeting WDF overall', async () => {
    const { component, fixture } = await setup();
    component.workerCount = 10;
    component.workplace.numberOfStaff = 9;
    component.overallWdfEligibility = false;
    component.setIcon();
    fixture.detectChanges();

    const redFlagIcon = 'red-flag-wdf-table';
    expect(component.icon).toEqual(redFlagIcon);
  });

  describe('setStaffRecordsUrl', async () => {
    it("should set URL to subs's staff records if user is a parent viewing their subsidiary", async () => {
      const workplace = establishmentBuilder();
      workplace.uid = 'abc12323123';

      const { getByText } = await setup({ uidInParams: workplace.uid, workplace });

      const viewStaffRecordsLink = getByText('view staff records');
      expect((viewStaffRecordsLink as HTMLAnchorElement).href).toContain(`/subsidiary/${workplace.uid}/staff-records`);
    });

    it('should set URL to staff records tab on dashboard if the user is viewing primary workplace', async () => {
      const { getByText } = await setup();

      const viewStaffRecordsLink = getByText('view staff records');
      expect((viewStaffRecordsLink as HTMLAnchorElement).href).toContain(`dashboard#staff-records`);
    });

    it('should not show "view staff records" as a link when user is read-only', async () => {
      const { getByText } = await setup({ isReadOnlyUser: true });

      const viewStaffRecords = getByText(/view staff records/);
      expect(viewStaffRecords.getAttribute('href')).toEqual(null);
    });
  });
});
