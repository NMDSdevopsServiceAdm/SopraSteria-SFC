import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { BrowserModule } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { Establishment } from '@core/model/establishment.model';
import { Eligibility } from '@core/model/wdf.model.js';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { UserService } from '@core/services/user.service.js';
import { WorkerService } from '@core/services/worker.service.js';
import { MockPermissionsService } from '@core/test-utils/MockPermissionsService';
import { MockWorkerService } from '@core/test-utils/MockWorkerService';
import { WdfModule } from '@features/wdf/wdf.module.js';
import { SharedModule } from '@shared/shared.module';
import { render } from '@testing-library/angular';

import { establishmentBuilder, workerBuilderWithWdf } from '../../../../../server/test/factories/models.js';
import { StaffRecordSummaryComponent } from './staff-record-summary.component';

describe('StaffRecordSummaryComponent', () => {
  const setup = async () => {
    const { fixture, getByText, queryByText } = await render(StaffRecordSummaryComponent, {
      imports: [SharedModule, RouterTestingModule, HttpClientTestingModule, BrowserModule, WdfModule],
      providers: [
        {
          provide: PermissionsService,
          useFactory: MockPermissionsService.factory(['canEditWorker']),
          deps: [HttpClient, Router, UserService],
        },
        {
          provide: WorkerService,
          useClass: MockWorkerService,
        },
      ],
      componentProperties: {
        wdfView: true,
        workplace: establishmentBuilder() as Establishment,
        worker: workerBuilderWithWdf(),
      },
    });

    const component = fixture.componentInstance;

    return { component, fixture, getByText, queryByText };
  };

  it('should render a StaffRecordSummaryComponent', async () => {
    const { component } = await setup();

    expect(component).toBeTruthy();
  });

  it('should show WdfFieldConfirmation component when is eligible but needs to be confirmed', async () => {
    const { component, fixture, getByText } = await setup();

    component.worker.wdf.mainJobStartDate.isEligible = Eligibility.YES;
    component.worker.wdf.mainJobStartDate.updatedSinceEffectiveDate = false;
    component.worker.mainJobStartDate = '2020-01-12';

    fixture.detectChanges();

    expect(getByText('Is this still correct?')).toBeTruthy();
    expect(getByText('Yes, it is')).toBeTruthy();
    expect(getByText('No, change it')).toBeTruthy();
  });

  it('should not show WdfFieldConfirmation component when fields do not need to be confirmed', async () => {
    const { queryByText } = await setup();

    expect(queryByText('Is this still correct?')).toBeFalsy();
    expect(queryByText('Yes, it is')).toBeFalsy();
    expect(queryByText('No, change it')).toBeFalsy();
  });
});
