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

import { WdfModule } from '../wdf.module.js';
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
  });

  describe('WdfStatusMessageComponent', async () => {
    it('should display the correct message and timeframe if meeting WDF requirements', async () => {
      const { component, fixture, getByText } = await setup();
      const timeframeSentence = 'Your data meets the WDF 2021 to 2022 requirements';

      component.wdfEligibilityStatus.overall = true;
      component.wdfEligibilityStatus.currentWorkplace = true;
      component.wdfEligibilityStatus.currentStaff = true;
      fixture.detectChanges();

      expect(getByText(timeframeSentence, { exact: false })).toBeTruthy();
    });

    it('should display the "Keeping data up to date" message if meeting WDF requirements with data changes', async () => {
      const { component, fixture, getByText } = await setup();
      const keepUpToDateMessage = 'Keeping your data up to date will save you time next year';

      component.wdfEligibilityStatus.overall = true;
      component.wdfEligibilityStatus.currentWorkplace = true;
      component.wdfEligibilityStatus.currentStaff = false;
      fixture.detectChanges();

      expect(getByText(keepUpToDateMessage, { exact: false })).toBeTruthy();
    });
  });
});
