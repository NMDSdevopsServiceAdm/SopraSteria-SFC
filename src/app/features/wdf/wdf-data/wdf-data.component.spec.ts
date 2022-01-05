import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { BrowserModule } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { ReportService } from '@core/services/report.service';
import { UserService } from '@core/services/user.service';
import { WorkerService } from '@core/services/worker.service';
import { MockBreadcrumbService } from '@core/test-utils/MockBreadcrumbService';
import { MockEstablishmentService } from '@core/test-utils/MockEstablishmentService';
import { MockPermissionsService } from '@core/test-utils/MockPermissionsService';
import { MockReportService } from '@core/test-utils/MockReportService';
import { MockWorkerService, workerBuilder } from '@core/test-utils/MockWorkerService';
import { SharedModule } from '@shared/shared.module';
import { render } from '@testing-library/angular';

import { WdfModule } from '../wdf.module';
import { WdfDataComponent } from './wdf-data.component';

describe('WdfDataComponent', () => {
  const setup = async () => {
    const { fixture, getByText, getAllByText, getByTestId, queryByText } = await render(WdfDataComponent, {
      imports: [RouterTestingModule, HttpClientTestingModule, BrowserModule, SharedModule, WdfModule],
      providers: [
        { provide: BreadcrumbService, useClass: MockBreadcrumbService },
        { provide: EstablishmentService, useClass: MockEstablishmentService },
        { provide: ReportService, useClass: MockReportService },
        { provide: WorkerService, useClass: MockWorkerService },
        {
          provide: PermissionsService,
          useFactory: MockPermissionsService.factory(['canViewWorker']),
          deps: [HttpClient, Router, UserService],
        },
      ],
    });
    const component = fixture.componentInstance;

    return { component, fixture, getByText, getAllByText, getByTestId, queryByText };
  };

  it('should render a WdfDataComponent', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  describe('Tab icons', async () => {
    it('should display a green tick on the workplace tab when the user has qualified for WDF and workplace is still eligible', async () => {
      const { component, fixture, getByText } = await setup();
      const greenTickVisuallyHiddenMessage = 'Green tick';

      component.wdfEligibilityStatus.currentWorkplace = true;
      component.wdfEligibilityStatus.currentStaff = false;
      fixture.detectChanges();

      expect(getByText(greenTickVisuallyHiddenMessage, { exact: false })).toBeTruthy();
    });

    it('should display a green tick in staff tab when the user has qualified for WDF and is still eligible', async () => {
      const { component, fixture, getByText } = await setup();
      const greenTickVisuallyHiddenMessage = 'Green tick';

      component.wdfEligibilityStatus.currentWorkplace = false;
      component.wdfEligibilityStatus.currentStaff = true;
      fixture.detectChanges();

      expect(getByText(greenTickVisuallyHiddenMessage, { exact: false })).toBeTruthy();
    });

    it('should display a green tick on the workplace tab when the user has not qualified for WDF but workplace is currently eligible', async () => {
      const { component, fixture, getByText } = await setup();
      const greenTickVisuallyHiddenMessage = 'Green tick';

      component.wdfEligibilityStatus.overall = false;
      component.wdfEligibilityStatus.currentWorkplace = true;
      component.wdfEligibilityStatus.currentStaff = false;
      fixture.detectChanges();

      expect(getByText(greenTickVisuallyHiddenMessage, { exact: false })).toBeTruthy();
    });

    it('should display a green tick on the staff tab and the workplace tab when the user has qualified for WDF and staff records and workplace are still eligible', async () => {
      const { component, fixture, getAllByText } = await setup();
      const greenTickVisuallyHiddenMessage = 'Green tick';

      component.wdfEligibilityStatus.currentWorkplace = true;
      component.wdfEligibilityStatus.currentStaff = true;
      fixture.detectChanges();

      expect(getAllByText(greenTickVisuallyHiddenMessage, { exact: false }).length).toBe(2);
    });

    it('should display an orange flag on the workplace tab when the user has qualified for WDF but workplace is no longer eligible', async () => {
      const { component, fixture, getByText } = await setup();
      const orangeFlagVisuallyHiddenMessage = 'Orange warning flag';

      component.wdfEligibilityStatus.currentWorkplace = false;
      component.wdfEligibilityStatus.currentStaff = true;
      fixture.detectChanges();

      expect(getByText(orangeFlagVisuallyHiddenMessage, { exact: false })).toBeTruthy();
    });

    it('should display an orange flag on the staff tab when the user has qualified for WDF but staff records are no longer eligible', async () => {
      const { component, fixture, getByText } = await setup();
      const orangeFlagVisuallyHiddenMessage = 'Orange warning flag';

      component.wdfEligibilityStatus.currentWorkplace = true;
      component.wdfEligibilityStatus.currentStaff = false;
      fixture.detectChanges();

      expect(getByText(orangeFlagVisuallyHiddenMessage, { exact: false })).toBeTruthy();
    });

    it('should display an orange flag on the staff tab and workplace tab when the user has qualified for WDF but staff records and workplace are no longer eligible', async () => {
      const { component, fixture, getAllByText } = await setup();
      const orangeFlagVisuallyHiddenMessage = 'Orange warning flag';

      component.wdfEligibilityStatus.currentWorkplace = false;
      component.wdfEligibilityStatus.currentStaff = false;
      fixture.detectChanges();

      expect(getAllByText(orangeFlagVisuallyHiddenMessage, { exact: false }).length).toBe(2);
    });

    it('should display a red cross on the workplace tab when the user has not qualified for WDF and workplace is not currently eligible', async () => {
      const { component, fixture, getByText } = await setup();
      const redCrossVisuallyHiddenMessage = 'Red cross';

      component.wdfEligibilityStatus.overall = false;
      component.wdfEligibilityStatus.currentWorkplace = false;
      component.wdfEligibilityStatus.currentStaff = true;
      fixture.detectChanges();

      expect(getByText(redCrossVisuallyHiddenMessage, { exact: false })).toBeTruthy();
    });

    it('should display a red cross on the staff tab when the user has not qualified for WDF and staff records are not currently eligible', async () => {
      const { component, fixture, getByText } = await setup();
      const redCrossVisuallyHiddenMessage = 'Red cross';

      component.wdfEligibilityStatus.overall = false;
      component.wdfEligibilityStatus.currentStaff = false;
      component.wdfEligibilityStatus.currentWorkplace = true;

      fixture.detectChanges();

      expect(getByText(redCrossVisuallyHiddenMessage, { exact: false })).toBeTruthy();
    });

    it('should display a red cross on the staff tab and workplace tab when the user has not qualified for WDF and staff records and workplace are not currently eligible', async () => {
      const { component, fixture, getAllByText } = await setup();
      const redCrossVisuallyHiddenMessage = 'Red cross';

      component.wdfEligibilityStatus.overall = false;
      component.wdfEligibilityStatus.currentWorkplace = false;
      component.wdfEligibilityStatus.currentStaff = false;
      fixture.detectChanges();

      expect(getAllByText(redCrossVisuallyHiddenMessage, { exact: false }).length).toBe(2);
    });
  });

  describe('getStaffWdfEligibility', () => {
    it('should return true when all workers are WDF eligible', async () => {
      const { component, fixture } = await setup();

      component.workers = [workerBuilder(), workerBuilder(), workerBuilder()];
      component.workers[0].wdfEligible = true;
      component.workers[1].wdfEligible = true;
      component.workers[2].wdfEligible = true;
      fixture.detectChanges();

      expect(component.getStaffWdfEligibility(component.workers)).toBeTrue();
    });

    it('should return false when any worker is not WDF eligible', async () => {
      const { component, fixture } = await setup();

      component.workers = [workerBuilder(), workerBuilder(), workerBuilder()];
      component.workers[0].wdfEligible = true;
      component.workers[1].wdfEligible = false;
      component.workers[2].wdfEligible = true;
      fixture.detectChanges();

      expect(component.getStaffWdfEligibility(component.workers)).toBeFalse();
    });

    it('should return false when there are no workers', async () => {
      const { component, fixture } = await setup();

      component.workers = [];
      fixture.detectChanges();

      expect(component.getStaffWdfEligibility(component.workers)).toBeFalse();
    });
  });

  describe('WdfDataStatusMessageComponent', async () => {
    it('should display the correct message and timeframe if meeting WDF requirements', async () => {
      const { component, fixture, getByText } = await setup();
      const timeframeSentence = 'Your data meets the WDF 2021 to 2022 requirements';

      component.isStandalone = true;
      component.wdfEligibilityStatus.overall = true;
      component.wdfEligibilityStatus.currentWorkplace = true;
      component.wdfEligibilityStatus.currentStaff = true;
      fixture.detectChanges();

      expect(getByText(timeframeSentence, { exact: false })).toBeTruthy();
    });

    it('should display the "Keeping data up to date" message if meeting WDF requirements with data changes', async () => {
      const { component, fixture, getByText } = await setup();
      const keepUpToDateMessage = 'Keeping your data up to date will save you time next year';

      component.isStandalone = true;
      component.wdfEligibilityStatus.overall = true;
      component.wdfEligibilityStatus.currentWorkplace = true;
      component.wdfEligibilityStatus.currentStaff = false;
      fixture.detectChanges();

      expect(getByText(keepUpToDateMessage, { exact: false })).toBeTruthy();
    });

    it('should display the not meeting message if not meeting WDF requirements overall', async () => {
      const { component, fixture, getByText } = await setup();
      const notMeetingMessage = 'Your data does not meet the WDF 2021 to 2022 requirements';

      component.isStandalone = true;
      component.wdfEligibilityStatus.overall = false;
      fixture.detectChanges();

      expect(getByText(notMeetingMessage, { exact: false })).toBeTruthy();
    });

    it('should display the correct message and timeframe for parents if meeting WDF requirements', async () => {
      const { component, fixture, getByText } = await setup();
      const timeframeSentence = 'Your data meets the WDF 2021 to 2022 requirements';

      component.isStandalone = false;
      component.wdfEligibilityStatus.overall = true;
      component.wdfEligibilityStatus.currentWorkplace = true;
      component.wdfEligibilityStatus.currentStaff = true;
      fixture.detectChanges();

      expect(getByText(timeframeSentence, { exact: false })).toBeTruthy();
    });

    it('should display the "keeping data up to date" message for parents if meeting WDF requirements with data changes', async () => {
      const { component, fixture, getByText } = await setup();
      const keepUpToDateMessage =
        'Your workplace met the WDF 2021 to 2022 requirements, but keeping your data up to date will save you time next year';

      component.isStandalone = false;
      component.wdfEligibilityStatus.overall = true;
      component.wdfEligibilityStatus.currentWorkplace = false;
      component.wdfEligibilityStatus.currentStaff = false;
      fixture.detectChanges();

      expect(getByText(keepUpToDateMessage, { exact: false })).toBeTruthy();
    });

    it('should display the not meeting message for parents if not meeting WDF requirements overall', async () => {
      const { component, fixture, getByText } = await setup();
      const notMeetingMessage = 'Your data does not meet the WDF 2021 to 2022 requirements';

      component.isStandalone = false;
      component.wdfEligibilityStatus.overall = false;
      fixture.detectChanges();

      expect(getByText(notMeetingMessage, { exact: false })).toBeTruthy();
    });
  });
});
