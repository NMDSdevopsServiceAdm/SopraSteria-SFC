import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { BrowserModule } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { BulkUploadService, BulkUploadServiceV2 } from '@core/services/bulk-upload.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { MockBreadcrumbService } from '@core/test-utils/MockBreadcrumbService';
import { MockEstablishmentService } from '@core/test-utils/MockEstablishmentService';
import { MockBulkUploadService, errorReport } from '@core/test-utils/MockBulkUploadService';
import { render } from '@testing-library/angular';

import { BulkUploadModule } from '../bulk-upload.module';
import { ErrorPageComponent } from './error-page.component';
import { FeatureFlagsService } from '@shared/services/feature-flags.service';
import { MockFeatureFlagsService } from '@core/test-utils/MockFeatureFlagService';

describe('ErrorPageComponent', () => {
  const getErrorPageComponent = async () => {
    return await render(ErrorPageComponent, {
      imports: [RouterTestingModule, HttpClientTestingModule, BrowserModule, BulkUploadModule],
      declarations: [ErrorPageComponent],
      providers: [
        { provide: EstablishmentService, useClass: MockEstablishmentService },
        { provide: BulkUploadService, useClass: BulkUploadServiceV2 },
        { provide: BreadcrumbService, useClass: MockBreadcrumbService },
        { provide: FeatureFlagsService, useClass: MockFeatureFlagsService},
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              data: {
                buErrors: errorReport,
              },
            },
          },
        },
      ],
    });
  };

  const setup = async () => {
    const { fixture, getByText, getByTestId } = await getErrorPageComponent();
    const component = fixture.componentInstance;
    const http = TestBed.inject(HttpTestingController);

    return { fixture, component, http, getByText, getByTestId };
  };

  it('should render a ErrorPageComponent', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should render a title for the page', async () => {
    const { getByText } = await setup();
    const title = getByText('Error report');
    expect(title).toBeTruthy();
  });

  it('should show an error summary table with the correct amount of errors', async () => {
    const { component, fixture, getByTestId } = await setup();

    fixture.detectChanges();
    const errorReport = component.errorReport;
    const establishmentsErrorCount = getByTestId('establishmentsErrorCount');
    const establishmentsWarningCount = getByTestId('establishmentsWarningCount');
    const workersErrorCount = getByTestId('workersErrorCount');
    const workersWarningCount = getByTestId('workersWarningCount');
    const trainingErrorCount = getByTestId('trainingErrorCount');
    const trainingWarningCount = getByTestId('trainingWarningCount');

    expect(establishmentsErrorCount.textContent).toContain(
      component.getNumberOfItems(errorReport.establishments.errors).toString(),
    );
    expect(establishmentsWarningCount.textContent).toContain(
      component.getNumberOfItems(errorReport.establishments.warnings).toString(),
    );
    expect(workersErrorCount.textContent).toContain(component.getNumberOfItems(errorReport.workers.errors).toString());
    expect(workersWarningCount.textContent).toContain(
      component.getNumberOfItems(errorReport.workers.warnings).toString(),
    );
    expect(trainingErrorCount.textContent).toContain(
      component.getNumberOfItems(errorReport.training.errors).toString(),
    );
    expect(trainingWarningCount.textContent).toContain(
      component.getNumberOfItems(errorReport.training.warnings).toString(),
    );
  });

  it('should show workplace errors and warnings tables on load', async () => {
    const { component, fixture, getByText } = await setup();

    fixture.detectChanges();
    const errorReport = component.errorReport;

    for (const err of errorReport.establishments.errors) {
      expect(getByText(err.error, { exact: false }));
    }

    for (const warn of errorReport.establishments.warnings) {
      expect(getByText(warn.warning, { exact: false }));
    }
  });
});
