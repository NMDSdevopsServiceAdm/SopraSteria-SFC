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

import { workerBuilder } from '../../../../../server/test/factories/models';
import { WdfModule } from '../wdf.module.js';
import { WdfStaffRecordComponent } from './wdf-staff-record.component';
import { FeatureFlagsService } from '@shared/services/feature-flags.service';
import { MockFeatureFlagsService } from '@core/test-utils/MockFeatureFlagService';

describe('WdfStaffRecordComponent', () => {
  const setup = async () => {
    const { fixture, getByText, getAllByText, getByTestId, queryByText } = await render(WdfStaffRecordComponent, {
      imports: [RouterTestingModule, HttpClientTestingModule, BrowserModule, SharedModule, WdfModule],
      providers: [
        { provide: BreadcrumbService, useClass: MockBreadcrumbService },
        { provide: EstablishmentService, useClass: MockEstablishmentService },
        { provide: WorkerService, useClass: MockWorkerService },
        { provide: FeatureFlagsService, useClass: MockFeatureFlagsService },
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

  it('should display the "update staff record" message and orange flag when user meets WDF requirements overall but current staff record does not', async () => {
    const { component, fixture, getByText } = await setup();
    const expectedStatusMessage = 'Update this staff record to save yourself time next year';
    const orangeFlagVisuallyHiddenMessage = 'Orange warning flag';

    component.worker = workerBuilder();
    component.exitUrl = { url: [] };
    component.overallWdfEligibility = true;
    fixture.detectChanges();

    expect(getByText(orangeFlagVisuallyHiddenMessage, { exact: false })).toBeTruthy();
    expect(getByText(expectedStatusMessage, { exact: false })).toBeTruthy();
  });

  it('should display the "not meeting requirements" message and red cross when user does not meet WDF requirements overall and current staff record does not', async () => {
    const { component, fixture, getByText } = await setup();
    const expectedStatusMessage = 'Not meeting the WDF 2021 to 2022 requirements';
    const redCrossVisuallyHiddenMessage = 'Red cross';

    component.worker = workerBuilder();
    component.exitUrl = { url: [] };
    component.overallWdfEligibility = false;
    component.wdfStartDate = '2021-01-01';
    component.wdfEndDate = '2022-01-01';
    fixture.detectChanges();

    expect(getByText(redCrossVisuallyHiddenMessage, { exact: false })).toBeTruthy();
    expect(getByText(expectedStatusMessage, { exact: false })).toBeTruthy();
  });
});
