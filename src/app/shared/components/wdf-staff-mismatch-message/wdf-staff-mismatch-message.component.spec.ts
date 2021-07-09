import { HttpClientTestingModule } from '@angular/common/http/testing';
import { BrowserModule } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { EstablishmentService } from '@core/services/establishment.service';
import { MockEstablishmentService } from '@core/test-utils/MockEstablishmentService';
import { SharedModule } from '@shared/shared.module';
import { render } from '@testing-library/angular';

import { establishmentBuilder } from '../../../../../server/test/factories/models';
import { WdfStaffMismatchMessageComponent } from './wdf-staff-mismatch-message.component';

describe('WdfStaffMismatchMessageComponent', () => {
  const setup = async (uid = '') => {
    const { fixture, getByText, getAllByText, getByTestId, queryByText } = await render(
      WdfStaffMismatchMessageComponent,
      {
        imports: [RouterTestingModule, HttpClientTestingModule, BrowserModule, SharedModule],
        providers: [
          { provide: EstablishmentService, useClass: MockEstablishmentService },
          {
            provide: ActivatedRoute,
            useValue: {
              snapshot: {
                params: {
                  establishmentuid: uid,
                },
              },
            },
          },
        ],
        componentProperties: { workplace: establishmentBuilder(), workerCount: 1 },
      },
    );

    const component = fixture.componentInstance;
    return { component, fixture, getByText, getAllByText, getByTestId, queryByText };
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

  it('should show a red cross if the user is not meeting WDF overall', async () => {
    const { component, fixture } = await setup();
    component.workerCount = 10;
    component.workplace.numberOfStaff = 9;
    component.overallWdfEligibility = false;
    component.setIcon();
    fixture.detectChanges();

    const crossIcon = 'cross-icon';
    expect(component.icon).toEqual(crossIcon);
  });

  describe('setStaffRecordsUrl', async () => {
    it("should set URL to subs's staff records if user is a parent viewing their subsidiary", async () => {
      const { component, fixture } = await setup('123');
      const expectedUrl = { url: ['/workplace', '456'], fragment: 'staff-records' };

      component.primaryWorkplaceUid = '123';
      component.workplace.uid = '456';
      fixture.componentInstance.setStaffRecordsUrl();
      fixture.detectChanges();

      expect(component.staffRecordsUrl).toEqual(expectedUrl);
    });

    it('should set URL to staff records tab on dashboard if the user is the primary user', async () => {
      const { component, fixture } = await setup();
      const expectedUrl = { url: ['/dashboard'], fragment: 'staff-records' };

      component.primaryWorkplaceUid = '123';
      component.workplace.uid = '123';
      fixture.componentInstance.setStaffRecordsUrl();
      fixture.detectChanges();

      expect(component.staffRecordsUrl).toEqual(expectedUrl);
    });
  });
});
