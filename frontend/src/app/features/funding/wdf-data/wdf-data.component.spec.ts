import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
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
import { establishmentBuilder, MockEstablishmentService } from '@core/test-utils/MockEstablishmentService';
import { MockPermissionsService } from '@core/test-utils/MockPermissionsService';
import { createMockWdfReport, MockReportService } from '@core/test-utils/MockReportService';
import { MockWorkerService, workerBuilder } from '@core/test-utils/MockWorkerService';
import { SharedModule } from '@shared/shared.module';
import { render, within } from '@testing-library/angular';
import { of } from 'rxjs';

import { FundingModule } from '../funding.module';
import { WdfStaffSummaryComponent } from '../wdf-staff-summary/wdf-staff-summary.component';
import { WdfDataComponent } from './wdf-data.component';

describe('WdfDataComponent', () => {
  const report = createMockWdfReport();

  const setup = async (overrides: any = {}) => {
    const setupTools = await render(WdfDataComponent, {
      imports: [RouterTestingModule, HttpClientTestingModule, BrowserModule, SharedModule, FundingModule],
      declarations: [WdfStaffSummaryComponent],
      providers: [
        { provide: BreadcrumbService, useClass: MockBreadcrumbService },
        {
          provide: EstablishmentService,
          useClass: MockEstablishmentService,
        },
        { provide: ReportService, useClass: MockReportService },
        { provide: WorkerService, useClass: MockWorkerService },
        {
          provide: PermissionsService,
          useFactory: MockPermissionsService.factory(['canViewWorker', 'canEditWorker']),
          deps: [HttpClient, Router, UserService],
        },
        {
          provide: UserService,
          useValue: {
            getEstablishments: () => of(overrides.getEstablishments ?? null),
          },
        },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              data: { workplace: overrides.workplace ?? establishmentBuilder(), report },
              params: overrides.viewingSub ? { establishmentuid: '98a83eef-e1e1-49f3-89c5-b1287a3cc8de' } : {},
            },
            fragment: of(overrides.fragment ?? undefined),
          },
        },
      ],
      componentProperties: {
        workerCount: 1,
      },
    });

    const component = setupTools.fixture.componentInstance;
    const establishmentService = TestBed.inject(EstablishmentService);

    return { ...setupTools, component, establishmentService, report };
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
    describe('Parent or standalone', () => {
      it('should display the workplace name and the nmds ID in brackets in caption above title', async () => {
        const workplaceName = 'Mock Workplace Name';
        const workplace = establishmentBuilder();
        workplace.name = workplaceName;
        workplace.nmdsId = 'AB123456';

        const { getByText } = await setup({ workplace });

        const workplaceIdCaption = `(Workplace ID: ${workplace.nmdsId})`;

        expect(getByText(workplaceName, { selector: '.govuk-caption-xl' })).toBeTruthy();
        expect(getByText(workplaceIdCaption)).toBeTruthy();
      });

      it('should display header text', async () => {
        const { getByText } = await setup();
        const headerText = 'Your data';

        expect(getByText(headerText)).toBeTruthy();
      });
    });

    describe('Viewing sub workplace', () => {
      it('should display the parent workplace name and nmds ID in brackets in caption above title', async () => {
        const { establishmentService, getByText } = await setup({ viewingSub: true });
        const parentName = establishmentService.primaryWorkplace.name;
        const parentNmdsId = establishmentService.primaryWorkplace.nmdsId;

        expect(getByText(parentName)).toBeTruthy();
        expect(getByText(`(Workplace ID: ${parentNmdsId})`)).toBeTruthy();
      });

      it('should display the sub workplace name and data in title', async () => {
        const workplace = establishmentBuilder();
        workplace.name = 'Test Sub Workplace';

        const { getByText } = await setup({ workplace, viewingSub: true });

        expect(getByText(`${workplace.name}: data`)).toBeTruthy();
      });
    });
  });

  describe('Tabs', () => {
    it('should display the workplace tab when no fragment in params', async () => {
      const { fixture, getByTestId } = await setup();

      fixture.detectChanges();
      expect(getByTestId('workplaceSummaryTab')).toBeTruthy();
    });

    it('should display the workplace tab when workplace fragment in params', async () => {
      const { fixture, getByTestId } = await setup({ fragment: 'workplace' });

      fixture.detectChanges();
      expect(getByTestId('workplaceSummaryTab')).toBeTruthy();
    });

    it('should display the staff records tab when staff-records fragment in params', async () => {
      const { fixture, getByTestId } = await setup({ fragment: 'staff' });

      fixture.detectChanges();
      expect(getByTestId('staffRecordsTab')).toBeTruthy();
    });

    it("should have 'Your other workplaces' tab when workplace is parent", async () => {
      const workplace = establishmentBuilder();
      workplace.isParent = true;

      const { getByTestId } = await setup({ workplace });

      const tabSection = getByTestId('tabSection');

      expect(within(tabSection).queryByText('Your other workplaces')).toBeTruthy();
    });

    it('should display the Your other workplaces tab on page load when workplaces fragment in params', async () => {
      const { fixture, getByTestId } = await setup({ workplace: { isParent: true }, fragment: 'workplaces' });

      fixture.detectChanges();
      expect(getByTestId('yourOtherWorkplacesTab')).toBeTruthy();
    });

    it("should not have 'Your other workplaces' tab when workplace is not parent", async () => {
      const workplace = establishmentBuilder();
      workplace.isParent = false;

      const { getByTestId } = await setup({ workplace });

      const tabSection = getByTestId('tabSection');

      expect(within(tabSection).queryByText('Your other workplaces')).toBeFalsy();
    });
  });

  describe('Your other workplaces row in summary panel', () => {
    let getEstablishments;

    beforeEach(() => {
      const parent = establishmentBuilder();
      parent.isParent = true;

      getEstablishments = {
        primary: parent,
        subsidaries: {
          count: 2,
          establishments: [establishmentBuilder(), establishmentBuilder()],
        },
      };
    });

    it('should display the row when workplace is parent', async () => {
      const { getByTestId } = await setup({ workplace: getEstablishments.primary, getEstablishments });

      const yourOtherWorkplacesRow = getByTestId('workplaces-row');

      expect(yourOtherWorkplacesRow).toBeTruthy();
    });

    it('should display the met funding requirements message when subs all have overall eligibility', async () => {
      getEstablishments.primary.wdf = { overall: true };
      getEstablishments.subsidaries.establishments[0].wdf = { overall: true };
      getEstablishments.subsidaries.establishments[1].wdf = { overall: true };

      const { getByTestId } = await setup({ workplace: getEstablishments.primary, getEstablishments });

      const yourOtherWorkplacesRow = getByTestId('workplaces-row');

      expect(within(yourOtherWorkplacesRow).getByTestId('met-funding-message')).toBeTruthy();
    });

    it('should display the met funding requirements message when all subs have eligibility even if parent does not', async () => {
      getEstablishments.primary.wdf = { overall: false };
      getEstablishments.subsidaries.establishments[0].wdf = { overall: true };
      getEstablishments.subsidaries.establishments[1].wdf = { overall: true };

      const { getByTestId } = await setup({ workplace: getEstablishments.primary, getEstablishments });

      const yourOtherWorkplacesRow = getByTestId('workplaces-row');

      expect(within(yourOtherWorkplacesRow).getByTestId('met-funding-message')).toBeTruthy();
    });

    it('should display the some data not meeting funding requirements message when not all meeting but some subs have overall eligibility', async () => {
      getEstablishments.primary.wdf = { overall: true };
      getEstablishments.subsidaries.establishments[0].wdf = { overall: true };
      getEstablishments.subsidaries.establishments[1].wdf = { overall: false };

      const { getByTestId, report } = await setup({ workplace: getEstablishments.primary, getEstablishments });

      const currentYear = new Date(report.effectiveFrom).getFullYear();
      const yourOtherWorkplacesRow = getByTestId('workplaces-row');

      expect(
        within(yourOtherWorkplacesRow).getByText(
          `Some data does not meet the funding requirements for ${currentYear} to ${currentYear + 1}`,
        ),
      ).toBeTruthy();
    });

    it('should display the not meeting funding requirements message when no subs have overall eligibility', async () => {
      getEstablishments.primary.wdf = { overall: false };
      getEstablishments.subsidaries.establishments[0].wdf = { overall: false };
      getEstablishments.subsidaries.establishments[1].wdf = { overall: false };

      const { getByTestId, report } = await setup({ workplace: getEstablishments.primary, getEstablishments });

      const currentYear = new Date(report.effectiveFrom).getFullYear();
      const yourOtherWorkplacesRow = getByTestId('workplaces-row');

      expect(
        within(yourOtherWorkplacesRow).getByText(
          `Your data does not meet the funding requirements for ${currentYear} to ${currentYear + 1}`,
        ),
      ).toBeTruthy();
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
