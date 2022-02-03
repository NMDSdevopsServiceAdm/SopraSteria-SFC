import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { BrowserModule } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { Establishment } from '@core/model/establishment.model';
import { EstablishmentService } from '@core/services/establishment.service';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { ReportService } from '@core/services/report.service';
import { UserService } from '@core/services/user.service';
import { MockEstablishmentService } from '@core/test-utils/MockEstablishmentService';
import { MockPermissionsService } from '@core/test-utils/MockPermissionsService';
import { MockReportService } from '@core/test-utils/MockReportService';
import { SharedModule } from '@shared/shared.module';
import { render } from '@testing-library/angular';

import { establishmentBuilder, workerBuilder } from '../../../../../../server/test/factories/models';
import { WdfModule } from '../wdf.module';
import { WdfStaffSummaryComponent } from './wdf-staff-summary.component';

describe('WdfStaffSummaryComponent', () => {
  const setup = async () => {
    const { fixture, getByText, getAllByText, getByTestId, queryByText } = await render(WdfStaffSummaryComponent, {
      imports: [RouterTestingModule, HttpClientTestingModule, BrowserModule, SharedModule, WdfModule],
      providers: [
        { provide: ReportService, useClass: MockReportService },
        {
          provide: PermissionsService,
          useFactory: MockPermissionsService.factory(['canViewWorker']),
          deps: [HttpClient, Router, UserService],
        },
        { provide: EstablishmentService, useClass: MockEstablishmentService },
      ],
      componentProperties: {
        workplace: establishmentBuilder() as Establishment,
        workers: [workerBuilder(), workerBuilder(), workerBuilder()],
      },
    });
    const component = fixture.componentInstance;

    return { component, fixture, getByText, getAllByText, getByTestId, queryByText };
  };

  it('should render a WdfStaffSummaryComponent', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should display green ticks on 3 staff records when the user has qualified for WDF and all staff records are eligible', async () => {
    const { component, fixture, getAllByText } = await setup();
    const greenTickVisuallyHiddenMessage = 'Green tick';
    const meetingMessage = 'Meeting';

    component.overallWdfEligibility = true;
    component.workers[0].wdfEligible = true;
    component.workers[1].wdfEligible = true;
    component.workers[2].wdfEligible = true;
    fixture.detectChanges();

    expect(getAllByText(greenTickVisuallyHiddenMessage, { exact: false }).length).toBe(3);
    expect(getAllByText(meetingMessage, { exact: true }).length).toBe(3);
  });

  it('should display an orange flag on staff record when the user has qualified for WDF but 1 staff record is no longer eligible', async () => {
    const { component, fixture, getByText } = await setup();
    const orangeFlagVisuallyHiddenMessage = 'Orange warning flag';
    const notMeetingMessage = 'Not meeting';

    component.overallWdfEligibility = true;
    component.workers[0].wdfEligible = false;
    component.workers[1].wdfEligible = true;
    component.workers[2].wdfEligible = true;
    fixture.detectChanges();

    expect(getByText(orangeFlagVisuallyHiddenMessage, { exact: false })).toBeTruthy();
    expect(getByText(notMeetingMessage, { exact: true })).toBeTruthy();
  });

  it('should display one orange flag and two green flags when the user has qualified for WDF but 1 staff record is no longer eligible and two still are', async () => {
    const { component, fixture, getByText, getAllByText } = await setup();
    const orangeFlagVisuallyHiddenMessage = 'Orange warning flag';
    const notMeetingMessage = 'Not meeting';
    const greenTickVisuallyHiddenMessage = 'Green tick';
    const meetingMessage = 'Meeting';

    component.overallWdfEligibility = true;
    component.workers[0].wdfEligible = false;
    component.workers[1].wdfEligible = true;
    component.workers[2].wdfEligible = true;
    fixture.detectChanges();

    expect(getByText(orangeFlagVisuallyHiddenMessage, { exact: false })).toBeTruthy();
    expect(getByText(notMeetingMessage, { exact: true })).toBeTruthy();
    expect(getAllByText(greenTickVisuallyHiddenMessage, { exact: false }).length).toBe(2);
    expect(getAllByText(meetingMessage, { exact: true }).length).toBe(2);
  });

  it('should display a red cross on staff record when the user has not qualified for WDF overall and 1 staff record is not eligible', async () => {
    const { component, fixture, getByText } = await setup();
    const redCrossVisuallyHiddenMessage = 'Red cross';
    const notMeetingMessage = 'Not meeting';

    component.overallWdfEligibility = false;
    component.workers[0].wdfEligible = false;
    component.workers[1].wdfEligible = true;
    component.workers[2].wdfEligible = true;
    fixture.detectChanges();

    expect(getByText(redCrossVisuallyHiddenMessage, { exact: false })).toBeTruthy();
    expect(getByText(notMeetingMessage, { exact: true })).toBeTruthy();
  });

  it('should display two red crosses and one green tick when the user has not qualified for WDF but 1 staff record is eligible and two are not', async () => {
    const { component, fixture, getByText, getAllByText } = await setup();
    const redCrossVisuallyHiddenMessage = 'Red cross';
    const notMeetingMessage = 'Not meeting';
    const greenTickVisuallyHiddenMessage = 'Green tick';
    const meetingMessage = 'Meeting';

    component.overallWdfEligibility = false;
    component.workers[0].wdfEligible = false;
    component.workers[1].wdfEligible = true;
    component.workers[2].wdfEligible = false;
    fixture.detectChanges();

    expect(getAllByText(redCrossVisuallyHiddenMessage, { exact: false }).length).toBe(2);
    expect(getAllByText(notMeetingMessage, { exact: true }).length).toBe(2);
    expect(getByText(greenTickVisuallyHiddenMessage, { exact: false })).toBeTruthy();
    expect(getByText(meetingMessage, { exact: true })).toBeTruthy();
  });
});
