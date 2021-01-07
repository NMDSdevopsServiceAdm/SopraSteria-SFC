import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { BrowserModule } from '@angular/platform-browser';
import { RouterTestingModule } from '@angular/router/testing';
import { BulkUploadService, BulkUploadServiceV2 } from '@core/services/bulk-upload.service';
import { EstablishmentService } from '@core/services/establishment.service';
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
        { provide: BulkUploadService, useClass: BulkUploadServiceV2 },
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

  it('should show a table with the correct amount of errors', async () => {
    const { component, getByTestId } = await setup();

    component.errorReport = {
      establishments: {
        errors: [
          {
            errCode: 1100,
            errType: 'ERROR',
            error: 'WE HAVE AN ERROR',
            origin: 'Establishment',
            lineNumber: 2,
            source: '',
            name: 'SKILLS FOR CARE',
          },
        ],
        warnings: [],
      },
      workers: {
        errors: [],
        warnings: [],
      },
      training: {
        errors: [],
        warnings: [],
      },
    };
    const errorCount = getByTestId('errorCount');
    expect(errorCount.textContent).toBe('1');
  });
});
