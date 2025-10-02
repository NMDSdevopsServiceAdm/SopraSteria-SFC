import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { BrowserModule } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { Worker } from '@core/model/worker.model';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { InternationalRecruitmentService } from '@core/services/international-recruitment.service';
import { WorkerService } from '@core/services/worker.service';
import { FundingReportResolver } from '@core/resolvers/funding-report.resolver';
import { MockBreadcrumbService } from '@core/test-utils/MockBreadcrumbService';
import { MockEstablishmentService } from '@core/test-utils/MockEstablishmentService';
import { MockInternationalRecruitmentService } from '@core/test-utils/MockInternationalRecruitmentService';
import { createMockWdfReport } from '@core/test-utils/MockReportService';
import { MockWorkerService, workerBuilder, workerWithWdf } from '@core/test-utils/MockWorkerService';
import { SharedModule } from '@shared/shared.module';
import { render } from '@testing-library/angular';
import { Observable } from 'rxjs';

import { FundingModule } from '../funding.module';
import { WdfStaffRecordComponent } from './wdf-staff-record.component';

fdescribe('WdfStaffRecordComponent', () => {
  const setup = async (overrides: any = {}) => {
    const setupTools = await render(WdfStaffRecordComponent, {
      imports: [BrowserModule, SharedModule, FundingModule],
      providers: [
        { provide: BreadcrumbService, useClass: MockBreadcrumbService },
        { provide: EstablishmentService, useClass: MockEstablishmentService },
        { provide: WorkerService, useFactory: MockWorkerService.factory(overrides.worker ?? workerBuilder()) },
        { provide: InternationalRecruitmentService, useClass: MockInternationalRecruitmentService },
        {
          provide: ActivatedRoute,
          useValue: {
            params: Observable.from([{ id: 123 }]),
            snapshot: {
              data: {
                worker: {},
                report: createMockWdfReport(),
              },
              params: overrides.establishmentuid ? { establishmentuid: overrides.establishmentuid } : {},
              paramMap: {
                get(id) {
                  return 123;
                },
              },
            },
          },
        },
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: FundingReportResolver, useValue: { resolve: () => {} } },
      ],
    });
    const component = setupTools.fixture.componentInstance;

    return { ...setupTools, component };
  };

  it('should render a WdfStaffRecordComponent', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should display the "update staff record" message and orange flag when user meets funding requirements overall but current staff record does not', async () => {
    const { component, fixture, getByText } = await setup();
    const expectedStatusMessage = 'Update this staff record to save yourself time next year';
    const orangeFlagVisuallyHiddenMessage = 'Orange warning flag';

    component.exitUrl = { url: [] };
    component.overallWdfEligibility = true;
    component.workerList = ['1', '2', '3', '4'];

    fixture.detectChanges();

    expect(getByText(orangeFlagVisuallyHiddenMessage, { exact: false })).toBeTruthy();
    expect(getByText(expectedStatusMessage, { exact: false })).toBeTruthy();
  });

  it('should display the "not meeting requirements" message and red flag when user does not meet funding requirements overall and current staff record does not', async () => {
    const { component, fixture, getByText } = await setup();
    const year = new Date().getFullYear();
    const expectedStatusMessage = `This staff record does not meet the funding requirements for ${year} to ${year + 1}`;
    const redFlagVisuallyHiddenMessage = 'Red flag';

    component.overallWdfEligibility = false;
    component.wdfStartDate = `${year}-01-01`;
    component.wdfEndDate = `${year + 1}-01-01`;
    component.workerList = ['1', '2', '3', '4'];

    fixture.detectChanges();

    expect(getByText(redFlagVisuallyHiddenMessage, { exact: false })).toBeTruthy();
    expect(getByText(expectedStatusMessage, { exact: false })).toBeTruthy();
  });

  it('should display the "meets funding requirements" message when worker is eligible', async () => {
    const { component, fixture, queryByText } = await setup({ worker: workerWithWdf() });
    const year = new Date().getFullYear();
    const meetsRequirementsMessage = `This staff record meets the funding requirements for ${year} to ${year + 1}`;
    const greenTickVisuallyHiddenMessage = 'Green tick';

    component.wdfStartDate = `${year}-01-01`;
    component.wdfEndDate = `${year + 1}-01-01`;
    component.workerList = ['1', '2', '3', '4'];
    fixture.detectChanges();

    expect(queryByText(meetsRequirementsMessage)).toBeTruthy();
    expect(queryByText(greenTickVisuallyHiddenMessage)).toBeTruthy();
  });

  it('should display the last updated date in expected format', async () => {
    const worker = workerWithWdf() as Worker;
    worker.updated = '2023-01-01';

    const { getByText } = await setup({ worker });

    expect(getByText('Last update, 1 January 2023')).toBeTruthy();
  });

  it('should set the Close this staff record buttons to navigate back to primary workplace staff tab when viewing primary workplace', async () => {
    const { getAllByText } = await setup();

    const closeRecordButtons = getAllByText('Close this staff record');
    const expectedLink = '/funding/data#staff';

    expect(closeRecordButtons.length).toEqual(2);

    expect((closeRecordButtons[0] as HTMLAnchorElement).href).toContain(expectedLink);
    expect((closeRecordButtons[1] as HTMLAnchorElement).href).toContain(expectedLink);
  });

  it('should set the Close this staff record buttons to navigate back to sub workplace staff tab when viewing sub workplace', async () => {
    const establishmentuid = 'mockEstablishmentUid123';

    const { getAllByText } = await setup({ establishmentuid });

    const closeRecordButtons = getAllByText('Close this staff record');
    const expectedLink = `funding/workplaces/${establishmentuid}#staff`;

    expect(closeRecordButtons.length).toEqual(2);

    expect((closeRecordButtons[0] as HTMLAnchorElement).href).toContain(expectedLink);
    expect((closeRecordButtons[1] as HTMLAnchorElement).href).toContain(expectedLink);
  });
});
