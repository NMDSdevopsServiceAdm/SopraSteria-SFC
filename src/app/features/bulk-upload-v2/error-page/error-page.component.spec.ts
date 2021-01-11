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

fdescribe('ErrorPageComponent', () => {
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

  fit('should show a table with the correct amount of errors - establishments - 1', async () => {
    const { component, fixture, getByTestId } = await setup();

    fixture.detectChanges();

    const errorCount = getByTestId('errorCount');
    expect(errorCount.textContent).toBe('1');
  });

  it('should show a table with the correct amount of warnings - workers - 2', async () => {
    const { component, getByTestId } = await setup();

    component.errorReport = {
      establishments: {
        errors: [],
        warnings: [],
      },
      workers: {
        errors: [],
        warnings: [
          {
            warnCode: 1100,
            warnType: 'WARNING',
            warning: 'WE HAVE A WARNING',
            origin: 'Worker',
            lineNumber: 2,
            source: '',
            name: 'SKILLS FOR CARE',
          },
          {
            warnCode: 1500,
            warnType: 'WARNING',
            warning: 'WE HAVE ANOTHER WARNING',
            origin: 'Worker',
            lineNumber: 5,
            source: '',
            name: 'SKILLS FOR CARE',
          },
        ],
      },
      training: {
        errors: [],
        warnings: [],
      },
    };
    const errorCount = getByTestId('warningCount');
    expect(errorCount.textContent).toBe('2');
  });
});
