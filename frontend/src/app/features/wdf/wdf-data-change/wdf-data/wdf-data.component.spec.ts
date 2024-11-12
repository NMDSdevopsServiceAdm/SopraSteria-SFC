import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { BrowserModule } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { Establishment } from '@core/model/establishment.model';
import { Worker } from '@core/model/worker.model';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { ReportService } from '@core/services/report.service';
import { UserService } from '@core/services/user.service';
import { WorkerService } from '@core/services/worker.service';
import { MockBreadcrumbService } from '@core/test-utils/MockBreadcrumbService';
import { establishmentBuilder, MockEstablishmentService } from '@core/test-utils/MockEstablishmentService';
import { MockFeatureFlagsService } from '@core/test-utils/MockFeatureFlagService';
import { MockPermissionsService } from '@core/test-utils/MockPermissionsService';
import { MockReportService } from '@core/test-utils/MockReportService';
import { MockWorkerService, workerBuilder } from '@core/test-utils/MockWorkerService';
import { FeatureFlagsService } from '@shared/services/feature-flags.service';
import { SharedModule } from '@shared/shared.module';
import { getByText, render } from '@testing-library/angular';

import { WdfModule } from '../wdf.module';
import { WdfDataComponent } from './wdf-data.component';

describe('WdfDataComponent', () => {

  const setup = async () => {
    const establishment = establishmentBuilder() as Establishment;

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
        { provide: FeatureFlagsService, useClass: MockFeatureFlagsService },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { data: { workplace: establishment }, params: { establishmentuid: 'abc123' } },
          },
        },
      ],
    });
    const component = fixture.componentInstance;

    return { component, fixture, getByText, getAllByText, getByTestId, queryByText, establishment };
  };

  it('should render a WdfDataComponent', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  describe('Header', () => {
    it('should display workplace name and Id in pre-header', async () => {
      const { component, fixture, getByTestId, establishment } = await setup();


      expect(getByTestId('pre-header').innerHTML).toContain(establishment.name);
      expect(getByTestId('pre-header').innerHTML).toContain(establishment.nmdsId);
    })

    it('should display header text', async () => {
      const { component, getByText } = await setup();
      const headerText = 'Your data';

      expect(getByText(headerText)).toBeTruthy();
    })
  })

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

  describe('WdfDataStatusMessageComponent', async () => {
    it('should display the correct message and timeframe if meeting WDF requirements', async () => {
      const { component, fixture, getByText } = await setup();
      const year = new Date().getFullYear();
      const timeFrameSentence = `Your data meets the WDF ${year} to ${year + 1} requirements`;

      component.isStandalone = true;
      component.wdfEligibilityStatus.overall = true;
      component.wdfEligibilityStatus.currentWorkplace = true;
      component.wdfEligibilityStatus.currentStaff = true;
      fixture.detectChanges();

      expect(getByText(timeFrameSentence, { exact: false })).toBeTruthy();
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
      const year = new Date().getFullYear();
      const notMeetingMessage = `Your data does not meet the WDF ${year} to ${year + 1} requirements`;

      component.isStandalone = true;
      component.wdfEligibilityStatus.overall = false;
      fixture.detectChanges();

      expect(getByText(notMeetingMessage, { exact: false })).toBeTruthy();
    });

    it('should display the correct message and timeframe for parents if meeting WDF requirements', async () => {
      const { component, fixture, getByText } = await setup();
      const year = new Date().getFullYear();
      const timeFrameSentence = `Your data meets the WDF ${year} to ${year + 1} requirements`;

      component.isStandalone = false;
      component.wdfEligibilityStatus.overall = true;
      component.wdfEligibilityStatus.currentWorkplace = true;
      component.wdfEligibilityStatus.currentStaff = true;
      fixture.detectChanges();

      expect(getByText(timeFrameSentence, { exact: false })).toBeTruthy();
    });

    it('should display the "keeping data up to date" message for parents if meeting WDF requirements with data changes', async () => {
      const { component, fixture, getByText } = await setup();
      const year = new Date().getFullYear();
      const keepUpToDateMessage = `Your workplace met the WDF ${year} to ${
        year + 1
      } requirements, but keeping your data up to date will save you time next year`;

      component.isStandalone = false;
      component.wdfEligibilityStatus.overall = true;
      component.wdfEligibilityStatus.currentWorkplace = false;
      component.wdfEligibilityStatus.currentStaff = false;
      fixture.detectChanges();

      expect(getByText(keepUpToDateMessage, { exact: false })).toBeTruthy();
    });

    it('should display the not meeting message for parents if not meeting WDF requirements overall', async () => {
      const { component, fixture, getByText } = await setup();
      const year = new Date().getFullYear();
      const notMeetingMessage = `Your data does not meet the WDF ${year} to ${year + 1} requirements`;

      component.isStandalone = false;
      component.wdfEligibilityStatus.overall = false;
      fixture.detectChanges();

      expect(getByText(notMeetingMessage, { exact: false })).toBeTruthy();
    });
  });
});
