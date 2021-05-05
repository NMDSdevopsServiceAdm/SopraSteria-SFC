import { HttpClientTestingModule } from '@angular/common/http/testing';
import { BrowserModule } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { WorkerService } from '@core/services/worker.service';
import { MockBreadcrumbService } from '@core/test-utils/MockBreadcrumbService';
import { MockEstablishmentService } from '@core/test-utils/MockEstablishmentService';
import { MockWorkerService } from '@core/test-utils/MockWorkerService';
import { SharedModule } from '@shared/shared.module';
import { render } from '@testing-library/angular';

import { WdfModule } from '../wdf.module.js';
import { WdfStaffRecordComponent } from './wdf-staff-record.component';

describe('WdfStaffRecordComponent', () => {
  const setup = async () => {
    const { fixture, getByText, getAllByText, getByTestId, queryByText } = await render(WdfStaffRecordComponent, {
      imports: [RouterTestingModule, HttpClientTestingModule, BrowserModule, SharedModule, WdfModule],
      providers: [
        { provide: BreadcrumbService, useClass: MockBreadcrumbService },
        { provide: EstablishmentService, useClass: MockEstablishmentService },
        { provide: WorkerService, useClass: MockWorkerService },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              params: {
                id: '123',
              },
            },
          },
        },
      ],
    });
    const component = fixture.componentInstance;

    return { component, fixture, getByText, getAllByText, getByTestId, queryByText };
  };

  it('should render a WdfStaffRecordComponent', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  // it('should display the "update staff record message" and orange flag when user meets WDF requirements overall but current staff record does not', async () => {
  //   const { component, fixture, getByText } = await setup();
  //   component.worker = workerBuilder();
  //   fixture.detectChanges();

  //   const expectedStatusMessage = 'Update this staff record to save yourself time next year';
  //   expect(getByText(expectedStatusMessage, { exact: false })).toBeTruthy();
  // });
});
