import { HttpClientTestingModule } from '@angular/common/http/testing';
import { BrowserModule } from '@angular/platform-browser';
import { RouterTestingModule } from '@angular/router/testing';
import { SharedModule } from '@shared/shared.module';
import { render } from '@testing-library/angular';

import { establishmentBuilder } from '../../../../../server/test/factories/models';
import { WdfStaffMismatchMessageComponent } from './wdf-staff-mismatch-message.component';

describe('WdfStaffMismatchMessageComponent', () => {
  const setup = async () => {
    const { fixture, getByText, getAllByText, getByTestId, queryByText } = await render(
      WdfStaffMismatchMessageComponent,
      {
        imports: [RouterTestingModule, HttpClientTestingModule, BrowserModule, SharedModule],
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

    const expectedStaffMismatchMessage = "You've more staff than staff records.";
    expect(component.staffMismatchMessage).toEqual(expectedStaffMismatchMessage);
  });

  it('should show staff mismatch message if you have more staff records than staff', async () => {
    const { component, fixture } = await setup();
    component.workerCount = 10;
    component.workplace.numberOfStaff = 9;
    component.setMessage();
    fixture.detectChanges();

    const expectedStaffMismatchMessage = "You've more staff records than staff.";
    expect(component.staffMismatchMessage).toEqual(expectedStaffMismatchMessage);
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
});
