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
import { Observable } from 'rxjs';

import { workerBuilder, workerBuilderWithWdf } from '../../../../../../server/test/factories/models';
import { WdfModule } from '../wdf.module';
import { WdfStaffRecordComponent } from './wdf-staff-record.component';

describe('WdfStaffRecordComponent', () => {
  const setup = async (id = 123) => {
    const { fixture, getByText, getAllByText, getByTestId, queryByText } = await render(WdfStaffRecordComponent, {
      imports: [RouterTestingModule, HttpClientTestingModule, BrowserModule, SharedModule, WdfModule],
      providers: [
        { provide: BreadcrumbService, useClass: MockBreadcrumbService },
        { provide: EstablishmentService, useClass: MockEstablishmentService },
        { provide: WorkerService, useClass: MockWorkerService },
        {
          provide: ActivatedRoute,
          useValue: {
            params: Observable.from([{ id: id }]),
            snapshot: {
              params: [{ id: id }],
              paramMap: {
                get(id) {
                  return id;
                },
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
    component.updatedWorker = workerBuilder();
    component.exitUrl = { url: [] };
    component.overallWdfEligibility = true;
    component.workerList = ['1', '2', '3', '4'];

    fixture.detectChanges();

    expect(getByText(orangeFlagVisuallyHiddenMessage, { exact: false })).toBeTruthy();
    expect(getByText(expectedStatusMessage, { exact: false })).toBeTruthy();
  });

  it('should display the "not meeting requirements" message and red cross when user does not meet WDF requirements overall and current staff record does not', async () => {
    const { component, fixture, getByText } = await setup();
    const expectedStatusMessage = 'This record does not meet the WDF 2021 to 2022 requirements';
    const redCrossVisuallyHiddenMessage = 'Red cross';

    component.worker = workerBuilder();
    component.updatedWorker = workerBuilder();

    component.exitUrl = { url: [] };
    component.overallWdfEligibility = false;
    component.wdfStartDate = '2021-01-01';
    component.wdfEndDate = '2022-01-01';
    component.workerList = ['1', '2', '3', '4'];

    fixture.detectChanges();

    expect(getByText(redCrossVisuallyHiddenMessage, { exact: false })).toBeTruthy();
    expect(getByText(expectedStatusMessage, { exact: false })).toBeTruthy();
  });

  it('should not display the "not meeting requirements" or "update staff record" message when worker eligible', async () => {
    const { component, fixture, queryByText } = await setup();
    const redCrossStatusMessage = 'This record does not meet the WDF 2021 to 2022 requirements';
    const redCrossVisuallyHiddenMessage = 'Red cross';

    const orangeFlagStatusMessage = 'Update this staff record to save yourself time next year';
    const orangeFlagVisuallyHiddenMessage = 'Orange warning flag';

    component.worker = workerBuilderWithWdf();
    component.updatedWorker = workerBuilderWithWdf();

    component.exitUrl = { url: [] };
    component.overallWdfEligibility = true;
    component.wdfStartDate = '2021-01-01';
    component.wdfEndDate = '2022-01-01';
    component.workerList = ['1', '2', '3', '4'];
    fixture.detectChanges();

    expect(queryByText(redCrossVisuallyHiddenMessage, { exact: false })).toBeFalsy();
    expect(queryByText(redCrossStatusMessage, { exact: false })).toBeFalsy();

    expect(queryByText(orangeFlagVisuallyHiddenMessage, { exact: false })).toBeFalsy();
    expect(queryByText(orangeFlagStatusMessage, { exact: false })).toBeFalsy();
  });
});
