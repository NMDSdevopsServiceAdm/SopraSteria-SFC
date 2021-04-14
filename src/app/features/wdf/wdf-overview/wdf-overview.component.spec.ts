import { HttpClientTestingModule } from '@angular/common/http/testing';
import { BrowserModule } from '@angular/platform-browser';
import { RouterTestingModule } from '@angular/router/testing';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { ReportService } from '@core/services/report.service';
import { MockBreadcrumbService } from '@core/test-utils/MockBreadcrumbService';
import { MockEstablishmentService } from '@core/test-utils/MockEstablishmentService';
import { MockReportService } from '@core/test-utils/MockReportService';
import { SharedModule } from '@shared/shared.module';
import { render } from '@testing-library/angular';

import { WdfOverviewComponent } from './wdf-overview.component';

describe('WdfOverviewComponent', () => {
  const setup = async () => {
    const { fixture, getByText, getAllByText, getByTestId, queryByText } = await render(WdfOverviewComponent, {
      imports: [RouterTestingModule, HttpClientTestingModule, BrowserModule, SharedModule],
      providers: [
        { provide: BreadcrumbService, useClass: MockBreadcrumbService },
        { provide: EstablishmentService, useClass: MockEstablishmentService },
        { provide: ReportService, useClass: MockReportService },
      ],
    });
    const component = fixture.componentInstance;

    return { component, fixture, getByText, getAllByText, getByTestId, queryByText };
  };

  it('should render a WdfOverviewComponent', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should display the correct timeframe for meeting WDF requirements', async () => {
    const { getByText } = await setup();
    const timeframeSentence = 'Your data has met the WDF 2021 to 2022 requirements';

    expect(getByText(timeframeSentence, { exact: false }));
  });

  it('should display the correct date for next WDF fund', async () => {
    const { getByText } = await setup();
    const timeframeSentence = 'until the next fund is available on 1 April 2022';

    expect(getByText(timeframeSentence, { exact: false }));
  });

  it('should display the correct date for when the user became eligible', async () => {
    const { getByText } = await setup();
    const timeframeSentence = 'Your data met the requirements on 21 July 2021';

    expect(getByText(timeframeSentence, { exact: false }));
  });
});
