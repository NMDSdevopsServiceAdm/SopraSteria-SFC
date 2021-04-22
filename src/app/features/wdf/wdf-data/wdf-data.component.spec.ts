import { HttpClientTestingModule } from '@angular/common/http/testing';
import { BrowserModule } from '@angular/platform-browser';
import { RouterTestingModule } from '@angular/router/testing';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { ReportService } from '@core/services/report.service';
import { WorkerService } from '@core/services/worker.service';
import { MockBreadcrumbService } from '@core/test-utils/MockBreadcrumbService';
import { MockEstablishmentService } from '@core/test-utils/MockEstablishmentService';
import { MockPermissionsService } from '@core/test-utils/MockPermissionsService';
import { MockReportService } from '@core/test-utils/MockReportService';
import { MockWorkerService } from '@core/test-utils/MockWorkerService';
import { SharedModule } from '@shared/shared.module';
import { render } from '@testing-library/angular';

import { WdfDataComponent } from './wdf-data.component';

describe('WdfDataComponent', () => {
  const setup = async () => {
    const { fixture, getByText, getAllByText, getByTestId, queryByText } = await render(WdfDataComponent, {
      imports: [RouterTestingModule, HttpClientTestingModule, BrowserModule, SharedModule],
      providers: [
        { provide: BreadcrumbService, useClass: MockBreadcrumbService },
        { provide: EstablishmentService, useClass: MockEstablishmentService },
        { provide: ReportService, useClass: MockReportService },
        { provide: WorkerService, useClass: MockWorkerService },
        { provide: PermissionsService, useClass: MockPermissionsService },
      ],
    });
    const component = fixture.componentInstance;

    return { component, fixture, getByText, getAllByText, getByTestId, queryByText };
  };

  it('should render a WdfDataComponent', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should display the correct timeframe for meeting WDF requirements', async () => {
    const { getByText } = await setup();
    const timeframeSentence = 'Your data meets the WDF 2021 to 2022 requirements';

    expect(getByText(timeframeSentence, { exact: false })).toBeTruthy();
  });

  it('should display a green tick when the user qualifies for WDF', async () => {
    const { getByText } = await setup();
    const greenTickVisuallyHiddenMessage = 'Green tick';

    expect(getByText(greenTickVisuallyHiddenMessage, { exact: false })).toBeTruthy();
  });
});
