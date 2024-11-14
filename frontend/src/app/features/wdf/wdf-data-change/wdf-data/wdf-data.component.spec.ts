import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { BrowserModule } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
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
import { MockFeatureFlagsService } from '@core/test-utils/MockFeatureFlagService';
import { MockPermissionsService } from '@core/test-utils/MockPermissionsService';
import { MockReportService } from '@core/test-utils/MockReportService';
import { MockWorkerService, workerBuilder } from '@core/test-utils/MockWorkerService';
import { WdfSummaryPanel } from '@shared/components/wdf-summary-panel/wdf-summary-panel.component';
import { FeatureFlagsService } from '@shared/services/feature-flags.service';
import { SharedModule } from '@shared/shared.module';
import { getByText, render } from '@testing-library/angular';
import { of } from 'rxjs';

import { WdfStaffSummaryComponent } from '../wdf-staff-summary/wdf-staff-summary.component';
import { WdfModule } from '../wdf.module';
import { WdfDataComponent } from './wdf-data.component';

describe('WdfDataComponent', () => {
  const setup = async (overrides: any = {}) => {
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
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { params: { establishmentuid: '98a83eef-e1e1-49f3-89c5-b1287a3cc8de' } },
            fragment: of(overrides.fragment ?? undefined),
          },
        },
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

  it('should display the summary panel', async () => {
    const { getByTestId } = await setup();

    expect(getByTestId('summaryPanel')).toBeTruthy();
  });

  describe('Header', () => {
    it('should display the workplace name and the nmds ID in brackets in caption above title', async () => {
      const { component, getByTestId } = await setup();


      expect(getByTestId('pre-header').innerHTML).toContain(component.workplace.name);
      expect(getByTestId('pre-header').innerHTML).toContain(component.workplace.nmdsId);
    })

    it('should display header text', async () => {
      const { component, getByText } = await setup();
      const headerText = 'Your data';

      expect(getByText(headerText)).toBeTruthy();
    })
  })

  describe('Tabs', () => {
    it('should display the workplace tab when no fragment in params', async () => {
      const { fixture, getByTestId } = await setup();

      fixture.detectChanges()
      expect(getByTestId('workplaceSummaryTab')).toBeTruthy();
    });

    it('should display the workplace tab when workplace fragment in params', async () => {
      const { fixture, getByTestId } = await setup({ fragment: 'workplace' });

      fixture.detectChanges()
      expect(getByTestId('workplaceSummaryTab')).toBeTruthy();
    });

    it('should display the staff records tab when staff-records fragment in params', async () => {
      const { fixture, getByTestId } = await setup({ fragment: 'staff' });

      fixture.detectChanges()
      expect(getByTestId('staffRecordsTab')).toBeTruthy();
    });
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
});
