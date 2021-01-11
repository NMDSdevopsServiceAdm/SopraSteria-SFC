import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { BrowserModule } from '@angular/platform-browser';
import { RouterTestingModule } from '@angular/router/testing';
import { BulkUploadService } from '@core/services/bulk-upload.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { MockBulkUploadService } from '@core/test-utils/MockBulkUploadService';
import { MockEstablishmentService } from '@core/test-utils/MockEstablishmentService';
import { render } from '@testing-library/angular';

import { BulkUploadV2Module } from '../bulk-upload.module';
import { ErrorPageComponent } from './error-page.component';

describe('ErrorPageComponent', () => {
  const getErrorPageComponent = async () => {
    return await render(ErrorPageComponent, {
      imports: [RouterTestingModule, HttpClientTestingModule, BrowserModule, BulkUploadV2Module],
      declarations: [ErrorPageComponent],
      providers: [
        { provide: EstablishmentService, useClass: MockEstablishmentService },
        { provide: BulkUploadService, useClass: MockBulkUploadService },
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

  it('should show a table with the correct amount of errors - establishments - 1', async () => {
    const { component, fixture, getByTestId } = await setup();

    fixture.detectChanges();
    const errorReport = component.errorReport;
    const establishmentsErrorCount = getByTestId('establishmentsErrorCount');
    const establishmentsWarningCount = getByTestId('establishmentsWarningCount');
    const workersErrorCount = getByTestId('workersErrorCount');
    const workersWarningCount = getByTestId('workersWarningCount');
    const trainingErrorCount = getByTestId('trainingErrorCount');
    const trainingWarningCount = getByTestId('trainingWarningCount');

    expect(establishmentsErrorCount.textContent).toContain(errorReport.establishments.errors.length.toString());
    expect(establishmentsWarningCount.textContent).toContain(errorReport.establishments.warnings.length.toString());
    expect(workersErrorCount.textContent).toContain(errorReport.workers.errors.length.toString());
    expect(workersWarningCount.textContent).toContain(errorReport.workers.warnings.length.toString());
    expect(trainingErrorCount.textContent).toContain(errorReport.training.errors.length.toString());
    expect(trainingWarningCount.textContent).toContain(errorReport.training.warnings.length.toString());
  });
});
