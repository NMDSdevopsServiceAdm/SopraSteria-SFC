import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { BrowserModule } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { Worker } from '@core/model/worker.model';
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
import { FeatureFlagsService } from '@shared/services/feature-flags.service';

import { WdfModule } from '../wdf.module';
import { WdfDataComponent } from './wdf-data.component';
import { MockFeatureFlagsService } from '@core/test-utils/MockFeatureFlagService';
import { WdfStaffSummaryComponent } from '../wdf-staff-summary/wdf-staff-summary.component';
import { WdfSummaryPanel } from '@shared/components/wdf-summary-panel/wdf-summary-panel.component';

describe('WdfDataComponent', () => {
  const setup = async () => {
    const { fixture, getByText, getAllByText, getByTestId, queryByText } = await render(WdfDataComponent, {
      imports: [RouterTestingModule, HttpClientTestingModule, BrowserModule, SharedModule, WdfModule],
      declarations: [WdfStaffSummaryComponent, WdfSummaryPanel],
      providers: [
        { provide: BreadcrumbService, useClass: MockBreadcrumbService },
        { provide: EstablishmentService, useClass: MockEstablishmentService },
        { provide: ReportService, useClass: MockReportService },
        { provide: WorkerService, useClass: MockWorkerService },
        {
          provide: PermissionsService,
          useFactory: MockPermissionsService.factory(['canViewWorker', 'canEditWorker']),
          deps: [HttpClient, Router, UserService],
        },
        { provide: FeatureFlagsService, useClass: MockFeatureFlagsService },
      ],
      componentProperties: {
        workerCount: 1,
      },
    });
    const component = fixture.componentInstance;

    return { component, fixture, getByText, getAllByText, getByTestId, queryByText };
  };

  it('should render a WdfDataComponent', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should display the workplace name and the nmds ID in brackets in caption above title', async () => {
    const { component, getByText } = await setup();

    const workplaceName = component.workplace.name;
    const nmdsId = component.workplace.nmdsId;
    const expectedTitleCaption = `${workplaceName} (Workplace ID: ${nmdsId})`;

    expect(getByText(expectedTitleCaption)).toBeTruthy();
  });

  it('should display the page with title', async () => {
    const { getByText } = await setup();

    const pageTitle = 'Your data';

    expect(getByText(pageTitle)).toBeTruthy();
  });

  it('should display the summary panel', async () => {
    const { getByTestId } = await setup();

    expect(getByTestId('summaryPanel')).toBeTruthy();
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

      component.workers = [workerBuilder(), workerBuilder(), workerBuilder()] as Worker[];
      component.workers[0].wdfEligible = true;
      component.workers[1].wdfEligible = true;
      component.workers[2].wdfEligible = true;
      fixture.detectChanges();

      expect(component.getStaffWdfEligibility(component.workers)).toBeTrue();
    });

    it('should return false when any worker is not WDF eligible', async () => {
      const { component, fixture } = await setup();

      component.workers = [workerBuilder(), workerBuilder(), workerBuilder()] as Worker[];
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
});
